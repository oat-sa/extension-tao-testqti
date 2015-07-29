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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 */

use qtism\runtime\storage\binary\BinaryAssessmentTestSeeker;
use qtism\runtime\tests\AssessmentTestSessionException;
use \taoQtiTest_actions_TestRunner as TestRunner;

/**
 * taoQtiTest_actions_TestCommand represents an executable commands. 
 *
 * @author Aleh Hutnikau <hutnikau@1pt.com>
 * @package taoQtiTest
 */
class taoQtiTest_actions_TestCommand extends \tao_actions_ServiceModule
{
    /**
     * Action to finish test attempts where the maximum time limit has been reached.
     * To end user will be sent array that contains id's of finished session.
     */
    public function endExpiredTests() 
    {
        $started = \taoDelivery_models_classes_DeliveryServerService::singleton()->getResumableDeliveries();
        $resultServer = \taoResultServer_models_classes_ResultServerStateFull::singleton();
        $result = array();

        foreach ($started as $deliveryExecution) {
            $compiledDelivery = $deliveryExecution->getDelivery();
            $runtime = \taoDelivery_models_classes_DeliveryAssemblyService::singleton()->getRuntime($compiledDelivery);
            $inputParameters = \tao_models_classes_service_ServiceCallHelper::getInputValues($runtime, array());
            
            $testDefinition = \taoQtiTest_helpers_Utils::getTestDefinition($inputParameters['QtiTestCompilation']);
            $testResource = new \core_kernel_classes_Resource($inputParameters['QtiTestDefinition']);
            
            $subjectProp = new \core_kernel_classes_Property(PROPERTY_DELVIERYEXECUTION_SUBJECT);
            $delvieryExecutionSubject = $deliveryExecution->getOnePropertyValue($subjectProp);
            
            $sessionManager = new \taoQtiTest_helpers_SessionManager($resultServer, $testResource);
            
            $qtiStorage = new \taoQtiTest_helpers_TestSessionStorage(
                $sessionManager, 
                new BinaryAssessmentTestSeeker($testDefinition), 
                $delvieryExecutionSubject->getUri()
            );
            
            $session = $qtiStorage->retrieve($testDefinition, $deliveryExecution->getUri());
            $resultServerUri = $compiledDelivery->getOnePropertyValue(new \core_kernel_classes_Property(TAO_DELIVERY_RESULTSERVER_PROP));
            $resultServerObject = new \taoResultServer_models_classes_ResultServer($resultServerUri, array());
            
            $resultServer->setValue('resultServerUri', $resultServerUri->getUri());
            $resultServer->setValue('resultServerObject', array($resultServerUri->getUri() => $resultServerObject));
            $resultServer->setValue('resultServer_deliveryResultIdentifier', $deliveryExecution->getUri());
            
            
            try {
                $session->checkTimeLimits(false, false, false);
            } catch (AssessmentTestSessionException $e) {
                if (AssessmentTestSessionException::ASSESSMENT_TEST_DURATION_OVERFLOW){
                    $session->saveMetaData(array(
                       'TEST' => array('TEST_EXIT_CODE' => TestRunner::TEST_CODE_INCOMPLETE),
                       'SECTION' => array('SECTION_EXIT_CODE' => TestRunner::SECTION_CODE_TIMEOUT),
                    ));
                    $session->endTestSession();
                    $deliveryExecution->setState(INSTANCE_DELIVERYEXEC_FINISHED);
                    
                    \common_Logger::i("Expired test session {$session->getSessionId()} has finished.");
                    
                    $result[] = $session->getSessionId();
                }
            }
        }
        
        echo json_encode($result);
    }
}