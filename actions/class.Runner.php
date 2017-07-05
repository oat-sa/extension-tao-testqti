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
use oat\taoQtiTest\models\runner\QtiRunnerClosedException;
use oat\taoQtiTest\models\runner\QtiRunnerEmptyResponsesException;
use oat\taoQtiTest\models\runner\QtiRunnerMessageService;
use oat\taoQtiTest\models\runner\QtiRunnerPausedException;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\communicator\QtiCommunicationService;
use oat\taoQtiTest\models\runner\map\QtiRunnerMap;
use oat\tao\model\security\xsrf\TokenService;
use taoQtiTest_helpers_TestRunnerUtils as TestRunnerUtils;

/**
 * Class taoQtiTest_actions_Runner
 *
 * Serves QTI implementation of the test runner
 */
class taoQtiTest_actions_Runner extends tao_actions_ServiceModule
{
    /**
     * The runner implementation
     * @var QtiRunnerService
     */
    protected $runnerService;

    /**
     * The current test session
     * @var QtiRunnerServiceContext
     */
    protected $serviceContext;


    /**
     * taoQtiTest_actions_Runner constructor.
     */
    public function __construct()
    {
        $this->runnerService = $this->getServiceManager()->get(QtiRunnerService::SERVICE_ID);

        // Prevent anything to be cached by the client.
        TestRunnerUtils::noHttpClientCache();
    }

    /**
     * Get the token service
     * @return TokenService
     */
    protected function getTokenService()
    {
        return $this->getServiceManager()->get(TokenService::SERVICE_ID);
    }

