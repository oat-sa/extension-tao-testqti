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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes\Translation\Service;

use core_kernel_classes_Class;
use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\tao\model\TaoOntology;
use oat\tao\model\Translation\Entity\ResourceCollection;
use oat\tao\model\Translation\Entity\ResourceTranslation;
use oat\tao\model\Translation\Query\ResourceTranslationQuery;
use oat\tao\model\Translation\Repository\ResourceTranslationRepository;
use oat\taoQtiTest\models\Translation\Service\TestTranslator;
use oat\taoTests\models\TaoTestOntology;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use taoQtiTest_models_classes_QtiTestService;

class TestTranslatorTest extends TestCase
{
    /** @var core_kernel_classes_Resource|MockObject */
    private $resource;

    /** @var taoQtiTest_models_classes_QtiTestService|MockObject */
    private $testQtiService;

    /** @var Ontology|MockObject */
    private $ontology;

    /** @var ResourceTranslationRepository|MockObject */
    private $resourceTranslationRepository;

    private TestTranslator $sut;

    protected function setUp(): void
    {
        $this->resource = $this->createMock(core_kernel_classes_Resource::class);

        $this->testQtiService = $this->createMock(taoQtiTest_models_classes_QtiTestService::class);
        $this->ontology = $this->createMock(Ontology::class);
        $this->resourceTranslationRepository = $this->createMock(ResourceTranslationRepository::class);

        $this->sut = new TestTranslator($this->testQtiService, $this->ontology, $this->resourceTranslationRepository);
    }

    public function testTranslate(): void
    {
        $rootClass = $this->createMock(core_kernel_classes_Class::class);

        $this->ontology
            ->expects($this->once())
            ->method('getClass')
            ->with(TaoOntology::CLASS_URI_TEST)
            ->willReturn($rootClass);

        $this->resource
            ->expects($this->once())
            ->method('isInstanceOf')
            ->with($rootClass)
            ->willReturn(true);

        $this->testQtiService
            ->expects($this->once())
            ->method('getJsonTest')
            ->with($this->resource)
            ->willReturn('{"testParts":[{"assessmentSections":[{"sectionParts":[{"href":"originResourceUri"}]}]}]}');

        $translationResource = $this->createMock(core_kernel_classes_Resource::class);

        $this->ontology
            ->expects($this->once())
            ->method('getResource')
            ->with('originResourceUri')
            ->willReturn($translationResource);

        $uniqueIdProperty = $this->createMock(core_kernel_classes_Property::class);
        $languageProperty = $this->createMock(core_kernel_classes_Property::class);
        $completionProperty = $this->createMock(core_kernel_classes_Property::class);

        $this->ontology
            ->expects($this->exactly(3))
            ->method('getProperty')
            ->withConsecutive(
                [TaoOntology::PROPERTY_UNIQUE_IDENTIFIER],
                [TaoOntology::PROPERTY_LANGUAGE],
                [TaoTestOntology::PROPERTY_TRANSLATION_COMPLETION]
            )
            ->willReturnOnConsecutiveCalls($uniqueIdProperty, $languageProperty, $completionProperty);

        $uniqueId = $this->createMock(core_kernel_classes_Resource::class);
        $uniqueId
            ->method('__toString')
            ->willReturn('uniqueId');

        $translationResource
            ->expects($this->once())
            ->method('getOnePropertyValue')
            ->with($uniqueIdProperty)
            ->willReturn($uniqueId);

        $language = $this->createMock(core_kernel_classes_Resource::class);
        $language
            ->expects($this->once())
            ->method('getUri')
            ->willReturn('languageUri');

        $this->resource
            ->expects($this->once())
            ->method('getOnePropertyValue')
            ->with($languageProperty)
            ->willReturn($language);

        $translation = $this->createMock(ResourceTranslation::class);

        $this->resourceTranslationRepository
            ->expects($this->once())
            ->method('find')
            ->willReturn(new ResourceCollection($translation));

        $translation
            ->expects($this->once())
            ->method('getOriginResourceUri')
            ->willReturn('originResourceUri');

        $translation
            ->expects($this->once())
            ->method('getResourceUri')
            ->willReturn('translationResourceUri');

        $this->testQtiService
            ->expects($this->once())
            ->method('saveJsonTest')
            ->with(
                $this->resource,
                '{"testParts":[{"assessmentSections":[{"sectionParts":[{"href":"translationResourceUri"}]}]}]}'
            );

        $this->resource
            ->expects($this->once())
            ->method('editPropertyValues')
            ->with($completionProperty, TaoTestOntology::PROPERTY_VALUE_TRANSLATION_COMPLETION_TRANSLATED);

        $this->assertEquals($this->resource, $this->sut->translate($this->resource));
    }
}
