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
 * Copyright (c) 2013 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *               
 * 
 */

use qtism\data\storage\php\PhpDocument;
use qtism\runtime\tests\AssessmentTestSessionException;
use qtism\runtime\tests\AssessmentTestSessionState;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\data\AssessmentTest;
use qtism\runtime\common\State;
use qtism\runtime\common\ResponseVariable;
use qtism\common\enums\BaseType;
use qtism\common\enums\Cardinality;
use qtism\common\datatypes\String;
use qtism\runtime\storage\binary\BinaryAssessmentTestSeeker;
use qtism\runtime\storage\common\AbstractStorage;
use qtism\data\SubmissionMode;
use qtism\data\NavigationMode;
use oat\taoQtiItem\helpers\QtiRunner;
use oat\taoQtiTest\models\TestSessionMetaData;
/**
 * Runs a QTI Test.
 *
 * @author Joel Bout <joel@taotesting.com>
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 * @package taoQtiTest
 
 * @license GPLv2  http://www.opensource.org/licenses/gpl-2.0.php
 */
class taoQtiTest_actions_TestRunner extends tao_actions_ServiceModule {
    
    /**
     * The current AssessmentTestSession object.
     * 
     * @var AssessmentTestSession
     */
    private $testSession = null;
    
    /**
     * The current AssessmentTest definition object.
     * 
     * @var AssessmentTest
     */
    private $testDefinition = null;
    
    /**
     * The TAO Resource describing the test to be run.
     * 
     * @var core_kernel_classes_Resource
     */
    private $testResource = null;
    
    /**
     * The current AbstractStorage object.
     * 
     * @var AbstractStorage
     */
    private $storage = null;
    
    /**
     * The error that occured during the current request.
     * 
     */
    private $currentError = -1;
    
    /**
     * The compilation directory.
     * 
     * @var string
     */
    private $compilationDirectory;
    
    /**
     * The meta data about the test definition
     * being executed.
     * 
     * @var array
     */
    private $testMeta;
    
    /**
     * Testr session metadata manager
     * 
     * @var TestSessionMetaData
     */
    private $testSessionMetaData;
    
    /**
     * Get the current assessment test session.
     * 
     * @return AssessmentTestSession An AssessmentTestSession object.
     */
    protected function getTestSession() {
        return $this->testSession;
    }
    
    /**
     * Set the current assessment test session.
     * 
     * @param AssessmentTestSession $testSession An AssessmentTestSession object.
     */
    protected function setTestSession(AssessmentTestSession $testSession) {
        $this->testSession = $testSession;
    }
    
    /**
     * Get the current test definition.
     * 
     * @return AssessmentTest An AssessmentTest object.
     */
    protected function getTestDefinition() {
        return $this->testDefinition;
    }
    
    /**
     * Set the current test defintion.
     * 
     * @param AssessmentTest $testDefinition An AssessmentTest object.
     */
    protected function setTestDefinition(AssessmentTest $testDefinition) {
        $this->testDefinition = $testDefinition;
    }
    
    /**
	 * Get the QtiSm AssessmentTestSession Storage Service.
	 * 
	 * @return AbstractStorage An AssessmentTestSession Storage Service.
	 */
	protected function getStorage() {
	    return $this->storage;    
	}
	
	/**
	 * Set the QtiSm AssessmentTestSession Storage Service.
	 * 
	 * @param AbstractStorage $storage An AssessmentTestSession Storage Service.
	 */
	protected function setStorage(AbstractStorage $storage) {
	    $this->storage = $storage;
	}
	
	/**
	 * Get the error that occured during the previous request.
	 * 
	 * @return integer
	 */
	protected function getPreviousError() {
	    return $this->getStorage()->getLastError();
	}
	
	/**
	 * Set the error that occured during the current request.
	 * 
	 * @param integer $error
	 */
	protected function setCurrentError($currentError) {
	    $this->currentError = $currentError;
	}
	
	/**
	 * Get the error that occured during the current request.
	 * 
	 * @return integer
	 */
	protected function getCurrentError() {
	    return $this->currentError;
	}
	
