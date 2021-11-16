<?php

/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2016-2020 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 *
 * @noinspection AutoloadingIssuesInspection
 */

use oat\libCat\exception\CatEngineConnectivityException;
use oat\tao\model\routing\AnnotationReader\security;
use oat\taoDelivery\model\execution\DeliveryExecutionService;
use oat\taoDelivery\model\RuntimeService;
use oat\taoQtiTest\model\Service\ExitTestCommand;
use oat\taoQtiTest\model\Service\ExitTestService;
use oat\taoQtiTest\model\Service\ItemContextAwareInterface;
use oat\taoQtiTest\model\Service\ListItemsQuery;
use oat\taoQtiTest\model\Service\ListItemsService;
use oat\taoQtiTest\model\Service\MoveCommand;
use oat\taoQtiTest\model\Service\MoveService;
use oat\taoQtiTest\model\Service\NavigationContextAwareInterface;
use oat\taoQtiTest\model\Service\PauseCommand;
use oat\taoQtiTest\model\Service\PauseService;
use oat\taoQtiTest\model\Service\SkipCommand;
use oat\taoQtiTest\model\Service\SkipService;
use oat\taoQtiTest\model\Service\StoreTraceVariablesService;
use oat\taoQtiTest\model\Service\StoreTraceVariablesCommand;
use oat\taoQtiTest\model\Service\TimeoutCommand;
use oat\taoQtiTest\model\Service\TimeoutService;
use oat\taoQtiTest\model\Service\ToolsStateAwareInterface;
use oat\taoQtiTest\models\cat\CatEngineNotFoundException;
use oat\taoQtiTest\models\container\QtiTestDeliveryContainer;
use oat\taoQtiTest\models\runner\communicator\CommunicationService;
use oat\taoQtiTest\models\runner\communicator\QtiCommunicationService;
use oat\taoQtiTest\models\runner\QtiRunnerClosedException;
use oat\taoQtiTest\models\runner\QtiRunnerEmptyResponsesException;
use oat\taoQtiTest\models\runner\QtiRunnerItemResponseException;
use oat\taoQtiTest\models\runner\QtiRunnerMessageService;
use oat\taoQtiTest\models\runner\QtiRunnerPausedException;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\RunnerToolStates;
use oat\taoQtiTest\models\runner\StorageManager;
use taoQtiTest_helpers_TestRunnerUtils as TestRunnerUtils;
use oat\oatbox\session\SessionService;

/**
 * Class taoQtiTest_actions_Runner
 *
 * Serves QTI implementation of the test runner
 */
class taoQtiTest_actions_Runner extends tao_actions_ServiceModule
{
    use RunnerToolStates;

    /**
     * The current test session
     * @var QtiRunnerServiceContext
     */
    protected $serviceContext;

    /**
     * taoQtiTest_actions_Runner constructor.
     * @security("hide");
     */
    public function __construct()
    {
        parent::__construct();

        // Prevent anything to be cached by the client.
        TestRunnerUtils::noHttpClientCache();
    }

    /**
     * @return StorageManager
     */
    protected function getStorageManager()
    {
        /** @noinspection PhpIncompatibleReturnTypeInspection */
        return $this->getServiceLocator()->get(StorageManager::SERVICE_ID);
    }

    /**
     * @param $data
     * @param int [$httpStatus]
     * @param bool [$token]
     */
    protected function returnJson($data, $httpStatus = 200)
    {
        try {
            // auto append platform messages, if any
            if ($this->serviceContext && !isset($data['messages'])) {
                /* @var $communicationService CommunicationService */
                $communicationService = $this->getServiceManager()->get(QtiCommunicationService::SERVICE_ID);
                $data['messages'] = $communicationService->processOutput($this->serviceContext);
            }

            // ensure the state storage is properly updated
            $this->getStorageManager()->persist();
        } catch (common_Exception $e) {
            $data = $this->getErrorResponse($e);
            $httpStatus = $this->getStatusCodeFromException($e);
        }

        // Applies status code to the response object
        $this->response = $this->getPsrResponse()
            ->withStatus($httpStatus);

        return parent::returnJson($data, $httpStatus);
    }

