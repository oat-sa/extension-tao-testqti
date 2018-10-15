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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA;
 */
 
namespace oat\taoQtiTest\scripts\tools;

use oat\generis\model\OntologyAwareTrait;
use \common_report_Report as Report;
use oat\taoDelivery\model\AssignmentAggregator\UnionAssignmentService;
use oat\taoDeliveryRdf\model\DeliveryAssemblyService;
use oat\taoQtiItem\model\QtiJsonItemCompiler;
use qtism\data\AssessmentItemRef;
use oat\oatbox\extension\script\ScriptAction;

/**
 * Class RecompileItemsElements
 *
 * Update every deliveries in order to add the metadata of AssessmentItemRef's by AssessmentItemRef Identifier.
 *
 * php index.php 'oat\taoQtiTest\scripts\tools\RecompileItemsElements'
 *
 * Usage example:
 * ```
 * sudo -u www-data php index.php '\oat\taoQtiTest\scripts\tools\RecompileItemsElements'
 * ```
 *
 * @package oat\taoQtiTest\scripts\tools
 */
class RecompileItemsElements extends ScriptAction
{
    use OntologyAwareTrait;

    /** @var Report */
    private $report;

    private $wetRun;

    /**
     * @return string
     */
    protected function provideDescription()
    {
        return 'Update every deliveries in order to add the metadata of AssessmentItemRef\'s by AssessmentItemRef Identifier.';
    }

    /**
     * @return array
     */
    protected function provideOptions()
    {
        return [
            'wetRun' => [
                'longPrefix' => 'wetRun',
                'required' => false,
                'description' => 'Wet run',
                'defaultValue' => 0
            ]
        ];
    }

    /**
     * @return Report
     * @throws \common_Exception
     * @throws \common_exception_Error
     */
    protected function run()
    {
        try {
            $this->init();
        } catch (\Exception $e) {
            return new Report(Report::TYPE_ERROR, $e->getMessage());
        }
        $this->recompileItems();
        return $this->report;
    }

    /**
     * Initialize parameters
     */
    protected function init()
    {
        $this->wetRun = (boolean) $this->getOption('wetRun');
        $this->report = new Report(Report::TYPE_INFO, 'Starting recompile deliveries');
    }

    /**
     * Recompile items
     *
     * @throws \common_Exception
     * @throws \common_exception_Error
     */
    protected function recompileItems()
    {
        $extManager = $this->getServiceLocator()->get(\common_ext_ExtensionsManager::SERVICE_ID);

        if ($extManager->isInstalled('taoDeliveryRdf') === true && $extManager->isEnabled('taoDeliveryRdf') === true) {
            $compiledDeliveryClass = $this->getClass(DeliveryAssemblyService::CLASS_URI);
            if ($compiledDeliveryClass->exists() === true) {
                foreach ($compiledDeliveryClass->getInstances(true) as $compiledDelivery) {
                    try {
                        $this->getAssessmentsFromDelivery($compiledDelivery);
                    } catch (\Exception $e) {
                        $this->report->add(
                            new Report(
                                Report::TYPE_WARNING,
                                "Delivery {$compiledDelivery->getUri()} was skipped with message: '{$e->getMessage()}'"
                            )
                        );
                    }
                }
            }
        } else {
            $this->report->add(
                new Report(
                    Report::TYPE_WARNING,
                    "Extension taoDeliveryRdf is not installed. No compilation environment is available."
                )
            );
        }
    }

    /**
     * Get assessmentItemRef from delivery
     *
     * @param \core_kernel_classes_Resource $compiledDelivery
     *
     * @throws \common_Exception
     * @throws \common_exception_Error
     */
    protected function getAssessmentsFromDelivery(\core_kernel_classes_Resource $compiledDelivery)
    {
        /** @var UnionAssignmentService $unionAssignmentService */
        $unionAssignmentService = $this->getServiceLocator()->get(UnionAssignmentService::SERVICE_ID);
        $runtime = $unionAssignmentService->getRuntime($compiledDelivery);

        $inputParameters = \tao_models_classes_service_ServiceCallHelper::getInputValues($runtime, []);
        $testDefinition = \taoQtiTest_helpers_Utils::getTestDefinition($inputParameters['QtiTestCompilation']);

        $assessmentItemRefs = $testDefinition->getComponentsByClassName('assessmentItemRef');

        $this->report->add(
            new Report(
                Report::TYPE_INFO,
                "Starting to recompile items for delivery {$compiledDelivery->getLabel()} with identifier {$compiledDelivery->getUri()}:"
            )
        );

        $count = 0;

        /** @var AssessmentItemRef $assessmentItemRef */
        foreach ($assessmentItemRefs as $assessmentItemRef) {
            $directoryIds = explode('|', $assessmentItemRef->getHref());
            $item = $this->getResource($directoryIds[0]);
            $properties = [];
            foreach ($item->getRdfTriples() as $triple) {
                $properties[$triple->predicate] = $triple->object;
            }

            if ($properties) {
                $directory = \tao_models_classes_service_FileStorage::singleton()->getDirectoryById($directoryIds[2]);
                $languages = $item->getUsedLanguages(
                    $this->getProperty(\taoItems_models_classes_ItemsService::PROPERTY_ITEM_CONTENT)
                );
                foreach ($languages as $lang) {
                    $path = $lang.DIRECTORY_SEPARATOR.QtiJsonItemCompiler::METADATA_FILE_NAME;
                    if (!$directory->has($path)) {
                        $this->writeMetadata($item, $directory, $path, $properties);
                        $count++;
                    }
                }
            }
        }
        $this->report->add(new Report(Report::TYPE_INFO, "Was updated {$count} items."));
    }

    /**
     * @param \core_kernel_classes_Resource $item
     * @param \tao_models_classes_service_StorageDirectory $directory
     * @param $path
     * @param $properties
     * @throws \common_Exception
     * @throws \common_exception_Error
     */
    protected function writeMetadata(
        \core_kernel_classes_Resource $item,
        \tao_models_classes_service_StorageDirectory $directory,
        $path,
        $properties
    ) {

        if ($this->wetRun === true) {
            $directory->write(
                $path,
                json_encode($properties)
            );
            $this->report->add(
                new Report(
                    Report::TYPE_SUCCESS,
                    "Metadata for assessmentItemRef '{$item->getLabel()}' with identifier '{$item->getUri()}' was successfully compiled."
                )
            );
        } else {
            $this->report->add(
                new Report(
                    Report::TYPE_SUCCESS,
                    "Metadata for assessmentItemRef '{$item->getLabel()}' with identifier '{$item->getUri()}' will successfully compiled."
                )
            );
        }
    }
}