	/**
	 * Set the path to the directory where the test is compiled.
	 * 
	 * @param string $compilationDirectory An absolute path.
	 */
	protected function setCompilationDirectory($compilationDirectory) {
	    $this->compilationDirectory = $compilationDirectory;
	}
	
	/**
	 * Get the path to the directory where the test is compiled.
	 * 
	 * @return string
	 */
	protected function getCompilationDirectory() {
	    return $this->compilationDirectory;
	}
	
	/**
	 * Set the meta-data array about the test definition
	 * being executed.
	 * 
	 * @param array $testMeta
	 */
	protected function setTestMeta(array $testMeta) {
	    $this->testMeta = $testMeta;
	}
	
	/**
	 * Get the meta-data array about the test definition
	 * being executed.
	 * 
	 * @return array
	 */
	protected function getTestMeta() {
	    return $this->testMeta;
	}
    
    protected function beforeAction() {
        // Controller initialization.
        $this->retrieveTestDefinition($this->getRequestParameter('QtiTestCompilation'));
        $resultServer = taoResultServer_models_classes_ResultServerStateFull::singleton();
        
        // Initialize storage and test session.
        $testResource = new core_kernel_classes_Resource($this->getRequestParameter('QtiTestDefinition'));
        
        $sessionManager = new taoQtiTest_helpers_SessionManager($resultServer, $testResource);
        $userUri = common_session_SessionManager::getSession()->getUserUri();
        $seeker = new BinaryAssessmentTestSeeker($this->getTestDefinition());
        
        $this->setStorage(new taoQtiTest_helpers_TestSessionStorage($sessionManager, $seeker, $userUri));
        $this->retrieveTestSession();
        $this->retrieveTestMeta();
        
        // Prevent anything to be cached by the client.
        taoQtiTest_helpers_TestRunnerUtils::noHttpClientCache();
        
        $metaData = $this->getSessionMeta();
        if (!empty($metaData)) {
            $this->getTestSessionMetaData()->save($metaData);
        }
    }
    
    /**
     * Get session metadata manager
     * 
     * @return array test session meta data.
     */
    protected function getTestSessionMetaData()
    {
        if ($this->testSessionMetaData === null) {
            $this->testSessionMetaData = new TestSessionMetaData($this->getTestSession());
        }
        return $this->testSessionMetaData;
    }
    
    /**
     * Get current test session meta data array
     * 
     * @return array test session meta data.
     */
    protected function getSessionMeta()
    {
        $data = $this->hasRequestParameter('metaData') ? $this->getRequestParameter('metaData') : array();
        $action = Context::getInstance()->getActionName();
        $route = $this->getTestSession()->getRoute();

		if (in_array($action, array('index'))) {
            $data['TEST']['TAO_VERSION'] = TAO_VERSION;
        }
        
        if (in_array($action, array('moveForward', 'skip'))) {
            if (!isset($data['SECTION']['SECTION_EXIT_CODE'])) {
                $currentSection = $this->getTestSession()->getCurrentAssessmentSection();
                $lastInSection = $route->isLast() || 
                    ($route->getNext()->getAssessmentSection()->getIdentifier() !== $currentSection->getIdentifier());

                if ($lastInSection) {
                    $data['SECTION']['SECTION_EXIT_CODE'] = TestSessionMetaData::SECTION_CODE_COMPLETED_NORMALLY;
                }
            }

            if ($route->isLast()) {
                $data['TEST']['TEST_EXIT_CODE'] = TestSessionMetaData::TEST_CODE_COMPLETE;
            }
        }
        
        if (in_array($action, array('moveForward', 'skip', 'jumpTo', 'moveBackward', 'onTimeout'))) {
            $data['ITEM']['ITEM_END_TIME_SERVER'] = microtime(true);
        }
 
        return $data;
    }
    
    /**
     * Save metadata of session. Method implemented for backward compatibility.
     * 
     * @todo check usages and remove after merge {@link https://github.com/oat-sa/extension-tao-testqti/pull/135} pull request
     * @see oat\taoQtiTest\models\TestSessionMetaData
     * @param array $metaData Meta data array to be saved.
     */
    private function saveMetaData(array $metaData)
    {
        $this->getTestSessionMetaData()->save($metaData);
    } 
    
