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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */

use oat\taoQtiTest\models\event\TraceVariableStored;
use oat\taoQtiTest\models\runner\communicator\CommunicationService;
use oat\taoQtiTest\models\runner\QtiRunnerClosedException;
use oat\taoQtiTest\models\runner\QtiRunnerEmptyResponsesException;
use oat\taoQtiTest\models\runner\QtiRunnerItemResponseException;
use oat\taoQtiTest\models\runner\QtiRunnerMessageService;
use oat\taoQtiTest\models\runner\QtiRunnerPausedException;
use oat\libCat\exception\CatEngineConnectivityException;
use oat\taoQtiTest\models\cat\CatEngineNotFoundException;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\communicator\QtiCommunicationService;
use oat\taoQtiTest\models\runner\StorageManager;
use taoQtiTest_helpers_TestRunnerUtils as TestRunnerUtils;
use oat\taoQtiTest\models\runner\RunnerToolStates;
use oat\tao\model\routing\AnnotationReader\security;
use oat\taoDelivery\model\execution\DeliveryExecutionService;
use oat\taoDelivery\model\RuntimeService;
use oat\taoQtiTest\models\container\QtiTestDeliveryContainer;

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
        // Prevent anything to be cached by the client.
        TestRunnerUtils::noHttpClientCache();
    }

    /**
     * @return StorageManager
     */
    protected function getStorageManager()
    {
        return $this->getServiceManager()->get(StorageManager::SERVICE_ID);
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
            $httpStatus = $this->getErrorCode($e);
        }

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
        } else {
            return $this->getRequestParameter('serviceCallId');
        }
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
            $execution = $this->getServiceLocator()->get(DeliveryExecutionService::SERVICE_ID)->getDeliveryExecution($testExecution);
            $delivery = $execution->getDelivery();
            $container = $this->getServiceLocator()->get(RuntimeService::SERVICE_ID)->getDeliveryContainer($delivery->getUri());
            if (!$container instanceof QtiTestDeliveryContainer) {
                throw new common_Exception('Non QTI test container '.get_class($container).' in qti test runner');
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
    protected function checkSecurityToken()
    {
        $config = $this->getRunnerService()->getTestConfig()->getConfigValue('security');
        if (isset($config['csrfToken']) && $config['csrfToken'] === true) {
            $this->validateCsrf();
        }
    }

    /**
     * Gets an error response object
     * @param Exception [$e] Optional exception from which extract the error context
     * @param array $prevResponse Response before catch
     * @return array
     */
    protected function getErrorResponse($e = null, $prevResponse = [])
    {
        $response = [
            'success' => false,
            'type' => 'error',
        ];

        if ($e) {
            if ($e instanceof \Exception) {
                $response['type'] = 'exception';
                $response['code'] = $e->getCode();
            }

            if ($e instanceof \common_exception_UserReadableException) {
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

                case $e instanceof \tao_models_classes_FileNotFoundException:
                    $response['type'] = 'FileNotFound';
                    $response['message'] = __('File not found');
                    break;

                case $e instanceof \common_exception_Unauthorized:
                    $response['code'] = 403;
                    break;
            }
        }

        return $response;
    }

    /**
     * Gets an HTTP response code
     * @param Exception [$e] Optional exception from which extract the error context
     * @return int
     */
    protected function getErrorCode($e = null)
    {
        $code = 200;
        if ($e) {
            $code = 500;

            switch (true) {
                case $e instanceof CatEngineConnectivityException:
                case $e instanceof CatEngineNotFoundException:
                case $e instanceof QtiRunnerEmptyResponsesException:
                case $e instanceof QtiRunnerClosedException:
                case $e instanceof QtiRunnerPausedException:
                    $code = 200;
                    break;

                case $e instanceof \common_exception_NotImplemented:
                case $e instanceof \common_exception_NoImplementation:
                case $e instanceof \common_exception_Unauthorized:
                    $code = 403;
                    break;

                case $e instanceof \tao_models_classes_FileNotFoundException:
                    $code = 404;
                    break;
            }
        }
        return $code;
    }

    /**
     * Initializes the delivery session
     * @throws common_Exception
     */
    public function init()
    {
        /** @var QtiRunnerServiceContext $serviceContext */
        $serviceContext = $this->getRunnerService()->initServiceContext($this->getServiceContext());

        $this->checkSecurityToken();

        try {
            $this->returnJson($this->getInitResponse($serviceContext));
        } catch (\Exception $e) {
            $this->returnJson(
                $this->getErrorResponse($e),
                $this->getErrorCode($e)
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
            $this->checkSecurityToken();
            $serviceContext = $this->getRunnerService()->initServiceContext($this->getServiceContext());

            $response = [
                'testData' => $this->getRunnerService()->getTestData($serviceContext),
                'success' => true,
            ];
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getErrorCode($e);
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
            $this->checkSecurityToken();
            $serviceContext = $this->getRunnerService()->initServiceContext($this->getServiceContext());

            $response = [
                'testContext' => $this->getRunnerService()->getTestContext($serviceContext),
                'success' => true,
            ];
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getErrorCode($e);
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
            $this->checkSecurityToken();
            $serviceContext = $this->getRunnerService()->initServiceContext($this->getServiceContext());

            $response = [
                'testMap' => $this->getRunnerService()->getTestMap($serviceContext),
                'success' => true,
            ];
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getErrorCode($e);
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
            $this->checkSecurityToken();
            $serviceContext = $this->getServiceContext();

            //load item data
            $response = $this->getItemData($itemIdentifier);

            if (is_array($response)) {
                $response['success'] = true;
            } else {
                // Build an appropriate failure response.
                $response = [];
                $response['success'] = false;

                $userIdentifier = \common_session_SessionManager::getSession()->getUser()->getIdentifier();
                \common_Logger::e("Unable to retrieve item with identifier '${itemIdentifier}' for user '${userIdentifier}'.");
            }

            $this->getRunnerService()->startTimer($serviceContext);
        } catch (common_Exception $e) {
            $userIdentifier = \common_session_SessionManager::getSession()->getUser()->getIdentifier();
            $msg = __CLASS__ . "::getItem(): Unable to retrieve item with identifier '${itemIdentifier}' for user '${userIdentifier}'.\n";
            $msg .= "Exception of type '" . get_class($e) . "' was thrown in '" . $e->getFile() . "' l." . $e->getLine() . " with message '" . $e->getMessage() . "'.";

            if ($e instanceof \common_exception_Unauthorized) {
                // Log as debug as not being authorized is not a "real" system error.
                \common_Logger::d($msg);
            } else {
                \common_Logger::e($msg);
            }

            $response = $this->getErrorResponse($e);
            $code = $this->getErrorCode($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * Provides the definition data and the state for a list of items
     */
    public function getNextItemData()
    {
        $code = 200;

        $itemIdentifier = $this->getRequestParameter('itemDefinition');
        if (!is_array($itemIdentifier)) {
            $itemIdentifier = [$itemIdentifier];
        }

        try {
            $this->checkSecurityToken();

            if (!$this->getRunnerService()->getTestConfig()->getConfigValue('itemCaching.enabled')) {
                \common_Logger::w("Attempt to disclose the next items without the configuration");
                throw new \common_exception_Unauthorized();
            }

            $response = [];
            foreach ($itemIdentifier as $itemId) {
                //load item data
                $response['items'][] = $this->getItemData($itemId);
            }

            if (isset($response['items'])) {
                $response['success'] = true;
            }
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getErrorCode($e);
        }

        $this->returnJson($response, $code);
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

            //to read JSON encoded params
            $params = $this->getRequest()->getRawParameters();
            $itemState  = isset($params['itemState']) ? $params['itemState'] : new stdClass();

            $state   =  json_decode($itemState, true);

            return $this->getRunnerService()->setItemState($serviceContext, $itemIdentifier, $state);
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
            $params = $this->getRequest()->getRawParameters();
            $itemResponse = isset($params['itemResponse']) ? $params['itemResponse'] : null;

            if ($serviceContext->getCurrentAssessmentItemRef()->getIdentifier() !== $itemIdentifier) {
                throw new QtiRunnerItemResponseException(__('Item response identifier does not match current item'));
            }

            if (!is_null($itemResponse) && ! empty($itemDefinition)) {
                $responses = $this->getRunnerService()->parsesItemResponse($serviceContext, $itemDefinition, json_decode($itemResponse, true));

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
            $this->checkSecurityToken();
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
            $code = $this->getErrorCode($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * Moves the current position to the provided scoped reference: item, section, part
     */
    public function move()
    {
        $code = 200;

        $ref               = $this->getRequestParameter('ref');
        $direction         = $this->getRequestParameter('direction');
        $scope             = $this->getRequestParameter('scope');
        $start             = $this->hasRequestParameter('start');

        try {
            $this->checkSecurityToken();
            $serviceContext = $this->getServiceContext();

            if (!$this->getRunnerService()->isTerminated($serviceContext)) {
                $this->endItemTimer();
                $this->saveItemState();
            }

            $this->getRunnerService()->initServiceContext($serviceContext);

            $this->saveItemResponses(false);
            $this->saveToolStates();

            $serviceContext->getTestSession()->initItemTimer();
            $result = $this->getRunnerService()->move($serviceContext, $direction, $scope, $ref);

            $response = [
                'success' => $result
            ];

            if ($result) {
                $response['testContext'] = $this->getRunnerService()->getTestContext($serviceContext);

                if ($serviceContext->containsAdaptive()) {
                    // Force map update.
                    $response['testMap'] = $this->getRunnerService()->getTestMap($serviceContext, true);
                }
            }

            \common_Logger::d('Test session state : ' . $serviceContext->getTestSession()->getState());

            $this->getRunnerService()->persist($serviceContext);

            if ($start == true) {
                // start the timer only when move starts the item session
                // and after context build to avoid timing error
                $this->getRunnerService()->startTimer($serviceContext);
            }
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getErrorCode($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * Skip the current position to the provided scope: item, section, part
     */
    public function skip()
    {
        $code = 200;

        $ref               = $this->getRequestParameter('ref');
        $scope             = $this->getRequestParameter('scope');
        $start             = $this->hasRequestParameter('start');

        try {
            $this->checkSecurityToken();
            $serviceContext = $this->getRunnerService()->initServiceContext($this->getServiceContext());

            $this->saveToolStates();

            $this->endItemTimer();

            $result = $this->getRunnerService()->skip($serviceContext, $scope, $ref);

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

            if ($start == true) {
                // start the timer only when move starts the item session
                // and after context build to avoid timing error
                $this->getRunnerService()->startTimer($serviceContext);
            }
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getErrorCode($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * Handles a test timeout
     */
    public function timeout()
    {
        $code = 200;

        $ref   = $this->getRequestParameter('ref');
        $scope = $this->getRequestParameter('scope');
        $start = $this->hasRequestParameter('start');
        $late = $this->hasRequestParameter('late');

        try {
            $this->checkSecurityToken();
            $serviceContext = $this->getServiceContext();

            if (!$this->getRunnerService()->isTerminated($serviceContext)) {
                $this->endItemTimer();
                $this->saveItemState();
            }

            $this->getRunnerService()->initServiceContext($serviceContext);

            $this->saveItemResponses();
            $this->saveToolStates();

            $result = $this->getRunnerService()->timeout($serviceContext, $scope, $ref, $late);

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

            if ($start == true) {
                // start the timer only when move starts the item session
                // and after context build to avoid timing error
                $this->getRunnerService()->startTimer($serviceContext);
            }
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getErrorCode($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * Exits the test before its end
     */
    public function exitTest()
    {
        $code = 200;

        try {
            $this->checkSecurityToken();
            $serviceContext = $this->getServiceContext();

            if (!$this->getRunnerService()->isTerminated($serviceContext)) {
                $this->endItemTimer();
                $this->saveItemState();
            }

            $this->getRunnerService()->initServiceContext($serviceContext);

            $this->saveItemResponses();
            $this->saveToolStates();

            $response = [
                'success' => $this->getRunnerService()->exitTest($serviceContext),
            ];

            $this->getRunnerService()->persist($serviceContext);
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getErrorCode($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * @return bool
     * @throws common_Exception
     * @throws common_ext_ExtensionException
     */
    private function shouldTimerStopOnPause()
    {
        $isTerminated = $this->getRunnerService()->isTerminated($this->getServiceContext());
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
        $code = 200;

        try {
            $this->checkSecurityToken();

            $serviceContext = $this->getServiceContext();

            if ($this->shouldTimerStopOnPause()) {
                $this->endItemTimer();
            }

            $serviceContext = $this->getRunnerService()->initServiceContext($serviceContext);

            $response = [
                'success' => $this->getRunnerService()->pause($serviceContext),
            ];
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getErrorCode($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * Resumes the test from paused state
     */
    public function resume()
    {
        $code = 200;

        try {
            $this->checkSecurityToken();
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
            $code = $this->getErrorCode($e);
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
            $this->checkSecurityToken();
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
                    $flag = !!(intval($flag));
                } else {
                    $flag = 'false' != strtolower($flag);
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
            $code = $this->getErrorCode($e);
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
            $this->checkSecurityToken();
            $serviceContext = $this->getRunnerService()->initServiceContext($this->getServiceContext());
            $result = $this->getRunnerService()->comment($serviceContext, $comment);

            $response = [
                'success' => $result,
            ];
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getErrorCode($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * allow client to store information about the test, the section or the item
     */
    public function storeTraceData()
    {
        $code = 200;

        $traceData = json_decode(html_entity_decode($this->getRequestParameter('traceData')), true);

        try {
            $this->checkSecurityToken();
            $serviceContext = $this->getServiceContext();
            if ($this->hasRequestParameter('itemDefinition')) {
                $itemRef = $this->getRunnerService()->getItemHref($serviceContext, $this->getRequestParameter('itemDefinition'));
            } else {
                $itemRef = null;
            }

            $stored = 0;
            $size   = count($traceData);

            foreach ($traceData as $variableIdentifier => $variableValue) {
                if ($this->getRunnerService()->storeTraceVariable($serviceContext, $itemRef, $variableIdentifier, $variableValue)) {
                    $stored++;
                }
            }

            $response = [
                'success' => $stored == $size
            ];
            common_Logger::d("Stored {$stored}/{$size} trace variables");
            $eventManager = $this->getServiceManager()->get(\oat\oatbox\event\EventManager::SERVICE_ID);
            $event = new TraceVariableStored($serviceContext->getTestSession()->getSessionId(), $traceData);
            $eventManager->trigger($event);
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getErrorCode($e);
        }

        $this->returnJson($response, $code);
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

        $this->checkSecurityToken(); // will return 500 on error

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
            $code = $this->getErrorCode($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * @return QtiRunnerService
     */
    protected function getRunnerService()
    {
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
}