    /**
     * Gets the identifier of the test session
     * @return string
     */
    protected function getSessionId()
    {
        if ($this->hasRequestParameter('testServiceCallId')) {
            return $this->getRequestParameter('testServiceCallId');
        }

        return $this->getRequestParameter('serviceCallId');
    }

    /**
     * Gets the test service context
     * @return QtiRunnerServiceContext
     * @throws \common_Exception
     */
    protected function getServiceContext()
    {
        if (!$this->serviceContext) {
            $testExecution = $this->getSessionId();
            $execution = $this->getDeliveryExecutionService()->getDeliveryExecution($testExecution);
            if (!$execution) {
                throw new common_exception_ResourceNotFound();
            }

            $currentUser = $this->getSessionService()->getCurrentUser();
            if (!$currentUser || $execution->getUserIdentifier() !== $currentUser->getIdentifier()) {
                throw new common_exception_Unauthorized($execution->getUserIdentifier());
            }

            $delivery = $execution->getDelivery();
            $container = $this->getRuntimeService()->getDeliveryContainer($delivery->getUri());
            if (!$container instanceof QtiTestDeliveryContainer) {
                throw new common_Exception('Non QTI test container ' . get_class($container) . ' in qti test runner');
            }
            $testDefinition = $container->getSourceTest($execution);
            $testCompilation = $container->getPrivateDirId($execution) . '|' . $container->getPublicDirId($execution);
            $this->serviceContext = $this->getRunnerService()->getServiceContext($testDefinition, $testCompilation, $testExecution);
        }

        return $this->serviceContext;
    }

    /**
     * Checks the security token.
     * @throws common_Exception
     * @throws common_exception_Error
     * @throws common_exception_Unauthorized
     * @throws common_ext_ExtensionException
     */
    protected function validateSecurityToken(): void
    {
        $config = $this->getRunnerService()->getTestConfig()->getConfigValue('security');

        $isCsrfValidationRequired = (bool)($config['csrfToken'] ?? false);

        if (!$isCsrfValidationRequired) {
            return;
        }

        $this->validateCsrf();
    }

    /**
     * Gets an error response object
     * @param Exception [$e] Optional exception from which extract the error context
     * @param array $prevResponse Response before catch
     * @return array
     */
    protected function getErrorResponse($e = null, $prevResponse = [])
    {
        $this->logError($e->getMessage());

        $response = [
            'success' => false,
            'type' => 'error',
        ];

        if ($e) {
            if ($e instanceof Exception) {
                $response['type'] = 'exception';
                $response['code'] = $e->getCode();
            }

            if ($e instanceof common_exception_UserReadableException) {
                $response['message'] = $e->getUserMessage();
            } else {
                $response['message'] = __('Internal server error!');
            }

            switch (true) {
                case $e instanceof CatEngineConnectivityException:
                case $e instanceof CatEngineNotFoundException:
                    $response = array_merge($response, $prevResponse);
                    $response['type'] = 'catEngine';
                    $response['code'] = 200;
                    $response['testMap'] = [];
                    $response['message'] = $e->getMessage();
                    break;
                case $e instanceof QtiRunnerClosedException:
                case $e instanceof QtiRunnerPausedException:
                    if ($this->serviceContext) {
                        /** @var QtiRunnerMessageService $messageService */
                        $messageService = $this->getServiceManager()->get(QtiRunnerMessageService::SERVICE_ID);
                        try {
                            $response['message'] = __($messageService->getStateMessage($this->serviceContext->getTestSession()));
                        } catch (common_exception_Error $e) {
                            $response['message'] = null;
                        }
                    }
                    $response['type'] = 'TestState';
                    break;

                case $e instanceof tao_models_classes_FileNotFoundException:
                    $response['type'] = 'FileNotFound';
                    $response['message'] = __('File not found');
                    break;

                case $e instanceof common_exception_Unauthorized:
                    $response['code'] = 403;
                    break;
            }
        }

        return $response;
    }

