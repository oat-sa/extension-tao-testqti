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
* Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
*
*/

use oat\taoQtiTest\models\runner\RunnerService;
use oat\taoQtiTest\models\runner\time\TimerLabelFormatterService;
use qtism\data\NavigationMode;
use qtism\data\SubmissionMode;
use qtism\runtime\common\Container;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\tests\AssessmentTestSessionException;
use qtism\runtime\tests\AssessmentItemSession;
use qtism\runtime\tests\AssessmentItemSessionState;
use qtism\runtime\tests\AssessmentTestSessionState;
use qtism\runtime\tests\Jump;
use qtism\runtime\tests\RouteItem;
use oat\taoQtiTest\models\ExtendedStateService;
use oat\taoQtiTest\models\QtiTestCompilerIndex;
use oat\taoQtiTest\models\runner\rubric\QtiRunnerRubric;
use qtism\common\datatypes\QtiString;
use oat\oatbox\service\ServiceManager;
use oat\taoQtiTest\models\runner\RunnerServiceContext;

/**
* Utility methods for the QtiTest Test Runner.
*
* @author Jérôme Bogaerts <jerome@taotesting.com>
*
*/
class taoQtiTest_helpers_TestRunnerUtils {
    
    /**
     * Temporary helper until proper ServiceManager integration
     * @return ServiceManager
     */
    static protected function getServiceManager()
    {
        return ServiceManager::getServiceManager();
    }
    
    /**
     * Temporary helper until proper ServiceManager integration
     * @return ExtendedStateService
     */
    static public function getExtendedStateService()
    {
        return self::getServiceManager()->get(ExtendedStateService::SERVICE_ID);
    }
    
    /**
     * Get the ServiceCall object representing how to call the current Assessment Item to be
     * presented to a candidate in a given Assessment Test $session.
     *
     * @param AssessmentTestSession $session An AssessmentTestSession Object.
     * @param string $testDefinition URI The URI of the knowledge base resource representing the folder where the QTI Test Definition is stored.
     * @param string $testCompilation URI The URI of the knowledge base resource representing the folder where the QTI Test Compilation is stored.
     * @return tao_models_classes_service_ServiceCall A ServiceCall object.
     */
    static public function buildItemServiceCall(AssessmentTestSession $session, $testDefinitionUri, $testCompilationUri) {
        
        $href = $session->getCurrentAssessmentItemRef()->getHref();

        // retrive itemUri & itemPath.
        $parts = explode('|', $href);
         
        $definition =  new core_kernel_classes_Resource(RunnerService::INSTANCE_TEST_ITEM_RUNNER_SERVICE);
        $serviceCall = new tao_models_classes_service_ServiceCall($definition);
         
        $uriResource = new core_kernel_classes_Resource(taoItems_models_classes_ItemsService::INSTANCE_FORMAL_PARAM_ITEM_URI);
        $uriParam = new tao_models_classes_service_ConstantParameter($uriResource, $parts[0]);
        $serviceCall->addInParameter($uriParam);
         
        $pathResource = new core_kernel_classes_Resource(taoItems_models_classes_ItemsService::INSTANCE_FORMAL_PARAM_ITEM_PATH);
        $pathParam = new tao_models_classes_service_ConstantParameter($pathResource, $parts[1]);
        $serviceCall->addInParameter($pathParam);
        
        $dataPathResource = new core_kernel_classes_Resource(taoItems_models_classes_ItemsService::INSTANCE_FORMAL_PARAM_ITEM_DATA_PATH);
        $dataPathParam = new tao_models_classes_service_ConstantParameter($dataPathResource, $parts[2]);
        $serviceCall->addInParameter($dataPathParam);
         
        $parentServiceCallIdResource = new core_kernel_classes_Resource(RunnerService::INSTANCE_FORMAL_PARAM_TEST_ITEM_RUNNER_PARENT_CALL_ID);
        $parentServiceCallIdParam = new tao_models_classes_service_ConstantParameter($parentServiceCallIdResource, $session->getSessionId());
        $serviceCall->addInParameter($parentServiceCallIdParam);
         
        $testDefinitionResource = new core_kernel_classes_Resource(taoQtiTest_models_classes_QtiTestService::INSTANCE_FORMAL_PARAM_TEST_DEFINITION);
        $testDefinitionParam = new tao_models_classes_service_ConstantParameter($testDefinitionResource, $testDefinitionUri);
        $serviceCall->addInParameter($testDefinitionParam);
         
        $testCompilationResource = new core_kernel_classes_Resource(taoQtiTest_models_classes_QtiTestService::INSTANCE_FORMAL_PARAM_TEST_COMPILATION);
        $testCompilationParam = new tao_models_classes_service_ConstantParameter($testCompilationResource, $testCompilationUri);
        $serviceCall->addInParameter($testCompilationParam);
         
        return $serviceCall;
    }
    
    /**
     * Build the Service Call ID of the current Assessment Item to be presented to a candidate
     * in a given Assessment Test $session.
     *
     * @return string A service call id composed of the session identifier,  the identifier of the item and its occurence number in the route.
     */
    static public function buildServiceCallId(AssessmentTestSession $session) {
        
	    $sessionId = $session->getSessionId();
	    $itemId = $session->getCurrentAssessmentItemRef()->getIdentifier();
	    $occurence = $session->getCurrentAssessmentItemRefOccurence();
	    return "${sessionId}.${itemId}.${occurence}";
    }

    /**
     * Set the initial outcomes defined in the rdf outcome map configuration file
     *
     * @param AssessmentTestSession $session
     * @param \oat\oatbox\user\User $testTaker
     * @throws common_exception_Error
     * @throws common_ext_ExtensionException
     */
    public static function setInitialOutcomes(AssessmentTestSession $session, \oat\oatbox\user\User $testTaker)
    {
        $rdfOutcomeMap = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->getConfig('rdfOutcomeMap');
        if(is_array($rdfOutcomeMap)){
            foreach($rdfOutcomeMap as $outcomeId => $rdfPropUri){
                //set outcome value
                $values = $testTaker->getPropertyValues($rdfPropUri);
                $outcome = $session->getVariable($outcomeId);
                if(!is_null($outcome) && count($values)){
                    $outcome->setValue(new QtiString((string)$values[0]));
                }
            }
        }
    }

