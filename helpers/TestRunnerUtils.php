<?php
/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */

namespace oat\taoQtiTest\helpers;

use common_exception_Error;
use common_exception_NotFound;
use common_ext_ExtensionException;
use oat\oatbox\service\ConfigurableService;
use oat\oatbox\user\User;
use oat\taoQtiTest\models\ExtendedStateService;
use oat\taoQtiTest\models\QtiTestCompilerIndex;
use oat\taoQtiTest\models\runner\RunnerServiceContext;
use qtism\common\datatypes\Duration;
use qtism\runtime\tests\AssessmentItemSession;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\tests\AssessmentTestSessionException;
use qtism\runtime\tests\Jump;
use qtism\runtime\tests\RouteItem;
use tao_models_classes_service_ServiceCall;
use taoQtiTest_helpers_TestRunnerUtils as LegacyTestRunnerUtils;

class TestRunnerUtils extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/TestRunnerUtils';

    /**
     * Temporary helper until proper ServiceManager integration
     *
     * @return ExtendedStateService
     */
    public function getExtendedStateService()
    {
        return LegacyTestRunnerUtils::getExtendedStateService();
    }

    /**
     * Get the ServiceCall object representing how to call the current Assessment Item to be
     * presented to a candidate in a given Assessment Test $session.
     *
     * @param AssessmentTestSession $session An AssessmentTestSession Object.
     * @param string $testDefinitionUri      The URI of the knowledge base resource representing the folder
     *                                       where the QTI Test Definition is stored.
     * @param string $testCompilationUri     The URI of the knowledge base resource representing the folder
     *                                       where the QTI Test Compilation is stored.
     *
     * @return tao_models_classes_service_ServiceCall A ServiceCall object.
     * @throws common_exception_Error
     */
    public function buildItemServiceCall(AssessmentTestSession $session, $testDefinitionUri, $testCompilationUri)
    {
        return LegacyTestRunnerUtils::buildItemServiceCall($session, $testDefinitionUri, $testCompilationUri);
    }

    /**
     * Build the Service Call ID of the current Assessment Item to be presented to a candidate in a given Assessment
     * Test $session.
     *
     * @param AssessmentTestSession $session
     *
     * @return string A service call id composed of the session identifier,  the identifier of the item and it
     *                occurrence number in the route.
     */
    public function buildServiceCallId(AssessmentTestSession $session)
    {
        return LegacyTestRunnerUtils::buildServiceCallId($session);
    }

    /**
     * Set the initial outcomes defined in the rdf outcome map configuration file
     *
     * @param AssessmentTestSession $session
     * @param User $testTaker
     *
     * @throws common_exception_Error
     * @throws common_ext_ExtensionException
     */
    public function setInitialOutcomes(AssessmentTestSession $session, User $testTaker)
    {
        LegacyTestRunnerUtils::setInitialOutcomes($session, $testTaker);
    }

    /**
     * Preserve the outcomes variables set in the "rdfOutcomeMap" config.
     * This is required to prevent those special outcomes from being reset before every outcome processing
     *
     * @param AssessmentTestSession $session
     *
     * @throws common_ext_ExtensionException
     */
    public function preserveOutcomes(AssessmentTestSession $session)
    {
        LegacyTestRunnerUtils::preserveOutcomes($session);
    }

    /**
     * Whether or not the current Assessment Item to be presented to the candidate is timed-out. By timed-out
     * we mean:
     * * current Assessment Test level time limits are not respected OR,
     * * current Test Part level time limits are not respected OR,
     * * current Assessment Section level time limits are not respected OR,
     * * current Assessment Item level time limits are not respected.
     *
     * @param AssessmentTestSession $session The AssessmentTestSession object you want to know it is timed-out.
     *
     * @return boolean
     */
    public function isTimeout(AssessmentTestSession $session)
    {
        return LegacyTestRunnerUtils::isTimeout($session);
    }

    /**
     * Get the URI referencing the current Assessment Item (in the knowledge base)
     * to be presented to the candidate.
     *
     * @param AssessmentTestSession $session An AssessmentTestSession object.
     *
     * @return string A URI.
     */
    public function getCurrentItemUri(AssessmentTestSession $session)
    {
        return LegacyTestRunnerUtils::getCurrentItemUri($session);
    }

    /**
     * Build the URL to be called to perform a given action on the Test Runner controller.
     *
     * @param AssessmentTestSession $session An AssessmentTestSession object.
     * @param string $action                 The action name e.g. 'moveForward', 'moveBackward', 'skip',
     * @param string $qtiTestDefinitionUri   The URI of a reference to an Assessment Test definition in
     *                                       the knowledge base.
     * @param string $qtiTestCompilationUri  The Uri of a reference to an Assessment Test compilation in
     *                                       the knowledge base.
     * @param string $standalone
     *
     * @return string A URL to be called to perform an action.
     */
    public function buildActionCallUrl(
        AssessmentTestSession $session,
        $action,
        $qtiTestDefinitionUri,
        $qtiTestCompilationUri,
        $standalone
    ) {
        return LegacyTestRunnerUtils::buildActionCallUrl(
            $session,
            $action,
            $qtiTestDefinitionUri,
            $qtiTestCompilationUri,
            $standalone
        );
    }

    /**
     * @param AssessmentTestSession $session
     * @param $qtiTestDefinitionUri
     * @param $qtiTestCompilationUri
     *
     * @return mixed
     * @throws common_exception_Error
     */
    public function buildServiceApi(AssessmentTestSession $session, $qtiTestDefinitionUri, $qtiTestCompilationUri)
    {
        return LegacyTestRunnerUtils::buildServiceApi($session, $qtiTestDefinitionUri, $qtiTestCompilationUri);
    }

    /**
     * Tell the client to not cache the current request. Supports HTTP 1.0 to 1.1.
     */
    public function noHttpClientCache()
    {
        LegacyTestRunnerUtils::noHttpClientCache();
    }

    /**
     * Make the candidate interact with the current Assessment Item to be presented. A new attempt
     * will begin automatically if the candidate still has available attempts. Otherwise,
     * nothing happens.
     *
     * @param AssessmentTestSession $session The AssessmentTestSession you want to make the candidate interact with.
     *
     * @throws AssessmentTestSessionException
     */
    public function beginCandidateInteraction(AssessmentTestSession $session)
    {
        LegacyTestRunnerUtils::beginCandidateInteraction($session);
    }

    /**
     * Whether or not the candidate taking the given $session is allowed
     * to skip the presented Assessment Item.
     *
     * @param AssessmentTestSession $session A given AssessmentTestSession object.
     *
     * @return boolean
     */
    public function doesAllowSkipping(AssessmentTestSession $session)
    {
        return LegacyTestRunnerUtils::doesAllowSkipping($session);
    }

    /**
     * Whether or not the candidate's response is validated
     *
     * @param AssessmentTestSession $session A given AssessmentTestSession object.
     *
     * @return boolean
     */
    public function doesValidateResponses(AssessmentTestSession $session)
    {
        return LegacyTestRunnerUtils::doesValidateResponses($session);
    }

    /**
     * Whether or not the candidate taking the given $session is allowed to make
     * a comment on the presented Assessment Item.
     *
     * @param AssessmentTestSession $session A given AssessmentTestSession object.
     *
     * @return boolean
     */
    public function doesAllowComment(AssessmentTestSession $session)
    {
        return LegacyTestRunnerUtils::doesAllowComment($session);
    }

    /**
     * Build an array where each cell represent a time constraint (a.k.a. time limits)
     * in force. Each cell is actually an array with two keys:
     * * 'source': The identifier of the QTI component emitting the constraint (e.g. AssessmentTest, TestPart,
     * AssessmentSection, AssessmentItemRef).
     * * 'seconds': The number of remaining seconds until it times out.
     *
     * @param AssessmentTestSession $session An AssessmentTestSession object.
     *
     * @return array
     */
    public function buildTimeConstraints(AssessmentTestSession $session)
    {
        return LegacyTestRunnerUtils::buildTimeConstraints($session);
    }

    /**
     * Build an array where each cell represent a possible Assessment Item a candidate
     * can jump on during a given $session. Each cell is an array with two keys:
     * * 'identifier': The identifier of the Assessment Item the candidate is allowed to jump on.
     * * 'position': The position in the route of the Assessment Item.
     *
     * @param AssessmentTestSession $session A given AssessmentTestSession object.
     *
     * @return array
     */
    public function buildPossibleJumps(AssessmentTestSession $session)
    {
        return LegacyTestRunnerUtils::buildPossibleJumps($session);
    }

    /**
     * Build the context of the given candidate test $session as an associative array. This array
     * is especially useful to transmit the test context to a view as JSON data.
     * The returned array contains the following keys:
     * * state: The state of test session.
     * * navigationMode: The current navigation mode.
     * * submissionMode: The current submission mode.
     * * remainingAttempts: The number of remaining attempts for the current item.
     * * isAdaptive: Whether or not the current item is adaptive.
     * * itemIdentifier: The identifier of the current item.
     * * itemSessionState: The state of the current assessment item session.
     * * timeConstraints: The time constraints in force.
     * * testTitle: The title of the test.
     * * testPartId: The identifier of the current test part.
     * * sectionTitle: The title of the current section.
     * * numberItems: The total number of items eligible to the candidate.
     * * numberCompleted: The total number items considered to be completed by the candidate.
     * * moveForwardUrl: The URL to be de-referenced to perform a moveNext on the session.
     * * moveBackwardUrl: The URL to be de-referenced to perform a moveBack on the session.
     * * skipUrl: The URL to be de-referenced to perform a skip on the session.
     * * commentUrl: The URL to be de-referenced to leave a comment about the current item.
     * * timeoutUrl: The URL to be de-referenced when the time constraints in force reach their maximum.
     * * canMoveBackward: Whether or not the candidate is allowed/able to move backward.
     * * jumps: The possible jumpers the candidate is allowed to undertake among eligible items.
     * * itemServiceApiCall: The JavaScript code to be executed to instantiate the current item.
     * * rubrics: The XHTML compiled content of the rubric blocks to be displayed for the current item if any.
     * * allowComment: Whether or not the candidate is allowed to leave a comment about the current item.
     * * allowSkipping: Whether or not the candidate is allowed to skip the current item.
     * * considerProgress: Whether or not the test driver view must consider to give a test progress feedback.
     *
     * @param AssessmentTestSession $session   A given AssessmentTestSession object.
     * @param array $testMeta                  An associative array containing meta-data about the test
     *                                         definition taken by the candidate.
     * @param QtiTestCompilerIndex $itemIndex
     * @param string $qtiTestDefinitionUri     The URI of a reference to an Assessment Test definition in
     *                                         The knowledge base.
     * @param string $qtiTestCompilationUri    The Uri of a reference to an Assessment Test compilation in
     *                                         The knowledge base.
     * @param string $standalone
     * @param array $compilationDirs           An array containing respectively the private and public compilation
     *                                         directories.
     *
     * @return array The context of the candidate session.
     * @throws AssessmentTestSessionException
     * @throws common_exception_NotFound
     * @throws common_exception_Error
     * @throws common_ext_ExtensionException
     */
    public function buildAssessmentTestContext(
        AssessmentTestSession $session,
        array $testMeta,
        $itemIndex,
        $qtiTestDefinitionUri,
        $qtiTestCompilationUri,
        $standalone,
        $compilationDirs
    ) {
        return LegacyTestRunnerUtils::buildAssessmentTestContext(
            $session,
            $testMeta,
            $itemIndex,
            $qtiTestDefinitionUri,
            $qtiTestCompilationUri,
            $standalone,
            $compilationDirs
        );
    }

    /**
     * Gets the item reference for a particular item in the test
     *
     * @param AssessmentTestSession $session
     * @param string|Jump|RouteItem $itemPosition
     * @param RunnerServiceContext|null $context
     *
     * @return null|string
     */
    public function getItemRef(AssessmentTestSession $session, $itemPosition, RunnerServiceContext $context = null)
    {
        return LegacyTestRunnerUtils::getItemRef($session, $itemPosition, $context);
    }

    /**
     * Sets an item to be reviewed
     *
     * @param AssessmentTestSession $session
     * @param string|Jump|RouteItem $itemPosition
     * @param bool $flag
     * @param RunnerServiceContext|null $context
     *
     * @return bool
     * @throws common_exception_Error
     */
    public function setItemFlag(
        AssessmentTestSession $session,
        $itemPosition,
        $flag,
        RunnerServiceContext $context = null
    ) {
        return LegacyTestRunnerUtils::setItemFlag($session, $itemPosition, $flag, $context);
    }

    /**
     * Gets the marked for review state of an item
     *
     * @param AssessmentTestSession $session
     * @param string|Jump|RouteItem $itemPosition
     * @param RunnerServiceContext|null $context
     *
     * @return bool
     * @throws common_exception_Error
     */
    public function getItemFlag(AssessmentTestSession $session, $itemPosition, RunnerServiceContext $context = null)
    {
        return LegacyTestRunnerUtils::getItemFlag($session, $itemPosition, $context);
    }

    /**
     * Gets the usage of an item
     *
     * @param RouteItem $routeItem
     *
     * @return string Return the usage, can be: default, informational, seeding
     */
    public function getItemUsage(RouteItem $routeItem)
    {
        return LegacyTestRunnerUtils::getItemUsage($routeItem);
    }

    /**
     * Checks if an item is informational
     *
     * @param RouteItem $routeItem
     * @param AssessmentItemSession $itemSession
     *
     * @return bool
     */
    public function isItemInformational(RouteItem $routeItem, AssessmentItemSession $itemSession)
    {
        return LegacyTestRunnerUtils::isItemInformational($routeItem, $itemSession);
    }

    /**
     * Checks if an item has been completed
     *
     * @param RouteItem $routeItem
     * @param AssessmentItemSession $itemSession
     * @param bool $partially                    (optional) Whether or not consider partially responded sessions as
     *                                           responded.
     *
     * @return bool
     */
    public function isItemCompleted(RouteItem $routeItem, AssessmentItemSession $itemSession, $partially = true)
    {
        return LegacyTestRunnerUtils::isItemCompleted($routeItem, $itemSession, $partially);
    }

    /**
     * Gets the map of the reachable items.
     *
     * @param AssessmentTestSession $session
     *
     * @return array The map of the test
     */
    public function getTestMap($session)
    {
        return LegacyTestRunnerUtils::getTestMap($session);
    }

    /**
     * Compute the the number of completed items during a given
     * candidate test $session.
     *
     * @param AssessmentTestSession $session
     *
     * @return integer
     */
    public function testCompletion(AssessmentTestSession $session)
    {
        return LegacyTestRunnerUtils::testCompletion($session);
    }

    /**
     * Checks if the current test allows the progress bar to be displayed
     *
     * @param AssessmentTestSession $session
     * @param array $testMeta
     * @param array $config
     *
     * @return bool
     */
    public function considerProgress(AssessmentTestSession $session, array $testMeta, array $config = [])
    {
        return LegacyTestRunnerUtils::considerProgress($session, $testMeta, $config);
    }

    /**
     * Checks if the current session can be exited. If a context is pass we use it over the session
     *
     * @param AssessmentTestSession $session
     * @param RunnerServiceContext $context
     *
     * @return bool
     * @throws common_ext_ExtensionException
     */
    public function doesAllowExit(AssessmentTestSession $session, RunnerServiceContext $context = null)
    {
        return LegacyTestRunnerUtils::doesAllowExit($session, $context);
    }

    /**
     * Checks if the test taker can logout
     *
     * @param AssessmentTestSession $session
     *
     * @return mixed
     * @throws common_ext_ExtensionException
     */
    public function doesAllowLogout(AssessmentTestSession $session)
    {
        return LegacyTestRunnerUtils::doesAllowLogout($session);
    }

    /**
     * Get the array of available categories for the current itemRef
     * If we have a non null context we use it over the session
     *
     * @param AssessmentTestSession $session
     * @param RunnerServiceContext $context
     *
     * @return array
     */
    public function getCategories(AssessmentTestSession $session, RunnerServiceContext $context = null)
    {
        return LegacyTestRunnerUtils::getCategories($session, $context);
    }

    /**
     * Get the array of available categories for the test
     *
     * @param AssessmentTestSession $session
     *
     * @return array
     */
    public function getAllCategories(AssessmentTestSession $session)
    {
        return LegacyTestRunnerUtils::getAllCategories($session);
    }

    /**
     * Whether or not $value is considered as a null QTI value.
     *
     * @param $value
     *
     * @return boolean
     */
    public function isQtiValueNull($value)
    {
        return LegacyTestRunnerUtils::isQtiValueNull($value);
    }

    /**
     * Gets the amount of seconds with the microseconds as fractional part from a Duration instance.
     *
     * @param Duration $duration
     *
     * @return float|null
     */
    public function getDurationWithMicroseconds($duration)
    {
        return LegacyTestRunnerUtils::getDurationWithMicroseconds($duration);
    }
}
