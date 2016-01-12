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

namespace oat\taoQtiTest\models;

use oat\oatbox\service\ConfigurableService;
use qtism\runtime\tests\AssessmentTestSessionState;

/**
 * Class QtiRunnerService
 * 
 * QTI implementation service for the test runner
 * 
 * @package oat\taoQtiTest\models
 */
class QtiRunnerService extends ConfigurableService implements RunnerService
{
    const CONFIG_ID = 'taoQtiTest/runner';

    /**
     * Gets the test session for a particular delivery execution
     * @param string $testDefinitionUri
     * @param string $testCompilationUri
     * @param string $testExecutionUri
     * @return QtiRunnerServiceContext
     * @throws \common_Exception
     */
    public function getServiceContext($testDefinitionUri, $testCompilationUri, $testExecutionUri)
    {
        // create a service context based on the provided URI
        // initialize the test session and related objects
        $serviceContext = new QtiRunnerServiceContext($testDefinitionUri, $testCompilationUri, $testExecutionUri);

        // will throw exception if the test session is not valid
        $this->check($serviceContext);

        // code borrowed from the previous implementation, maybe obsolete...
        /** @var SessionStateService $sessionStateService */
        $sessionStateService = $this->getServiceManager()->get(SessionStateService::CONFIG_ID);
        $sessionStateService->resumeSession($serviceContext->getTestSession());

        $serviceContext->retrieveTestMeta();
        
        $metaDataHandler = $serviceContext->getMetaDataHandler();
        $metaDataHandler->registerItemCallbacks();
        $metaData = $metaDataHandler->getData();
        if (!empty($metaData)) {
            $metaDataHandler->save($metaData);
        }
        
        return $serviceContext;
    }

    /**
     * Initializes the delivery execution session
     * @param RunnerServiceContext $context
     * @return boolean
     * @throws \common_Exception
     */
    public function init(RunnerServiceContext $context)
    {
        $session = $context->getTestSession();

        // code borrowed from the previous implementation, but the reset timers option has been discarded
        if ($session->getState() === AssessmentTestSessionState::INITIAL) {
            // The test has just been instantiated.
            $session->beginTestSession();
            $context->getMetaDataHandler()->registerItemCallbacks();
            \common_Logger::i("Assessment Test Session begun.");
        }

        if (\taoQtiTest_helpers_TestRunnerUtils::isTimeout($session) === false) {
            \taoQtiTest_helpers_TestRunnerUtils::beginCandidateInteraction($session);
        }
        
        return true;
    }

    /**
     * Gets the test definition data
     * @param RunnerServiceContext $context
     * @return array
     * @throws \common_Exception
     */
    public function getTestData(RunnerServiceContext $context)
    {
        // TODO: Implement getTestData() method.

        return [];
    }

    /**
     * Gets the test context object
     * @param RunnerServiceContext $context
     * @return array
     * @throws \common_Exception
     */
    public function getTestContext(RunnerServiceContext $context)
    {
        // TODO: Implement getTestContext() method.

        return [];
    }

    /**
     * Gets the map of the test items
     * @param RunnerServiceContext $context
     * @return array
     * @throws \common_Exception
     */
    public function getTestMap(RunnerServiceContext $context)
    {
        // TODO: Implement getTestMap() method.

        return [];
    }

    /**
     * Gets definition data of a particular item
     * @param RunnerServiceContext $context
     * @param $itemRef
     * @return array
     * @throws \common_Exception
     */
    public function getItemData(RunnerServiceContext $context, $itemRef)
    {
        // TODO: Implement getItemData() method.

        return [];
    }

    /**
     * Gets the state of a particular item
     * @param RunnerServiceContext $context
     * @param $itemRef
     * @return array
     * @throws \common_Exception
     */
    public function getItemState(RunnerServiceContext $context, $itemRef)
    {
        // TODO: Implement getItemState() method.
        
        return [];
    }

    /**
     * Sets the state of a particular item
     * @param RunnerServiceContext $context
     * @param $itemRef
     * @param $state
     * @return boolean
     * @throws \common_Exception
     */
    public function setItemState(RunnerServiceContext $context, $itemRef, $state)
    {
        // TODO: Implement setItemState() method.

        return true;
    }

    /**
     * Stores the response of a particular item
     * @param RunnerServiceContext $context
     * @param $itemRef
     * @param $response
     * @return boolean
     * @throws \common_Exception
     */
    public function storeItemResponse(RunnerServiceContext $context, $itemRef, $response)
    {
        // TODO: Implement storeItemResponse() method.

        return true;
    }

    /**
     * Moves the current position to the provided scoped reference.
     * @param RunnerServiceContext $context
     * @param $direction
     * @param $scope
     * @param $ref
     * @return boolean
     * @throws \common_Exception
     */
    public function move(RunnerServiceContext $context, $direction, $scope, $ref)
    {
        // TODO: Implement move() method.

        return true;
    }

    /**
     * Skips the current position to the provided scoped reference
     * @param RunnerServiceContext $context
     * @param $scope
     * @param $ref
     * @return boolean
     * @throws \common_Exception
     */
    public function skip(RunnerServiceContext $context, $scope, $ref)
    {
        // TODO: Implement skip() method.

        return true;
    }

    /**
     * Finishes the test
     * @param RunnerServiceContext $context
     * @return boolean
     * @throws \common_Exception
     */
    public function finish(RunnerServiceContext $context)
    {
        // TODO: Implement finish() method.

        return true;
    }

    /**
     * Sets the test to paused state
     * @param RunnerServiceContext $context
     * @return boolean
     * @throws \common_Exception
     */
    public function pause(RunnerServiceContext $context)
    {
        // TODO: Implement pause() method.

        return true;
    }

    /**
     * Resumes the test from paused state
     * @param RunnerServiceContext $context
     * @return boolean
     * @throws \common_Exception
     */
    public function resume(RunnerServiceContext $context)
    {
        // TODO: Implement resume() method.
        
        return true;
    }

    /**
     * Checks if the test is still valid
     * @param RunnerServiceContext $context
     * @return boolean
     * @throws \common_Exception
     */
    public function check(RunnerServiceContext $context)
    {
        $state = $context->getTestSession()->getState();
        
        if ($state == AssessmentTestSessionState::CLOSED) {
            throw new QtiRunnerClosedException();
        }

        if ($state == AssessmentTestSessionState::SUSPENDED) {
            throw new QtiRunnerPausedException();
        }
        
        return true;
    }
}
