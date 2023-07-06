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
use oat\tao\model\media\TaoMediaException;
use oat\tao\model\media\TaoMediaResolver;
use oat\tao\model\resources\Service\ClassDeleter;
use oat\taoMediaManager\model\MediaService;
use oat\taoMediaManager\model\Specification\MediaClassSpecification;
use oat\taoMediaManager\model\TaoMediaOntology;
use oat\taoQtiItem\model\qti\parser\ElementReferencesExtractor;
use oat\taoQtiItem\model\qti\Service;
use Psr\Log\LoggerInterface;
use tao_helpers_Uri;
use taoItems_models_classes_ItemsService;
use taoTests_models_classes_TestsService;

class TestDeleter
{
    private LoggerInterface $logger;
    private Ontology $ontology;
    private Service $qtiItemService;
    private ClassDeleter $classDeleter;
    private TaoMediaResolver $taoMediaResolver;
    private taoTests_models_classes_TestsService $testsService;
    private taoItems_models_classes_ItemsService $itemsService;
    private ElementReferencesExtractor $elementReferencesExtractor;
    private ?MediaClassSpecification $mediaClassSpecification;
    private ?MediaService $mediaService;

    public function __construct(
        LoggerInterface $logger,
        Ontology $ontology,
        Service $qtiItemService,
        ClassDeleter $classDeleter,
        ElementReferencesExtractor $elementReferencesExtractor,
        ?MediaClassSpecification $mediaClassSpecification
    ) {
        $this->logger = $logger;
        $this->ontology = $ontology;
        $this->qtiItemService = $qtiItemService;
        $this->classDeleter = $classDeleter;
        $this->elementReferencesExtractor = $elementReferencesExtractor;
        $this->mediaClassSpecification = $mediaClassSpecification;

        $this->taoMediaResolver = new TaoMediaResolver();
        $this->itemsService = $this->getItemTreeService();
        $this->testsService = $this->getTestService();

        /** @noinspection PhpFieldAssignmentTypeMismatchInspection */
        $this->mediaService = MediaService::singleton();
    }

    public function deleteTestsFromClassByLabel(
        string $testLabel,
        string $itemsClassLabel,
        core_kernel_classes_Resource $testClass,
        core_kernel_classes_Class $itemClass
    ): void {
        foreach ($testClass->getInstances() as $testInstance) {
            if ($testInstance->getLabel() === $testLabel) {
                $this->testsService->deleteTest($testInstance);
            }
        }

        $resourceReferences = [];
        foreach ($itemClass->getSubClasses() as $subClass) {
            if ($subClass->getLabel() === $itemsClassLabel) {
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

        $resourceReferences = array_unique($resourceReferences);

        $assetIds = [];

        foreach ($resourceReferences as $ref) {
            try {
                $asset = $this->taoMediaResolver->resolve($ref);
                $assetIds[] = $asset->getMediaIdentifier();
            } catch (TaoMediaException $e) {
                // Happens with relative paths (like "assets/e951e5156361c85aeffac.svg",
                // i.e. non-shared stimulus assets).
                $this->logger->debug(
                    sprintf('Unable to resolve "%s": %s', $ref, $e->getMessage())
                );
            }
        }

        $this->logger->debug(
            sprintf('Will remove these assets: %s', implode(', ',  $assetIds))
        );

        if (
            $this->mediaClassSpecification instanceof MediaClassSpecification
            && $this->mediaService instanceof MediaService
        ) {
            $this->deleteAssets($assetIds);
        }
    }

    private function deleteAssets(array $assetIds): void
    {
        $classesToDelete = [];

        foreach ($assetIds as $assetId) {
            $uri = tao_helpers_Uri::decode($assetId);

            $this->logger->debug(sprintf('Remove asset: %s', $uri));

            $resource = $this->ontology->getResource($uri);

            if ($this->isMediaResource($resource)) {
                $this->logger->debug(
                    sprintf('isMedia=true, deleting %s', $resource->getUri())
                );

                $type = current($resource->getTypes());

                if ($this->resourceClassHasNoMoreResources($resource)) {
                    $this->logger->debug(
                        sprintf(
                            'Class %s for media %s only contains the resource being deleted, '.
                            'deferring deletion for the class as well',
                            $type->getUri(),
                            $resource->getUri()
                        )
                    );

                    $classesToDelete[] = $type;
                }

                // Using mediaService in order to have the asset files removed as well
                $this->mediaService->deleteResource($resource);
            }
        }

        if (count($classesToDelete) > 0) {
            $this->logger->debug(
                sprintf('Performing %d deferred deletions for empty classes', count($classesToDelete))
            );

            foreach ($classesToDelete as $class) {
                $this->logger->debug(
                    sprintf('Deleting class %s [%s]', $class->getLabel(), $class->getUri())
                );

                $this->classDeleter->delete($class);
            }
        }
    }

    private function isMediaResource(core_kernel_classes_Resource $resource): bool
    {
        foreach ($resource->getTypes() as $type) {
            if ($this->mediaClassSpecification->isSatisfiedBy($type)) {
                return true;
            }
        }

        return false;
    }

    private function resourceClassHasNoMoreResources(core_kernel_classes_Resource $resource): bool
    {
        $type = current($resource->getTypes());

        return count($resource->getTypes()) == 1
            && $type instanceof core_kernel_classes_Class
            && $type->countInstances() == 1
            && $type->getUri() !== TaoMediaOntology::CLASS_URI_MEDIA_ROOT;
    }

    private function getItemTreeService(): taoItems_models_classes_ItemsService
    {
        return taoItems_models_classes_ItemsService::singleton();
    }

    private function getTestService(): taoTests_models_classes_TestsService
    {
        return taoTests_models_classes_TestsService::singleton();
    }
}
