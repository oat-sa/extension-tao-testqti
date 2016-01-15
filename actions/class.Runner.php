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
use \qtism\runtime\tests\AssessmentTestSessionState;

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
     * @return QtiRunnerServiceContext
     * @throws \common_Exception
     */
    protected function getServiceContext()
    {
        if (!$this->serviceContext) {
            $testDefinition = $this->getRequestParameter('testDefinition');
            $testCompilation = $this->getRequestParameter('testCompilation');

            if ($this->hasRequestParameter('testServiceCallId')) {
                $testExecution = $this->getRequestParameter('testServiceCallId');
            } else {
                $testExecution = $this->getRequestParameter('serviceCallId');
            }  
            $this->serviceContext = $this->runnerService->getServiceContext($testDefinition, $testCompilation, $testExecution);
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
        ];
        
        if ($e) {
            if ($e instanceof \Exception) {
                $response['code'] = $e->getCode();
            }

            if ($e instanceof \common_exception_UserReadableException) {
                $response['message'] = $e->getUserMessage();
            } else {
                $response['message'] = __('An error occurred!');
            }

            if ($e instanceof QtiRunnerClosedException) {
                $response['state'] = AssessmentTestSessionState::CLOSED;
            }
            
            if ($e instanceof QtiRunnerPausedException) {
                $response['state'] = AssessmentTestSessionState::SUSPENDED;
            }
        }
        
        return $response;
    }

    /**
     * Initializes the delivery session
     */
    public function init()
    {
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
        }
        

        $this->returnJson($response);
    }

    /**
     * Provides the test definition data
     */
    public function getTestData()
    {
        try {
            $serviceContext = $this->getServiceContext();
            
            $response = [
                'testData' => $this->runnerService->getTestData($serviceContext),
                'success' => true,
            ];
            
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
        }

        $this->returnJson($response);
    }

    /**
     * Provides the test context object
     */
    public function getTestContext()
    {
        try {
            $serviceContext = $this->getServiceContext();
            
            $response = [
                'testContext' => $this->runnerService->getTestContext($serviceContext),
                'success' => true,
            ];
            
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
        }

        $this->returnJson($response);
    }
    
    /**
     * Provides the map of the test items
     */
    public function getTestMap()
    {
        try {
            $serviceContext = $this->getServiceContext();
            
            $response = [
                'testMap' => $this->runnerService->getTestMap($serviceContext),
                'success' => true,
            ];
            
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
        }

        $this->returnJson($response);
    }
    
    /**
     * Provides the rubrics related to the current session state
     */
    public function getRubrics()
    {
        // TODO: make a better implementation
        
        // the rubrics will be rendered in the page
        header(HTTPToolkit::statusCodeHeader(200));
        Context::getInstance()->getResponse()->setContentHeader('text/html');
        
        $serviceContext = $this->getServiceContext();
        $this->runnerService->getRubrics($serviceContext);
    }

    /**
     * Provides the definition data for a particular item
     */
    public function getItemData()
    {
        $itemRef = $this->getRequestParameter('itemDefinition');
        
        try {
            $serviceContext = $this->getServiceContext();
            
            $itemData = $this->runnerService->getItemData($serviceContext, $itemRef);

            if (is_string($itemData)) {
                $response = '{"success":true,"itemData":' . $itemData . '}';
            } else {
                $response = [
                    'itemData' => $itemData,
                    'success' => true,
                ];    
            }
            
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
        }

        if (is_string($response)) {
            $code = 200;
            header(HTTPToolkit::statusCodeHeader($code));
            Context::getInstance()->getResponse()->setContentHeader('application/json');
            echo $response;   
        } else {
            $this->returnJson($response);
        }
    }

    /**
     * Provides the state object for a particular item 
     */
    public function getItemState()
    {
        $itemRef = $this->getRequestParameter('itemDefinition');

        try {
            $serviceContext = $this->getServiceContext();
            
            $response = [
                'itemState' => $this->runnerService->getItemState($serviceContext, $itemRef),
                'success' => true,
            ];
            
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
        }

        $this->returnJson($response);
    }

    /**
     * Stores the state object of a particular item
     */
    public function submitItemState()
    {
        $itemRef = $this->getRequestParameter('itemDefinition');
        $state = $this->getRequestParameter('state');

        try {
            $serviceContext = $this->getServiceContext();
            
            $response = [
                'success' => $this->runnerService->setItemState($serviceContext, $itemRef, $state),
            ];
            
            $this->runnerService->persist($serviceContext);
            
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
        }

        $this->returnJson($response);
    }

    /**
     * Stores the response set of a particular item
     */
    public function storeItemResponse()
    {
        $itemRef = $this->getRequestParameter('itemDefinition');
        $response = $this->getRequestParameter('response');

        try {
            $serviceContext = $this->getServiceContext();
            
            $response = [
                'success' => $this->runnerService->setItemResponse($serviceContext, $itemRef, $response),
            ];
            
            $this->runnerService->persist($serviceContext);
            
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
        }

        $this->returnJson($response);
    }

    /**
     * Moves the current position to the provided scoped reference: item, section, part
     */
    public function move()
    {
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
        }

        $this->returnJson($response);
    }
    
    /**
     * Skip the current position to the provided scope: item, section, part
     */
    public function skip()
    {
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
        }

        $this->returnJson($response);
    }
    
    /**
     * Handles a test timeout
     */
    public function timeout()
    {
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
        }

        $this->returnJson($response);
    }
    
    /**
     * Finishes the test
     */
    public function finish()
    {
        try {
            $serviceContext = $this->getServiceContext();
            
            $response = [
                'success' => $this->runnerService->finish($serviceContext),
            ];
            
            $this->runnerService->persist($serviceContext);
            
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
        try {
            $serviceContext = $this->getServiceContext();
            
            $response = [
                'success' => $this->runnerService->pause($serviceContext),
            ];
            
            $this->runnerService->persist($serviceContext);
            
        } catch (common_Exception $e) {
            $response = $this->getErrorResponse($e);
        }

        $this->returnJson($response);
    }

    /**
     * Resumes the test from paused state
     */
    public function resume()
    {
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
        }

        $this->returnJson($response);
    }
}
