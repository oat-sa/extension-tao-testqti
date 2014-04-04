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
 * Copyright (c) 2013 (original work) Open Assessment Techonologies SA (under the project TAO-PRODUCT);
 *               
 * 
 */

use qtism\data\storage\php\PhpDocument;
use qtism\runtime\tests\AssessmentItemSession;
use qtism\runtime\tests\AssessmentItemSessionState;
use qtism\runtime\tests\AssessmentTestSessionException;
use qtism\runtime\tests\AssessmentTestSessionFactory;
use qtism\runtime\tests\AssessmentTestSessionState;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\tests\AssessmentTestPlace;
use qtism\data\AssessmentTest;
use qtism\runtime\common\State;
use qtism\runtime\common\ResponseVariable;
use qtism\common\enums\BaseType;
use qtism\common\enums\Cardinality;
use qtism\common\datatypes\String;
use qtism\runtime\tests\AssessmentItemSessionException;
use qtism\runtime\storage\common\AbstractStorage;
use qtism\data\SubmissionMode;
use qtism\data\NavigationMode;
use qtism\data\View;
use \taoQtiCommon_helpers_PciVariableFiller;
use \taoQtiCommon_helpers_PciStateOutput;
use \taoQtiCommon_helpers_Utils;

/**
 * Runs a QTI Test.
 *
 * @author Joel Bout <joel@taotesting.com>
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 * @package taoQtiTest
 * @subpackage actions
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
    
    protected function beforeAction() {
        // Controller initialization.
        $this->retrieveTestDefinition();
        $resultServer = taoResultServer_models_classes_ResultServerStateFull::singleton();
        
        // Initialize storage and test session.
        $testResource = new core_kernel_classes_Resource($this->getRequestParameter('QtiTestDefinition'));
        
        $testSessionFactory = new taoQtiTest_helpers_TestSessionFactory($this->getTestDefinition(), $resultServer, $testResource);
        $this->setStorage(new taoQtiTest_helpers_TestSessionStorage($testSessionFactory));
        $this->retrieveTestSession();
        
        taoQtiTest_helpers_TestRunnerUtils::noHttpClientCache();
    }
    
    protected function afterAction() {
        $testSession = $this->getTestSession();
        $sessionId = $testSession->getSessionId();
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
        
        $this->buildAssessmentTestContext();
        $this->setData('client_config_url', $this->getClientConfigUrl());
        $this->setView('test_runner.tpl');
        
        $this->afterAction();
	}
	
	/**
	 * Move forward in the Assessment Test Session flow.
	 *
	 */
	public function moveForward() {
        $this->beforeAction();
        $session = $this->getTestSession();
        
        try {
            $session->moveNext();
            
            if ($session->isRunning() === true && taoQtiTest_helpers_TestRunnerUtils::isTimeout($session) === false) {
                taoQtiTest_helpers_TestRunnerUtils::beginCandidateInteraction($session);
            }
        }
        catch (AssessmentTestSessionException $e) {
            $this->handleAssessmentTestSessionException($e);
        }

        $context = $this->buildAssessmentTestContext();
        echo json_encode($context);
        $this->afterAction();
	}
	
	/**
	 * Move backward in the Assessment Test Session flow.
	 *
	 */
	public function moveBackward() {
	    $this->beforeAction();
	    $session = $this->getTestSession();
	    
	    try {
	        $session->moveBack();
	        
	        if (taoQtiTest_helpers_TestRunnerUtils::isTimeout($session) === false) {
	            taoQtiTest_helpers_TestRunnerUtils::beginCandidateInteraction($session);
	        }
	    }
	    catch (AssessmentTestSessionException $e) {
	        $this->handleAssessmentTestSessionException($e);
	    }
	    
	    $context = $this->buildAssessmentTestContext();
	    echo json_encode($context);
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
	    
	    $context = $this->buildAssessmentTestContext();
	    echo json_encode($context);
	    $this->afterAction();
	}
	
	/**
	 * Action to call when a structural QTI component times out in linear mode.
	 *
	 */
	public function timeout() {
	    $this->beforeAction();
	    $session = $this->getTestSession();
	    $timedOut = false;
	    
	    try {
            $session->checkTimeLimits(false, true, false);
        }
        catch (AssessmentTestSessionException $e) {
            $timedOut = $e;
        }
        
        if ($timedOut !== false) {
            $this->onTimeout($e);
        }

        // If we are here, without executing onTimeout() there is an inconsistency. Simply respond
        // to the client with the actual assessment test context. Maybe the client will be able to
        // continue...
        $context = $this->buildAssessmentTestContext();
        echo json_encode($context);
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
	    $jsonPayload = taoQtiCommon_helpers_utils::readJsonPayload();
	    
	    $responses = new State();
	    $currentItem = $this->getTestSession()->getCurrentAssessmentItemRef();
	    $currentOccurence = $this->getTestSession()->getCurrentAssessmentItemRefOccurence();
	    
	    $filler = new taoQtiCommon_helpers_PciVariableFiller($currentItem);
	    
	    foreach ($jsonPayload as $id => $response) {
	        try {
	            $var = $filler->fill($id, $response);
	            $responses->setVariable($var);
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
	    }
	    catch (AssessmentTestSessionException $e) {
	        $this->handleAssessmentTestSessionException($e);
	    }
	    
	    echo json_encode(array('success' => true, 'displayFeedback' => $displayFeedback, 'itemSession' => $stateOutput->getOutput()));
	    
	    $this->afterAction();
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
	 * @return AssessmentTest The AssessmentTest object the current test session is built from.
	 */
	protected function retrieveTestDefinition() {
	    
	    $directories = array('private' => null, 'public' => null);
	    $directoryIds = explode('|', $this->getRequestParameter('QtiTestCompilation'));
	    
	    $directories['private'] = $this->getDirectory($directoryIds[0]);
	    $directories['public'] = $this->getDirectory($directoryIds[1]);
	    
	    $this->setCompilationDirectory($directories);
	    
	    $dirPath = $directories['private']->getPath();
	    $testFilePath = $dirPath .'compact-test.php';
	    
	    common_Logger::d("Loading QTI-PHP file at '${testFilePath}'.");
	    $doc = new PhpDocument();
	    $doc->load($testFilePath);
	    
	    $this->setTestDefinition($doc->getDocumentComponent());
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
	        $this->setTestSession($qtiStorage->instantiate($sessionId));
	    }
	    else {
	        common_Logger::i("Retrieving QTI Assessment Test Session '${sessionId}'...");
	        $this->setTestSession($qtiStorage->retrieve($sessionId));
	    }
    }
	
	/**
	 * Builds an associative array which describes the current AssessmentTestContext and set
	 * into the request data for a later use.
	 * 
	 * @return array The built AssessmentTestContext.
	 */
	protected function buildAssessmentTestContext() {
	    $session = $this->getTestSession();
	    $context = array();
	    
	    // The state of the test session.
	    $context['state'] = $session->getState();
	    
	    // Default values for the test session context.
	    $context['navigationMode'] = null;
	    $context['submissionMode'] = null;
	    $context['remainingAttempts'] = 0;
	    $context['isAdaptive'] = false;
	    
	    if ($session->getState() === AssessmentTestSessionState::INTERACTING) {
	        // The navigation mode.
	        $context['navigationMode'] = $session->getCurrentNavigationMode();
	         
	        // The submission mode.
	        $context['submissionMode'] = $session->getCurrentSubmissionMode();
	         
	        // The number of remaining attempts for the current item.
	        $context['remainingAttempts'] = $session->getCurrentRemainingAttempts();
	        
	        // Whether or not the current step is time out.
	        $context['isTimeout'] = taoQtiTest_helpers_TestRunnerUtils::isTimeout($session);
	        
	        // The identifier of the current item.
	        $context['itemIdentifier'] = $session->getCurrentAssessmentItemRef()->getIdentifier();
	        
	        // The state of the current AssessmentTestSession.
	        $context['itemSessionState'] = $session->getCurrentAssessmentItemSession()->getState();
	             
	        // Whether the current item is adaptive.
	        $context['isAdaptive'] = $session->isCurrentAssessmentItemAdaptive();
	        
	        // Time constraints.
	        $context['timeConstraints'] = taoQtiTest_helpers_TestRunnerUtils::buildTimeConstraints($session);
	        
	        // The URLs to be called to move forward/backward in the Assessment Test Session or skip or comment.
	        $qtiTestDefinitionUri = $this->getRequestParameter('QtiTestDefinition');
	        $qtiTestCompilationUri = $this->getRequestParameter('QtiTestCompilation');
	        $standalone = $this->getRequestParameter('standalone');
	        
	        $context['moveForwardUrl'] = taoQtiTest_helpers_TestRunnerUtils::buildActionCallUrl($session, 'moveForward', $qtiTestDefinitionUri , $qtiTestCompilationUri, $standalone);
	        $context['moveBackwardUrl'] = taoQtiTest_helpers_TestRunnerUtils::buildActionCallUrl($session, 'moveBackward', $qtiTestDefinitionUri, $qtiTestCompilationUri, $standalone);
	        $context['skipUrl'] = taoQtiTest_helpers_TestRunnerUtils::buildActionCallUrl($session, 'skip', $qtiTestDefinitionUri, $qtiTestCompilationUri, $standalone);
	        $context['commentUrl'] = taoQtiTest_helpers_TestRunnerUtils::buildActionCallUrl($session, 'comment', $qtiTestDefinitionUri, $qtiTestCompilationUri, $standalone);
	        $context['timeoutUrl'] = taoQtiTest_helpers_TestRunnerUtils::buildActionCallUrl($session, 'timeout', $qtiTestDefinitionUri, $qtiTestCompilationUri, $standalone);
	        
	        // If the candidate is allowed to move backward e.g. first item of the test.
	        $context['canMoveBackward'] = $session->canMoveBackward();
	        
	        // The places in the test session where the candidate is allowed to jump to.
	        $context['jumps'] = taoQtiTest_helpers_TestRunnerUtils::buildPossibleJumps($session);

	        // The code to be executed to build the ServiceApi object to be injected in the QTI Item frame.
	        $context['itemServiceApiCall'] = taoQtiTest_helpers_TestRunnerUtils::buildServiceApi($session, $qtiTestDefinitionUri, $qtiTestCompilationUri);
	        
	        // Rubric Blocks.
	        $rubrics = array();
	        
	        $compilationDirs = $this->getCompilationDirectory();
	        
	        // -- variables used in the included rubric block templates.
	        // base path (base URI to be used for resource inclusion).
	        $basePathVarName = TAOQTITEST_BASE_PATH_NAME;
	        $$basePathVarName = $compilationDirs['public']->getPublicAccessUrl();
	        
	        // state name (the variable to access to get the state of the assessmentTestSession).
	        $stateName = TAOQTITEST_RENDERING_STATE_NAME;
	        $$stateName = $session;
	        
	        // views name (the variable to be accessed for the visibility of rubric blocks).
	        $viewsName = TAOQTITEST_VIEWS_NAME;
	        $$viewsName = array(View::CANDIDATE);
	        
	        foreach ($session->getRoute()->current()->getRubricBlockRefs() as $rubric) {
	            ob_start();
	            include($compilationDirs['private']->getPath() . $rubric->getHref());
	            $rubrics[] = ob_get_clean();
	        }
	        
	        $context['rubrics'] = $rubrics;
	        
	        // Comment allowed? Skipping allowed?
	        $context['allowComment'] = taoQtiTest_helpers_TestRunnerUtils::doesAllowComment($session);
	        $context['allowSkipping'] = taoQtiTest_helpers_TestRunnerUtils::doesAllowSkipping($session);
	    }
	    
	    $this->setData('assessmentTestContext', $context);
	    return $context;
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
}