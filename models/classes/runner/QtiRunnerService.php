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
 * Copyright (c) 2016-2017 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */

namespace oat\taoQtiTest\models\runner;

use oat\taoDelivery\model\execution\ServiceProxy;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoQtiTest\models\event\AfterAssessmentTestSessionClosedEvent;
use oat\taoQtiTest\models\event\QtiContinueInteractionEvent;
use \oat\taoQtiTest\models\ExtendedStateService;
use oat\oatbox\event\EventManager;
use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\QtiJsonItemCompiler;
use oat\taoQtiTest\models\event\TestExitEvent;
use oat\taoQtiTest\models\event\TestInitEvent;
use oat\taoQtiTest\models\event\TestTimeoutEvent;
use oat\taoQtiTest\models\runner\config\QtiRunnerConfig;
use oat\taoQtiTest\models\runner\config\RunnerConfig;
use oat\taoQtiTest\models\runner\map\QtiRunnerMap;
use oat\taoQtiTest\models\runner\navigation\QtiRunnerNavigation;
use oat\taoQtiTest\models\runner\rubric\QtiRunnerRubric;
use oat\taoQtiTest\models\runner\session\TestSession;
use oat\taoQtiTest\models\SectionPauseService;
use oat\taoQtiTest\models\TestSessionService;
use oat\taoTests\models\runner\time\TimePoint;
use qtism\common\datatypes\QtiString as QtismString;
use qtism\common\enums\BaseType;
use qtism\common\enums\Cardinality;
use qtism\data\AssessmentTest;
use qtism\data\NavigationMode;
use qtism\data\SubmissionMode;
use qtism\runtime\common\ResponseVariable;
use qtism\runtime\common\State;
use qtism\runtime\tests\AssessmentItemSession;
use qtism\runtime\tests\AssessmentItemSessionState;
use qtism\runtime\tests\AssessmentTestSessionException;
use qtism\runtime\tests\AssessmentTestSessionState;
use taoQtiTest_helpers_TestRunnerUtils as TestRunnerUtils;
use oat\taoQtiTest\models\files\QtiFlysystemFileManager;
use qtism\data\AssessmentItemRef;
use oat\taoQtiTest\models\cat\CatService;
use qtism\runtime\tests\SessionManager;
use oat\libCat\result\ItemResult;
use oat\libCat\result\ResultVariable;

/**
 * Class QtiRunnerService
 *
 * QTI implementation service for the test runner
 *
 * @package oat\taoQtiTest\models
 */
class QtiRunnerService extends ConfigurableService implements RunnerService
{
    const SERVICE_ID = 'taoQtiTest/QtiRunnerService';

    /**
     * @deprecated use SERVICE_ID
     */
    const CONFIG_ID = 'taoQtiTest/QtiRunnerService';


    /**
     * The test runner config
     * @var RunnerConfig
     */
    protected $testConfig;

    /**
     * Use to store retrieved item data, inside the same request
     * @var array
     */
    private $dataCache = [];

    /**
     * Get the data folder from a given item definition
     * @param string $itemRef - formatted as itemURI|publicFolderURI|privateFolderURI
     * @return string the path
     * @throws \common_Exception
     */
    private function loadItemData($itemRef, $path)
    {
        $cacheKey = $itemRef . $path;
        if(! empty($cacheKey) && isset($this->dataCache[$itemRef . $path])) {
            return $this->dataCache[$itemRef . $path];
        }

        $directoryIds = explode('|', $itemRef);
        if (count($directoryIds) < 3) {
            throw new \common_exception_InconsistentData('The itemRef is not formated correctly');
        }

        $itemUri = $directoryIds[0];
        $userDataLang = \common_session_SessionManager::getSession()->getDataLanguage();
        $directory = \tao_models_classes_service_FileStorage::singleton()->getDirectoryById($directoryIds[2]);

        if ($directory->has($userDataLang))
        {
            $lang = $userDataLang;
        } elseif ($directory->has(DEFAULT_LANG)) {
            \common_Logger::d(
                $userDataLang . ' is not part of compilation directory for item : ' . $itemUri . ' use ' . DEFAULT_LANG
            );
            $lang = DEFAULT_LANG;
        } else {
            throw new \common_Exception(
                'item : ' . $itemUri . 'is neither compiled in ' . $userDataLang . ' nor in ' . DEFAULT_LANG
            );
        }
        try {
            $this->dataCache[$cacheKey] = json_decode($directory->read($lang.DIRECTORY_SEPARATOR.$path), true);
            return $this->dataCache[$cacheKey];
        } catch (\FileNotFoundException $e) {
            throw new \tao_models_classes_FileNotFoundException(
                $path . ' for item reference ' . $itemRef
            );
        }
    }