    protected function afterAction($withContext = true) {
        $testSession = $this->getTestSession();
        $sessionId = $testSession->getSessionId();
        
        // Build assessment test context.
        $ctx = taoQtiTest_helpers_TestRunnerUtils::buildAssessmentTestContext($this->getTestSession(),
                                                                              $this->getTestMeta(),
	                                                                          $this->getRequestParameter('QtiTestDefinition'),
	                                                                          $this->getRequestParameter('QtiTestCompilation'),
	                                                                          $this->getRequestParameter('standalone'),
	                                                                          $this->getCompilationDirectory());
	    
        // Put the assessment test context in request data.
	    $this->setData('assessmentTestContext', $ctx);
        
        if ($withContext === true) {
            // Output only if requested by client-code.
            echo json_encode($ctx);
        }
        
        common_Logger::i("Persisting QTI Assessment Test Session '${sessionId}'...");
	    $this->getStorage()->persist($testSession);
    }

    /**
     * Main action of the TestRunner module.
     * 
     */
	public function index() {
	    $this->beforeAction();
	    $session = $this->getTestSession();
	    
	    if ($session->getState() === AssessmentTestSessionState::INITIAL) {
            // The test has just been instantiated.
            $session->beginTestSession();
            common_Logger::i("Assessment Test Session begun.");
        }
	    
        if (taoQtiTest_helpers_TestRunnerUtils::isTimeout($session) === false) {
            taoQtiTest_helpers_TestRunnerUtils::beginCandidateInteraction($session);
        }

        // loads the specific config
        $config = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->getConfig('testRunner');
        $this->setData('review_screen', !empty($config['test-taker-review']));
        $this->setData('review_region', isset($config['test-taker-review-region']) ? $config['test-taker-review-region'] : '');
        
        $this->setData('client_config_url', $this->getClientConfigUrl());
        $this->setData('client_timeout', $this->getClientTimeout());
        $this->setView('test_runner.tpl');
        
        $this->afterAction(false);
	}
    
    /**
     * Mark an item for review in the Assessment Test Session flow.
     *
     */
    public function markForReview() {
        $this->beforeAction();
        $testSession = $this->getTestSession();

        try {
            if ($this->hasRequestParameter('position')) {
                $itemPosition = intval($this->getRequestParameter('position'));
            } else {
                $itemPosition = $testSession->getRoute()->getPosition();                
            }
            if ($this->hasRequestParameter('flag')) {
                $flag = $this->getRequestParameter('flag');
                if (is_numeric($flag)) {
                    $flag = !!(intval($flag));
                } else {
                    $flag = 'false' != strtolower($flag);
                }
            } else {
                $flag = true;
            }
            taoQtiTest_helpers_TestRunnerUtils::setItemFlag($testSession, $itemPosition, $flag);
        }
        catch (AssessmentTestSessionException $e) {
            $this->handleAssessmentTestSessionException($e);
        }

        $this->afterAction();
    }

    /**
     * Jump to an item in the Assessment Test Session flow.
     *
     */
    public function jumpTo() {
        $this->beforeAction();
        $session = $this->getTestSession();
        $nextPosition = intval($this->getRequestParameter('position'));

        try {
            $this->endTimedSection($nextPosition);

            $session->jumpTo($nextPosition);

            if ($session->isRunning() === true && taoQtiTest_helpers_TestRunnerUtils::isTimeout($session) === false) {
                taoQtiTest_helpers_TestRunnerUtils::beginCandidateInteraction($session);
            }
        }
        catch (AssessmentTestSessionException $e) {
            $this->handleAssessmentTestSessionException($e);
        }

        $this->afterAction();
    }

    protected function endTimedSection($nextPosition)
    {
        $isJumpOutOfSection = false;
        $session = $this->getTestSession();
        $section = $session->getCurrentAssessmentSection();

        $route = $session->getRoute();

        if( ($nextPosition >= 0) && ($nextPosition < $route->count()) ){
            $nextSection = $route->getRouteItemAt($nextPosition);

            $isJumpOutOfSection = ($section->getIdentifier() !== $nextSection->getAssessmentSection()->getIdentifier());
        }

        $limits = $section->getTimeLimits();

        //ensure that jumping out and section is timed
        if( $isJumpOutOfSection && $limits != null && $limits->hasMaxTime() ) {
            $components = $section->getComponents();

            foreach( $components as $object ){
                if( $object instanceof \qtism\data\ExtendedAssessmentItemRef ){
                    $items = $session->getAssessmentItemSessions( $object->getIdentifier() );

                    foreach ($items as $item) {
                        if( $item instanceof \qtism\runtime\tests\AssessmentItemSession ){
                            $item->endItemSession();
                        }
                    }
                }
            }
        }
    }

