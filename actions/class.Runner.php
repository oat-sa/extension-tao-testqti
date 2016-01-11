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

use oat\taoQtiTest\models\QtiRunnerService;

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
     * @var \qtism\runtime\tests\AssessmentTestSession
     */
    protected $testSession;
    
    /**
     * @inheritDoc
     */
    public function __construct()
    {
        $this->runnerService = $this->getServiceManager()->get(QtiRunnerService::CONFIG_ID);
    }

    /**
     * Gets the test session
     * @return \qtism\runtime\tests\AssessmentTestSession
     */
    protected function getTestSession()
    {
        if (!$this->testSession) {
            $testDefinition = $this->getRequestParameter('testDefinition');
            $testCompilation = $this->getRequestParameter('testCompilation');

            if ($this->hasRequestParameter('testServiceCallId')) {
                $testExecution = $this->getRequestParameter('testServiceCallId');
            } else {
                $testExecution = $this->getRequestParameter('serviceCallId');
            }  
            $this->testSession = $this->runnerService->getTestSession($testDefinition, $testCompilation, $testExecution);
        }
        
        return $this->testSession;
    }

    /**
     * Initializes the delivery session
     */
    public function init()
    {
        try {
            $testSession = $this->getTestSession();
            $result = $this->runnerService->init($testSession);

            $response = [
                'success' => $result,
            ];

            if ($result) {
                $result['testData'] = $this->runnerService->getTestData($testSession);
                $result['testContext'] = $this->runnerService->getTestContext($testSession);
                $result['testMap'] = $this->runnerService->getTestMap($testSession);
            }
        } catch (common_Exception $e) {
            $response = [
                'success' => false,
            ];
        }
        

        $this->returnJson($response);
    }

    /**
     * Provides the test definition data
     */
    public function getTestData()
    {
        try {
            $testSession = $this->getTestSession();
            $response = [
                'testData' => $this->runnerService->getTestData($testSession),
                'success' => true,
            ];
        } catch (common_Exception $e) {
            $response = [
                'success' => false,
            ];
        }

        $this->returnJson($response);
    }

    /**
     * Provides the test context object
     */
    public function getTestContext()
    {
        try {
            $testSession = $this->getTestSession();
            $response = [
                'testContext' => $this->runnerService->getTestContext($testSession),
                'success' => true,
            ];
        } catch (common_Exception $e) {
            $response = [
                'success' => false,
            ];
        }

        $this->returnJson($response);
    }
    
    /**
     * Provides the map of the test items
     */
    public function getTestMap()
    {
        try {
            $testSession = $this->getTestSession();
            $response = [
                'testMap' => $this->runnerService->getTestMap($testSession),
                'success' => true,
            ];
        } catch (common_Exception $e) {
            $response = [
                'success' => false,
            ];
        }

        $this->returnJson($response);
    }

    /**
     * Provides the definition data for a particular item
     */
    public function getItemData()
    {
        $itemRef = $this->getRequestParameter('itemDefinition');
        
        try {
            $testSession = $this->getTestSession();
            $response = [
                'itemData' => $this->runnerService->getItemData($testSession, $itemRef),
                'success' => true,
            ];
        } catch (common_Exception $e) {
            $response = [
                'success' => false,
            ];
        }

        $this->returnJson($response);
    }

    /**
     * Provides the state object for a particular item 
     */
    public function getItemState()
    {
        $itemRef = $this->getRequestParameter('itemDefinition');

        try {
            $testSession = $this->getTestSession();
            $response = [
                'itemState' => $this->runnerService->getItemState($testSession, $itemRef),
                'success' => true,
            ];
        } catch (common_Exception $e) {
            $response = [
                'success' => false,
            ];
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
            $testSession = $this->getTestSession();
            $response = [
                'success' => $this->runnerService->setItemState($testSession, $itemRef, $state),
            ];
        } catch (common_Exception $e) {
            $response = [
                'success' => false,
            ];
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
            $testSession = $this->getTestSession();
            $response = [
                'success' => $this->runnerService->setItemResponse($testSession, $itemRef, $response),
            ];
        } catch (common_Exception $e) {
            $response = [
                'success' => false,
            ];
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
            $testSession = $this->getTestSession();
            $result = $this->runnerService->move($testSession, $direction, $scope, $ref);
            
            $response = [
                'success' => $result,
            ];

            if ($result) {
                $result['testContext'] = $this->runnerService->getTestContext($testSession);
            }
        } catch (common_Exception $e) {
            $response = [
                'success' => false,
            ];
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
            $testSession = $this->getTestSession();
            $result = $this->runnerService->skip($testSession, $scope, $ref);

            $response = [
                'success' => $result,
            ];

            if ($result) {
                $result['testContext'] = $this->runnerService->getTestContext($testSession);
            }
        } catch (common_Exception $e) {
            $response = [
                'success' => false,
            ];
        }

        $this->returnJson($response);
    }
    
    /**
     * Finishes the test
     */
    public function finish()
    {
        try {
            $testSession = $this->getTestSession();
            $response = [
                'success' => $this->runnerService->finish($testSession),
            ];
        } catch (common_Exception $e) {
            $response = [
                'success' => false,
            ];
        }

        $this->returnJson($response);
    }

    /**
     * Sets the test in paused state
     */
    public function pause()
    {
        try {
            $testSession = $this->getTestSession();
            $response = [
                'success' => $this->runnerService->pause($testSession),
            ];
        } catch (common_Exception $e) {
            $response = [
                'success' => false,
            ];
        }

        $this->returnJson($response);
    }

    /**
     * Resumes the test from paused state
     */
    public function resume()
    {
        try {
            $testSession = $this->getTestSession();
            $result = $this->runnerService->resume($testSession);

            $response = [
                'success' => $result,
            ];

            if ($result) {
                $result['testContext'] = $this->runnerService->getTestContext($testSession);
            }
        } catch (common_Exception $e) {
            $response = [
                'success' => false,
            ];
        }

        $this->returnJson($response);
    }
}