    /**
     * Gets an HTTP response code
     */
    protected function getStatusCodeFromException(Exception $exception): int
    {
        switch (get_class($exception)) {
            case CatEngineConnectivityException::class:
            case CatEngineNotFoundException::class:
            case QtiRunnerEmptyResponsesException::class:
            case QtiRunnerClosedException::class:
            case QtiRunnerPausedException::class:
                return 200;

            case common_exception_NotImplemented::class:
            case common_exception_NoImplementation::class:
            case common_exception_Unauthorized::class:
                return 403;

            case tao_models_classes_FileNotFoundException::class:
                return 404;
        }

        return 500;
    }

    /**
     * Initializes the delivery session
     * @throws common_Exception
     */
    public function init()
    {
        $this->validateSecurityToken();

        try {
            /** @var QtiRunnerServiceContext $serviceContext */
            $serviceContext = $this->getRunnerService()->initServiceContext($this->getServiceContext());
            $this->returnJson($this->getInitResponse($serviceContext));
        } catch (Exception $e) {
            $this->returnJson(
                $this->getErrorResponse($e),
                $this->getStatusCodeFromException($e)
            );
        }
    }

    /**
     * Provides the test definition data
     *
     * @deprecated
     */
    public function getTestData()
    {
        $code = 200;

        try {
            $this->validateSecurityToken();
            $serviceContext = $this->getRunnerService()->initServiceContext($this->getServiceContext());

            $response = [
                'testData' => $this->getRunnerService()->getTestData($serviceContext),
                'success' => true,
            ];
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getStatusCodeFromException($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * Provides the test context object
     */
    public function getTestContext()
    {
        $code = 200;

        try {
            $this->validateSecurityToken();
            $serviceContext = $this->getRunnerService()->initServiceContext($this->getServiceContext());

            $response = [
                'testContext' => $this->getRunnerService()->getTestContext($serviceContext),
                'success' => true,
            ];
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getStatusCodeFromException($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * Provides the map of the test items
     */
    public function getTestMap()
    {
        $code = 200;

        try {
            $this->validateSecurityToken();
            $serviceContext = $this->getRunnerService()->initServiceContext($this->getServiceContext());

            $response = [
                'testMap' => $this->getRunnerService()->getTestMap($serviceContext),
                'success' => true,
            ];
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getStatusCodeFromException($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * Provides the definition data and the state for a particular item
     */
    public function getItem()
    {
        $code = 200;

        $itemIdentifier = $this->getRequestParameter('itemDefinition');

        try {
            $serviceContext = $this->getServiceContext();

            //load item data
            $response = $this->getItemData($itemIdentifier);

            if (is_array($response)) {
                $response['success'] = true;
            } else {
                // Build an appropriate failure response.
                $response = [];
                $response['success'] = false;

                $userIdentifier = common_session_SessionManager::getSession()->getUser()->getIdentifier();
                common_Logger::e("Unable to retrieve item with identifier '${itemIdentifier}' for user '${userIdentifier}'.");
            }

            $this->getRunnerService()->startTimer($serviceContext);
        } catch (common_Exception $e) {
            $userIdentifier = common_session_SessionManager::getSession()->getUser()->getIdentifier();
            $msg = __CLASS__ . "::getItem(): Unable to retrieve item with identifier '${itemIdentifier}' for user '${userIdentifier}'.\n";
            $msg .= "Exception of type '" . get_class($e) . "' was thrown in '" . $e->getFile() . "' l." . $e->getLine() . " with message '" . $e->getMessage() . "'.";

            if ($e instanceof common_exception_Unauthorized) {
                // Log as debug as not being authorized is not a "real" system error.
                common_Logger::d($msg);
            } else {
                common_Logger::e($msg);
            }

            $response = $this->getErrorResponse($e);
            $code = $this->getStatusCodeFromException($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * Provides the definition data and the state for a list of items
     */
    public function getNextItemData()
    {
        $itemIdentifiers = $this->getRequestParameter('itemDefinition');

        if (!is_array($itemIdentifiers)) {
            $itemIdentifiers = [$itemIdentifiers];
        }

        try {
            $query = new ListItemsQuery(
                $this->getServiceContext(),
                $itemIdentifiers
            );

            /** @var ListItemsService $listItems */
            $listItems = $this->getPsrContainer()->get(ListItemsService::class);

            $response = $listItems($query);

            $this->returnJson($response->toArray());
        } catch (common_Exception $e) {
            $this->returnJson(
                $this->getErrorResponse($e),
                $this->getStatusCodeFromException($e)
            );
        }
    }

    /**
     * Create the item definition response for a given item
     * @param string $itemIdentifier the item id
     * @return array the item data
     * @throws common_Exception
     * @throws common_exception_Error
     * @throws common_exception_InvalidArgumentType
     */
    protected function getItemData($itemIdentifier)
    {
        $serviceContext = $this->getServiceContext();
        $itemRef        = $this->getRunnerService()->getItemHref($serviceContext, $itemIdentifier);
        $itemData       = $this->getRunnerService()->getItemData($serviceContext, $itemRef);
        $baseUrl        = $this->getRunnerService()->getItemPublicUrl($serviceContext, $itemRef);
        $portableElements = $this->getRunnerService()->getItemPortableElements($serviceContext, $itemRef);

        $itemState = $this->getRunnerService()->getItemState($serviceContext, $itemIdentifier);
        if (is_null($itemState) || !count($itemState)) {
            $itemState = new stdClass();
        }

        return [
            'baseUrl'        => $baseUrl,
            'itemData'       => $itemData,
            'itemState'      => $itemState,
            'itemIdentifier' => $itemIdentifier,
            'portableElements' => $portableElements
        ];
    }

    /**
     * Save the actual item state.
     * Requires params itemIdentifier and itemState
     * @return boolean true if saved
     * @throws \common_Exception
     */
    protected function saveItemState()
    {
        if ($this->hasRequestParameter('itemDefinition') && $this->hasRequestParameter('itemState')) {
            $serviceContext = $this->getServiceContext();
            $itemIdentifier = $this->getRequestParameter('itemDefinition');

            return $this->getRunnerService()->setItemState($serviceContext, $itemIdentifier, $this->getItemState());
        }
        return false;
    }

    /**
     * End the item timer and save the duration
     * Requires params itemDuration and optionaly consumedExtraTime
     * @return boolean true if saved
     * @throws \common_Exception
     */
    protected function endItemTimer()
    {
        if ($this->hasRequestParameter('itemDuration')) {
            $serviceContext    = $this->getServiceContext();
            $itemDuration      = $this->getRequestParameter('itemDuration');
            return $this->getRunnerService()->endTimer($serviceContext, $itemDuration);
        }
        return false;
    }

    /**
     * Save the item responses
     * Requires params itemDuration and optionally consumedExtraTime
     * @param boolean $emptyAllowed if we allow empty responses
     * @return boolean true if saved
     * @throws \common_Exception
     * @throws QtiRunnerEmptyResponsesException if responses are empty, emptyAllowed is false and no allowSkipping
     */
    protected function saveItemResponses($emptyAllowed = true)
    {
        if ($this->hasRequestParameter('itemDefinition') && $this->hasRequestParameter('itemResponse')) {
            $itemIdentifier = $this->getRequestParameter('itemDefinition');
            $serviceContext = $this->getServiceContext();
            $itemDefinition = $this->getRunnerService()->getItemHref($serviceContext, $itemIdentifier);

            //to read JSON encoded params
            $itemResponse = $this->getItemResponse();

            if ($serviceContext->getCurrentAssessmentItemRef()->getIdentifier() !== $itemIdentifier) {
                throw new QtiRunnerItemResponseException(__('Item response identifier does not match current item'));
            }

            if (!is_null($itemResponse) && !empty($itemDefinition)) {
                $responses = $this->getRunnerService()->parsesItemResponse($serviceContext, $itemDefinition, $itemResponse);

                //still verify allowSkipping & empty responses
                if (
                    !$emptyAllowed &&
                    $this->getRunnerService()->getTestConfig()->getConfigValue('enableAllowSkipping') &&
                    !TestRunnerUtils::doesAllowSkipping($serviceContext->getTestSession())
                ) {
                    if ($this->getRunnerService()->emptyResponse($serviceContext, $responses)) {
                        throw new QtiRunnerEmptyResponsesException();
                    }
                }

                return $this->getRunnerService()->storeItemResponse($serviceContext, $itemDefinition, $responses);
            }
        }
        return false;
    }

    /**
     * Stores the state object and the response set of a particular item
     */
    public function submitItem()
    {
        $code = 200;
        $successState = false;

        try {
            // get the service context, but do not perform the test state check,
            // as we need to store the item state whatever the test state is
            $this->validateSecurityToken();
            $serviceContext = $this->getServiceContext();
            $itemRef        = $this->getRunnerService()->getItemHref($serviceContext, $this->getRequestParameter('itemDefinition'));

            if (!$this->getRunnerService()->isTerminated($serviceContext)) {
                $this->endItemTimer();
                $successState = $this->saveItemState();
            }

            $this->getRunnerService()->initServiceContext($serviceContext);

            $successResponse = $this->saveItemResponses(false);
            $displayFeedback = $this->getRunnerService()->displayFeedbacks($serviceContext);

            $response = [
                'success' => $successState && $successResponse,
                'displayFeedbacks' => $displayFeedback
            ];

            if ($displayFeedback == true) {
                $response['feedbacks'] = $this->getRunnerService()->getFeedbacks($serviceContext, $itemRef);
                $response['itemSession'] = $this->getRunnerService()->getItemSession($serviceContext);
            }

            $this->getRunnerService()->persist($serviceContext);
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getStatusCodeFromException($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * Moves the current position to the provided scoped reference: item, section, part
     */
    public function move()
    {
        try {
            $this->validateSecurityToken();

            $moveCommand = new MoveCommand(
                $this->getServiceContext(),
                $this->hasRequestParameter('start')
            );

            $this->setNavigationContextToCommand($moveCommand);
            $this->setItemContextToCommand($moveCommand);
            $this->setToolsStateContextToCommand($moveCommand);

            /** @var MoveService $moveService */
            $moveService = $this->getPsrContainer()->get(MoveService::class);

            $response = $moveService($moveCommand);

            common_Logger::d('Test session state : ' . $this->getServiceContext()->getTestSession()->getState());

            $this->returnJson($response->toArray());
        } catch (common_Exception $e) {
            $this->returnJson(
                $this->getErrorResponse($e),
                $this->getStatusCodeFromException($e)
            );
        }
    }

    /**
     * Skip the current position to the provided scope: item, section, part
     */
    public function skip()
    {
        try {
            $this->validateSecurityToken();

            $command = new SkipCommand(
                $this->getServiceContext(),
                $this->hasRequestParameter('start')
            );

            $this->setNavigationContextToCommand($command);
            $this->setItemContextToCommand($command);
            $this->setToolsStateContextToCommand($command);

            /** @var SkipService $skip */
            $skip = $this->getPsrContainer()->get(SkipService::class);

            $response = $skip($command);

            $this->returnJson($response->toArray());
        } catch (common_Exception $e) {
            $this->returnJson(
                $this->getErrorResponse($e),
                $this->getStatusCodeFromException($e)
            );
        }
    }

    /**
     * Handles a test timeout
     */
    public function timeout()
    {
        try {
            $this->validateSecurityToken();

            $command = new TimeoutCommand(
                $this->getServiceContext(),
                $this->hasRequestParameter('start'),
                $this->hasRequestParameter('late')
            );

            $this->setNavigationContextToCommand($command);
            $this->setItemContextToCommand($command);
            $this->setToolsStateContextToCommand($command);

            /** @var TimeoutService $timeout */
            $timeout = $this->getPsrContainer()->get(TimeoutService::class);

            $response = $timeout($command);

            $this->returnJson($response->toArray());
        } catch (common_Exception $e) {
            $this->returnJson(
                $this->getErrorResponse($e),
                $this->getStatusCodeFromException($e)
            );
        }
    }

    /**
     * Exits the test before its end
     */
    public function exitTest()
    {
        try {
            $this->validateSecurityToken();

            $command = new ExitTestCommand($this->getServiceContext());

            $this->setNavigationContextToCommand($command);
            $this->setItemContextToCommand($command);
            $this->setToolsStateContextToCommand($command);

            /** @var ExitTestService $exitTest */
            $exitTest = $this->getPsrContainer()->get(ExitTestService::class);

            $response = $exitTest($command);

            $this->returnJson($response->toArray());
        } catch (common_Exception $e) {
            $this->returnJson(
                $this->getErrorResponse($e),
                $this->getStatusCodeFromException($e)
            );
        }
    }

    /**
     * @param  bool  $isTerminated
     * @return bool
     * @throws common_Exception
     * @throws common_ext_ExtensionException
     */
    private function shouldTimerStopOnPause(bool $isTerminated)
    {
        if (!$isTerminated) {
            $timerTarget = $this->getRunnerService()->getTestConfig()->getConfigValue('timer.target');
            if ($timerTarget === 'client') {
                return  true;
            }
        }
        return false;
    }

    /**
     * Sets the test in paused state
     */
    public function pause()
    {
        try {
            $this->validateSecurityToken();

            $command = new PauseCommand($this->getServiceContext());

            $this->setItemContextToCommand($command);

            /** @var PauseService $pause */
            $pause = $this->getPsrContainer()->get(PauseService::class);

            $response = $pause($command);

            $this->returnJson($response->toArray());
        } catch (common_Exception $e) {
            $this->createErrorResponseFromException($e);
        }
    }

    /**
     * Resumes the test from paused state
     */
    public function resume()
    {
        $code = 200;

        try {
            $this->validateSecurityToken();
            /** @var QtiRunnerServiceContext $serviceContext */
            $serviceContext = $this->getRunnerService()->initServiceContext($this->getServiceContext());
            $result = $this->getRunnerService()->resume($serviceContext);

            $response = [
                'success' => $result,
            ];

            if ($result) {
                $response['testContext'] = $this->getRunnerService()->getTestContext($serviceContext);

                if ($serviceContext->containsAdaptive()) {
                    // Force map update.
                    $response['testMap'] = $this->getRunnerService()->getTestMap($serviceContext, true);
                }
            }

            $this->getRunnerService()->persist($serviceContext);
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getStatusCodeFromException($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * Flag an item
     */
    public function flagItem()
    {
        $code = 200;

        try {
            $this->validateSecurityToken();
            $serviceContext = $this->getRunnerService()->initServiceContext($this->getServiceContext());
            $testSession = $serviceContext->getTestSession();

            if ($this->hasRequestParameter('position')) {
                $itemPosition = intval($this->getRequestParameter('position'));
            } else {
                $itemPosition = $testSession->getRoute()->getPosition();
            }

            if ($this->hasRequestParameter('flag')) {
                $flag = $this->getRequestParameter('flag');
                if (is_numeric($flag)) {
                    $flag = (bool)(int)$flag;
                } else {
                    $flag = 'false' !== strtolower($flag);
                }
            } else {
                $flag = true;
            }

            TestRunnerUtils::setItemFlag($testSession, $itemPosition, $flag, $serviceContext);

            $response = [
                'success' => true,
            ];
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getStatusCodeFromException($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * Comment the test
     */
    public function comment()
    {
        $code = 200;

        $comment = $this->getRequestParameter('comment');

        try {
            $this->validateSecurityToken();
            $serviceContext = $this->getRunnerService()->initServiceContext($this->getServiceContext());
            $result = $this->getRunnerService()->comment($serviceContext, $comment);

            $response = [
                'success' => $result,
            ];
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getStatusCodeFromException($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * allow client to store information about the test, the section or the item
     */
    public function storeTraceData()
    {
        try {
            $this->validateSecurityToken();

            $traceVariables = json_decode(
                html_entity_decode($this->getRequestParameter('traceData')),
                true
            );

            $command = new StoreTraceVariablesCommand(
                $this->getServiceContext(),
                $traceVariables,
                $this->getRequestParameter('itemDefinition') ?: null
            );

            /** @var StoreTraceVariablesService $storeTraceVariables */
            $storeTraceVariables = $this->getPsrContainer()->get(StoreTraceVariablesService::class);

            $response = $storeTraceVariables($command);

            common_Logger::d('Stored ' . count($traceVariables) . ' trace variables');

            $this->returnJson($response->toArray());
        } catch (common_Exception $e) {
            $this->returnJson(
                $this->getErrorResponse($e),
                $this->getStatusCodeFromException($e)
            );
        }
    }

    /**
     * The smallest telemetry signal,
     * just to know the server is up.
     */
    public function up()
    {
        $this->returnJson([
            'success' => true
        ], 200);
    }

    /**
     * Manage the bidirectional communication
     * @throws common_Exception
     * @throws common_exception_Error
     * @throws common_exception_Unauthorized
     * @throws common_ext_ExtensionException
     */
    public function messages()
    {
        $code = 200;

        $this->validateSecurityToken(); // will return 500 on error

        // close the PHP session to prevent session overwriting and loss of security token for secured queries
        session_write_close();

        try {
            $input = taoQtiCommon_helpers_Utils::readJsonPayload();
            if (!$input) {
                $input = [];
            }

            $serviceContext = $this->getServiceContext();

            /* @var $communicationService CommunicationService */
            $communicationService = $this->getServiceLocator()->get(QtiCommunicationService::SERVICE_ID);

            $response = [
                'responses' => $communicationService->processInput($serviceContext, $input),
                'messages' => $communicationService->processOutput($serviceContext),
                'success' => true,
            ];
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getStatusCodeFromException($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * @return QtiRunnerService
     */
    protected function getRunnerService()
    {
        /** @noinspection PhpIncompatibleReturnTypeInspection */
        return $this->getServiceLocator()->get(QtiRunnerService::SERVICE_ID);
    }

    /**
     *
     * For RunnerToolStates
     *
     * @param $name
     * @return mixed
     * @throws common_exception_MissingParameter
     */
    protected function getRawRequestParameter($name)
    {
        $parameters = $this->getRequest()->getRawParameters();
        if (!array_key_exists($name, $parameters)) {
            throw new common_exception_MissingParameter(sprintf('No such parameter "%s"', $name));
        }
        return $parameters[$name];
    }

    /**
     * @param QtiRunnerServiceContext $serviceContext
     * @return array
     * @throws QtiRunnerClosedException
     * @throws \oat\oatbox\service\exception\InvalidServiceManagerException
     * @throws \qtism\runtime\storage\common\StorageException
     * @throws common_Exception
     * @throws common_exception_Error
     * @throws common_exception_InvalidArgumentType
     * @throws common_ext_ExtensionException
     */
    protected function getInitResponse(QtiRunnerServiceContext $serviceContext)
    {
        if (
            $this->hasRequestParameter('clientState')
            && $this->getRequestParameter('clientState') === 'paused'
        ) {
            $this->getRunnerService()->pause($serviceContext);
            $this->getRunnerService()->check($serviceContext);
        }

        $result = $this->getRunnerService()->init($serviceContext);
        $this->getRunnerService()->persist($serviceContext);

        if ($result) {
            return array_merge(...[
                $this->getInitSerializedResponse($serviceContext),
                [ 'success' => true ],
            ]);
        }

        return [
            'success' => false,
        ];
    }

    /**
     * Checks the storeId request parameter and returns the last store id if set, false otherwise
     *
     * @param QtiRunnerServiceContext $serviceContext
     * @return string|boolean
     * @throws common_exception_InvalidArgumentType
     */
    private function getClientStoreId(QtiRunnerServiceContext $serviceContext)
    {
        if (
            $this->hasRequestParameter('storeId')
            && preg_match('/^[a-z0-9\-]+$/i', $this->getRequestParameter('storeId'))
        ) {
            return $this->getRunnerService()->switchClientStoreId(
                $serviceContext,
                $this->getRequestParameter('storeId')
            );
        }

        return false;
    }

    /**
     * @param QtiRunnerServiceContext $serviceContext
     * @return array
     * @throws \oat\oatbox\service\exception\InvalidServiceManagerException
     * @throws common_Exception
     * @throws common_exception_InvalidArgumentType
     * @throws common_ext_ExtensionException
     */
    private function getInitSerializedResponse(QtiRunnerServiceContext $serviceContext)
    {
        return [
            'success' => true,
            'testData' => $this->getRunnerService()->getTestData($serviceContext),
            'testContext' => $this->getRunnerService()->getTestContext($serviceContext),
            'testMap' => $this->getRunnerService()->getTestMap($serviceContext),
            'toolStates' => $this->getToolStates(),
            'lastStoreId' => $this->getClientStoreId($serviceContext),
        ];
    }

    private function getSessionService(): SessionService
    {
        return $this->getServiceLocator()->get(SessionService::class);
    }

    private function getDeliveryExecutionService(): DeliveryExecutionService
    {
        return $this->getServiceLocator()->get(DeliveryExecutionService::SERVICE_ID);
    }

    private function getRuntimeService(): RuntimeService
    {
        return $this->getServiceLocator()->get(RuntimeService::SERVICE_ID);
    }

    private function getItemDuration(): ?float
    {
        if (!$this->hasRequestParameter('itemDuration')) {
            return null;
        }

        return (float)$this->getRequestParameter('itemDuration');
    }

    private function getItemState(): ?array
    {
        $params = $this->getRequest()->getRawParameters();

        if (!isset($params['itemState'])) {
            return null;
        }

        return (array)json_decode($params['itemState'], true);
    }

    private function getItemResponse(): ?array
    {
        $params = $this->getRequest()->getRawParameters();

        if (!isset($params['itemResponse'])) {
            return null;
        }

        return (array)json_decode($params['itemResponse'], true);
    }

    private function setNavigationContextToCommand(NavigationContextAwareInterface $command): void
    {
        $command->setNavigationContext(
            $this->getRequestParameter('direction') ?? '',
            $this->getRequestParameter('scope'),
            $this->getRequestParameter('ref')
        );
    }

    private function setItemContextToCommand(ItemContextAwareInterface $command): void
    {
        if (empty($this->getRequestParameter('itemDefinition'))) {
            return;
        }

        $command->setItemContext(
            $this->getRequestParameter('itemDefinition'),
            $this->getItemState(),
            $this->getItemDuration(),
            $this->getItemResponse()
        );
    }

    private function setToolsStateContextToCommand(ToolsStateAwareInterface $command): void
    {
        $command->setToolsState($this->getToolStatesFromRequest());
    }

    private function createErrorResponseFromException(Exception $exception): void
    {
        $this->returnJson(
            $this->getErrorResponse($exception),
            $this->getStatusCodeFromException($exception)
        );
    }
}
