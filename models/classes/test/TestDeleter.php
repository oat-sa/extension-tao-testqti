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
 * Copyright (c) 2023 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\test;

use core_kernel_classes_Class;
use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\oatbox\event\EventManager;
use oat\oatbox\service\ServiceManager;
use oat\tao\model\resources\Service\ClassDeleter;
use oat\taoQtiItem\model\qti\parser\ElementReferencesExtractor;
use oat\taoQtiItem\model\qti\Service;
use oat\taoQtiTest\models\event\QtiTestDeletedEvent;
use Psr\Log\LoggerInterface;
use taoItems_models_classes_ItemsService;
use taoTests_models_classes_TestsService;

class TestDeleter
{
    private LoggerInterface $logger;
    private Ontology $ontology;
    private Service $qtiItemService;
    private ClassDeleter $classDeleter;
    private taoTests_models_classes_TestsService $testsService;
    private taoItems_models_classes_ItemsService $itemsService;
    private ElementReferencesExtractor $elementReferencesExtractor;

    public function __construct(
        LoggerInterface $logger,
        Ontology $ontology,
        ClassDeleter $classDeleter,
        ElementReferencesExtractor $elementReferencesExtractor,
        Service $qtiItemService,
        ?taoItems_models_classes_ItemsService $itemTreeService,
        ?taoTests_models_classes_TestsService $testsService
    ) {
        $this->logger = $logger;
        $this->ontology = $ontology;
        $this->qtiItemService = $qtiItemService;
        $this->classDeleter = $classDeleter;
        $this->elementReferencesExtractor = $elementReferencesExtractor;

        $this->itemsService = $this->getItemTreeService($itemTreeService);
        $this->testsService = $this->getTestService($testsService);
    }

    public function deleteTestsFromClassByLabel(
        string $testLabel,
        string $itemsClassLabel,
        core_kernel_classes_Resource $testClass,
        core_kernel_classes_Class $itemClass
    ): void {
        $deletedTests = [];
        $deletedItemClasses = [];

        foreach ($testClass->getInstances() as $testInstance) {
            if ($testInstance->getLabel() === $testLabel) {
                $deletedTests[] = $testInstance->getUri();
                $this->testsService->deleteTest($testInstance);
            }
        }

        $resourceReferences = [];
        foreach ($itemClass->getSubClasses() as $subClass) {
            if ($subClass->getLabel() === $itemsClassLabel) {
                $deletedItemClasses[] = $subClass->getUri();
                foreach ($subClass->getInstances(true) as $rdfItem) {
                    $qtiItem = $this->qtiItemService->getDataItemByRdfItem($rdfItem);
                    $itemReferences = $this->elementReferencesExtractor->extractAll($qtiItem);
                    $resourceReferences = array_merge(
                        $resourceReferences,
                        $itemReferences->getAllReferences()
                    );
                }

                $this->itemsService->deleteClass($subClass);
            }
        }

        /** @var EventManager $eventManager */
        $eventManager = $this->getServiceLocator()->get(EventManager::SERVICE_ID);

        $eventManager->trigger(
            new QtiTestDeletedEvent(
                $deletedTests,
                $deletedItemClasses,
                $resourceReferences
            )
        );
    }

    private function getItemTreeService(
        ?taoItems_models_classes_ItemsService $itemTreeService
    ): taoItems_models_classes_ItemsService
    {
        if ($itemTreeService instanceof taoItems_models_classes_ItemsService) {
            return $itemTreeService;
        }

        /** @noinspection PhpIncompatibleReturnTypeInspection */
        return taoItems_models_classes_ItemsService::singleton();
    }

    private function getTestService(
        ?taoTests_models_classes_TestsService $testsService
    ): taoTests_models_classes_TestsService
    {
        if ($testsService instanceof taoTests_models_classes_TestsService) {
            return $testsService;
        }

        /** @noinspection PhpIncompatibleReturnTypeInspection */
        return taoTests_models_classes_TestsService::singleton();
    }

    /**
     * Placeholder until the servicemanage is passed properly
     *
     * @return \oat\oatbox\service\ServiceManager
     */
    public function getServiceLocator()
    {
        return ServiceManager::getServiceManager();
    }
}
