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

use oat\generis\model\data\Ontology;
use oat\tao\model\media\TaoMediaResolver;
use oat\tao\model\resources\Service\ClassDeleter;
use oat\taoMediaManager\model\MediaService;
use oat\taoMediaManager\model\Specification\MediaClassSpecification;
use oat\taoQtiItem\model\qti\parser\ElementReferencesExtractor;
use oat\taoQtiItem\model\qti\Service;
use PHPUnit\Framework\MockObject\MockObject;
use Psr\Log\LoggerInterface;
use PHPUnit\Framework\TestCase;
use taoItems_models_classes_ItemsService;
use taoTests_models_classes_TestsService;

class TestDeleterTest extends TestCase
{
    /** @var (LoggerInterface&MockObject) */
    private LoggerInterface $logger;

    /** @var Ontology&MockObject */
    private Ontology $ontology;

    /** @var Service&MockObject */
    private Service $qtiItemService;

    /** @var ClassDeleter&MockObject */
    private ClassDeleter $classDeleter;

    /** @var TaoMediaResolver&MockObject */
    private TaoMediaResolver $taoMediaResolver;

    /** @var taoTests_models_classes_TestsService&MockObject */
    private taoTests_models_classes_TestsService $testsService;

    /** @var taoItems_models_classes_ItemsService&MockObject */
    private taoItems_models_classes_ItemsService $itemsService;

    /** @var ElementReferencesExtractor&MockObject */
    private ElementReferencesExtractor $elementReferencesExtractor;

    /** @var (MediaClassSpecification&MockObject)|null */
    private ?MediaClassSpecification $mediaClassSpecification;

    /** @var (MediaService&MockObject)|null */
    private ?MediaService $mediaService;

    private ?TestDeleter $deleter;
    private ?TestDeleter $assetAwareDeleter;

    protected function setUp(): void
    {
        if (!class_exists(taoItems_models_classes_ItemsService::class)) {
            $this->markTestSkipped('This test needs taoItems to be present');
        }

        if (!class_exists(taoTests_models_classes_TestsService::class)) {
            $this->markTestSkipped('This test needs taoTests to be present');
        }

        $this->logger = $this->createMock(LoggerInterface::class);
        $this->ontology = $this->createMock(Ontology::class);
        $this->qtiItemService = $this->createMock(Service::class);
        $this->classDeleter = $this->createMock(ClassDeleter::class);
        $this->taoMediaResolver = $this->createMock(TaoMediaResolver::class);
        $this->testsService = $this->createMock(taoTests_models_classes_TestsService::class);
        $this->itemsService = $this->createMock(taoItems_models_classes_ItemsService::class);
        $this->elementReferencesExtractor = $this->createMock(ElementReferencesExtractor::class);

        if (class_exists(MediaClassSpecification::class)) {
            $this->mediaClassSpecification = $this->createMock(MediaClassSpecification::class);
        }

        if (class_exists(MediaService::class)) {
            $this->mediaService = $this->createMock(MediaService::class);
        }

        if (
            $this->mediaService instanceof MediaService
            && $this->mediaClassSpecification instanceof MediaClassSpecification
        ) {
            $this->assetAwareDeleter = new TestDeleter(
                $this->logger,
                $this->ontology,
                $this->classDeleter,
                $this->elementReferencesExtractor,
                $this->qtiItemService,
                $this->taoMediaResolver,
                $this->itemsService,
                $this->testsService,
                $this->mediaClassSpecification,
                $this->mediaService
            );
        } else {
            $this->deleter = new TestDeleter(
                $this->logger,
                $this->ontology,
                $this->classDeleter,
                $this->elementReferencesExtractor,
                $this->qtiItemService,
                $this->taoMediaResolver,
                $this->itemsService,
                $this->testsService,
                null,
                null
            );
        }
    }

    public function testSomething(

    ): void {
        $this->markTestIncomplete('Not implemented');
    }
}
