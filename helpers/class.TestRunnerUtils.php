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

use qtism\data\NavigationMode;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\tests\AssessmentTestSessionException;
use qtism\runtime\tests\AssessmentItemSessionState;

/**
* Utility methods for the QtiTest Test Runner.
*
* @author Jérôme Bogaerts <jerome@taotesting.com>
*
*/
class taoQtiTest_helpers_TestRunnerUtils {
    
    /**
     * Get the ServiceCall object represeting how to call the current Assessment Item to be
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
         
        $definition =  new core_kernel_classes_Resource(INSTANCE_QTITEST_ITEMRUNNERSERVICE);
        $serviceCall = new tao_models_classes_service_ServiceCall($definition);
         
        $uriResource = new core_kernel_classes_Resource(INSTANCE_FORMALPARAM_ITEMURI);
        $uriParam = new tao_models_classes_service_ConstantParameter($uriResource, $parts[0]);
        $serviceCall->addInParameter($uriParam);
         
        $pathResource = new core_kernel_classes_Resource(INSTANCE_FORMALPARAM_ITEMPATH);
        $pathParam = new tao_models_classes_service_ConstantParameter($pathResource, $parts[1]);
        $serviceCall->addInParameter($pathParam);
         
        $parentServiceCallIdResource = new core_kernel_classes_Resource(INSTANCE_FORMALPARAM_QTITESTITEMRUNNER_PARENTCALLID);
        $parentServiceCallIdParam = new tao_models_classes_service_ConstantParameter($parentServiceCallIdResource, $session->getSessionId());
        $serviceCall->addInParameter($parentServiceCallIdParam);
         
        $testDefinitionResource = new core_kernel_classes_Resource(INSTANCE_FORMALPARAM_QTITEST_TESTDEFINITION);
        $testDefinitionParam = new tao_models_classes_service_ConstantParameter($testDefinitionResource, $testDefinitionUri);
        $serviceCall->addInParameter($testDefinitionParam);
         
        $testCompilationResource = new core_kernel_classes_Resource(INSTANCE_FORMALPARAM_QTITEST_TESTCOMPILATION);
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
     * Build the hyper-text reference to be used to get a given Assessment Item
     * (involved in $session) at runtime.
     * 
     * @param AssessmentTestSession $session An AssessmentTestSession object.
     * @param string $itemUri The URI of the an Assessment Item in the knowledge base.
     * @param string $itemPath The URI of a reference to an Assessment Item compilation folder in the knowledge base.
     * @param string $qtiTestDefinitionUri The URI of the definition of an Assessment Test in the knowledge base.
     * @param string $qtiTestCompilationUri The URI of the resource in the knowledge base representing the compilation folder of an Assessment Test.
     * @return string The hypertext reference to access an item at runtime.
     */
    static public function buildItemHref(AssessmentTestSession $session, $itemUri, $itemPath, $qtiTestDefinitionUri, $qtiTestCompilationUri) {
        $src = BASE_URL . 'ItemRunner/index?';
        $src .= 'itemUri=' . urlencode($itemUri);
        $src.= '&itemPath=' . urlencode($itemPath);
        $src.= '&QtiTestParentServiceCallId=' . urlencode($session->getSessionId());
        $src.= '&QtiTestDefinition=' . urlencode($qtiTestDefinitionUri);
        $src.= '&QtiTestCompilation=' . urlencode($qtiTestCompilationUri);
        $src.= '&standalone=true';
        $src.= '&serviceCallId=' . self::buildServiceCallId($session);
         
        return $src;
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
        $url = BASE_URL . "TestRunner/${action}";
        $url.= '?QtiTestDefinition=' . urlencode($qtiTestDefinitionUri);
        $url.= '&QtiTestCompilation=' . urlencode($qtiTestCompilationUri);
        $url.= '&standalone=' . urlencode($standalone);
        $url.= '&serviceCallId=' . urlencode($session->getSessionId());
        return $url;
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
        $doesAllowSkipping = false;
        $navigationMode = $session->getCurrentNavigationMode();
         
        $routeItem = $session->getRoute()->current();
        $routeControl = $routeItem->getItemSessionControl();
         
        if (empty($routeControl) === false) {
            $doesAllowSkipping = $routeControl->getItemSessionControl()->doesAllowSkipping();
        }
         
        return $doesAllowSkipping && $navigationMode === NavigationMode::LINEAR;
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
        
        foreach ($session->getTimeConstraints() as $tc) {
            // Only consider time constraints in force.
            if ($tc->getMaximumRemainingTime() !== false) {
                $constraints[] = array(
                    'source' => $tc->getSource()->getIdentifier(),
                    'seconds' => $tc->getMaximumRemainingTime()->getSeconds(true),
                    'allowLateSubmission' => $tc->allowLateSubmission()
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
}