    /**
     * Preserve the outcomes variables set in the "rdfOutcomeMap" config
     * This is required to prevent those special outcomes from being reset before every outcome processing
     *
     * @param AssessmentTestSession $session
     * @throws common_ext_ExtensionException
     */
    public static function preserveOutcomes(AssessmentTestSession $session)
    {
        //preserve the special outcomes defined in the rdfOutcomeMap config
        $rdfOutcomeMap = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->getConfig('rdfOutcomeMap');
        if (is_array($rdfOutcomeMap) === true) {
            $session->setPreservedOutcomeVariables(array_keys($rdfOutcomeMap));
        }
    }
    
    /**
     * Whether or not the current Assessment Item to be presented to the candidate is timed-out. By timed-out
     * we mean:
     * 
     * * current Assessment Test level time limits are not respected OR,
     * * current Test Part level time limits are not respected OR,
     * * current Assessment Section level time limits are not respected OR,
     * * current Assessment Item level time limits are not respected.
     * 
     * @param AssessmentTestSession $session The AssessmentTestSession object you want to know it is timed-out.
     * @return boolean
     */
    static public function isTimeout(AssessmentTestSession $session) {
        
        try {
            $session->checkTimeLimits(false, true, false);
        }
        catch (AssessmentTestSessionException $e) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Get the URI referencing the current Assessment Item (in the knowledge base)
     * to be presented to the candidate.
     * 
     * @param AssessmentTestSession $session An AssessmentTestSession object.
     * @return string A URI.
     */
    static public function getCurrentItemUri(AssessmentTestSession $session) {
        $href = $session->getCurrentAssessmentItemRef()->getHref();
        $parts = explode('|', $href);
        
        return $parts[0];
    }
    
    /**
     * Build the URL to be called to perform a given action on the Test Runner controller.
     * 
     * @param AssessmentTestSession $session An AssessmentTestSession object.
     * @param string $action The action name e.g. 'moveForward', 'moveBackward', 'skip', ... 
     * @param string $qtiTestDefinitionUri The URI of a reference to an Assessment Test definition in the knowledge base.
     * @param string $qtiTestCompilationUri The Uri of a reference to an Assessment Test compilation in the knowledge base.
     * @param string $standalone
     * @return string A URL to be called to perform an action.
     */
    static public function buildActionCallUrl(AssessmentTestSession $session, $action, $qtiTestDefinitionUri, $qtiTestCompilationUri, $standalone) {
        return _url($action, 'TestRunner', null, array(
            'QtiTestDefinition' => $qtiTestDefinitionUri,
            'QtiTestCompilation' => $qtiTestCompilationUri,
            'standalone' => $standalone,
            'serviceCallId' => $session->getSessionId(),
        ));
    }
    
    static public function buildServiceApi(AssessmentTestSession $session, $qtiTestDefinitionUri, $qtiTestCompilationUri) {
        $serviceCall = self::buildItemServiceCall($session, $qtiTestDefinitionUri, $qtiTestCompilationUri);         
        $itemServiceCallId = self::buildServiceCallId($session);
        return tao_helpers_ServiceJavascripts::getServiceApi($serviceCall, $itemServiceCallId);
    }
    
    /**
     * Tell the client to not cache the current request. Supports HTTP 1.0 to 1.1.
     */
    static public function noHttpClientCache() {
        // From stackOverflow: http://stackoverflow.com/questions/49547/making-sure-a-web-page-is-not-cached-across-all-browsers
        // license is Creative Commons Attribution Share Alike (author Edward Wilde)
        header('Cache-Control: no-cache, no-store, must-revalidate'); // HTTP 1.1.
        header('Pragma: no-cache'); // HTTP 1.0.
        header('Expires: 0'); // Proxies.
    }
    
    /**
     * Make the candidate interact with the current Assessment Item to be presented. A new attempt
     * will begin automatically if the candidate still has available attempts. Otherwise,
     * nothing happends.
     * 
     * @param AssessmentTestSession $session The AssessmentTestSession you want to make the candidate interact with.
     */
    static public function beginCandidateInteraction(AssessmentTestSession $session) {
        $itemSession = $session->getCurrentAssessmentItemSession();
        $itemSessionState = $itemSession->getState();
        
        $initial = $itemSessionState === AssessmentItemSessionState::INITIAL;
        $suspended = $itemSessionState === AssessmentItemSessionState::SUSPENDED;
        $remainingAttempts = $itemSession->getRemainingAttempts();
        $attemptable = $remainingAttempts === -1 || $remainingAttempts > 0;
        
        if ($initial === true || ($suspended === true && $attemptable === true)) {
            // Begin the very first attempt.
            $session->beginAttempt();
        }
        // Otherwise, the item is not attemptable bt the candidate.
    }
    
    /**
     * Whether or not the candidate taking the given $session is allowed
     * to skip the presented Assessment Item.
     * 
     * @param AssessmentTestSession $session A given AssessmentTestSession object.
     * @return boolean
     */
    static public function doesAllowSkipping(AssessmentTestSession $session) {
        $doesAllowSkipping = true;
        $submissionMode = $session->getCurrentSubmissionMode();
         
        $routeItem = $session->getRoute()->current();
        $routeControl = $routeItem->getItemSessionControl();
         
        if (empty($routeControl) === false) {
            $doesAllowSkipping = $routeControl->getItemSessionControl()->doesAllowSkipping();
        }
         
        return $doesAllowSkipping && $submissionMode === SubmissionMode::INDIVIDUAL;
    }

    /**
     * Whether or not the candidate's response is validated
     *
     * @param AssessmentTestSession $session A given AssessmentTestSession object.
     * @return boolean
     */
    static public function doesValidateResponses(AssessmentTestSession $session) {
        $doesValidateResponses = true;
        $submissionMode = $session->getCurrentSubmissionMode();

        $routeItem = $session->getRoute()->current();
        $routeControl = $routeItem->getItemSessionControl();

        if (empty($routeControl) === false) {
            $doesValidateResponses = $routeControl->getItemSessionControl()->mustValidateResponses();
        }

        return $doesValidateResponses && $submissionMode === SubmissionMode::INDIVIDUAL;
    }

    /**
     * Whether or not the candidate taking the given $session is allowed to make
     * a comment on the presented Assessment Item.
     * 
     * @param AssessmentTestSession $session A given AssessmentTestSession object.
     * @return boolean
     */
    static public function doesAllowComment(AssessmentTestSession $session) {
        $doesAllowComment = false;
         
        $routeItem = $session->getRoute()->current();
        $routeControl = $routeItem->getItemSessionControl();
         
        if (empty($routeControl) === false) {
            $doesAllowComment = $routeControl->getItemSessionControl()->doesAllowComment();
        }
         
        return $doesAllowComment;
    }
    
    /**
     * Build an array where each cell represent a time constraint (a.k.a. time limits)
     * in force. Each cell is actually an array with two keys:
     * 
     * * 'source': The identifier of the QTI component emitting the constraint (e.g. AssessmentTest, TestPart, AssessmentSection, AssessmentItemRef).
     * * 'seconds': The number of remaining seconds until it times out.
     * 
     * @param AssessmentTestSession $session An AssessmentTestSession object.
     * @return array
     */
    static public function buildTimeConstraints(AssessmentTestSession $session) {
        $constraints = array();
        /** @var TimerLabelFormatterService $timerLabelFormatter */
        $timerLabelFormatter = static::getServiceManager()->get(TimerLabelFormatterService::SERVICE_ID);

        foreach ($session->getTimeConstraints() as $tc) {
            // Only consider time constraints in force.
            if ($tc->getMaximumRemainingTime() !== false) {
                $label = method_exists($tc->getSource(), 'getTitle') ? $tc->getSource()->getTitle() : $tc->getSource()->getIdentifier();
                $constraints[] = array(
                    'label' => $timerLabelFormatter->format($label),
                    'source' => $tc->getSource()->getIdentifier(),
                    'seconds' => self::getDurationWithMicroseconds($tc->getMaximumRemainingTime()),
                    'allowLateSubmission' => $tc->allowLateSubmission(),
                    'qtiClassName' => $tc->getSource()->getQtiClassName()
                );
            }
        }
        
        return $constraints;
    }
    
    /**
     * Build an array where each cell represent a possible Assessment Item a candidate
     * can jump on during a given $session. Each cell is an array with two keys:
     * 
     * * 'identifier': The identifier of the Assessment Item the candidate is allowed to jump on.
     * * 'position': The position in the route of the Assessment Item.
     * 
     * @param AssessmentTestSession $session A given AssessmentTestSession object.
     * @return array
     */
    static public function buildPossibleJumps(AssessmentTestSession $session) {
        $jumps = array();
         
        foreach ($session->getPossibleJumps() as $jumpObject) {
            $jump = array();
            $jump['identifier'] = $jumpObject->getTarget()->getAssessmentItemRef()->getIdentifier();
            $jump['position'] = $jumpObject->getPosition();
             
            $jumps[] = $jump;
        }
         
        return $jumps;
    }
    
    /**
     * Build the context of the given candidate test $session as an associative array. This array
     * is especially usefull to transmit the test context to a view as JSON data.
     * 
     * The returned array contains the following keys:
     * 
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
     * * moveForwardUrl: The URL to be dereferenced to perform a moveNext on the session.
     * * moveBackwardUrl: The URL to be dereferenced to perform a moveBack on the session.
     * * skipUrl: The URL to be dereferenced to perform a skip on the session.
     * * commentUrl: The URL to be dereferenced to leave a comment about the current item.
     * * timeoutUrl: The URL to be dereferenced when the time constraints in force reach their maximum.
     * * canMoveBackward: Whether or not the candidate is allowed/able to move backward.
     * * jumps: The possible jumpers the candidate is allowed to undertake among eligible items.
     * * itemServiceApiCall: The JavaScript code to be executed to instantiate the current item.
     * * rubrics: The XHTML compiled content of the rubric blocks to be displayed for the current item if any.
     * * allowComment: Whether or not the candidate is allowed to leave a comment about the current item.
     * * allowSkipping: Whether or not the candidate is allowed to skip the current item.
     * * considerProgress: Whether or not the test driver view must consider to give a test progress feedback.
     * 
     * @param AssessmentTestSession $session A given AssessmentTestSession object.
     * @param array $testMeta An associative array containing meta-data about the test definition taken by the candidate.
     * @param QtiTestCompilerIndex $itemIndex
     * @param string $qtiTestDefinitionUri The URI of a reference to an Assessment Test definition in the knowledge base.
     * @param string $qtiTestCompilationUri The Uri of a reference to an Assessment Test compilation in the knowledge base.
     * @param string $standalone
     * @param array $compilationDirs An array containing respectively the private and public compilation directories.
     * @return array The context of the candidate session.
     */
    static public function buildAssessmentTestContext(AssessmentTestSession $session, array $testMeta, $itemIndex, $qtiTestDefinitionUri, $qtiTestCompilationUri, $standalone, $compilationDirs) {
        $context = array();
         
        // The state of the test session.
        $context['state'] = $session->getState();
         
        // Default values for the test session context.
        $context['navigationMode'] = null;
        $context['submissionMode'] = null;
        $context['remainingAttempts'] = 0;
        $context['isAdaptive'] = false;

        $hasBeenPaused = false;
        if(common_ext_ExtensionsManager::singleton()->isEnabled('taoProctoring')){
            $hasBeenPaused = \oat\taoProctoring\helpers\DeliveryHelper::getHasBeenPaused($session->getSessionId());
        }
        $context['hasBeenPaused'] = $hasBeenPaused;

         
        if ($session->getState() === AssessmentTestSessionState::INTERACTING) {
            $config = common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->getConfig('testRunner');
            
            // The navigation mode.
            $context['navigationMode'] = $session->getCurrentNavigationMode();
        
            // The submission mode.
            $context['submissionMode'] = $session->getCurrentSubmissionMode();
        
            // The number of remaining attempts for the current item.
            $context['remainingAttempts'] = $session->getCurrentRemainingAttempts();
             
            // Whether or not the current step is time out.
            $context['isTimeout'] = self::isTimeout($session);
             
            // The identifier of the current item.
            $context['itemIdentifier'] = $session->getCurrentAssessmentItemRef()->getIdentifier();
             
            // The state of the current AssessmentTestSession.
            $context['itemSessionState'] = $session->getCurrentAssessmentItemSession()->getState();
        
            // Whether the current item is adaptive.
            $context['isAdaptive'] = $session->isCurrentAssessmentItemAdaptive();
            
            // Whether the current item is the very last one of the test.
            $context['isLast'] = $session->getRoute()->isLast();
             
            // The current position in the route.
            $context['itemPosition'] = $session->getRoute()->getPosition();
             
            // Time constraints.
            $context['timeConstraints'] = self::buildTimeConstraints($session);
             
            // Test title.
            $context['testTitle'] = $session->getAssessmentTest()->getTitle();
             
            // Test Part title.
            $context['testPartId'] = $session->getCurrentTestPart()->getIdentifier();
             
            // Current Section title.
            $context['sectionTitle'] = $session->getCurrentAssessmentSection()->getTitle();
             
            // Number of items composing the test session.
            $context['numberItems'] = $session->getRouteCount(AssessmentTestSession::ROUTECOUNT_FLOW);
             
            // Number of items completed during the test session.
            $context['numberCompleted'] = self::testCompletion($session);
            
            // Number of items presented during the test session.
            $context['numberPresented'] = $session->numberPresented();
            
            // Whether or not the progress of the test can be inferred.
            $context['considerProgress'] = self::considerProgress($session, $testMeta, $config);
            
            // Whether or not the deepest current section is visible.
            $context['isDeepestSectionVisible'] = $session->getCurrentAssessmentSection()->isVisible();
             
            // The URLs to be called to move forward/backward in the Assessment Test Session or skip or comment.
            $context['moveForwardUrl'] = self::buildActionCallUrl($session, 'moveForward', $qtiTestDefinitionUri , $qtiTestCompilationUri, $standalone);
            $context['moveBackwardUrl'] = self::buildActionCallUrl($session, 'moveBackward', $qtiTestDefinitionUri, $qtiTestCompilationUri, $standalone);
            $context['nextSectionUrl'] = self::buildActionCallUrl($session, 'nextSection', $qtiTestDefinitionUri, $qtiTestCompilationUri, $standalone);
            $context['skipUrl'] = self::buildActionCallUrl($session, 'skip', $qtiTestDefinitionUri, $qtiTestCompilationUri, $standalone);
            $context['commentUrl'] = self::buildActionCallUrl($session, 'comment', $qtiTestDefinitionUri, $qtiTestCompilationUri, $standalone);
            $context['timeoutUrl'] = self::buildActionCallUrl($session, 'timeout', $qtiTestDefinitionUri, $qtiTestCompilationUri, $standalone);
            $context['endTestSessionUrl'] = self::buildActionCallUrl($session, 'endTestSession', $qtiTestDefinitionUri, $qtiTestCompilationUri, $standalone);
            $context['keepItemTimedUrl'] = self::buildActionCallUrl($session, 'keepItemTimed', $qtiTestDefinitionUri, $qtiTestCompilationUri, $standalone);
            // If the candidate is allowed to move backward e.g. first item of the test.
            $context['canMoveBackward'] = $session->canMoveBackward();
             
            // The places in the test session where the candidate is allowed to jump to.
            $context['jumps'] = self::buildPossibleJumps($session);

            // The test review screen setup
            if (!empty($config['test-taker-review']) && $context['considerProgress']) {
                // The navigation map in order to build the test navigator
                $navigator = self::getNavigatorMap($session, $itemIndex);
                if ($navigator !== NavigationMode::LINEAR) {
                    $context['navigatorMap'] = $navigator['map'];
                    $context['itemFlagged'] = self::getItemFlag($session, $context['itemPosition']);
                } else {
                    $navigator = self::countItems($session);
                }

                // Extract the progression stats 
                $context['numberFlagged'] = $navigator['numberItemsFlagged'];
                $context['numberItemsPart'] = $navigator['numberItemsPart'];
                $context['numberItemsSection'] = $navigator['numberItemsSection'];
                $context['numberCompletedPart'] = $navigator['numberCompletedPart'];
                $context['numberCompletedSection'] = $navigator['numberCompletedSection'];
                $context['numberPresentedPart'] = $navigator['numberPresentedPart'];
                $context['numberPresentedSection'] = $navigator['numberPresentedSection'];
                $context['numberFlaggedPart'] = $navigator['numberFlaggedPart'];
                $context['numberFlaggedSection'] = $navigator['numberFlaggedSection'];
                $context['itemPositionPart'] = $navigator['itemPositionPart'];
                $context['itemPositionSection'] = $navigator['itemPositionSection'];

                // The URLs to be called to move to a particular item in the Assessment Test Session or mark item for later review.
                $context['jumpUrl'] = self::buildActionCallUrl($session, 'jumpTo', $qtiTestDefinitionUri, $qtiTestCompilationUri, $standalone);
                $context['markForReviewUrl'] = self::buildActionCallUrl($session, 'markForReview', $qtiTestDefinitionUri, $qtiTestCompilationUri, $standalone);
            } else {
                // Setup data for progress bar when displaying position and timed section exit control
                $numberItems = self::countItems($session);
                $context['numberCompletedPart'] = $numberItems['numberCompletedPart'];
                $context['numberCompletedSection'] = $numberItems['numberCompletedSection'];
                $context['numberItemsSection'] = $numberItems['numberItemsSection'];
                $context['numberItemsPart'] = $numberItems['numberItemsPart'];
                $context['itemPositionPart'] = $numberItems['itemPositionPart'];
                $context['itemPositionSection'] = $numberItems['itemPositionSection'];
            }

            // The code to be executed to build the ServiceApi object to be injected in the QTI Item frame.
            $context['itemServiceApiCall'] = self::buildServiceApi($session, $qtiTestDefinitionUri, $qtiTestCompilationUri);

            // Rubric Blocks.
            /** @var QtiRunnerRubric $rubricBlockHelper */
            $rubricBlockHelper = self::getServiceManager()->get(QtiRunnerRubric::SERVICE_ID);
            $context['rubrics'] = $rubricBlockHelper->getRubricBlock($session->getRoute()->current(), $session, $compilationDirs);
             
            // Comment allowed? Skipping allowed? Logout or Exit allowed ?
            $context['allowComment'] = self::doesAllowComment($session);
            $context['allowSkipping'] = self::doesAllowSkipping($session);
            $context['exitButton'] = self::doesAllowExit($session);
            $context['logoutButton'] = self::doesAllowLogout($session);
            $context['categories'] = self::getCategories($session);

            // loads the specific config into the context object
            $configMap = array(
                // name in config                   => name in context object
                'timerWarning'                      => 'timerWarning',
                'progress-indicator'                => 'progressIndicator',
                'progress-indicator-scope'          => 'progressIndicatorScope',
                'test-taker-review'                 => 'reviewScreen',
                'test-taker-review-region'          => 'reviewRegion',
                'test-taker-review-scope'           => 'reviewScope',
                'test-taker-review-prevents-unseen' => 'reviewPreventsUnseen',
                'test-taker-review-can-collapse'    => 'reviewCanCollapse',
                'next-section'                      => 'nextSection',
                'keep-timer-up-to-timeout'          => 'keepTimerUpToTimeout',
            );
            foreach ($configMap as $configKey => $contextKey) {
                if (isset($config[$configKey])) {
                    $context[$contextKey] = $config[$configKey];
                }
            }

            // optionally extend the context 
            if (isset($config['extraContextBuilder']) && class_exists($config['extraContextBuilder'])) {
                $builder = new $config['extraContextBuilder']();
                if ($builder instanceof \oat\taoQtiTest\models\TestContextBuilder) {
                    $builder->extendAssessmentTestContext(
                        $context,
                        $session,
                        $testMeta,
                        $qtiTestDefinitionUri,
                        $qtiTestCompilationUri,
                        $standalone,
                        $compilationDirs
                    );
                } else {
                    common_Logger::d('Try to use an extra context builder class that is not an instance of \\oat\\taoQtiTest\\models\\TestContextBuilder!');
                }
            }
        }

        return $context;
    }
        
    /**
     * Gets the item reference for a particular item in the test
     * 
     * @param AssessmentTestSession $session
     * @param string|Jump|RouteItem $itemPosition
     * @return null|string
     */
    static public function getItemRef(AssessmentTestSession $session, $itemPosition, RunnerServiceContext $context = null) {
        $sessionId = $session->getSessionId();

        $itemRef = null;
        $routeItem = null;
        
        if ($itemPosition && is_object($itemPosition)) {
            if ($itemPosition instanceof RouteItem) {
                $routeItem = $itemPosition;
            } elseif ($itemPosition instanceof Jump) {
                $routeItem = $itemPosition->getTarget();
            }
        } elseif ($context) {
            $itemId = '';
            $itemPosition = $context->getItemPositionInRoute($itemPosition, $itemId);
            
            if ($itemId !== '') {
                $itemRef = $itemId;
            } else {
                $routeItem = $session->getRoute()->getRouteItemAt($itemPosition);
            }
        } else {
            $jumps = $session->getPossibleJumps();
            foreach($jumps as $jump) {
                if ($itemPosition == $jump->getPosition()) {
                    $routeItem = $jump->getTarget();
                    break;
                }
            }
        }
        
        if ($routeItem) {
            $itemRef = (string)$routeItem->getAssessmentItemRef();
        }
        
        return $itemRef;
    }

    /**
     * Sets an item to be reviewed
     * @param AssessmentTestSession $session
     * @param string|Jump|RouteItem $itemPosition
     * @param bool $flag
     * @return bool
     * @throws common_exception_Error
     */
    static public function setItemFlag(AssessmentTestSession $session, $itemPosition, $flag, RunnerServiceContext $context = null) {
        
        $itemRef = self::getItemRef($session, $itemPosition, $context);
        $result = self::getExtendedStateService()->setItemFlag($session->getSessionId(), $itemRef, $flag);
        
        return $result;
    }

    /**
     * Gets the marked for review state of an item
     * @param AssessmentTestSession $session
     * @param string|Jump|RouteItem $itemPosition
     * @return bool
     * @throws common_exception_Error
     */
    static public function getItemFlag(AssessmentTestSession $session, $itemPosition, RunnerServiceContext $context = null) {
        $result = false;

        $itemRef = self::getItemRef($session, $itemPosition, $context);
        if ($itemRef) {
            $result = self::getExtendedStateService()->getItemFlag($session->getSessionId(), $itemRef);
        }
        
        return $result;
    }

    /**
     * Gets the usage of an item
     * @param RouteItem $routeItem
     * @return string Return the usage, can be: default, informational, seeding
     */
    static public function getItemUsage(RouteItem $routeItem)
    {
        $itemRef = $routeItem->getAssessmentItemRef();
        $categories = $itemRef->getCategories()->getArrayCopy();
        $prefixCategory = 'x-tao-itemusage-';
        $prefixCategoryLen = strlen($prefixCategory);
        foreach ($categories as $category) {
            if (!strncmp($category, $prefixCategory, $prefixCategoryLen)) {
                // extract the option name from the category, transform to camelCase if needed
                return lcfirst(str_replace(' ', '', ucwords(strtr(substr($category, $prefixCategoryLen), ['-' => ' ', '_' => ' ']))));
            }
        }
        
        return 'default';
    }

    /**
     * Checks if an item is informational
     * @param RouteItem $routeItem
     * @param AssessmentItemSession $itemSession
     * @return bool
     */
    static public function isItemInformational(RouteItem $routeItem, AssessmentItemSession $itemSession)
    {
        return !count($itemSession->getAssessmentItem()->getResponseDeclarations()) || 'informational' == self::getItemUsage($routeItem);
    }

    /**
     * Checks if an item has been completed
     * @param RouteItem $routeItem
     * @param AssessmentItemSession $itemSession
     * @param bool $partially (optional) Whether or not consider partially responded sessions as responded.
     * @return bool
     */
    static public function isItemCompleted(RouteItem $routeItem, AssessmentItemSession $itemSession, $partially = true) {
        $completed = false;
        if ($routeItem->getTestPart()->getNavigationMode() === NavigationMode::LINEAR) {
            // In linear mode, we consider the item completed if it was presented.
            if ($itemSession->isPresented() === true) {
                $completed = true;
            }
        }
        else {
            // In nonlinear mode we consider: 
            // - an adaptive item completed if it's completion status is 'completed'.
            // - a non-adaptive item to be completed if it is responded.
            $isAdaptive = $itemSession->getAssessmentItem()->isAdaptive();

            if ($isAdaptive === true && $itemSession['completionStatus']->getValue() === AssessmentItemSession::COMPLETION_STATUS_COMPLETED) {
                $completed = true;
            }
            else if ($isAdaptive === false && $itemSession->isResponded($partially) === true) {
                $completed = true;
            }
        }
        
        return $completed;
    }

    /**
     * Gets infos about a particular item
     * @param AssessmentTestSession $session
     * @param Jump $jump
     * @return array
     */
    static private function getItemInfo(AssessmentTestSession $session, Jump $jump) {
        $itemSession = $jump->getItemSession();
        $routeItem = $jump->getTarget();
        return array(
            'remainingAttempts' => $itemSession->getRemainingAttempts(),
            'answered' => self::isItemCompleted($routeItem, $itemSession),
            'viewed' => $itemSession->isPresented(),
            'flagged' => self::getItemFlag($session, $jump),
            'position' => $jump->getPosition()
        );
    }

    /**
     * Builds a map of available jumps and count the flagged items
     * @param AssessmentTestSession $session
     * @param array $jumps
     * @return array
     */
    static private function getJumpsMap(AssessmentTestSession $session, $jumps) {
        $jumpsMap = array();
        $numberItemsFlagged = 0;
        foreach ($jumps as $jump) {
            $routeItem = $jump->getTarget();
            $partId = $routeItem->getTestPart()->getIdentifier();
            $sections = $routeItem->getAssessmentSections();
            $sections->rewind();
            $sectionId = key(current($sections));
            $itemId = $routeItem->getAssessmentItemRef()->getIdentifier();

            $jumpsMap[$partId][$sectionId][$itemId] = self::getItemInfo($session, $jump);
            if ($jumpsMap[$partId][$sectionId][$itemId]['flagged']) {
                $numberItemsFlagged ++;
            }
        }
        
        return array(
            'flagged' => $numberItemsFlagged,
            'map' => $jumpsMap,
        );
    }

    /**
     * Gets the section map for navigation between test parts, sections and items.
     *
     * @param AssessmentTestSession $session
     * @param QtiTestCompilerIndex $itemIndex
     * @return array A navigator map (parts, sections, items so on)
     */
    static private function getNavigatorMap(AssessmentTestSession $session, $itemIndex) {

        // get jumps
        $jumps = $session->getPossibleJumps();

        // no jumps, notify linear-mode
        if (!$jumps->count()) {
            return NavigationMode::LINEAR;
        }

        $jumpsMapInfo = self::getJumpsMap($session, $jumps);
        $jumpsMap = $jumpsMapInfo['map'];
        $numberItemsFlagged = $jumpsMapInfo['flagged'];


        // the active test-part identifier
        $activePart = $session->getCurrentTestPart()->getIdentifier();

        // the active section identifier
        $activeSection = $session->getCurrentAssessmentSection()->getIdentifier();

        $route = $session->getRoute();

        $activeItem = $session->getCurrentAssessmentItemRef()->getIdentifier();
        if (isset($jumpsMap[$activePart][$activeSection][$activeItem])) {
            $jumpsMap[$activePart][$activeSection][$activeItem]['active'] = true;
        }

        // current position
        $oldPosition = $route->getPosition();

        $route->setPosition($oldPosition);

        // get config for the sequence number option
        $config = common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->getConfig('testRunner');
        $forceTitles = !empty($config['test-taker-review-force-title']);
        $uniqueTitle = isset($config['test-taker-review-item-title']) ? $config['test-taker-review-item-title'] : '%d';
        $useTitle = !empty($config['test-taker-review-use-title']);
        $language = \common_session_SessionManager::getSession()->getInterfaceLanguage();

        $returnValue = array();
        $testParts   = array();
        $testPartIdx = 0;
        $numberItemsPart = 0;
        $numberItemsSection = 0;
        $numberCompletedPart = 0;
        $numberCompletedSection = 0;
        $numberPresentedPart = 0;
        $numberPresentedSection = 0;
        $numberFlaggedPart = 0;
        $numberFlaggedSection = 0;
        $itemPositionPart = 0;
        $itemPositionSection = 0;
        $itemPosition = $session->getRoute()->getPosition();

        foreach($jumps as $jump) {
            $testPart = $jump->getTarget()->getTestPart();
            $id = $testPart->getIdentifier();

            if (isset($testParts[$id])) {
                continue;
            }

            $sections = array();

            if ($testPart->getNavigationMode() == NavigationMode::NONLINEAR) {
                $firstPositionPart = PHP_INT_MAX;
                foreach($testPart->getAssessmentSections() as $sectionId => $section) {

                    $completed = 0;
                    $presented = 0;
                    $flagged = 0;
                    $items = array();
                    $firstPositionSection = PHP_INT_MAX;
                    $positionInSection = 0;

                    foreach($section->getSectionParts() as $itemId => $item) {

                        if (isset($jumpsMap[$id][$sectionId][$itemId])) {
                            $jumpInfo = $jumpsMap[$id][$sectionId][$itemId];
                            $itemUri = strstr($item->getHref(), '|', true);
                            $resItem  =  new \core_kernel_classes_Resource($itemUri);
                            if ($jumpInfo['answered']) {
                                ++$completed;
                            }
                            if ($jumpInfo['viewed']) {
                                ++$presented;
                            }
                            if ($jumpInfo['flagged']) {
                                ++$flagged;
                            }
                            if ($forceTitles) {
                                $label = sprintf($uniqueTitle, ++$positionInSection);
                            } else {
                                if ($useTitle) {
                                    $label = $itemIndex->getItemValue($itemUri, $language, 'title');
                                } else {
                                    $label = '';
                                }

                                if (!$label) {
                                    $label = $itemIndex->getItemValue($itemUri, $language, 'label');
                                }

                                if (!$label) {
                                    $label = $resItem->getLabel();
                                }
                            }
                            $items[]  = array_merge(
                                array(
                                    'id' => $itemId,
                                    'label' => $label,
                                ),
                                $jumpInfo
                            );

                            $firstPositionPart = min($firstPositionPart, $jumpInfo['position']);
                            $firstPositionSection = min($firstPositionSection, $jumpInfo['position']);
                        }

                    }

                    $sectionData = array(
                        'id'       => $sectionId,
                        'active'   => $sectionId === $activeSection,
                        'label'    => $section->getTitle(),
                        'answered' => $completed,
                        'items'    => $items
                    );
                    $sections[] = $sectionData;

                    if ($sectionData['active']) {
                        $numberItemsSection = count($items);
                        $itemPositionSection = $itemPosition - $firstPositionSection; 
                        $numberCompletedSection = $completed;
                        $numberPresentedSection = $presented;
                        $numberFlaggedSection = $flagged;
                    }
                    if ($id === $activePart) {
                        $numberItemsPart += count($items);
                        $numberCompletedPart += $completed;
                        $numberPresentedPart += $presented;
                        $numberFlaggedPart += $flagged;
                    }
                }
                
                if ($id === $activePart) {
                    $itemPositionPart = $itemPosition - $firstPositionPart;
                }
            }

            $data = array(
                'id'       => $id,
                'sections' => $sections,
                'active'   => $id === $activePart,
                'label'    => __('Part %d', ++$testPartIdx),
            );
            if (empty($sections)) {
                $item = current(current($jumpsMap[$id]));
                $data['position'] = $item['position'];
                $data['itemId'] = key(current($jumpsMap[$id]));
            }
            $returnValue[] = $data;
            $testParts[$id] = false;
        }

        return array(
            'map' => $returnValue,
            'numberItemsFlagged' => $numberItemsFlagged,
            'numberItemsPart' => $numberItemsPart,
            'numberItemsSection' => $numberItemsSection,
            'numberCompletedPart' => $numberCompletedPart,
            'numberCompletedSection' => $numberCompletedSection,
            'numberPresentedPart' => $numberPresentedPart,
            'numberPresentedSection' => $numberPresentedSection,
            'numberFlaggedPart' => $numberFlaggedPart,
            'numberFlaggedSection' => $numberFlaggedSection,
            'itemPositionPart' => $itemPositionPart,
            'itemPositionSection' => $itemPositionSection,
        );
    }
    
    /**
     * Gets the number of items within the current section and the current part.
     *
     * @param AssessmentTestSession $session
     * @return array The list of counters (numberItemsSection and numberItemsPart)
     */
    static private function countItems(AssessmentTestSession $session) {
        // get jumps
        $jumps = self::getTestMap($session);

        // the active test-part identifier
        $activePart = $session->getCurrentTestPart()->getIdentifier();

        // the active section identifier
        $activeSection = $session->getCurrentAssessmentSection()->getIdentifier();

        $jumpsMapInfo = self::getJumpsMap($session, $jumps);
        $jumpsMap = $jumpsMapInfo['map'];
        $numberItemsFlagged = $jumpsMapInfo['flagged'];

        $testParts = array();
        $numberItemsPart = 0;
        $numberItemsSection = 0;
        $numberCompletedPart = 0;
        $numberCompletedSection = 0;
        $numberPresentedPart = 0;
        $numberPresentedSection = 0;
        $numberFlaggedPart = 0;
        $numberFlaggedSection = 0;
        $itemPositionPart = 0;
        $itemPositionSection = 0;
        $itemPosition = $session->getRoute()->getPosition();
        foreach($jumps as $jump) {
            $testPart = $jump->getTarget()->getTestPart();
            $id = $testPart->getIdentifier();

            if (isset($testParts[$id])) {
                continue;
            }
            $testParts[$id] = true;

            $firstPositionPart = PHP_INT_MAX;
            foreach($testPart->getAssessmentSections() as $sectionId => $section) {
                $completed = 0;
                $presented = 0;
                $flagged = 0;
                $numberItems = count($section->getSectionParts());
                $firstPositionSection = PHP_INT_MAX;
                foreach($section->getSectionParts() as $itemId => $item) {
                    if (isset($jumpsMap[$id][$sectionId][$itemId])) {
                        $jumpInfo = $jumpsMap[$id][$sectionId][$itemId];
                        
                        if ($jumpInfo['answered']) {
                            ++$completed;
                        }
                        if ($jumpInfo['viewed']) {
                            ++$presented;
                        }
                        if ($jumpInfo['flagged']) {
                            ++$flagged;
                        }
                        
                        $firstPositionPart = min($firstPositionPart, $jumpInfo['position']);
                        $firstPositionSection = min($firstPositionSection, $jumpInfo['position']);
                    }
                }

                if ($sectionId === $activeSection) {
                    $numberItemsSection = $numberItems;
                    $itemPositionSection = $itemPosition - $firstPositionSection;
                    $numberCompletedSection = $completed;
                    $numberPresentedSection = $presented;
                    $numberFlaggedSection = $flagged;
                }
                if ($id === $activePart) {
                    $numberItemsPart += $numberItems;
                    $numberCompletedPart += $completed;
                    $numberPresentedPart += $presented;
                    $numberFlaggedPart += $flagged;
                }
            }
            if ($id === $activePart) {
                $itemPositionPart = $itemPosition - $firstPositionPart;
            }
        }

        return array(
            'numberItemsFlagged' => $numberItemsFlagged,
            'numberItemsPart' => $numberItemsPart,
            'numberItemsSection' => $numberItemsSection,
            'numberCompletedPart' => $numberCompletedPart,
            'numberCompletedSection' => $numberCompletedSection,
            'numberPresentedPart' => $numberPresentedPart,
            'numberPresentedSection' => $numberPresentedSection,
            'numberFlaggedPart' => $numberFlaggedPart,
            'numberFlaggedSection' => $numberFlaggedSection,
            'itemPositionPart' => $itemPositionPart,
            'itemPositionSection' => $itemPositionSection,
        );
    }

    /**
     * Gets the map of the reachable items.
     * @param AssessmentTestSession $session
     * @return array The map of the test
     */
    static public function getTestMap($session) {
        $map = array();

        if ($session->isRunning() !== false) {
            $route = $session->getRoute();
            $routeItems = $route->getAllRouteItems();
            $offset = $route->getRouteItemPosition($routeItems[0]);
            foreach ($routeItems as $routeItem) {
                $itemRef = $routeItem->getAssessmentItemRef();
                $occurrence = $routeItem->getOccurence();

                // get the session related to this route item.
                $store = $session->getAssessmentItemSessionStore();
                $itemSession = $store->getAssessmentItemSession($itemRef, $occurrence);
                $map[] = new Jump($offset, $routeItem, $itemSession);
                $offset++;
            }
        }
        
        return $map;
    }
    
    /**
     * Compute the the number of completed items during a given
     * candidate test $session.
     * 
     * @param AssessmentTestSession $session
     * @return integer
     */
    static public function testCompletion(AssessmentTestSession $session) {
        $completed = $session->numberCompleted();
        
        if ($session->getCurrentNavigationMode() === NavigationMode::LINEAR && $completed > 0) {
            $completed--;
        }
        
        return $completed;
    }

    /**
     * Checks if the current test allows the progress bar to be displayed
     * @param AssessmentTestSession $session
     * @param array $testMeta
     * @param array $config
     * @return bool
     */
    static public function considerProgress(AssessmentTestSession $session, array $testMeta, array $config = array()) {
        $considerProgress = true;

        if (!empty($config['progress-indicator-forced'])) {
            // Caution: this piece of code can introduce a heavy load on very large tests
            // The local optimisation made here concerns:
            // - only check the part branchRules if the progress indicator must be forced for all tests
            // - branchRules check is ignored when the navigation mode is non linear.
            //
            // TODO: Perform this check at compilation time and store a map of parts options.
            //       This can be also done for navigation map (see getNavigatorMap and getJumpsMap)

            $testPart = $session->getCurrentTestPart();
            if ($testPart->getNavigationMode() !== NavigationMode::NONLINEAR) {
                $branchings = $testPart->getComponentsByClassName('branchRule');

                if (count($branchings) > 0) {
                    $considerProgress = false;
                }
            }
        } else {
            if ($testMeta['preConditions'] === true) {
                $considerProgress = false;
            }
            else if ($testMeta['branchRules'] === true) {
                $considerProgress = false;
            }
        }

        return $considerProgress;
    }

    /**
     * Checks if the current session can be exited. If a context is pass we use it over the session
     *
     * @param AssessmentTestSession $session
     * @param RunnerServiceContext $context
     * @return bool
     */
    static public function doesAllowExit(AssessmentTestSession $session, RunnerServiceContext $context = null){
        $config = common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->getConfig('testRunner');
        $exitButton = (isset($config['exitButton']) && $config['exitButton']);
        $categories = self::getCategories($session, $context);
        return ($exitButton && in_array('x-tao-option-exit', $categories));
    }

    /**
     * Checks if the test taker can logout
     * 
     * @param AssessmentTestSession $session
     * @return type
     */
    static public function doesAllowLogout(AssessmentTestSession $session){
        $config = common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->getConfig('testRunner');
        return !(isset($config['exitButton']) && $config['exitButton']);
    }

    /**
     * Get the array of available categories for the current itemRef
     * If we have a non null context we use it over the session
     *
     * @param \qtism\runtime\tests\AssessmentTestSession $session
     * @param RunnerServiceContext $context
     * @return array
     */
    static public function getCategories(AssessmentTestSession $session, RunnerServiceContext $context = null){
        if(!is_null($context)){
            return $context->getCurrentAssessmentItemRef()->getCategories()->getArrayCopy();
        }
        return $session->getCurrentAssessmentItemRef()->getCategories()->getArrayCopy();
    }


    /**
     * Get the array of available categories for the test
     *
     * @param \qtism\runtime\tests\AssessmentTestSession $session
     * @return array
     */
    static public function getAllCategories(AssessmentTestSession $session)
    {
        $prevCategories = null;
        $assessmentItemRefs = $session->getAssessmentTest()->getComponentsByClassName('assessmentItemRef');

        /** @var \qtism\data\AssessmentItemRef $assessmentItemRef */
        foreach ($assessmentItemRefs as $assessmentItemRef){
            $categories = $assessmentItemRef->getCategories();
            if(!is_null($prevCategories)){
                $prevCategories->merge($categories);
            } else {
                $prevCategories = $categories;
            }
        }

        return (!is_null($prevCategories))? array_unique($prevCategories->getArrayCopy()):[];
    }
    
    /**
     * Whether or not $value is considered as a null QTI value.
     * 
     * @param $value
     * @return boolean
     */
    static public function isQtiValueNull($value){
        return is_null($value) === true || ($value instanceof QtiString && $value->getValue() === '') || ($value instanceof Container && count($value) === 0);
    }

    /**
     * Gets the amount of seconds with the microseconds as fractional part from a Duration instance.
     * @param \qtism\common\datatypes\Duration $duration
     * @return float|null
     */
    public static function getDurationWithMicroseconds($duration)
    {
        if ($duration) {
            if (method_exists($duration, 'getMicroseconds')) {
                return $duration->getMicroseconds(true) / 1e6;
            }
            return $duration->getSeconds(true);
        }
        return null;
    }
}
