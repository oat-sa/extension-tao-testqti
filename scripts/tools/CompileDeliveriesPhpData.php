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
use oat\taoDeliveryRdf\model\DeliveryAssemblyService;
use oat\taoDelivery\model\RuntimeService;

/**
 * 
 * @package oat\taoQtiTest\scripts\tools
 */
abstract class CompileDeliveriesPhpData extends AbstractAction
{
    public function __invoke($params)
    {
        $extManager = $this->getServiceManager()->get(\common_ext_ExtensionsManager::SERVICE_ID);
        $report = new Report(Report::TYPE_INFO, "Script gracefully ended.");
        
        $count = 0;
        $failCount = 0;    
        
        if ($extManager->isInstalled('taoDeliveryRdf') === true && $extManager->isEnabled('taoDeliveryRdf') === true) {
            
            $extManager->getExtensionById('taoDeliveryRdf');
            $runtimeService = $this->getServiceLocator()->get(RuntimeService::SERVICE_ID);
            
            $iterator = new \core_kernel_classes_ResourceIterator([DeliveryAssemblyService::singleton()->getRootClass()]);
            
            foreach ($iterator as $delivery) {
                
                $deliveryUri = $delivery->getUri();
                
                $runtime = $runtimeService->getRuntime($deliveryUri);
                $inputParameters = \tao_models_classes_service_ServiceCallHelper::getInputValues($runtime, array());
                list($privateId, $publicId) = explode('|', $inputParameters['QtiTestCompilation'], 2);
                $directory = \tao_models_classes_service_FileStorage::singleton()->getDirectoryById($privateId);

                foreach ($directory->getIterator() as $filePrefix) {
                    if ($filePrefix === '/compact-test.php' || preg_match('/\/adaptive-assessment-section-.+?\.php/', $filePrefix) === 1 || preg_match('/\/adaptive-assessment-item-ref-.+?\.php/', $filePrefix) === 1) {
                        try {
                            if ($this->compileData($directory->getFile($filePrefix))) {
                                $count++;
                                
                                $report->add(
                                    new Report(
                                        Report::TYPE_SUCCESS,
                                        "File '${filePrefix}' successfully compiled for delivery '${deliveryUri}'."
                                    )
                                );
                            } else {
                                $failCount++;
                                $report->add(
                                    new Report(
                                        Report::TYPE_WARNING,
                                        "File '${filePrefix}' could not be compiled for delivery '${deliveryUri}'."
                                    )
                                );
                            }
                        } catch (\Exception $e) {
                            $failCount++;
                            $report->add(
                                new Report(
                                    Report::TYPE_ERROR,
                                    "An unexpected error occured while compiling file '${filePrefix}' for Delivery '${deliveryUri}'. The system returned the following error:\n" . $e->getMessage()
                                )
                            );
                        }
                    }
                }
            }
            
            $report->add(
                new Report(
                    Report::TYPE_INFO,
                    "${count} file(s) successfully compiled."
                )
            );
            
            $report->add(
                new Report(
                    Report::TYPE_INFO,
                    "${failCount} file(s) not successfully compiled."
                )
            );
            
        } else {
            $report->add(
                new Report(
                    Report::TYPE_ERROR, 
                    "Extension taoDeliveryRdf is not installed. No compilation environment is available."
                )
            );
        }
        
        return $report;
    }
    
    abstract protected function compileData($file);
}
