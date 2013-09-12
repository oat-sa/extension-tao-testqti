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

use qtism\runtime\tests\AssessmentTestSessionFactory;
use qtism\data\AssessmentTest;
use qtism\data\storage\xml\XmlCompactAssessmentTestDocument;
use qtism\runtime\common\State;
use qtism\runtime\tests\AssessmentTestSessionState;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\storage\common\AbstractStorage;

/**
 * Runs a QTI Test.
 *
 * @author Joel Bout, <joel@taotesting.com>
 * @author Jérôme Bogaerts, <jerome@taotesting.com>
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
     * The current AbstractStorage object.
     * 
     * @var AbstractStorage
     */
    private $storage = null;
    
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
    
    public function __construct() {
        parent::__construct();
        $this->retrieveTestDefinition();
        $resultServer = taoResultServer_models_classes_ResultServerStateFull::singleton();
        $testSessionFactory = new taoQtiTest_helpers_TestSessionFactory($this->getTestDefinition(), $resultServer);
        $this->setStorage(new taoQtiTest_helpers_TestSessionStorage($testSessionFactory, $this));
        $this->retrieveTestSession();
    }
    
    protected function beforeAction() {
        // Do the required stuff
        // --- If the session has just been instantiated, begin the test session.
        $testSession = $this->getTestSession();
        if ($testSession->getState() === AssessmentTestSessionState::INITIAL) {
            // The test has just been instantiated.
            common_Logger::d("Beginning Assessment Test Session.");
            $testSession->beginTestSession();
        }
        
        if ($testSession->getState() === AssessmentTestSessionState::INTERACTING) {
            // Log current [itemId].[occurence].
            common_Logger::d("Current Route Item is '" . $testSession->getCurrentAssessmentItemRef()->getIdentifier() . "." . $testSession->getCurrentAssessmentItemRefOccurence() . "'");
            
            // --- If the item session is not in INTERACTING state, begin new attempt.
            if (!$testSession->isCurrentAssessmentItemInteracting() && $testSession->getCurrentRemainingAttempts() > 0) {
                $this->beginAttempt();
            }
            
            // --- Init javascript API.
            $this->buildServiceApi();
        }  
    }
    
    protected function afterAction() {
        $this->persistTestSession();
    }
    
    /**
     * Main action of the TestRunner module.
     * 
     */
	public function index()
	{
	    $this->beforeAction();
	    
        // Prepare the AssessmentTestContext for the client.
        // The built data is availabe with get_data('assessmentTestContext').
        $this->buildAssessmentTestContext();
	    	    
	    $this->setView('test_runner.tpl');
	    
	    $this->afterAction();
	}
	
	public function storeItemVariableSet() {
	    
	    $this->beforeAction();
	    
	    // --- Deal with provided responses.
	    $responses = new State();
	    if ($this->hasRequestParameter('responseVariables')) {
	        
	        
	        
	        // Transform the values from the client-side in a QtiSm form.
	        foreach ($this->getRequestParameter('responseVariables') as $id => $val) {
	            if (empty($val) === false) {
	                $filler = new taoQtiCommon_helpers_VariableFiller($this->getTestSession()->getCurrentAssessmentItemRef());
	                $var = $filler->fill($id, $val);
	                $responses->setVariable($var);
	            }
	        }
	    }
	    
	    $this->getTestSession()->endAttempt($responses);
	    
	    $this->afterAction();
	}
	
	/**
	 * Retrieve the Test Definition the test session is built
	 * from as an AssessmentTest object.
	 * 
	 * @return AssessmentTest The AssessmentTest object the current test session is built from.
	 */
	protected function retrieveTestDefinition() {
	    $testFilePath = $this->getRequestParameter('QtiTestDefinition');
	    
	    common_Logger::d("Loading QTI-XML file at '${testFilePath}'.");
	    $doc = new XmlCompactAssessmentTestDocument();
	    $doc->load($testFilePath);
	    
	    $this->setTestDefinition($doc);
	}
	
	/**
	 * Retrieve the current test session as an AssessmentTestSession object from
	 * persistent storage.
	 * 
	 */
	protected function retrieveTestSession() {
	    $qtiStorage = $this->getStorage();
	    $state = $this->getState();
	    
	    if (empty($state)) {
	        common_Logger::d("Instantiating QTI Assessment Test Session");
	        $this->setTestSession($qtiStorage->instantiate());
	    }
	    else {
	        $sessionId = $this->getSessionId();
	        common_Logger::d("Retrieving QTI Assessment Test Session '${sessionId}'");
	        $this->setTestSession($qtiStorage->retrieve($sessionId));
	    }
	}
	
	/**
	 * Persist the current assessment test session.
	 * 
	 * @throws RuntimeException If no assessment test session has started yet.
	 */
	protected function persistTestSession() {
	    
	    $storage = $this->getStorage();
	    common_Logger::d("Persisting Assessment Test Session.");
	    try {
	        $storage->persist($this->getTestSession());
	    }
	    catch (Exception $e) {
	        throw $e->getPrevious();
	    }
	}
	
	/**
	 * Get the unique identifier of the assessment test session.
	 * 
	 * @return string|false A 28 characters long unique ID or false if the session has not started yet.
	 */
	protected function getSessionId() {
	    $state = $this->getState();
	    if (empty($state)) {
	        return false;
	    }
	    else {
	        return mb_substr($state, 0, 28, TAO_DEFAULT_ENCODING);
	    }
	}
	
	/**
	 * Builds an associative array which describes the current AssessmentTestContext and set
	 * into the request data for a later use.
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
	         
	        // Whether the current item is adaptive.
	        $context['isAdaptive'] = $session->isCurrentAssessmentItemAdaptive();
	    }
	    
	    $this->setData('assessmentTestContext', $context);
	}
	
	/**
	 * Begin an attempt on the current item.
	 * 
	 */
	protected function beginAttempt() {
	    common_Logger::d("Beginning attempt for item " . $this->getTestSession()->getCurrentAssessmentItemRef()->getIdentifier() . "." . $this->getTestSession()->getCurrentAssessmentItemRefOccurence());
	    $this->getTestSession()->beginAttempt();
	}
	
	/**
	 * Get the service call for the current item.
	 * 
	 * @return tao_models_classes_service_ServiceCall A ServiceCall object.
	 */
	protected function getItemServiceCall() {
	    $ext = common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
	    $href = $this->getTestSession()->getCurrentAssessmentItemRef()->getHref();
	    
	    // retrive itemUri & itemPath. 
	    $parts = explode('-', $href);
	    
	    $definition =  new core_kernel_classes_Resource(INSTANCE_QTITEST_ITEMRUNNERSERVICE);
	    $serviceCall = new tao_models_classes_service_ServiceCall($definition);
	    
	    $uriResource = new core_kernel_classes_Resource(INSTANCE_FORMALPARAM_ITEMURI);
	    $uriParam = new tao_models_classes_service_ConstantParameter($uriResource, $parts[0]);
	    $serviceCall->addInParameter($uriParam);
	    
	    $pathResource = new core_kernel_classes_Resource(INSTANCE_FORMALPARAM_ITEMPATH);
	    $pathParam = new tao_models_classes_service_ConstantParameter($pathResource, $parts[1]);
	    $serviceCall->addInParameter($pathParam);
	    
	    $resultServerResource = new core_kernel_classes_Resource(INSTANCE_FORMALPARAM_RESULTSERVER);
	    $resultServerUri = $ext->getConfig(QTITEST_RESULT_SERVER_CONFIG_KEY);
	    $resultServerParam = new tao_models_classes_service_ConstantParameter($resultServerResource, $resultServerUri);
	    $serviceCall->addInParameter($resultServerParam);
	    
	    $parentServiceCallIdResource = new core_kernel_classes_Resource(INSTANCE_FORMALPARAM_QTITESTITEMRUNNER_PARENTCALLID);
	    $parentServiceCallIdParam = new tao_models_classes_service_ConstantParameter($parentServiceCallIdResource, $this->getServiceCallId());
	    $serviceCall->addInParameter($parentServiceCallIdParam);
	    
	    $testDefinitionResource = new core_kernel_classes_Resource(INSTANCE_FORMALPARAM_QTITEST_TESTDEFINITION);
	    $testDefinitionParam = new tao_models_classes_service_ConstantParameter($testDefinitionResource, $this->getRequestParameter('QtiTestDefinition'));
	    $serviceCall->addInParameter($testDefinitionParam);
	    
	    return $serviceCall;
	}
	
	/**
	 * Build the service call id for the current item.
	 * 
	 * @return string A service call id composed of the identifier of the item and its occurence number in the route.
	 */
	protected function buildServiceCallId() {
	    $testSession = $this->getTestSession();
	    $sessionId = $testSession->getSessionId();
	    $itemId = $testSession->getCurrentAssessmentItemRef()->getIdentifier();
	    $occurence = $testSession->getCurrentAssessmentItemRefOccurence();
	    return "${sessionId}.${itemId}.${occurence}";
	}
	
	/**
	 * Build the serviceApi call for the current item and store
	 * it in the request parameters with key 'serviceApi'.
	 */
	protected function buildServiceApi() {
	    $serviceCall = $this->getItemServiceCall();
	    $serviceCallId = $this->buildServiceCallId();
	    $this->setData('itemServiceApi', tao_helpers_ServiceJavascripts::getServiceApi($serviceCall, $serviceCallId));
	}
}
