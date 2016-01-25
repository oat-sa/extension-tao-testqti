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

use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\QtiRunnerClosedException;
use oat\taoQtiTest\models\runner\QtiRunnerPausedException;

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
        $this->runnerService = $this->getServiceManager()->get(QtiRunnerService::CONFIG_ID);

        // Prevent anything to be cached by the client.
        taoQtiTest_helpers_TestRunnerUtils::noHttpClientCache();
    }

    /**
     * Gets the test service context
     * @param bool [$check] Checks the context after create. Default to true.
     * @return QtiRunnerServiceContext
     * @throws \common_Exception
     */
    protected function getServiceContext($check = true)
    {
        if (!$this->serviceContext) {
            $testDefinition = $this->getRequestParameter('testDefinition');
            $testCompilation = $this->getRequestParameter('testCompilation');

            if ($this->hasRequestParameter('testServiceCallId')) {
                $testExecution = $this->getRequestParameter('testServiceCallId');
            } else {
                $testExecution = $this->getRequestParameter('serviceCallId');
            }  
            $this->serviceContext = $this->runnerService->getServiceContext($testDefinition, $testCompilation, $testExecution, $check);
        }
        
        return $this->serviceContext;
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
                    $response['type'] = 'TestState';
                    break;
                
                case $e instanceof \tao_models_classes_FileNotFoundException:
                    $response['type'] = 'FileNotFound';
                    $response['message'] = __('File not found');
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
                case $e instanceof QtiRunnerClosedException:
                case $e instanceof QtiRunnerPausedException:
                    $code = 200;
                    break;

                case $e instanceof \common_exception_NotImplemented:
                case $e instanceof \common_exception_NoImplementation:
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
     */
    public function init()
    {
        $code = 200;
        
        try {
            $serviceContext = $this->getServiceContext();
            $result = $this->runnerService->init($serviceContext);

            $response = [
                'success' => $result,
            ];

            if ($result) {
                $response['testData'] = $this->runnerService->getTestData($serviceContext);
                $response['testContext'] = $this->runnerService->getTestContext($serviceContext);
                $response['testMap'] = $this->runnerService->getTestMap($serviceContext);
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
     * Provides the rubrics related to the current session state
     */
    public function getRubrics()
    {
        // TODO: make a better implementation 
        // the rb are now rendererd in the output...
        ob_start();
        $serviceContext = $this->getServiceContext();
        $this->runnerService->getRubrics($serviceContext);
        $rubrics = ob_get_contents();
        ob_end_clean();

        $this->returnJson(array(
            'success' => true,
            'content' => $rubrics
        ));
    }

    /**
     * Provides the definition data for a particular item
     */
    public function getItemData()
    {
        $code = 200;
        
        $itemRef = $this->getRequestParameter('itemDefinition');
        
        try {
            $serviceContext = $this->getServiceContext();
            
            $response = [
                'itemData' => $this->runnerService->getItemData($serviceContext, $itemRef),
                'baseUrl' => $this->runnerService->getItemPublicUrl($serviceContext, $itemRef),
                'success' => true,
            ];
            
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getErrorCode($e);
        }
        
        $this->returnJson($response, $code);
    }

    /**
     * Provides the state object for a particular item 
     */
    public function getItemState()
    {
        $code = 200;

        $serviceCallId = $this->getRequestParameter('testServiceCallId');

        try {
            $serviceContext = $this->getServiceContext();
            $stateId = $serviceCallId . $serviceContext->getTestSession()->getCurrentAssessmentItemRef()->getIdentifier();


            $response = [
                'itemState' => $this->runnerService->getItemState($serviceContext, $stateId),
                'success' => true,
            ];

        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getErrorCode($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * Stores the state object of a particular item
     */
    public function submitItemState()
    {
        $code = 200;

        $state = $this->getRequestParameter('state');
        $serviceCallId = $this->getRequestParameter('testServiceCallId');

        try {
            $serviceContext = $this->getServiceContext();
            $stateId = $serviceCallId . $serviceContext->getTestSession()->getCurrentAssessmentItemRef()->getIdentifier();

            $response = [
                'success' => $this->runnerService->setItemState($serviceContext, $stateId, $state),
            ];
            
            $this->runnerService->persist($serviceContext);
            
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getErrorCode($e);
        }

        $this->returnJson($response, $code);
    }

    /**
     * Stores the response set of a particular item
     */
    public function storeItemResponse()
    {
        $code = 200;

        $itemRef = $this->getRequestParameter('itemDefinition');

        $itemResponse = \taoQtiCommon_helpers_Utils::readJsonPayload();

        try {
            $serviceContext = $this->getServiceContext();

            $response = array(
                'success' => $this->runnerService->storeItemResponse($serviceContext, $itemRef, $itemResponse),
                'displayFeedbacks' => $this->runnerService->displayFeedbacks($serviceContext)
            );

            if($response['displayFeedbacks'] == true){

                //FIXME there is here a performance issue, at the end we need the defitions only once, not at each storage
                $response['feedbacks']   = $this->runnerService->getFeedbacks($serviceContext, $itemRef);
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
        
        $ref = $this->getRequestParameter('ref');
        $direction = $this->getRequestParameter('direction');
        $scope = $this->getRequestParameter('scope');

        try {
            $serviceContext = $this->getServiceContext();
            $result = $this->runnerService->move($serviceContext, $direction, $scope, $ref);
            
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
     * Skip the current position to the provided scope: item, section, part
     */
    public function skip()
    {
        $code = 200;
        
        $ref = $this->getRequestParameter('ref');
        $scope = $this->getRequestParameter('scope');

        try {
            $serviceContext = $this->getServiceContext();
            $result = $this->runnerService->skip($serviceContext, $scope, $ref);

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
     * Handles a test timeout
     */
    public function timeout()
    {
        $code = 200;
        
        $ref = $this->getRequestParameter('ref');
        $scope = $this->getRequestParameter('scope');

        try {
            $serviceContext = $this->getServiceContext();
            $result = $this->runnerService->timeout($serviceContext, $scope, $ref);

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
     * Exits the test before its end
     */
    public function exitTest()
    {
        $code = 200;
        
        try {
            $serviceContext = $this->getServiceContext();
            
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
     * Finishes the test
     */
    public function finish()
    {
        try {
            $serviceContext = $this->getServiceContext(false);
            
            $response = [
                'success' => $this->runnerService->finish($serviceContext),
            ];
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
        }

        $this->returnJson($response);
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
     * allow client to store information about the test, the section or the item
     */
    public function storeTraceData(){
        $code = 200;

        $itemRef = ($this->hasRequestParameter('itemDefinition'))?$this->getRequestParameter('itemDefinition'): null;

        $variableIdentifier = $this->getRequestParameter('variableIdentifier');
        $variableValue = $this->getRequestParameter('variableValue');

        try {
            $serviceContext = $this->getServiceContext();
            $response = [
                'success' => $this->runnerService->storeTraceVariable($serviceContext, $itemRef, $variableIdentifier, $variableValue),
            ];

            $this->runnerService->persist($serviceContext);

        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
            $code = $this->getErrorCode($e);
        }

        $this->returnJson($response, $code);
    }
}
