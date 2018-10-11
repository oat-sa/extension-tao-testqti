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

use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\extension\AbstractAction;
use \common_report_Report as Report;
use oat\taoDelivery\model\AssignmentAggregator\UnionAssignmentService;
use oat\taoDeliveryRdf\model\DeliveryAssemblyService;
use oat\taoQtiItem\model\QtiJsonItemCompiler;
use qtism\data\AssessmentItemRef;

/**
 * Class RecompileItemsElements
 * 
 * Update every deliveries in order to add the index of AssessmentItemRef's Href by AssessmentItemRef Identifier.
 * 
 * php index.php 'oat\taoQtiTest\scripts\tools\RecompileItemsElements'
 * 
 * @package oat\taoQtiTest\scripts\tools
 */
class RecompileItemsElements extends AbstractAction
{
    use OntologyAwareTrait;

    /** @var Report */
    private $report;

    /**
     * @param $params
     * @return Report
     * @throws \common_Exception
     * @throws \common_exception_Error
     */
    public function __invoke($params)
    {
        $this->report = new Report(Report::TYPE_INFO, "Script gracefully ended.");

        $this->recompileItems();
        
        return $this->report;
    }

    /**
     * @throws \common_Exception
     * @throws \common_exception_Error
     */
    private function recompileItems()
    {
        $extManager = $this->getServiceLocator()->get(\common_ext_ExtensionsManager::SERVICE_ID);
        if ($extManager->isInstalled('taoDeliveryRdf') === true && $extManager->isEnabled('taoDeliveryRdf') === true) {

            $extManager->getExtensionById('taoDeliveryRdf');

            $compiledDeliveryClass = $this->getClass(DeliveryAssemblyService::CLASS_URI);

            if ($compiledDeliveryClass->exists() === true) {
                foreach ($compiledDeliveryClass->getInstances(true) as $compiledDelivery) {
                    $this->getAssessmentsFromDelivery($compiledDelivery);
                }
            }
        } else {
            $this->add(
                new Report(Report::TYPE_WARNING, "Extension taoDeliveryRdf is not installed. No compilation environment is available.")
            );
        }
    }

    /**
     * @param $compiledDelivery
     * @throws \common_Exception
     * @throws \common_exception_Error
     */
    private function getAssessmentsFromDelivery($compiledDelivery)
    {
        /** @var UnionAssignmentService $unionAssignmentService */
        $unionAssignmentService = $this->getServiceLocator()->get(UnionAssignmentService::SERVICE_ID);
        $runtime = $unionAssignmentService->getRuntime($compiledDelivery);

        $inputParameters = \tao_models_classes_service_ServiceCallHelper::getInputValues($runtime, []);
        $testDefinition = \taoQtiTest_helpers_Utils::getTestDefinition($inputParameters['QtiTestCompilation']);

        $assessmentItemRefs = $testDefinition->getComponentsByClassName('assessmentItemRef');

        $this->report->add(new Report(Report::TYPE_INFO, "Starting to recompile items for delivery {$compiledDelivery->getLabel()} with identifier {$compiledDelivery->getUri()}:"));
        $count = 0;
        /** @var AssessmentItemRef $assessmentItemRef */
        foreach ($assessmentItemRefs as $assessmentItemRef) {
            $href = $assessmentItemRef->getHref();
            $directoryIds = explode('|', $href);
            $itemId = $directoryIds[0];
            $item = $this->getResource($itemId);
            $uri = $item->getUri();
            $identifier = $assessmentItemRef->getIdentifier();
            $languages = $item->getUsedLanguages($this->getProperty(\taoItems_models_classes_ItemsService::PROPERTY_ITEM_CONTENT));
            $triples = $item->getRdfTriples();
            $properties = [];
            foreach ($triples as $triple){
                $properties[$triple->predicate] = $triple->object;
            }
            if ($properties) {
                $directory = \tao_models_classes_service_FileStorage::singleton()->getDirectoryById($directoryIds[2]);
            }
            foreach ($languages as $lang) {
                if (!$directory->has($lang.DIRECTORY_SEPARATOR.QtiJsonItemCompiler::METADATA_FILE_NAME)) {
                    $directory->write($lang.DIRECTORY_SEPARATOR.QtiJsonItemCompiler::METADATA_FILE_NAME, json_encode($properties));
                    $this->report->add(new Report(Report::TYPE_SUCCESS, "Metadata for assessmentItemRef '{$identifier}' with identifier '{$uri}' and lang '{$lang}' successfully compiled."));
                    $count++;
                }
            }
        }
        $this->report->add(new Report(Report::TYPE_INFO, "Was updated {$count} items."));
    }
}