	/**
	 * Move forward in the Assessment Test Session flow.
	 *
	 */
	public function moveForward() {
        $this->beforeAction();
        $session = $this->getTestSession();
        $nextPosition = $session->getRoute()->getPosition() + 1;

        try {
            $this->endTimedSection($nextPosition);

            $session->moveNext();

            if ($session->isRunning() === true && taoQtiTest_helpers_TestRunnerUtils::isTimeout($session) === false) {
                taoQtiTest_helpers_TestRunnerUtils::beginCandidateInteraction($session);
            }
        }
        catch (AssessmentTestSessionException $e) {
            $this->handleAssessmentTestSessionException($e);
        }

        $this->afterAction();
	}
	    
	/**
	 * Move backward in the Assessment Test Session flow.
	 *
	 */
	public function moveBackward() {
	    $this->beforeAction();
	    $session = $this->getTestSession();
        $nextPosition = $session->getRoute()->getPosition() - 1;
	    
	    try {
            $this->endTimedSection($nextPosition);

	        $session->moveBack();
	        
	        if (taoQtiTest_helpers_TestRunnerUtils::isTimeout($session) === false) {
	            taoQtiTest_helpers_TestRunnerUtils::beginCandidateInteraction($session);
	        }
	    }
	    catch (AssessmentTestSessionException $e) {
	        $this->handleAssessmentTestSessionException($e);
	    }

	    $this->afterAction();
	}
	
	/**
	 * Skip the current item in the Assessment Test Session flow.
	 *
	 */
	public function skip() {
	    $this->beforeAction();
	    $session = $this->getTestSession();
	    
	    try {
	        $session->skip();
	        $session->moveNext();
	        
	        if ($session->isRunning() === true && taoQtiTest_helpers_TestRunnerUtils::isTimeout($session) === false) {
	            taoQtiTest_helpers_TestRunnerUtils::beginCandidateInteraction($session);
	        }
	    }
	    catch (AssessmentTestSessionException $e) {
	        $this->handleAssessmentTestSessionException($e);
	    }
	    
	    $this->afterAction();
	}
	
	/**
	 * Action to call when a structural QTI component times out in linear mode.
	 *
	 */
	public function timeout() {
	    $this->beforeAction();
	    $session = $this->getTestSession();
	    
	    try {
            $session->checkTimeLimits(false, true, false);
        } catch (AssessmentTestSessionException $e) {
            $this->onTimeout($e);
        }
        
        // If we are here, without executing onTimeout() there is an inconsistency. Simply respond
        // to the client with the actual assessment test context. Maybe the client will be able to
        // continue...
        $this->afterAction();
	}
    
	/**
	 * Action to end test session
	 */
	public function endTestSession() {
	    $this->beforeAction();
        $session = $this->getTestSession();
        $sessionId = $session->getSessionId();
        
        common_Logger::i("The user has requested termination of the test session '{$sessionId}'");
	    $session->endTestSession();
        
        $this->afterAction();
	}