    /**
     * Gets the test session for a particular delivery execution
     * 
     * This method is called before each action (moveNext, moveBack, pause, ...) call.
     * 
     * @param string $testDefinitionUri The URI of the test
     * @param string $testCompilationUri The URI of the compiled delivery
     * @param string $testExecutionUri The URI of the delivery execution
     * @return QtiRunnerServiceContext
     * @throws \common_Exception
     */
    public function getServiceContext($testDefinitionUri, $testCompilationUri, $testExecutionUri)
    {
        // create a service context based on the provided URI
        // initialize the test session and related objects
        $serviceContext = new QtiRunnerServiceContext($testDefinitionUri, $testCompilationUri, $testExecutionUri);
        $serviceContext->setServiceManager($this->getServiceManager());
        $serviceContext->setTestConfig($this->getTestConfig());

        $sessionService = $this->getServiceManager()->get(TestSessionService::SERVICE_ID);
        $sessionService->registerTestSession($serviceContext->getTestSession(), $serviceContext->getStorage());

        return $serviceContext;
    }

    /**
     * Checks the created context, then initializes it.
     * @param RunnerServiceContext $context
     * @return RunnerServiceContext
     * @throws \common_Exception
     */
    public function initServiceContext(RunnerServiceContext $context)
    {
        // will throw exception if the test session is not valid
        $this->check($context);

        // starts the context
        $context->init();
        
        return $context;
    }

    /**
     * Persists the AssessmentTestSession into binary data.
     * @param QtiRunnerServiceContext $context
     */
    public function persist(QtiRunnerServiceContext $context)
    {
        $testSession = $context->getTestSession();
        $sessionId = $testSession->getSessionId();

        \common_Logger::d("Persisting QTI Assessment Test Session '${sessionId}'...");
        $context->getStorage()->persist($testSession);
        if($this->isTerminated($context)){
            $userId = \common_session_SessionManager::getSession()->getUser()->getIdentifier();
            $eventManager = $this->getServiceManager()->get(EventManager::SERVICE_ID);
            $eventManager->trigger(new AfterAssessmentTestSessionClosedEvent($testSession, $userId));
        }
    }

    /**
     * Initializes the delivery execution session
     * 
     * This method is called whenever a candidate enters the test. This includes
     * 
     * * Newly launched/instantiated test session.
     * * The candidate refreshes the client (F5).
     * * Resumed test sessions.
     * 
     * @param RunnerServiceContext $context
     * @return boolean
     * @throws \common_Exception
     */
    public function init(RunnerServiceContext $context)
    {
        if ($context instanceof QtiRunnerServiceContext) {
            /* @var TestSession $session */
            $session = $context->getTestSession();

            // code borrowed from the previous implementation, but the reset timers option has been discarded
            if ($session->getState() === AssessmentTestSessionState::INITIAL) {
                // The test has just been instantiated.
                $session->beginTestSession();
                $event = new TestInitEvent($session);
                $this->getServiceManager()->get(EventManager::SERVICE_ID)->trigger($event);
                \common_Logger::i("Assessment Test Session begun.");
                
                if ($context->isAdaptive()) {
                    \common_Logger::i("First item is adaptive.");
                    $context->initCatSession();
                    $context->selectAdaptiveNextItem();
                }
            }

            $session->initItemTimer();
            if ($session->isTimeout() === false) {
                TestRunnerUtils::beginCandidateInteraction($session);
            }

            $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID)->clearEvents($session->getSessionId());
        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'init',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
        }