    /**
     * @param $data
     * @param int [$httpStatus]
     * @param bool [$token]
     */
    protected function returnJson($data, $httpStatus = 200, $token = true)
    {
        // auto append the CSRF token to the result
        if ($token) {
            if (is_array($data)) {
                if ($data['success'] || $httpStatus != 403) {
                    $data['token'] = $this->getTokenService()->createToken();
                }
            } else if (is_object($data)) {
                if ($data->success || $httpStatus != 403) {
                    $data->token = $this->getTokenService()->createToken();
                }
            }
        }

        // auto append platform messages, if any
        if ($this->serviceContext && !isset($data['messages'])) {
            /* @var $communicationService \oat\taoQtiTest\models\runner\communicator\CommunicationService */
            $communicationService = $this->getServiceManager()->get(QtiCommunicationService::SERVICE_ID);
            $data['messages'] = $communicationService->processOutput($this->serviceContext);
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
     * @param bool [$check] Checks the context after create. Default to true.
     * @param bool [$checkToken] Checks the security token.
     * @return QtiRunnerServiceContext
     * @throws \common_Exception
     */
    protected function getServiceContext($check = true, $checkToken = true)
    {
        if (!$this->serviceContext) {
            $testDefinition = $this->getRequestParameter('testDefinition');
            $testCompilation = $this->getRequestParameter('testCompilation');

            if ($checkToken) {

                $config = $this->runnerService->getTestConfig()->getConfigValue('security');
                if(isset($config['csrfToken']) && $config['csrfToken'] == true){

                    $csrfToken = $this->getRequestParameter('X-Auth-Token');
                    if($this->getTokenService()->checkToken($csrfToken)){
                        $this->getTokenService()->revokeToken($csrfToken);
                    } else {
                        \common_Logger::e("XSRF attempt! The token $csrfToken is no longer valid! " .
                                          "or the previous request failed silently without creating a token");
                        throw new \common_exception_Unauthorized();
                    }
                }
            }

            $testExecution = $this->getSessionId();
            $this->serviceContext = $this->runnerService->getServiceContext($testDefinition, $testCompilation, $testExecution, $check);
        }

        return $this->serviceContext;
    }


    /**
     * Initialize and verify the current service context
     * useful when the context was opened but not checked.
     * @return boolean true if initialized
     * @throws \common_Exception
     */
    protected function initServiceContext()
    {
        $serviceContext = $this->getServiceContext(false, false);
        $this->runnerService->check($serviceContext);
        return $serviceContext->init();
    }

    /**
     * Gets an error response object
     * @param Exception [$e] Optional exception from which extract the error context
     * @return array
     */
    protected function getErrorResponse($e = null) {
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
                $response['message'] = __('An error occurred!');
            }

            switch (true) {
                case $e instanceof QtiRunnerClosedException:
                case $e instanceof QtiRunnerPausedException:
                    if ($this->serviceContext) {
                        $messageService = $this->getServiceManager()->get(QtiRunnerMessageService::SERVICE_ID);
                        $response['message'] = $messageService->getStateMessage($this->serviceContext->getTestSession());
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
    protected function getErrorCode($e = null) {
        $code = 200;
        if ($e) {
            $code = 500;

            switch (true) {
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
     * Gets the state identifier for the current itemRef
     * @param string $itemIdentifier the item id
     * @return string the state id
     */
    protected function getStateId($itemIdentifier)
    {
        $serviceContext = $this->getServiceContext(false, false);
        return  $serviceContext->getTestExecutionUri() . $itemIdentifier;
    }
    
    /**
     * Gets the item reference for the current itemRef
     * @todo TAO-4605 remove/adapt this temporary workaround
     * @param string $itemIdentifier the item id
     * @return string the state id
     */
    protected function getItemRef($itemIdentifier)
    {
        $serviceContext = $this->getServiceContext(false, false);
        $mapService     = $this->getServiceManager()->get(QtiRunnerMap::SERVICE_ID);
        return $mapService->getItemHref($serviceContext, $itemIdentifier);
    }

    /**
     * Initializes the delivery session
     */
    public function init()
    {
        $code = 200;

        try {
            $serviceContext = $this->getServiceContext(true, false);


            if ($this->hasRequestParameter('clientState')) {
                $clientState = $this->getRequestParameter('clientState');
                if ('paused' == $clientState) {
                    $this->runnerService->pause($serviceContext);
                    $this->runnerService->check($serviceContext);
                }
            }

            $lastStoreId = false;
            if($this->hasRequestParameter('storeId')){
                $receivedStoreId =  $this->getRequestParameter('storeId');
                if(preg_match('/^[a-z0-9\-]+$/i', $receivedStoreId)) {
                    $lastStoreId = $this->runnerService->switchClientStoreId($serviceContext, $receivedStoreId);
                }
            }

            $result = $this->runnerService->init($serviceContext);

            $response = [
                'success' => $result,
            ];

            if ($result) {
                $response['testData'] = $this->runnerService->getTestData($serviceContext);
                $response['testContext'] = $this->runnerService->getTestContext($serviceContext);
                $response['testMap'] = $this->runnerService->getTestMap($serviceContext);
                $response['lastStoreId'] = $lastStoreId;
            }

            $this->runnerService->persist($serviceContext);
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getErrorCode($e);
        }


        $this->returnJson($response, $code);
    }

    /**
     * Provides the test definition data
     */
    public function getTestData()
    {
        $code = 200;

        try {
            $serviceContext = $this->getServiceContext();

            $response = [
                'testData' => $this->runnerService->getTestData($serviceContext),
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
            $serviceContext = $this->getServiceContext();

            $response = [
                'testContext' => $this->runnerService->getTestContext($serviceContext),
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
            $serviceContext = $this->getServiceContext();

            $response = [
                'testMap' => $this->runnerService->getTestMap($serviceContext),
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
        $start          = $this->hasRequestParameter('start');

        try {
            $serviceContext = $this->getServiceContext(false, true);

            if (is_array($itemIdentifier)) {
                if (!$this->runnerService->getTestConfig()->getConfigValue('itemCaching.enabled')) {
                    \common_Logger::w("Attempt to disclose the next items without the configuration");
                    throw new \common_exception_Unauthorized();
                }
                
                $response = [];
                foreach ($itemIdentifier as $itemId) {
                    //load item data
                    $response['items'][] = $this->getItemData($itemId);
                }
            } else {
                //load item data
                $response = $this->getItemData($itemIdentifier);
            }

            if (is_array($response)) {
                $response['success'] = true;
            }

            if ($start == true) {
                // start the timer only when getItem starts the item session
                // and after the action has been processed to avoid timing error
                $this->runnerService->startTimer($serviceContext);
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
     */
    protected function getItemData($itemIdentifier)
    {
        $serviceContext = $this->getServiceContext(false, false);
        $itemRef        = $this->getItemRef($itemIdentifier);
        $itemData       = $this->runnerService->getItemData($serviceContext, $itemRef);
        $baseUrl        = $this->runnerService->getItemPublicUrl($serviceContext, $itemRef);

        $itemState = $this->runnerService->getItemState($serviceContext, $this->getStateId($itemIdentifier));
        if ( is_null($itemState) || !count($itemState)) {
            $itemState = new stdClass();
        }

        return [
            'baseUrl'        => $baseUrl,
            'itemData'       => $itemData,
            'itemState'      => $itemState,
            'itemIdentifier' => $itemIdentifier,
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
        if($this->hasRequestParameter('itemDefinition') && $this->hasRequestParameter('itemState')) {
            $serviceContext = $this->getServiceContext(false, false);
            $itemIdentifier = $this->getRequestParameter('itemDefinition');

            //to read JSON encoded params
            $params = $this->getRequest()->getRawParameters();
            $itemState  = isset($params['itemState']) ? $params['itemState'] : new stdClass();

            $stateId =  $this->getStateId($itemIdentifier);
            $state   =  json_decode($itemState, true);

            return $this->runnerService->setItemState($serviceContext, $stateId, $state);
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
        if($this->hasRequestParameter('itemDuration')){
            $serviceContext    = $this->getServiceContext(false, false);
            $itemDuration      = $this->getRequestParameter('itemDuration');
            $consumedExtraTime = $this->getRequestParameter('consumedExtraTime');
            return $this->runnerService->endTimer($serviceContext, $itemDuration, $consumedExtraTime);
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
        if($this->hasRequestParameter('itemDefinition') && $this->hasRequestParameter('itemResponse')){

            $itemDefinition = $this->getItemRef($this->getRequestParameter('itemDefinition'));
            $serviceContext = $this->getServiceContext(false, false);

            //to read JSON encoded params
            $params = $this->getRequest()->getRawParameters();
            $itemResponse = isset($params['itemResponse']) ? $params['itemResponse'] : null;

            if(!is_null($itemResponse) && ! empty($itemDefinition)) {

                $responses = $this->runnerService->parsesItemResponse($serviceContext, $itemDefinition, json_decode($itemResponse, true));

                //still verify allowSkipping & empty responses
                if( !$emptyAllowed &&
                    $this->runnerService->getTestConfig()->getConfigValue('enableAllowSkipping') &&
                    !TestRunnerUtils::doesAllowSkipping($serviceContext->getTestSession())){

                    if($this->runnerService->emptyResponse($serviceContext, $responses)){
                        throw new QtiRunnerEmptyResponsesException();
                    }
                }

                return $this->runnerService->storeItemResponse($serviceContext, $itemDefinition, $responses);
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

        $itemRef = $this->getItemRef($this->getRequestParameter('itemDefinition'));

        try {
            // get the service context, but do not perform the test state check,
            // as we need to store the item state whatever the test state is
            $serviceContext = $this->getServiceContext(false, true);

            if (!$this->runnerService->isTerminated($serviceContext)) {
                $this->endItemTimer();
                $successState = $this->saveItemState();
            }
            $this->initServiceContext();

            $successResponse = $this->saveItemResponses(false);
            $displayFeedback = $this->runnerService->displayFeedbacks($serviceContext);

            $response = [
                'success' => $successState && $successResponse,
                'displayFeedbacks' => $displayFeedback
            ];

            if ($displayFeedback == true) {
                $response['feedbacks'] = $this->runnerService->getFeedbacks($serviceContext, $itemRef);
                $response['itemSession'] = $this->runnerService->getItemSession($serviceContext);
            }

            $this->runnerService->persist($serviceContext);

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
            $serviceContext = $this->getServiceContext(false, true);

            if (!$this->runnerService->isTerminated($serviceContext)) {
                $this->endItemTimer();
                $this->saveItemState();
            }
            $this->initServiceContext();

            $this->saveItemResponses(false);

            $serviceContext->getTestSession()->initItemTimer();
            $result = $this->runnerService->move($serviceContext, $direction, $scope, $ref);

            $response = [
                'success' => $result
            ];

            if ($result) {
                $response['testContext'] = $this->runnerService->getTestContext($serviceContext);
            }

            \common_Logger::d('Test session state : ' . $serviceContext->getTestSession()->getState());

            $this->runnerService->persist($serviceContext);

            if($start == true){

                // start the timer only when move starts the item session
                // and after context build to avoid timing error
                $this->runnerService->startTimer($serviceContext);
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
            $serviceContext = $this->getServiceContext();

            $this->endItemTimer();

            $result = $this->runnerService->skip($serviceContext, $scope, $ref);

            $response = [
                'success' => $result,
            ];

            if ($result) {
                $response['testContext'] = $this->runnerService->getTestContext($serviceContext);
            }

            $this->runnerService->persist($serviceContext);

            if($start == true){

                // start the timer only when move starts the item session
                // and after context build to avoid timing error
                $this->runnerService->startTimer($serviceContext);
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

        try {
            $serviceContext = $this->getServiceContext(false, true);

            if (!$this->runnerService->isTerminated($serviceContext)) {
                $this->endItemTimer();
                $this->saveItemState();
            }

            $this->initServiceContext();

            $this->saveItemResponses();

            $result = $this->runnerService->timeout($serviceContext, $scope, $ref);

            $response = [
                'success' => $result,
            ];

            if ($result) {
                $response['testContext'] = $this->runnerService->getTestContext($serviceContext);
            }

            $this->runnerService->persist($serviceContext);

            if($start == true){

                // start the timer only when move starts the item session
                // and after context build to avoid timing error
                $this->runnerService->startTimer($serviceContext);
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
            $serviceContext = $this->getServiceContext(false, true);

            if (!$this->runnerService->isTerminated($serviceContext)) {
                $this->endItemTimer();
                $this->saveItemState();
            }
            $this->initServiceContext();

            $this->saveItemResponses();

            $response = [
                'success' => $this->runnerService->exitTest($serviceContext),
            ];

            $this->runnerService->persist($serviceContext);

        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getErrorCode($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * Sets the test in paused state
     */
    public function pause()
    {
        $code = 200;

        try {
            $serviceContext = $this->getServiceContext();

            $response = [
                'success' => $this->runnerService->pause($serviceContext),
            ];

            $this->runnerService->persist($serviceContext);

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
            $serviceContext = $this->getServiceContext();
            $result = $this->runnerService->resume($serviceContext);

            $response = [
                'success' => $result,
            ];

            if ($result) {
                $response['testContext'] = $this->runnerService->getTestContext($serviceContext);
            }

            $this->runnerService->persist($serviceContext);

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
            $serviceContext = $this->getServiceContext();
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

            TestRunnerUtils::setItemFlag($testSession, $itemPosition, $flag);

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
            $serviceContext = $this->getServiceContext();
            $result = $this->runnerService->comment($serviceContext, $comment);

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
    public function storeTraceData(){
        $code = 200;

        $itemRef = ($this->hasRequestParameter('itemDefinition'))?$this->getItemRef($this->getRequestParameter('itemDefinition')): null;

        $traceData = json_decode(html_entity_decode($this->getRequestParameter('traceData')), true);

        try {
            $serviceContext = $this->getServiceContext(false);
            $stored = 0;
            $size   = count($traceData);

            foreach($traceData  as $variableIdentifier => $variableValue){
                if($this->runnerService->storeTraceVariable($serviceContext, $itemRef, $variableIdentifier, $variableValue)){
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
     * Manage the bidirectional communication
     */
    public function messages()
    {
        // close the PHP session to prevent session overwriting and loss of security token for secured queries
        session_write_close();

        $code = 200;

        try {
            $input = \taoQtiCommon_helpers_Utils::readJsonPayload();
            if (!$input) {
                $input = [];
            }

            $serviceContext = $this->getServiceContext(false, false);

            /* @var $communicationService \oat\taoQtiTest\models\runner\communicator\CommunicationService */
            $communicationService = $this->getServiceManager()->get(QtiCommunicationService::SERVICE_ID);

            $response = [
                'responses' => $communicationService->processInput($serviceContext, $input),
                'messages' => $communicationService->processOutput($serviceContext),
                'success' => true,
            ];

        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getErrorCode($e);
        }

        $this->returnJson($response, $code, false);
    }
}
