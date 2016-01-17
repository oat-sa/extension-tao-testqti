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
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoQtiItem\model\QtiJsonItemCompiler;
use oat\taoQtiTest\models\runner\map\QtiRunnerMap;
use oat\taoQtiTest\models\runner\navigation\QtiRunnerNavigation;
use oat\taoQtiTest\models\runner\rubric\QtiRunnerRubric;
use qtism\data\NavigationMode;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\tests\AssessmentTestSessionException;
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
    const CONFIG_ID = 'taoQtiTest/QtiRunnerService';

    /**
     * The test runner config
     * @var array
     */
    protected $config;

    /**
     * Gets the test session for a particular delivery execution
     * @param string $testDefinitionUri The URI of the test
     * @param string $testCompilationUri The URI of the compiled delivery
     * @param string $testExecutionUri The URI of the delivery execution
     * @param bool [$check] Checks the created context, then initializes it, 
     *                      otherwise just returns the context without check and init. Default to true.
     * @return QtiRunnerServiceContext
     * @throws \common_Exception
     */
    public function getServiceContext($testDefinitionUri, $testCompilationUri, $testExecutionUri, $check = true)
    {
        // create a service context based on the provided URI
        // initialize the test session and related objects
        $serviceContext = new QtiRunnerServiceContext($testDefinitionUri, $testCompilationUri, $testExecutionUri);
        $serviceContext->setServiceManager($this->getServiceManager());

        if ($check) {
            // will throw exception if the test session is not valid
            $this->check($serviceContext);

            // starts the context
            $serviceContext->init();
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
            /* @var AssessmentTestSession $session */
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
            $response['identifier'] = $testDefinition->getIdentifier();
            $response['className'] = $testDefinition->getQtiClassName();
            $response['toolName'] = $testDefinition->getToolName();
            $response['exclusivelyLinear'] = $testDefinition->isExclusivelyLinear();
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
            /* @var AssessmentTestSession $session */
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
                $response['itemUri'] = $session->getCurrentAssessmentItemRef()->getHref();

                // The state of the current AssessmentTestSession.
                $response['itemSessionState'] = $session->getCurrentAssessmentItemSession()->getState();

                // Whether the current item is adaptive.
                $response['isAdaptive'] = $session->isCurrentAssessmentItemAdaptive();
                
                // Whether the test map must be updated.
                // TODO: detect if the map need to be updated and set the flag
                $response['needMapUpdate'] = false;

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

                //Number of rubric blocks
                $response['numberRubrics'] = count($session->getRoute()->current()->getRubricBlockRefs());

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
        if ($context instanceof QtiRunnerServiceContext) {
            $map = new QtiRunnerMap();
            return $map->getMap($context);
        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
        }
    }

    /**
     * Gets the rubrics related to the current session state.
     * @param RunnerServiceContext $context
     * @return mixed
     * @throws \common_Exception
     */
    public function getRubrics(RunnerServiceContext $context)
    {
        if ($context instanceof QtiRunnerServiceContext) {
            $map = new QtiRunnerRubric();
            return $map->getRubrics($context);
        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
        }
    }

    /**
     * Gets definition data of a particular item
     * @param RunnerServiceContext $context
     * @param $itemRef
     * @return mixed
     * @throws \common_Exception
     */
    public function getItemData(RunnerServiceContext $context, $itemRef)
    {
        if ($context instanceof QtiRunnerServiceContext) {
            $directoryIds = explode('|', $itemRef);

            $itemUri = $directoryIds[0];
            $item = new \core_kernel_classes_Resource($itemUri);
            $usedLang = $item->getUsedLanguages(new \core_kernel_classes_Property(TAO_ITEM_CONTENT_PROPERTY));

            $userDataLang = \common_session_SessionManager::getSession()->getDataLanguage();

            $dirPath = \tao_models_classes_service_FileStorage::singleton()->getDirectoryById($directoryIds[2])->getPath();
            if (in_array($userDataLang, $usedLang)) {
                $itemFilePath = $dirPath . $userDataLang . DIRECTORY_SEPARATOR . QtiJsonItemCompiler::ITEM_FILE_NAME;
            } else {
                throw new \common_Exception(
                    $userDataLang . 'is not part of compilation directory for item : ' . $itemUri
                );
            }

            if (file_exists($itemFilePath)) {
                return json_decode(file_get_contents($itemFilePath));
            } else {
                throw new \tao_models_classes_FileNotFoundException(
                    $itemFilePath . ' for item ' . $directoryIds[2]
                );
            }
        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
        }
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
        if ($context instanceof QtiRunnerServiceContext) {
            $serviceService = $this->getServiceManager()->get('tao/stateStorage');
            $userUri = \common_session_SessionManager::getSession()->getUserUri();
            return is_null($userUri) ? null : $serviceService->get($userUri, $itemRef);
        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
        }
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
        if ($context instanceof QtiRunnerServiceContext) {
            $serviceService = $this->getServiceManager()->get('tao/stateStorage');
            $userUri = \common_session_SessionManager::getSession()->getUserUri();
            return is_null($userUri) ? false : $serviceService->set($userUri, $itemRef, $state);
        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
        }
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
        if ($context instanceof QtiRunnerServiceContext) {
            // --- Deal with provided responses.

            $responses = new State();
            $currentItem = $context->getTestSession()->getCurrentAssessmentItemRef();
            $currentOccurence = $context->getTestSession()->getCurrentAssessmentItemRefOccurence();

            if ($currentItem === false) {
                $msg = "Trying to store item variables but the state of the test session is INITIAL or CLOSED.\n";
                $msg .= "Session state value: " . $context->getTestSession()->getState() . "\n";
                $msg .= "Session ID: " . $context->getTestSession()->getSessionId() . "\n";
                $msg .= "JSON Payload: " . mb_substr(json_encode($response), 0, 1000);
                \common_Logger::e($msg);
            }

            $filler = new \taoQtiCommon_helpers_PciVariableFiller($currentItem);

            if (is_array($response)) {
                foreach ($response as $id => $resp) {
                    try {
                        $var = $filler->fill($id, $resp);
                        // Do not take into account QTI File placeholders.
                        if (\taoQtiCommon_helpers_Utils::isQtiFilePlaceHolder($var) === false) {
                            $responses->setVariable($var);
                        }
                    } catch (\OutOfRangeException $e) {
                        \common_Logger::d("Could not convert client-side value for variable '${id}'.");
                    } catch (\OutOfBoundsException $e) {
                        \common_Logger::d("Could not find variable with identifier '${id}' in current item.");
                    }
                }
            } else {
                \common_Logger::e('Invalid json payload');
            }

            $stateOutput = new \taoQtiCommon_helpers_PciStateOutput();

            try {
                \common_Logger::i('Responses sent from the client-side. The Response Processing will take place.');
                $context->getTestSession()->endAttempt($responses, true);

                // Return the item session state to the client side.
                $itemSession = $context->getTestSession()->getAssessmentItemSessionStore()->getAssessmentItemSession($currentItem, $currentOccurence);

                foreach ($itemSession->getAllVariables() as $var) {
                    $stateOutput->addVariable($var);
                }

                return true;
            } catch (AssessmentTestSessionException $e) {
                \common_Logger::w($e->getMessage());
                return false;
            }
        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
        }
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
        $result = true;
        
        if ($context instanceof QtiRunnerServiceContext) {
            $navigator = QtiRunnerNavigation::getNavigator($direction, $scope);
            try {
                $result = $navigator->move($context, $ref);
                if ($result) {
                    $this->continueInteraction($context);
                }
            } catch (AssessmentTestSessionException $e) {
                switch ($e->getCode()) {
                    case AssessmentTestSessionException::ASSESSMENT_TEST_DURATION_OVERFLOW:
                    case AssessmentTestSessionException::TEST_PART_DURATION_OVERFLOW:
                    case AssessmentTestSessionException::ASSESSMENT_SECTION_DURATION_OVERFLOW:
                    case AssessmentTestSessionException::ASSESSMENT_ITEM_DURATION_OVERFLOW:
                        $this->onTimeout($context, $e);
                        break;
                }
            }
        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
        }

        return $result;
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
        return $this->move($context, 'skip', $scope, $ref);
    }

    /**
     * Handles a test timeout
     * @param RunnerServiceContext $context
     * @param $scope
     * @param $ref
     * @return boolean
     * @throws \common_Exception
     */
    public function timeout(RunnerServiceContext $context, $scope, $ref)
    {
        if ($context instanceof QtiRunnerServiceContext) {
            /* @var AssessmentTestSession $session */
            $session = $context->getTestSession();
            
            try {
                $session->checkTimeLimits(false, true, false);
            } catch (AssessmentTestSessionException $e) {
                $this->onTimeout($context, $e);
            }
            
        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
        }

        return true;
    }

    /**
     * Exits the test before its end
     * @param RunnerServiceContext $context
     * @return boolean
     * @throws \common_Exception
     */
    public function exitTest(RunnerServiceContext $context)
    {
        if ($context instanceof QtiRunnerServiceContext) {
            /* @var AssessmentTestSession $session */
            $session = $context->getTestSession();
            $sessionId = $session->getSessionId();

            \common_Logger::i("The user has requested termination of the test session '{$sessionId}'");
            $session->endTestSession();
        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
        }
    }


    /**
     * Finishes the test
     * @param RunnerServiceContext $context
     * @return boolean
     * @throws \common_Exception
     */
    public function finish(RunnerServiceContext $context)
    {
        if ($context instanceof QtiRunnerServiceContext) {
            $executionUri = $context->getTestExecutionUri();
            $userUri = \common_session_SessionManager::getSession()->getUserUri();

            $executionService = \taoDelivery_models_classes_execution_ServiceProxy::singleton();
            $deliveryExecution = $executionService->getDeliveryExecution($executionUri);
            if ($deliveryExecution->getUserIdentifier() == $userUri) {
                \common_Logger::i("Finishing the delivery execution {$executionUri}");
                $result = $deliveryExecution->setState(DeliveryExecution::STATE_FINISHIED);
            } else {
                \common_Logger::w("Non owner {$userUri} tried to finish deliveryExecution {$executionUri}");
                $result = false;
            }
        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
        }


        

        return $result;
    }

    /**
     * Sets the test to paused state
     * @param RunnerServiceContext $context
     * @return boolean
     * @throws \common_Exception
     */
    public function pause(RunnerServiceContext $context)
    {
        if ($context instanceof QtiRunnerServiceContext) {
            // TODO: Implement pause() method.
            throw new \common_exception_NotImplemented('Not yet implemented!');
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
        if ($context instanceof QtiRunnerServiceContext) {
            // TODO: Implement resume() method.
            throw new \common_exception_NotImplemented('Not yet implemented!');
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

    /**
     * Get the base url to the item public directory
     * @param RunnerServiceContext $context
     * @param $itemRef
     * @return string
     * @throws \common_Exception
     * @throws \common_exception_Error
     * @throws \common_exception_InvalidArgumentType
     */
    public function getItemPublicUrl(RunnerServiceContext $context, $itemRef){
        if ($context instanceof QtiRunnerServiceContext) {
            $directoryIds = explode('|', $itemRef);

            $userDataLang = \common_session_SessionManager::getSession()->getDataLanguage();

            $directory = \tao_models_classes_service_FileStorage::singleton()->getDirectoryById($directoryIds[1]);
            $basepath = $directory->getPath();
            if (!file_exists($basepath.$userDataLang) && file_exists($basepath.DEFAULT_LANG)) {
                $userDataLang = DEFAULT_LANG;
            }
            return $directory->getPublicAccessUrl().$userDataLang.DIRECTORY_SEPARATOR;
        } else {
            throw new \common_exception_InvalidArgumentType('Context must be an instance of QtiRunnerServiceContext');
        }
    }

    /**
     * Continue the test interaction if possible
     * @param RunnerServiceContext $context
     * @return bool
     */
    protected function continueInteraction(RunnerServiceContext $context)
    {
        $continue = false;

        /* @var AssessmentTestSession $session */
        $session = $context->getTestSession();
        
        if ($session->isRunning() === true && \taoQtiTest_helpers_TestRunnerUtils::isTimeout($session) === false) {
            \taoQtiTest_helpers_TestRunnerUtils::beginCandidateInteraction($session);
            $continue = true;
        }
        
        return $continue;
    }

    /**
     * Stuff to be undertaken when the Assessment Item presented to the candidate
     * times out.
     *
     * @param RunnerServiceContext $context
     * @param AssessmentTestSessionException $timeOutException The AssessmentTestSessionException object thrown to indicate the timeout.
     */
    protected function onTimeout(RunnerServiceContext $context, AssessmentTestSessionException $timeOutException)
    {
        /* @var AssessmentTestSession $session */
        $session = $context->getTestSession();
        
        if ($session->getCurrentNavigationMode() === NavigationMode::LINEAR) {
            switch ($timeOutException->getCode()) {
                case AssessmentTestSessionException::ASSESSMENT_TEST_DURATION_OVERFLOW:
                    $session->endTestSession();
                    break;

                case AssessmentTestSessionException::TEST_PART_DURATION_OVERFLOW:
                    $session->moveNextTestPart();
                    break;

                case AssessmentTestSessionException::ASSESSMENT_SECTION_DURATION_OVERFLOW:
                    $session->moveNextAssessmentSection();
                    break;

                case AssessmentTestSessionException::ASSESSMENT_ITEM_DURATION_OVERFLOW:
                    $session->moveNextAssessmentItem();
                    break;
            }

            $this->continueInteraction($context);

        } else {
            $itemSession = $session->getCurrentAssessmentItemSession();
            $itemSession->endItemSession();
        }
    }
}