        return true;
    }

    /**
     * Gets the test runner config
     * @return RunnerConfig
     * @throws \common_ext_ExtensionException
     */
    public function getTestConfig()
    {
        if (is_null($this->testConfig)) {
            $this->testConfig = $this->getServiceManager()->get(QtiRunnerConfig::SERVICE_ID);
        }
        return $this->testConfig;
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

            //states that can be found in the context
            $response['states'] = [
                'initial'       => AssessmentTestSessionState::INITIAL,
                'interacting'   => AssessmentTestSessionState::INTERACTING,
                'modalFeedback' => AssessmentTestSessionState::MODAL_FEEDBACK,
                'suspended'     => AssessmentTestSessionState::SUSPENDED,
                'closed'        => AssessmentTestSessionState::CLOSED
            ];

            $response['itemStates'] = [
                'initial'       => AssessmentItemSessionState::INITIAL,
                'interacting'   => AssessmentItemSessionState::INTERACTING,
                'modalFeedback' => AssessmentItemSessionState::MODAL_FEEDBACK,
                'suspended'     => AssessmentItemSessionState::SUSPENDED,
                'closed'        => AssessmentItemSessionState::CLOSED,
                'solution'      => AssessmentItemSessionState::SOLUTION,
                'review'        => AssessmentItemSessionState::REVIEW,
                'notSelected'   => AssessmentItemSessionState::NOT_SELECTED
            ];

            $timeLimits = $testDefinition->getTimeLimits();
            if ($timeLimits) {
                if ($timeLimits->hasMinTime()) {
                    $response['timeLimits']['minTime'] = [
                        'duration' => TestRunnerUtils::getDurationWithMicroseconds($timeLimits->getMinTime()),
                        'iso' => $timeLimits->getMinTime()->__toString(),
                    ];
                }

                if ($timeLimits->hasMaxTime()) {
                    $response['timeLimits']['maxTime'] = [
                        'duration' => TestRunnerUtils::getDurationWithMicroseconds($timeLimits->getMaxTime()),
                        'iso' => $timeLimits->getMaxTime()->__toString(),
                    ];
                }
            }

            $response['config'] = $this->getTestConfig()->getConfig();

        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'getTestData',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
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
            /* @var TestSession $session */
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
                $config = $this->getTestConfig();
                $route = $session->getRoute();
                $currentItem = $route->current();
                $itemSession = $session->getCurrentAssessmentItemSession();
                $itemRef = $this->getCurrentAssessmentItemRef($context);

                $reviewConfig = $config->getConfigValue('review');
                $displaySubsectionTitle = isset($reviewConfig['displaySubsectionTitle']) ? (bool) $reviewConfig['displaySubsectionTitle'] : true;

                if ($displaySubsectionTitle) {
                    $currentSection = $session->getCurrentAssessmentSection();
                } else {
                    $sections = $currentItem->getAssessmentSections()->getArrayCopy();
                    $currentSection = $sections[0];
                }

                $testOptions = $config->getTestOptions($context);

                // The navigation mode.
                $response['navigationMode'] = $session->getCurrentNavigationMode();
                $response['isLinear'] = $response['navigationMode'] == NavigationMode::LINEAR;

                // The submission mode.
                $response['submissionMode'] = $session->getCurrentSubmissionMode();

                // The number of remaining attempts for the current item.
                $response['remainingAttempts'] = $session->getCurrentRemainingAttempts();

                // The number of current attempt (1 for the first time ...)
                $response['attempt'] = $itemSession['numAttempts']->getValue();

                // Duration of the current item attempt
                $response['attemptDuration'] = TestRunnerUtils::getDurationWithMicroseconds($session->getTimerDuration($session->getItemAttemptTag($currentItem), TimePoint::TARGET_SERVER));

                // Whether or not the current step is timed out.
                $response['isTimeout'] = $session->isTimeout();

                // The identifier of the current item.
                $response['itemIdentifier'] = $itemRef->getIdentifier();

                // The definition of the current item (HREF)
                $response['itemDefinition'] = $itemRef->getHref();

                //deprecated key
                $response['itemUri'] = $itemRef->getHref();

                // The state of the current AssessmentTestSession.
                $response['itemSessionState'] = $itemSession->getState();

                // Whether the current item is adaptive.
                $response['isAdaptive'] = $session->isCurrentAssessmentItemAdaptive();

                // Whether the test map must be updated.
                // TODO: detect if the map need to be updated and set the flag
                $response['needMapUpdate'] = false;

                // Whether the current item is the very last one of the test.
                $response['isLast'] = (!$context->isAdaptive()) ? $route->isLast() : false;

                // The current position in the route.
                $response['itemPosition'] = $route->getPosition();

                // The current item flagged state
                $response['itemFlagged'] = TestRunnerUtils::getItemFlag($session, $response['itemPosition']);

                // The current item answered state
                $response['itemAnswered'] = TestRunnerUtils::isItemCompleted($currentItem, $itemSession);

                // Time constraints.
                $response['timeConstraints'] = $this->buildTimeConstraints($context);
                $response['extraTime'] = $this->buildExtraTime($context);

                // Test Part title.
                $response['testPartId'] = $session->getCurrentTestPart()->getIdentifier();

                // Current Section title.
                $response['sectionId'] = $currentSection->getIdentifier();
                $response['sectionTitle'] = $currentSection->getTitle();
                $response['sectionPause'] = $this->getServiceManager()->get(SectionPauseService::SERVICE_ID)->isPausable($session);

                // Number of items composing the test session.
                $response['numberItems'] = $route->count();

                // Number of items completed during the test session.
                $response['numberCompleted'] = TestRunnerUtils::testCompletion($session);

                // Number of items presented during the test session.
                $response['numberPresented'] = $session->numberPresented();

                // Whether or not the progress of the test can be inferred.
                $response['considerProgress'] = TestRunnerUtils::considerProgress($session, $context->getTestMeta(), $config->getConfig());

                // Whether or not the deepest current section is visible.
                $response['isDeepestSectionVisible'] = $currentSection->isVisible();

                // If the candidate is allowed to move backward e.g. first item of the test.
                $response['canMoveBackward'] = $session->canMoveBackward();

                //Number of rubric blocks
                $response['numberRubrics'] = count($currentItem->getRubricBlockRefs());

                //add rubic blocks
                if($response['numberRubrics'] > 0){
                    $response['rubrics'] = $this->getRubrics($context, $session->getCurrentAssessmentItemRef());
                }

                //prevent the user from submitting empty (i.e. default or null) responses, feature availability
                $response['enableAllowSkipping'] = $config->getConfigValue('enableAllowSkipping');

                //contextual value
                $response['allowSkipping'] = $testOptions['allowSkipping'];

                //prevent the user from submitting an invalid response
                $response['enableValidateResponses'] = $config->getConfigValue('enableValidateResponses');

                //contextual value
                $response['validateResponses'] = $testOptions['validateResponses'];

                //does the item has modal feedbacks ?
                $response['hasFeedbacks'] = $this->hasFeedbacks($context, $itemRef->getHref());

                // append dynamic options
                $response['options'] = $testOptions;
            }

        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'getTestContext',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
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
            $map = $this->getServiceLocator()->get(QtiRunnerMap::SERVICE_ID);
            return $map->getMap($context, $this->getTestConfig());
        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'getTestMap',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
        }
    }

    /**
     * Gets the rubrics related to the current session state.
     * @param RunnerServiceContext $context
     * @param AssessmentItemRef $itemRef (optional) otherwise use the current
     * @return mixed
     * @throws \common_Exception
     */
    public function getRubrics(RunnerServiceContext $context, AssessmentItemRef $itemRef = null)
    {
        if ($context instanceof QtiRunnerServiceContext) {
            $rubricHelper = $this->getServiceLocator()->get(QtiRunnerRubric::SERVICE_ID);
            return $rubricHelper->getRubrics($context, $itemRef);
        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'getRubrics',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
        }
    }

    /**
     * Gets AssessmentItemRef's Href by AssessmentItemRef Identifier.
     * @param RunnerServiceContext $context
     * @param string $itemRef
     * @return string
     */
    public function getItemHref(RunnerServiceContext $context, $itemRef)
    {
        $mapService = $this->getServiceLocator()->get(QtiRunnerMap::SERVICE_ID);
        return $mapService->getItemHref($context, $itemRef);
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

            return $this->loadItemData($itemRef, QtiJsonItemCompiler::ITEM_FILE_NAME);

        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'getItemData',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
        }
    }

    /**
     * Gets the state identifier for a particular item
     * @param QtiRunnerServiceContext $context
     * @param string $itemRef The item identifier
     * @return string The state identifier
     */
    protected function getStateId(QtiRunnerServiceContext $context, $itemRef)
    {
        return  $context->getTestExecutionUri() . $itemRef;
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
            $stateId = $this->getStateId($context, $itemRef);
            $state = is_null($userUri) ? null : $serviceService->get($userUri, $stateId);

            if ($state) {
                $state = json_decode($state, true);
                if (is_null($state)) {
                    throw new \common_exception_InconsistentData('Unable to decode the state for the item '.$itemRef);
                }
            }

            return $state;
        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'getItemState',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
        }
    }

    /**
     * Sets the state of a particular item
     * @param RunnerServiceContext $context
     * @param $itemRef
     * @param  $state
     * @return boolean
     * @throws \common_Exception
     */
    public function setItemState(RunnerServiceContext $context, $itemRef, $state)
    {
        if ($context instanceof QtiRunnerServiceContext) {
            $serviceService = $this->getServiceManager()->get('tao/stateStorage');
            $userUri = \common_session_SessionManager::getSession()->getUserUri();
            $stateId = $this->getStateId($context, $itemRef);
            if(!isset($state)){
                $state = '';
            }
            return is_null($userUri) ? false : $serviceService->set($userUri, $stateId, json_encode($state));
        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'setItemState',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
        }
    }

    /**
     * Parses the responses provided for a particular item
     * @param RunnerServiceContext $context
     * @param $itemRef
     * @param $response
     * @return mixed
     * @throws \common_Exception
     */
    public function parsesItemResponse(RunnerServiceContext $context, $itemRef, $response)
    {
        if ($context instanceof QtiRunnerServiceContext) {

            /** @var TestSession $session */
            $session = $context->getTestSession();
            $currentItem  = $this->getCurrentAssessmentItemRef($context);
            $responses = new State();

            if ($currentItem === false) {
                $msg = "Trying to store item variables but the state of the test session is INITIAL or CLOSED.\n";
                $msg .= "Session state value: " . $session->getState() . "\n";
                $msg .= "Session ID: " . $session->getSessionId() . "\n";
                $msg .= "JSON Payload: " . mb_substr(json_encode($response), 0, 1000);
                \common_Logger::e($msg);
            }

            $filler = new \taoQtiCommon_helpers_PciVariableFiller(
                $currentItem,
                $this->getServiceManager()->get(QtiFlysystemFileManager::SERVICE_ID)
            );

            if (is_array($response)) {
                foreach ($response as $id => $responseData) {
                    try {
                        $var = $filler->fill($id, $responseData);
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

            return $responses;
        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'storeItemResponse',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
        }
    }

    /**
     * Checks if the provided responses are empty
     * @param RunnerServiceContext $context
     * @param $responses
     * @return mixed
     * @throws \common_Exception
     */
    public function emptyResponse(RunnerServiceContext $context, $responses)
    {
        if ($context instanceof QtiRunnerServiceContext) {
            $similar = 0;

            /** @var ResponseVariable $responseVariable */
            foreach ($responses as $responseVariable) {
                $value = $responseVariable->getValue();
                $default = $responseVariable->getDefaultValue();

                // Similar to default ?
                if (TestRunnerUtils::isQtiValueNull($value) === true) {
                    if (TestRunnerUtils::isQtiValueNull($default) === true) {
                        $similar++;
                    }
                } elseif ($value->equals($default) === true) {
                    $similar++;
                }
            }

            $respCount = count($responses);
            return $respCount > 0 && $similar == $respCount;
        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'storeItemResponse',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
        }
    }

    /**
     * Stores the response of a particular item
     * @param RunnerServiceContext $context
     * @param $itemRef
     * @param $responses
     * @return boolean
     * @throws \common_Exception
     */
    public function storeItemResponse(RunnerServiceContext $context, $itemRef, $responses)
    {
        if ($context instanceof QtiRunnerServiceContext) {

            $session = $this->getCurrentAssessmentSession($context);

            try {
                \common_Logger::t('Responses sent from the client-side. The Response Processing will take place.');
                
                if ($context->isAdaptive()) {
                    $session->beginItemSession();
                    $session->beginAttempt();
                    $session->endAttempt($responses);
                    $score = $session->getVariable('SCORE');
                    $assessmentItem = $session->getAssessmentItem();
                    
                    $output = new ItemResult(
                        $assessmentItem->getIdentifier(),
                            new ResultVariable(
                                $score->getIdentifier(),
                                BaseType::getNameByConstant($score->getBaseType()),
                                $score->getValue()->getValue()
                            )
                        );
                        
                    $context->persistLastCatItemOutput($output);
                    
                    // Send results to TAO Results.
                    $resultTransmitter = new \taoQtiCommon_helpers_ResultTransmitter($context->getSessionManager()->getResultServer());
                    $outcomeVariables = [];
                    
                    $hrefParts = explode('|', $assessmentItem->getHref());
                    $sessionId = $context->getTestSession()->getSessionId();
                    $itemIdentifier = $assessmentItem->getIdentifier();
                    $transmissionId = "${sessionId}.${itemIdentifier}.0";
                    
                    foreach ($session->getAllVariables() as $var) {
                        $variables[] = $var;
                    }
                    
                    $resultTransmitter->transmitItemVariable($variables, $transmissionId, $hrefParts[0], $hrefParts[2]);
                    
                } else {
                    $session->endAttempt($responses, true);
                }
                
                return true;
            } catch (AssessmentTestSessionException $e) {
                \common_Logger::w($e->getMessage());
                return false;
            }
        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'storeItemResponse',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
        }
    }


    /**
     * Should we display feedbacks
     * @param RunnerServiceContext $context
     * @return boolean
     * @throws \common_exception_InvalidArgumentType
     */
    public function displayFeedbacks(RunnerServiceContext $context)
    {
        $displayFeedbacks = false;

        if ($context instanceof QtiRunnerServiceContext) {
            /* @var TestSession $session */
            $session = $context->getTestSession();

            if($session->getCurrentSubmissionMode() !== SubmissionMode::SIMULTANEOUS){
                $displayFeedbacks = true;
            }
        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'displayFeedbacks',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
        }
        return $displayFeedbacks;
    }


    /**
     * Get feedback definitions
     *
     * @param RunnerServiceContext $context
     * @param string $itemRef  the item reference
     * @return array the feedbacks data
     * @throws \common_Exception
     * @throws \common_exception_InconsistentData
     * @throws \common_exception_InvalidArgumentType
     * @throws \tao_models_classes_FileNotFoundException
     */
    public function getFeedbacks(RunnerServiceContext $context, $itemRef)
    {
        $feedbacks = array();

        if ($context instanceof QtiRunnerServiceContext) {
            return $this->loadItemData($itemRef, QtiJsonItemCompiler::VAR_ELT_FILE_NAME);
        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'getFeedbacks',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
        }

        return $feedbacks;
    }

    /**
     * Does the given item has feedbacks
     *
     * @param RunnerServiceContext $context
     * @param string $itemRef  the item reference
     * @return boolean
     * @throws \common_Exception
     * @throws \common_exception_InconsistentData
     * @throws \common_exception_InvalidArgumentType
     * @throws \tao_models_classes_FileNotFoundException
     */
    public function hasFeedbacks(RunnerServiceContext $context, $itemRef)
    {
        $hasFeedbacks     = false;
        $displayFeedbacks = $this->displayFeedbacks($context);
        if($displayFeedbacks) {
            $feedbacks = $this->getFeedbacks($context, $itemRef);
            foreach ($feedbacks as $entry) {
                if(isset($entry['feedbackRules'])){
                    if(count($entry['feedbackRules']) > 0){
                        $hasFeedbacks = true;
                    }
                    break;
                }
            }
        }
        return $hasFeedbacks;
    }
    /**
     * Should we display feedbacks
     * @param RunnerServiceContext $context
     * @return AssessmentItemSession the item session
     * @throws \common_exception_InvalidArgumentType
     */
    public function getItemSession(RunnerServiceContext $context)
    {
        if ($context instanceof QtiRunnerServiceContext) {
            /* @var TestSession $session */
            $session = $context->getTestSession();

            $currentItem       = $session->getCurrentAssessmentItemRef();
            $currentOccurrence = $session->getCurrentAssessmentItemRefOccurence();

            $itemSession       = $session->getAssessmentItemSessionStore()->getAssessmentItemSession($currentItem, $currentOccurrence);

            $stateOutput = new \taoQtiCommon_helpers_PciStateOutput();

            foreach ($itemSession->getAllVariables() as $var) {
                $stateOutput->addVariable($var);
            }

            $output = $stateOutput->getOutput();

            // The current item answered state
            $route    = $session->getRoute();
            $position = $route->getPosition();
            $output['itemAnswered'] = TestRunnerUtils::isItemCompleted($route->getRouteItemAt($position), $itemSession);

        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'getItemSession',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
        }
        return $output;
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
            try {
                $result = QtiRunnerNavigation::move($direction, $scope, $context, $ref);
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
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'move',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
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
            /* @var TestSession $session */
            $session = $context->getTestSession();
            try {
                $session->closeTimer($ref, $scope);
                $session->checkTimeLimits(false, true, false);
            } catch (AssessmentTestSessionException $e) {
                $this->onTimeout($context, $e);
            }

        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'timeout',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
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
            /* @var TestSession $session */
            $session = $context->getTestSession();
            $sessionId = $session->getSessionId();
            \common_Logger::i("The user has requested termination of the test session '{$sessionId}'");

            $event = new TestExitEvent($session);
            $this->getServiceManager()->get(EventManager::SERVICE_ID)->trigger($event);

            $session->endTestSession();

            $this->finish($context);
        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'exitTest',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
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
        if ($context instanceof QtiRunnerServiceContext) {
            $executionUri = $context->getTestExecutionUri();
            $userUri = \common_session_SessionManager::getSession()->getUserUri();

            $executionService = ServiceProxy::singleton();
            $deliveryExecution = $executionService->getDeliveryExecution($executionUri);

            if ($deliveryExecution->getUserIdentifier() == $userUri) {
                \common_Logger::i("Finishing the delivery execution {$executionUri}");
                $result = $deliveryExecution->setState(DeliveryExecution::STATE_FINISHIED);
            } else {
                \common_Logger::w("Non owner {$userUri} tried to finish deliveryExecution {$executionUri}");
                $result = false;
            }

            $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID)->clearEvents($executionUri);
        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'finish',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
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

            $context->getTestSession()->suspend();
            $this->persist($context);

        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'pause',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
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

            $context->getTestSession()->resume();
            $this->persist($context);

        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'resume',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
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
     * Checks if the test is in paused state
     * @param RunnerServiceContext $context
     * @return boolean
     */
    public function isPaused(RunnerServiceContext $context)
    {
        return $context->getTestSession()->getState() == AssessmentTestSessionState::SUSPENDED;
    }

    /**
     * Checks if the test is in terminated state
     * @param RunnerServiceContext $context
     * @return boolean
     */
    public function isTerminated(RunnerServiceContext $context)
    {
        return $context->getTestSession()->getState() == AssessmentTestSessionState::CLOSED;
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
            // do fallback in case userlanguage is not default language
            if ($userDataLang != DEFAULT_LANG && !$directory->has($userDataLang) && $directory->has(DEFAULT_LANG)) {
                $userDataLang = DEFAULT_LANG;
            }
            return $directory->getPublicAccessUrl().$userDataLang.'/';
        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'getItemPublicUrl',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
        }
    }

    /**
     * Comment the test
     * @param RunnerServiceContext $context
     * @param string $comment
     * @return bool
     */
    public function comment(RunnerServiceContext $context, $comment)
    {
        $resultServer = \taoResultServer_models_classes_ResultServerStateFull::singleton();
        $transmitter = new \taoQtiCommon_helpers_ResultTransmitter($resultServer);

        // prepare transmission Id for result server.
        $testSession = $context->getTestSession();
        $item = $testSession->getCurrentAssessmentItemRef()->getIdentifier();
        $occurrence = $testSession->getCurrentAssessmentItemRefOccurence();
        $sessionId = $testSession->getSessionId();
        $transmissionId = "${sessionId}.${item}.${occurrence}";

        // build variable and send it.
        $itemUri = TestRunnerUtils::getCurrentItemUri($testSession);
        $testUri = $testSession->getTest()->getUri();
        $variable = new ResponseVariable('comment', Cardinality::SINGLE, BaseType::STRING, new QtismString($comment));
        $transmitter->transmitItemVariable($variable, $transmissionId, $itemUri, $testUri);

        return true;
    }

    /**
     * Continue the test interaction if possible
     * @param RunnerServiceContext $context
     * @return bool
     */
    protected function continueInteraction(RunnerServiceContext $context)
    {
        $continue = false;

        /* @var TestSession $session */
        $session = $context->getTestSession();

        if ($session->isRunning() === true && $session->isTimeout() === false) {

            $event = new QtiContinueInteractionEvent($context, $this);
            $this->getServiceManager()->get(EventManager::SERVICE_ID)->trigger($event);

            TestRunnerUtils::beginCandidateInteraction($session);
            $continue = true;
        } else {
            $this->finish($context);
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
        /* @var TestSession $session */
        $session = $context->getTestSession();

        $event = new TestTimeoutEvent($session, $timeOutException->getCode(), true);
        $this->getServiceManager()->get(EventManager::SERVICE_ID)->trigger($event);

        $isLinear = $session->getCurrentNavigationMode() === NavigationMode::LINEAR;
        switch ($timeOutException->getCode()) {
            case AssessmentTestSessionException::ASSESSMENT_TEST_DURATION_OVERFLOW:
                \common_Logger::i('TIMEOUT: closing the assessment test session');
                $session->endTestSession();
                break;

            case AssessmentTestSessionException::TEST_PART_DURATION_OVERFLOW:
                if ($isLinear) {
                    \common_Logger::i('TIMEOUT: moving to the next test part');
                    $session->moveNextTestPart();
                } else {
                    \common_Logger::i('TIMEOUT: closing the assessment test part');
                    $session->closeTestPart();
                }
                break;

            case AssessmentTestSessionException::ASSESSMENT_SECTION_DURATION_OVERFLOW:
                if ($isLinear) {
                    \common_Logger::i('TIMEOUT: moving to the next assessment section');
                    $session->moveNextAssessmentSection();
                } else {
                    \common_Logger::i('TIMEOUT: closing the assessment section session');
                    $session->closeAssessmentSection();
                }
                break;

            case AssessmentTestSessionException::ASSESSMENT_ITEM_DURATION_OVERFLOW:
                if ($isLinear) {
                    \common_Logger::i('TIMEOUT: moving to the next item');
                    $session->moveNextAssessmentItem();
                } else {
                    \common_Logger::i('TIMEOUT: closing the assessment item session');
                    $session->closeAssessmentItem();
                }
                break;
        }

        $event = new TestTimeoutEvent($session, $timeOutException->getCode(), false);
        $this->getServiceManager()->get(EventManager::SERVICE_ID)->trigger($event);

        $this->continueInteraction($context);
    }

    /**
     * Build an array where each cell represent a time constraint (a.k.a. time limits)
     * in force. Each cell is actually an array with two keys:
     *
     * * 'source': The identifier of the QTI component emitting the constraint (e.g. AssessmentTest, TestPart, AssessmentSection, AssessmentItemRef).
     * * 'seconds': The number of remaining seconds until it times out.
     *
     * @param RunnerServiceContext $context
     * @return array
     */
    protected function buildTimeConstraints(RunnerServiceContext $context)
    {
        $constraints = array();

        /* @var TestSession $session */
        $session = $context->getTestSession();

        foreach ($session->getRegularTimeConstraints() as $tc) {
            $maxTimeSeconds = $this->getTimeLimitsFromSession($session, $tc->getSource()->getQtiClassName());

            $timeRemaining = $tc->getMaximumRemainingTime();
            if ($timeRemaining !== false) {
                $source = $tc->getSource();
                $identifier = $source->getIdentifier();
                $seconds = TestRunnerUtils::getDurationWithMicroseconds($timeRemaining);
                $constraints[] = array(
                    'label' => method_exists($source, 'getTitle') ? $source->getTitle() : $identifier,
                    'source' => $identifier,
                    'seconds' => $seconds,
                    'extraTime' => $tc->getTimer()->getExtraTime($maxTimeSeconds),
                    'allowLateSubmission' => $tc->allowLateSubmission(),
                    'qtiClassName' => $source->getQtiClassName()
                );
            }
        }

        return $constraints;
    }

    /**
     * Builds a descriptor that contains the extra time
     * @param RunnerServiceContext $context
     * @return array
     */
    protected function buildExtraTime(RunnerServiceContext $context)
    {
        /* @var TestSession $session */
        $session = $context->getTestSession();
        $timer = $session->getTimer();
        $sessionMaxTime = null;
        $sessionTimeLimits = $session->getCurrentTestPart()->getTimeLimits();
        if ($sessionTimeLimits) {
            $sessionMaxTime = $sessionTimeLimits->hasMaxTime()
                 ? $sessionTimeLimits->getMaxTime()->getSeconds(true)
                 : null;
        }

        return [
            'total' => $timer->getExtraTime($sessionMaxTime),
            'consumed' => $timer->getConsumedExtraTime(),
            'remaining' => $timer->getRemainingExtraTime(),
        ];
    }

    /**
     * Stores trace variable related to an item, a test or a section
     * @param RunnerServiceContext $context
     * @param $itemUri
     * @param $variableIdentifier
     * @param $variableValue
     * @return boolean
     * @throws \common_Exception
     */
    public function storeTraceVariable(RunnerServiceContext $context, $itemUri, $variableIdentifier, $variableValue)
    {
        if ($context instanceof QtiRunnerServiceContext) {
            if (!is_string($variableValue) && !is_numeric($variableValue)) {
                $variableValue = json_encode($variableValue);
            }

            $metaVariable = new \taoResultServer_models_classes_TraceVariable();
            $metaVariable->setIdentifier($variableIdentifier);
            $metaVariable->setBaseType('string');
            $metaVariable->setCardinality(Cardinality::getNameByConstant(Cardinality::SINGLE));
            $metaVariable->setTrace($variableValue);

            $resultServer = \taoResultServer_models_classes_ResultServerStateFull::singleton();

            $testUri = $context->getTestDefinitionUri();
            $sessionId = $context->getTestSession()->getSessionId();

            if (!is_null($itemUri)) {
                $currentItem = $this->getCurrentAssessmentItemRef($context);
                $currentOccurrence = $context->getTestSession()->getCurrentAssessmentItemRefOccurence();

                $transmissionId = "${sessionId}.${currentItem}.${currentOccurrence}";
                $resultServer->storeItemVariable($testUri, $itemUri, $metaVariable, $transmissionId);
            } else {
                $resultServer->storeTestVariable($testUri, $metaVariable, $sessionId);
            }

            return true;
        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'storeTraceVariable',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
        }
    }

    /**
     * Starts the timer for the current item in the TestSession
     *
     * @param RunnerServiceContext $context
     * @param float $timestamp allow to start the timer at a specific time, or use current when it's null
     * @return bool
     * @throws \common_exception_InvalidArgumentType
     */
    public function startTimer(RunnerServiceContext $context, $timestamp = null)
    {
        if ($context instanceof QtiRunnerServiceContext) {
            /* @var TestSession $session */
            $session = $context->getTestSession();
            if($session->getState() === AssessmentTestSessionState::INTERACTING) {
                $session->startItemTimer($timestamp);
            }
        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'startTimer',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
        }
        return true;
    }

    /**
     * Ends the timer for the current item in the TestSession
     *
     * @param RunnerServiceContext $context
     * @param float $duration The client side duration to adjust the timer
     * @param float $consumedExtraTime The extra time consumed by the client
     * @param float $timestamp allow to end the timer at a specific time, or use current when it's null
     * @return bool
     * @throws \common_exception_InvalidArgumentType
     */
    public function endTimer(RunnerServiceContext $context, $duration = null, $consumedExtraTime = null, $timestamp = null)
    {
        if ($context instanceof QtiRunnerServiceContext) {
            /* @var TestSession $session */
            $session = $context->getTestSession();
            $session->endItemTimer($duration, $consumedExtraTime, $timestamp);
        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'endTimer',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
        }
        return true;
    }

    /**
     * Switch the received client store ids. Put the received id if different from the last stored.
     * This enables us to check wether the stores has been changed during a test session.
     * @param RunnerServiceContext $context
     * @param string $receivedStoreId The identifier of the client side store
     * @return string the identifier of the LAST saved client side store
     * @throws \common_exception_InvalidArgumentType
     */
    public function switchClientStoreId(RunnerServiceContext $context, $receivedStoreId)
    {
        if ($context instanceof QtiRunnerServiceContext){
            /* @var TestSession $session */
            $session = $context->getTestSession();
            $sessionId = $session->getSessionId();

            $stateService = $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID);
            $lastStoreId = $stateService->getStoreId($sessionId);

            if($lastStoreId == false || $lastStoreId != $receivedStoreId){
                $stateService->setStoreId($sessionId, $receivedStoreId);
            }

            return $lastStoreId;
        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerService',
                'switchClientStoreId',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
        }
    }
    
    /**
     * Get Current AssessmentItemRef object.
     * 
     * This method returns the current AssessmentItemRef object depending on the test $context.
     * 
     * @return \qtism\data\ExtendedAssessmentItemRef
     */
    public function getCurrentAssessmentItemRef(RunnerServiceContext $context)
    {
        if ($context->isAdaptive()) {
            return $this->getServiceManager()->get(CatService::SERVICE_ID)->getAssessmentItemRefByIdentifier(
                $context->getCompilationDirectory()['private'],
                $context->getLastCatItemId()
            );
        } else {
            return $context->getTestSession()->getCurrentAssessmentItemRef();
        }
    }
    
    /**
     * Get Current Assessment Session.
     * 
     * Depending on the context (adaptive or not), it will return an appropriate Assessment Object to deal with.
     * 
     * In case of the context is not adaptive, an AssessmentTestSession corresponding to the current test $context is returned.
     * 
     * Otherwise, an AssessmentItemSession to deal with is returned.
     * 
     * @param \oat\taoQtiTest\models\runner\RunnerServiceContext $context
     * @return \qtism\runtime\tests\AssessmentTestSession|\qtism\runtime\tests\AssessmentItemSession
     */
    public function getCurrentAssessmentSession(RunnerServiceContext $context)
    {
        if ($context->isAdaptive()) {
            return new AssessmentItemSession($this->getCurrentAssessmentItemRef($context), new SessionManager());
        } else {
            return $context->getTestSession();
        }
    }

    /**
     * @param TestSession $session
     * @param string $qtiClassName
     * @return null|string
     */
    public function getTimeLimitsFromSession(TestSession $session, $qtiClassName)
    {
        $maxTimeSeconds = null;
        $item = null;
        switch ($qtiClassName) {
            case 'assessmentTest' :
                $item = $session->getAssessmentTest();
                break;
            case 'testPart':
                $item = $session->getCurrentTestPart();
                break;
            case 'assessmentSection':
                $item = $session->getCurrentAssessmentSection();
                break;
            case 'assessmentItemRef':
                $item = $session->getCurrentAssessmentItemSession();
                break;
        }

        if ($item && $limits = $item->getTimeLimits()) {
            $maxTimeSeconds = $limits->hasMaxTime()
                ? $limits->getMaxTime()->getSeconds(true)
                : $maxTimeSeconds;
        }

        return $maxTimeSeconds;
    }
}
