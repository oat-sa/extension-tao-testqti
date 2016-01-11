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
        $testSession = $this->getTestSession();
        $this->runnerService->init($testSession);

        $this->returnJson([
            'testData' => $this->runnerService->getTestData($testSession),
            'testContext' => $this->runnerService->getTestContext($testSession),
            'success' => true,
        ]);
    }

    /**
     * Provides the test definition data
     */
    public function getTestData()
    {
        $testSession = $this->getTestSession();

        $this->returnJson([
            'testData' => $this->runnerService->getTestData($testSession),
            'success' => true,
        ]);   
    }

    /**
     * Provides the test context object
     */
    public function getTestContext()
    {
        $testSession = $this->getTestSession();

        $this->returnJson([
            'testContext' => $this->runnerService->getTestContext($testSession),
            'success' => true,
        ]);
    }

    /**
     * Provides the definition data for a particular item
     */
    public function getItemData()
    {
        $testSession = $this->getTestSession();
        
        $itemRef = $this->getRequestParameter('itemDefinition');
        
        $this->returnJson([
            'itemData' => $this->runnerService->getItemData($testSession, $itemRef),
            'success' => true,
        ]);
    }

    /**
     * Provides the state object for a particular item 
     */
    public function getItemState()
    {
        $testSession = $this->getTestSession();

        $itemRef = $this->getRequestParameter('itemDefinition');
        
        $this->returnJson([
            'itemState' => $this->runnerService->getItemState($testSession, $itemRef),
            'success' => true,
        ]);
    }

    /**
     * Stores the state object of a particular item
     */
    public function submitItemState()
    {
        $testSession = $this->getTestSession();

        $itemRef = $this->getRequestParameter('itemDefinition');
        $state = $this->getRequestParameter('state');
        
        $this->returnJson([
            'success' => $this->runnerService->setItemState($testSession, $itemRef, $state),
        ]);
    }

    /**
     * Stores the response set of a particular item
     */
    public function storeItemResponse()
    {
        $testSession = $this->getTestSession();

        $itemRef = $this->getRequestParameter('itemDefinition');
        $response = $this->getRequestParameter('response');

        $this->returnJson([
            'success' => $this->runnerService->setItemResponse($testSession, $itemRef, $response),
        ]);
    }

    /**
     * Moves the current position to the provided scoped reference: item, section, part
     */
    public function move()
    {
        $testSession = $this->getTestSession();

        $ref = $this->getRequestParameter('ref');
        $scope = $this->getRequestParameter('scope');

        $this->returnJson([
            'success' => $this->runnerService->move($testSession, $scope, $ref),
        ]);
    }
    
    /**
     * Skip the current position to the provided scope: item, section, part
     */
    public function skip()
    {
        $testSession = $this->getTestSession();

        $ref = $this->getRequestParameter('ref');
        $scope = $this->getRequestParameter('scope');

        $this->returnJson([
            'success' => $this->runnerService->skip($testSession, $scope, $ref),
        ]);
    }
    
    /**
     * Finishes the test
     */
    public function finish()
    {
        $testSession = $this->getTestSession();

        $this->returnJson([
            'success' => $this->runnerService->finish($testSession),
        ]);
    }

    /**
     * Sets the test in paused state
     */
    public function pause()
    {
        $testSession = $this->getTestSession();

        $this->returnJson([
            'success' => $this->runnerService->pause($testSession),
        ]);
    }

    /**
     * Resumes the test from paused state
     */
    public function resume()
    {
        $testSession = $this->getTestSession();

        $this->returnJson([
            'success' => $this->runnerService->resume($testSession),
        ]);
    }
}
