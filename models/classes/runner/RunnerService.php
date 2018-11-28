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
namespace oat\taoQtiTest\models\runner;

use oat\taoQtiTest\models\runner\config\RunnerConfig;
use qtism\data\AssessmentItemRef;
use oat\taoDelivery\model\execution\Delete\DeliveryExecutionDelete;

/**
 * Interface RunnerService
 *
 * Describes a test runner dedicated service
 *
 * @package oat\taoQtiTest\models
 */
interface RunnerService extends DeliveryExecutionDelete
{
    const INSTANCE_TEST_RUNNER_SERVICE = 'http://www.tao.lu/Ontologies/TAODelivery.rdf#ServiceQtiTestRunner';

    const INSTANCE_TEST_ITEM_RUNNER_SERVICE = 'http://www.tao.lu/Ontologies/TAODelivery.rdf#ServiceQtiTestItemRunner';

    const INSTANCE_FORMAL_PARAM_TEST_ITEM_RUNNER_PARENT_CALL_ID = 'http://www.tao.lu/Ontologies/TAOTest.rdf#FormalParamQtiTestParentServiceCallId';
    /**
     * Initializes the delivery execution session
     * @param RunnerServiceContext $context
     * @return boolean
     * @throws \common_Exception
     */
    public function init(RunnerServiceContext $context);

    /**
     * Gets the test runner config
     * @return RunnerConfig
     * @throws \common_ext_ExtensionException
     */
    public function getTestConfig();

    /**
     * Gets the test definition data
     * @param RunnerServiceContext $context
     * @return array
     * @throws \common_Exception
     */
    public function getTestData(RunnerServiceContext $context);

    /**
     * Gets the test context object
     * @param RunnerServiceContext $context
     * @return array
     * @throws \common_Exception
     */
    public function getTestContext(RunnerServiceContext $context);

    /**
     * Gets the map of the test items
     * @param RunnerServiceContext $context
     * @param bool $partial the full testMap or only the current section
     * @return array
     * @throws \common_Exception
     */
    public function getTestMap(RunnerServiceContext $context, $partial = false);

    /**
     * Gets the rubrics related to the current session state
     * @param RunnerServiceContext $context
     * @param AssessmentItemRef $itemRef (optional) otherwise use the current
     * @return mixed
     * @throws \common_Exception
     */
    public function getRubrics(RunnerServiceContext $context, AssessmentItemRef $itemRef = null);

    /**
     * Gets definition data of a particular item
     * @param RunnerServiceContext $context
     * @param $itemRef
     * @return mixed
     * @throws \common_Exception
     */
    public function getItemData(RunnerServiceContext $context, $itemRef);

    /**
     * Gets the state of a particular item
     * @param RunnerServiceContext $context
     * @param $itemRef
     * @return array
     * @throws \common_Exception
     */
    public function getItemState(RunnerServiceContext $context, $itemRef);

    /**
     * Sets the state of a particular item
     * @param RunnerServiceContext $context
     * @param $itemRef
     * @param $state
     * @return boolean
     * @throws \common_Exception
     */
    public function setItemState(RunnerServiceContext $context, $itemRef, $state);

    /**
     * Parses the responses provided for a particular item
     * @param RunnerServiceContext $context
     * @param $itemRef
     * @param $response
     * @return mixed
     * @throws \common_Exception
     */
    public function parsesItemResponse(RunnerServiceContext $context, $itemRef, $response);

    /**
     * Checks if the provided responses are empty
     * @param RunnerServiceContext $context
     * @param $responses
     * @return mixed
     * @throws \common_Exception
     */
    public function emptyResponse(RunnerServiceContext $context, $responses);

    /**
     * Stores the responses of a particular item
     * @param RunnerServiceContext $context
     * @param $itemRef
     * @param $responses
     * @return boolean
     * @throws \common_Exception
     */
    public function storeItemResponse(RunnerServiceContext $context, $itemRef, $responses);

    /**
     * Should we display feedbacks
     * @param RunnerServiceContext $context
     * @return boolean
     * @throws \common_Exception
     */
    public function displayFeedbacks(RunnerServiceContext $context);

    /**
     * Get feedback definition
     * @param RunnerServiceContext $context
     * @param string $itemRef  the item reference
     * @return array the feedbacks data
     * @throws \common_exception_InvalidArgumentType
     */
    public function getFeedbacks(RunnerServiceContext $context, $itemRef);

    /**
     * Does the given item has feedbacks
     * @param RunnerServiceContext $context
     * @param string $itemRef  the item reference
     * @return boolean
     * @throws \common_Exception
     */
    public function hasFeedbacks(RunnerServiceContext $context, $itemRef);

    /**
     * Get the current item session
     * @param RunnerServiceContext $context
     * @throws \common_Exception
     */
    public function getItemSession(RunnerServiceContext $context);

    /**
     * Moves the current position to the provided scoped reference.
     * @param RunnerServiceContext $context
     * @param $direction
     * @param $scope
     * @param $ref
     * @return boolean
     * @throws \common_Exception
     */
    public function move(RunnerServiceContext $context, $direction, $scope, $ref);

    /**
     * Skips the current position to the provided scoped reference
     * @param RunnerServiceContext $context
     * @param $scope
     * @param $ref
     * @return boolean
     * @throws \common_Exception
     */
    public function skip(RunnerServiceContext $context, $scope, $ref);

    /**
     * Handles a test timeout
     * @param RunnerServiceContext $context
     * @param $scope
     * @param $ref
     * @return boolean
     * @throws \common_Exception
     */
    public function timeout(RunnerServiceContext $context, $scope, $ref);

    /**
     * Exits the test before its end
     * @param RunnerServiceContext $context
     * @return boolean
     * @throws \common_Exception
     */
    public function exitTest(RunnerServiceContext $context);

    /**
     * Finishes the test
     * @param RunnerServiceContext $context
     * @return boolean
     * @throws \common_Exception
     */
    public function finish(RunnerServiceContext $context);

    /**
     * Sets the test to paused state
     * @param RunnerServiceContext $context
     * @return boolean
     * @throws \common_Exception
     */
    public function pause(RunnerServiceContext $context);

    /**
     * Resumes the test from paused state
     * @param RunnerServiceContext $context
     * @return boolean
     * @throws \common_Exception
     */
    public function resume(RunnerServiceContext $context);

    /**
     * Checks if the test is still valid
     * @param RunnerServiceContext $context
     * @return boolean
     * @throws \common_Exception
     */
    public function check(RunnerServiceContext $context);

    /**
     * Checks if the test is in paused state
     * @param RunnerServiceContext $context
     * @return boolean
     */
    public function isPaused(RunnerServiceContext $context);

    /**
     * Checks if the test is in terminated state
     * @param RunnerServiceContext $context
     * @return boolean
     */
    public function isTerminated(RunnerServiceContext $context);

    /**
     * Get the list of portable elements used in the item
     * @param RunnerServiceContext $context
     * @param $itemRef
     * @return mixed
     */
    public function getItemPortableElements(RunnerServiceContext $context, $itemRef);


    /**
     * Get the list of metadata elements used in the item
     * @param $itemRef
     * @return mixed
     */
    public function getItemMetadataElements($itemRef);

}
