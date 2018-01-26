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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */

namespace oat\taoQtiTest\models\cat;

use core_kernel_classes_Resource;
use oat\taoDelivery\model\execution\DeliveryExecutionInterface;
use oat\taoDelivery\model\RuntimeService;
use qtism\data\ExtendedAssessmentItemRef;
use qtism\data\ExtendedAssessmentSection;
use qtism\runtime\tests\AssessmentTestSession;
use tao_models_classes_service_FileStorage;
use tao_models_classes_service_ServiceCallHelper;

class GetDeliveryExecutionsItems
{
    /** @var RuntimeService */
    private $runTimeService;

    /** @var CatService */
    private $catService;

    /** @var \tao_models_classes_service_StorageDirectory */
    private $directoryStorage;

    /** @var DeliveryExecutionInterface  */
    private $deliveryExecution;

    /** @var AssessmentTestSession */
    private $assessmentTestSession;

    /**
     * @param RuntimeService $runTimeService
     * @param CatService $catService
     * @param tao_models_classes_service_FileStorage $fileStorage
     * @param DeliveryExecutionInterface $deliveryExecution
     * @param AssessmentTestSession $assessmentTestSession
     * @throws \Exception
     */
    public function __construct(
        RuntimeService $runTimeService,
        CatService $catService,
        tao_models_classes_service_FileStorage $fileStorage,
        DeliveryExecutionInterface $deliveryExecution,
        AssessmentTestSession $assessmentTestSession
    ) {
        $this->runTimeService = $runTimeService;
        $this->catService = $catService;
        $this->setDirectoryStorage($deliveryExecution->getDelivery());
        $this->deliveryExecution = $deliveryExecution;
        $this->assessmentTestSession = $assessmentTestSession;
    }


    /**
     * @return array
     * @throws \Exception
     */
    public function getItemsRefs()
    {
        $sections = $this->assessmentTestSession->getAssessmentTest()->getComponentsByClassName('assessmentSection');
        $items = [];
        foreach ($sections as $section) {
            $assessmentItemsRef = $this->getSectionItems($section, $this->deliveryExecution->getDelivery());
            /** @var ExtendedAssessmentItemRef $item */
            foreach ($assessmentItemsRef as $item) {
                $items[] = $item->getIdentifier();
            }
        }

        return $items;
    }

    /**
     * @param ExtendedAssessmentSection $section
     * @return array
     */
    protected function getSectionItems(ExtendedAssessmentSection $section) {

        $sectionItems = $section->getComponentsByClassName('assessmentItemRef' , false);

        if($this->catService->isAssessmentSectionAdaptive($section)) {
            $item = $sectionItems->current();
            $sectionItems = $this->catService->getAssessmentItemRefsByPlaceholder($this->directoryStorage, $item);
        }

        return $sectionItems;
    }


    /**
     * @param core_kernel_classes_Resource $delivery
     * @return void
     * @throws \common_exception_Error
     */
    protected function setDirectoryStorage($delivery)
    {
        $fileStorage = \tao_models_classes_service_FileStorage::singleton();
        $directoryIds = explode('|', $this->getTestFile($delivery));
        $this->directoryStorage = $fileStorage->getDirectoryById($directoryIds[0]);
    }

    /**
     * @param \core_kernel_classes_Resource $delivery
     * @return string
     * @throws \common_exception_Error
     */
    protected function getTestFile(\core_kernel_classes_Resource $delivery)
    {
        $parameters = tao_models_classes_service_ServiceCallHelper::getInputValues(
            $this->runTimeService->getRuntime($delivery->getUri()),[]
        );
        list($private, $public) = explode('|',$parameters['QtiTestCompilation']);
        return $private;
    }
}