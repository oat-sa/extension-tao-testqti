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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
 
namespace oat\taoQtiTest\scripts\tools;

use oat\oatbox\extension\AbstractAction;
use \common_report_Report as Report;
use qtism\data\storage\php\PhpDocument;
use oat\taoDeliveryRdf\model\DeliveryAssemblyService;
use oat\taoDelivery\model\RuntimeService;

/**
 * Class RecompileHrefIndexes
 * 
 * Update every deliveries in order to add the index of AssessmentItemRef's Href by AssessmentItemRef Identifier.
 * 
 * php index.php 'oat\taoQtiTest\scripts\tools\RecompileHrefIndexes'
 * 
 * @package oat\taoQtiTest\scripts\tools
 */
class RecompileHrefIndexes extends AbstractAction
{
    public function __invoke($params)
    {
        $extManager = $this->getServiceManager()->get(\common_ext_ExtensionsManager::SERVICE_ID);
        $report = new Report(Report::TYPE_INFO, "Script gracefully ended.");
            
        if ($extManager->isInstalled('taoDeliveryRdf') === true && $extManager->isEnabled('taoDeliveryRdf') === true) {
            
            $extManager->getExtensionById('taoDeliveryRdf');
            $runtimeService = $this->getServiceLocator()->get(RuntimeService::SERVICE_ID);
            $phpDocument = new PhpDocument();
            
            $iterator = new \core_kernel_classes_ResourceIterator([DeliveryAssemblyService::singleton()->getRootClass()]);
            foreach ($iterator as $delivery) {
                $runtime = $runtimeService->getRuntime($delivery->getUri());
                $inputParameters = \tao_models_classes_service_ServiceCallHelper::getInputValues($runtime, array());
                list($privateId, $publicId) = explode('|', $inputParameters['QtiTestCompilation'], 2);
                $directory = \tao_models_classes_service_FileStorage::singleton()->getDirectoryById($privateId);
                
                $compact = $directory->getFile('compact-test.php');
                $count = 0;
                
                if ($compact->exists()) {
                    $phpDocument->loadFromString($compact->read());

                    foreach ($phpDocument->getDocumentComponent()->getComponentsByClassName('assessmentItemRef', true) as $assessmentItemRef) {
                        $assessmentItemRefIdentifier = $assessmentItemRef->getIdentifier();
                        $indexPath = \taoQtiTest_models_classes_QtiTestCompiler::buildHrefIndexPath($assessmentItemRefIdentifier);
                        $newFile = $directory->getFile($indexPath);
                        if (!$newFile->exists()) {
                            $newFile->put($assessmentItemRef->getHref());
                            $count++;
                        }
                    }
                }
                $report->add(new Report(Report::TYPE_SUCCESS, $count." HrefIndexs for delivery '".$delivery->getLabel()."' compiled."));
            }
        } else {
            $report->add(
                new Report(Report::TYPE_WARNING, "Extension taoDeliveryRdf is not installed. No compilation environment is available.")
            );
        }
        
        return $report;
    }
}
