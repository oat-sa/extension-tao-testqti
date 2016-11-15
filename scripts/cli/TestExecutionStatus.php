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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 */

namespace oat\taoQtiTest\scripts\cli;

use oat\oatbox\action\Action;
use oat\oatbox\service\ServiceManager;
use qtism\runtime\storage\binary\BinaryAssessmentTestSeeker;
use qtism\runtime\tests\AssessmentTestSessionState;
use qtism\data\storage\php\PhpDocument;
use qtism\common\datatypes\QtiDuration;

class TestExecutionStatus implements Action
{
    public function __invoke($params)
    {
        $deliveryExecutionId = $params[0];
        $deliveryService = \taoDelivery_models_classes_execution_ServiceProxy::singleton();
        $deliveryExecution = $deliveryService->getDeliveryExecution($deliveryExecutionId);
        $delivery = $deliveryExecution->getDelivery();
        
        $storageService = ServiceManager::getServiceManager()->get(\tao_models_classes_service_FileStorage::SERVICE_ID);
        $directories = $delivery->getPropertyValues(new \core_kernel_classes_Property('http://www.tao.lu/Ontologies/TAODelivery.rdf#AssembledDeliveryCompilationDirectory'));
        $resultServerUri = $delivery->getOnePropertyValue(new \core_kernel_classes_Property('http://www.tao.lu/Ontologies/TAODelivery.rdf#DeliveryResultServer'));
        
        $resultServer = \taoResultServer_models_classes_ResultServerStateFull::singleton();
        $resultServerObject = new \taoResultServer_models_classes_ResultServer($resultServerUri, array());
        $resultServer->setValue('resultServerUri', $resultServerUri->getUri());
        $resultServer->setValue('resultServerObject', array($resultServerUri->getUri() => $resultServerObject));
        $resultServer->setValue('resultServer_deliveryResultIdentifier', $deliveryExecution->getIdentifier());
        
        $testDocument = new PhpDocument();
        
        foreach ($directories as $directory) {
            $dir = $storageService->getDirectoryById($directory);
            $files = $dir->getFlyIterator(3);
            
            foreach ($files as $file) {
                
                if ($file->getBasename() === 'compact-test.php') {
                    $testDocument->loadFromString($file->read());
                    break;
                }
            }
        }
        
        $testDefinitionUri = 'http://fake.com/my-fake-definition';
        $testDefinition = $testDocument->getDocumentComponent();
        $userUri = $deliveryExecution->getUserIdentifier();
        
        $testResource = new \core_kernel_classes_Resource($testDefinitionUri);
        $sessionManager = new \taoQtiTest_helpers_SessionManager($resultServer, $testResource);
        $seeker = new BinaryAssessmentTestSeeker($testDefinition);
        $storage = new \taoQtiTest_helpers_TestSessionStorage($sessionManager, $seeker, $userUri);
        
        $session = $storage->retrieve($testDefinition, $deliveryExecutionId);
        
        switch (strtolower($params[1])) {
            case 'restart':
                // Do something.
                $session->setState(AssessmentTestSessionState::INTERACTING);
                
                if (empty($params[2]) === false) {
                    // reset duration.
                    $durationStore = $session->getDurationStore();
                    $durationStore[$testDefinition->getIdentifier()] = new QtiDuration('PT0S');
                }
                
                break;
                
            case 'finish':
                // End test session.
                $session->endTestSession();
                break;

            default:
                return \common_report_Report::createFailure('Unknown state given.');
                break;
        }
        
        $storage->persist($session);
        
        return \common_report_Report::createSuccess("Test status of execution '${deliveryExecutionId}' has been changed.");
    }
}