	/**
	 * Stuff to be undertaken when the Assessment Item presented to the candidate
	 * times out.
	 * 
	 * @param AssessmentTestSessionException $timeOutException The AssessmentTestSessionException object thrown to indicate the timeout.
	 */
	protected function onTimeout(AssessmentTestSessionException $timeOutException) {
	    $session = $this->getTestSession();
	    
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
	    
	        if ($session->isRunning() === true && taoQtiTest_helpers_TestRunnerUtils::isTimeout($session) === false) {
	            taoQtiTest_helpers_TestRunnerUtils::beginCandidateInteraction($session);
	        }
	    }
	    else {
	        $itemSession = $session->getCurrentAssessmentItemSession();
	        $itemSession->endItemSession();
	    }
	}
	
	/**
	 * Action called when a QTI Item embedded in a QTI Test submit responses.
	 * 
	 */
	public function storeItemVariableSet() {
	    $this->beforeAction();
	    
	    // --- Deal with provided responses.
	    $jsonPayload = taoQtiCommon_helpers_Utils::readJsonPayload();

	    $responses = new State();
	    $currentItem = $this->getTestSession()->getCurrentAssessmentItemRef();
	    $currentOccurence = $this->getTestSession()->getCurrentAssessmentItemRefOccurence();
	    
	    if ($currentItem === false) {
	        $msg = "Trying to store item variables but the state of the test session is INITIAL or CLOSED.\n";
	        $msg .= "Session state value: " . $this->getTestSession()->getState() . "\n";
	        $msg .= "Session ID: " . $this->getTestSession()->getSessionId() . "\n";
	        $msg .= "JSON Payload: " . mb_substr(json_encode($jsonPayload), 0, 1000);
	        common_Logger::e($msg);
	    }
	    
	    $filler = new taoQtiCommon_helpers_PciVariableFiller($currentItem);
	    
	    foreach ($jsonPayload as $id => $response) {
	        try {
	            $var = $filler->fill($id, $response);
	            // Do not take into account QTI File placeholders.
	            if (taoQtiCommon_helpers_Utils::isQtiFilePlaceHolder($var) === false) {
	                $responses->setVariable($var);
	            }
	        }
	        catch (OutOfRangeException $e) {
	            common_Logger::d("Could not convert client-side value for variable '${id}'.");
	        }
	        catch (OutOfBoundsException $e) {
	            common_Logger::d("Could not find variable with identifier '${id}' in current item.");
	        }
	    }
	    
	    $displayFeedback = $this->getTestSession()->getCurrentSubmissionMode() !== SubmissionMode::SIMULTANEOUS;
	    $stateOutput = new taoQtiCommon_helpers_PciStateOutput();
	    
	    try {
	        common_Logger::i('Responses sent from the client-side. The Response Processing will take place.');
	        $this->getTestSession()->endAttempt($responses, true);
	         
	        // Return the item session state to the client side.
	        $itemSession = $this->getTestSession()->getAssessmentItemSessionStore()->getAssessmentItemSession($currentItem, $currentOccurence);
	         
	        foreach ($itemSession->getAllVariables() as $var) {
	            $stateOutput->addVariable($var);
	        }
	        
	        $itemCompilationDirectory = $this->getDirectory($this->getRequestParameter('itemDataPath'));
	        $jsonReturn = array('success' => true,
	                            'displayFeedback' => $displayFeedback,
	                            'itemSession' => $stateOutput->getOutput(),
	                            'feedbacks' => array());
	        
	        if ($displayFeedback === true) {
	            $jsonReturn['feedbacks'] = QtiRunner::getFeedbacks($itemCompilationDirectory, $itemSession);
	        }
	         
	        echo json_encode($jsonReturn);
	    }
	    catch (AssessmentTestSessionException $e) {
	        $this->handleAssessmentTestSessionException($e);
	    }
	    
	    $this->afterAction(false);
    }
    
    /**
     * Action to call to comment an item.
     * 
     */
	public function comment() {
	    $this->beforeAction();
	    $testSession = $this->getTestSession();
	    
	    $resultServer = taoResultServer_models_classes_ResultServerStateFull::singleton();
	    $transmitter = new taoQtiCommon_helpers_ResultTransmitter($resultServer);
	    
	    // prepare transmission Id for result server.
	    $item = $testSession->getCurrentAssessmentItemRef()->getIdentifier();
	    $occurence = $testSession->getCurrentAssessmentItemRefOccurence();
	    $sessionId = $testSession->getSessionId();
	    $transmissionId = "${sessionId}.${item}.${occurence}";
	    
	    // retrieve comment's intrinsic value.
	    $comment = $this->getRequestParameter('comment');
	    
	    // build variable and send it.
	    $itemUri = taoQtiTest_helpers_TestRunnerUtils::getCurrentItemUri($testSession);
	    $testUri = $testSession->getTest()->getUri();
	    $variable = new ResponseVariable('comment', Cardinality::SINGLE, BaseType::STRING, new String($comment));
	    $transmitter->transmitItemVariable($variable, $transmissionId, $itemUri, $testUri);
	}
	
	/**
	 * Retrieve the Test Definition the test session is built
	 * from as an AssessmentTest object. This method
	 * also retrieves the compilation directory.
	 * 
     * @param string $qtiTestCompilation (e.g. <i>'http://sample/first.rdf#i14363448108243883-|http://sample/first.rdf#i14363448109065884+'</i>)
     * 
	 * @return AssessmentTest The AssessmentTest object the current test session is built from.
	 */
	protected function retrieveTestDefinition($qtiTestCompilation) {
        $directoryIds = explode('|', $qtiTestCompilation);
	    $directories = array(
            'private' => $this->getDirectory($directoryIds[0]), 
            'public' => $this->getDirectory($directoryIds[1])
        );
	    
	    $this->setCompilationDirectory($directories);
	    $testDefinition = \taoQtiTest_helpers_Utils::getTestDefinition($qtiTestCompilation);
	    $this->setTestDefinition($testDefinition);
	}
	
	/**
	 * Retrieve the current test session as an AssessmentTestSession object from
	 * persistent storage.
	 * 
	 */
	protected function retrieveTestSession() {
	    $qtiStorage = $this->getStorage();
	    $sessionId = $this->getServiceCallId();
	    
	    if ($qtiStorage->exists($sessionId) === false) {
	        common_Logger::i("Instantiating QTI Assessment Test Session");
            $this->setTestSession($qtiStorage->instantiate($this->getTestDefinition(), $sessionId));
            $this->setInitialOutcomes();
	    }
	    else {
	        common_Logger::i("Retrieving QTI Assessment Test Session '${sessionId}'...");
	        $this->setTestSession($qtiStorage->retrieve($this->getTestDefinition(), $sessionId));
	    }

        $this->preserveOutcomes();
    }
    
    /**
     * Retrieve the QTI Test Definition meta-data array stored
     * into the private compilation directory.
     * 
     * @return array
     */
    protected function retrieveTestMeta() {
        $directories = $this->getCompilationDirectory();
        $privateDirectoryPath = $directories['private']->getPath();
        $meta = include($privateDirectoryPath . TAOQTITEST_COMPILED_META_FILENAME);
        
        $this->setTestMeta($meta);
    }

	protected function handleAssessmentTestSessionException(AssessmentTestSessionException $e) {
	    switch ($e->getCode()) {
	        case AssessmentTestSessionException::ASSESSMENT_TEST_DURATION_OVERFLOW:
	        case AssessmentTestSessionException::TEST_PART_DURATION_OVERFLOW:
	        case AssessmentTestSessionException::ASSESSMENT_SECTION_DURATION_OVERFLOW:
	        case AssessmentTestSessionException::ASSESSMENT_ITEM_DURATION_OVERFLOW:
	            $this->onTimeout($e);
	        break;
	    }
	}
    
    /**
     * Set the initial outcomes defined in the rdf outcome map configuration file
     */
    protected function setInitialOutcomes(){
        
        $testSession = $this->getTestSession();
        
        $rdfOutcomeMap = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->getConfig('rdfOutcomeMap');
        if(is_array($rdfOutcomeMap)){
            $testTaker = \common_session_SessionManager::getSession()->getUser();
            foreach($rdfOutcomeMap as $outcomeId => $rdfPropUri){
                //set outcome value
                $values = $testTaker->getPropertyValues($rdfPropUri);
                $outcome = $testSession->getVariable($outcomeId);
                if(!is_null($outcome) && count($values)){
                    $outcome->setValue(new String($values[0]));
                }
            }
        }
    }

    /**
     * Preserve the outcomes variables set in the "rdfOutcomeMap" config
     * This is required to prevent those special outcomes from being reset before every outcome processing
     */
    protected function preserveOutcomes(){

        //preserve the special outcomes defined in the rdfOutcomeMap config
        $rdfOutcomeMap = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->getConfig('rdfOutcomeMap');
        if (is_array($rdfOutcomeMap) === true) {
            $this->getTestSession()->setPreservedOutcomeVariables(array_keys($rdfOutcomeMap));
        }
    }
}