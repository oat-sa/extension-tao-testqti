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

/**
 * taoQtiTest_actions_TestCommand represents an executable commands. 
 *
 * @author Aleh Hutnikau <hutnikau@1pt.com>
 * @package taoQtiTest
 */
class taoQtiTest_actions_TestCommand extends \tao_actions_ServiceModule
{
    
    public function endExpiredTests() 
    {
        $started = \taoDelivery_models_classes_DeliveryServerService::singleton()->getResumableDeliveries();
        $resultServer = \taoResultServer_models_classes_ResultServerStateFull::singleton();
        
        foreach ($started as $deliveryExecution) {
            $compiledDelivery = $deliveryExecution->getDelivery();
            $runtime = \taoDelivery_models_classes_DeliveryAssemblyService::singleton()->getRuntime($compiledDelivery);
            $inputParameters = \tao_models_classes_service_ServiceCallHelper::getInputValues($runtime, array());
            
            $testDefinition = \taoQtiTest_helpers_Utils::getTestDefinition($inputParameters['QtiTestCompilation']);
            $testResource = new \core_kernel_classes_Resource($inputParameters['QtiTestDefinition']);

            $sessionManager = new \taoQtiTest_helpers_SessionManager($resultServer, $testResource);
            $qtiStorage = new \taoQtiTest_helpers_TestSessionStorage($sessionManager, new BinaryAssessmentTestSeeker($testDefinition));

            $session = $qtiStorage->retrieve($testDefinition, $deliveryExecution->getUri());
            
            try {
                $session->checkTimeLimits(false, false, false);
            } catch (AssessmentTestSessionException $e) {
                if (AssessmentTestSessionException::ASSESSMENT_TEST_DURATION_OVERFLOW){
                    $session->endTestSession();
                    $deliveryExecution->setState(INSTANCE_DELIVERYEXEC_FINISHED);
                }
            }
        }
    }
    
}