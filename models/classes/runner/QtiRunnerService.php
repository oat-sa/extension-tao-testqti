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

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiTest\models\SessionStateService;
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
     * The test runner config
     * @var array
     */
    protected $config;

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
     * Persists the AssessmentTestSession into binary data.
     * @param QtiRunnerServiceContext $context
     */
    public function persist(QtiRunnerServiceContext $context)
    {
        $testSession = $context->getTestSession();
        $sessionId = $testSession->getSessionId();

        \common_Logger::i("Persisting QTI Assessment Test Session '${sessionId}'...");
        $context->getStorage()->persist($testSession);
    }

    /**
     * Gets the test runner config
     * @return array
     * @throws \common_ext_ExtensionException
     */
    public function getConfig()
    {
        if (is_null($this->config)) {
            $this->config = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->getConfig('testRunner');
        }
        return $this->config;
    }

    /**
     * Initializes the delivery execution session
     * @param RunnerServiceContext $context
     * @return boolean
     * @throws \common_Exception
     */
    public function init(RunnerServiceContext $context)
    {
        if ($context instanceof QtiRunnerServiceContext) {
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
        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
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
        $response = [];

        if ($context instanceof QtiRunnerServiceContext) {
            $testDefinition = $context->getTestDefinition();

            $response['title'] = $testDefinition->getTitle();
            $response['hasTimeLimits'] = $testDefinition->hasTimeLimits();

            $timeLimits = $testDefinition->getTimeLimits();
            if ($timeLimits) {
                if ($timeLimits->hasMinTime()) {
                    $response['timeLimits']['minTime'] = [
                        'duration' => $timeLimits->getMinTime()->getSeconds(true),
                        'iso' => $timeLimits->getMinTime()->__toString(),
                    ];
                }

                if ($timeLimits->hasMaxTime()) {
                    $response['timeLimits']['maxTime'] = [
                        'duration' => $timeLimits->getMaxTime()->getSeconds(true),
                        'iso' => $timeLimits->getMaxTime()->__toString(),
                    ];
                }
            }

            $response['config'] = $this->getConfig();

        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
        }

        return $response;
    }

    /**
     * Gets the test context object
     * @param RunnerServiceContext $context
     * @return array
     * @throws \common_Exception
     */
    public function getTestContext(RunnerServiceContext $context)
    {
        $response = [];

        if ($context instanceof QtiRunnerServiceContext) {
            $session = $context->getTestSession();

            // The state of the test session.
            $response['state'] = $session->getState();

            // Default values for the test session context.
            $response['navigationMode'] = null;
            $response['submissionMode'] = null;
            $response['remainingAttempts'] = 0;
            $response['isAdaptive'] = false;

            // Context of interacting test
            if ($session->getState() === AssessmentTestSessionState::INTERACTING) {
                $config = $this->getConfig();

                // The navigation mode.
                $response['navigationMode'] = $session->getCurrentNavigationMode();

                // The submission mode.
                $response['submissionMode'] = $session->getCurrentSubmissionMode();

                // The number of remaining attempts for the current item.
                $response['remainingAttempts'] = $session->getCurrentRemainingAttempts();

                // Whether or not the current step is time out.
                $response['isTimeout'] = \taoQtiTest_helpers_TestRunnerUtils::isTimeout($session);

                // The identifier of the current item.
                $response['itemIdentifier'] = $session->getCurrentAssessmentItemRef()->getIdentifier();

                // The state of the current AssessmentTestSession.
                $response['itemSessionState'] = $session->getCurrentAssessmentItemSession()->getState();

                // Whether the current item is adaptive.
                $response['isAdaptive'] = $session->isCurrentAssessmentItemAdaptive();

                // Whether the current item is the very last one of the test.
                $response['isLast'] = $session->getRoute()->isLast();

                // The current position in the route.
                $response['itemPosition'] = $session->getRoute()->getPosition();

                // Time constraints.
                $response['timeConstraints'] = \taoQtiTest_helpers_TestRunnerUtils::buildTimeConstraints($session);

                // Test Part title.
                $response['testPartId'] = $session->getCurrentTestPart()->getIdentifier();

                // Current Section title.
                $response['sectionId'] = $session->getCurrentAssessmentSection()->getIdentifier();
                $response['sectionTitle'] = $session->getCurrentAssessmentSection()->getTitle();

                // Number of items composing the test session.
                $response['numberItems'] = $session->getRoute()->count();

                // Number of items completed during the test session.
                $response['numberCompleted'] = \taoQtiTest_helpers_TestRunnerUtils::testCompletion($session);

                // Number of items presented during the test session.
                $response['numberPresented'] = $session->numberPresented();

                // Whether or not the progress of the test can be inferred.
                $response['considerProgress'] = \taoQtiTest_helpers_TestRunnerUtils::considerProgress($session, $context->getTestMeta(), $config);

                // Whether or not the deepest current section is visible.
                $response['isDeepestSectionVisible'] = $session->getCurrentAssessmentSection()->isVisible();

                // If the candidate is allowed to move backward e.g. first item of the test.
                $response['canMoveBackward'] = $session->canMoveBackward();

                // Comment allowed? Skipping allowed? Logout or Exit allowed ?
                $response['allowComment'] = \taoQtiTest_helpers_TestRunnerUtils::doesAllowComment($session);
                $response['allowSkipping'] = \taoQtiTest_helpers_TestRunnerUtils::doesAllowSkipping($session);
                $response['exitButton'] = \taoQtiTest_helpers_TestRunnerUtils::doesAllowExit($session);
                $response['logoutButton'] = \taoQtiTest_helpers_TestRunnerUtils::doesAllowLogout($session);
                $response['categories'] = \taoQtiTest_helpers_TestRunnerUtils::getCategories($session);
            }

        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
        }

        return $response;
    }

    /**
     * Gets the map of the test items
     * @param RunnerServiceContext $context
     * @return array
     * @throws \common_Exception
     */
    public function getTestMap(RunnerServiceContext $context)
    {
        $response = [];

        // TODO: Implement getTestMap() method.

        if ($context instanceof QtiRunnerServiceContext) {
        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
        }

        return $response;
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
        $response = [];

        // TODO: Implement getItemData() method.

        if ($context instanceof QtiRunnerServiceContext) {
        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
        }

        return $response;
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
        $response = [];

        // TODO: Implement getItemState() method.

        if ($context instanceof QtiRunnerServiceContext) {
        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
        }

        return $response;
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

        if ($context instanceof QtiRunnerServiceContext) {
        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
        }

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

        if ($context instanceof QtiRunnerServiceContext) {
        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
        }

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

        if ($context instanceof QtiRunnerServiceContext) {
        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
        }

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

        if ($context instanceof QtiRunnerServiceContext) {
        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
        }

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

        if ($context instanceof QtiRunnerServiceContext) {
        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
        }

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

        if ($context instanceof QtiRunnerServiceContext) {
        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
        }

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

        if ($context instanceof QtiRunnerServiceContext) {
        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
        }

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
