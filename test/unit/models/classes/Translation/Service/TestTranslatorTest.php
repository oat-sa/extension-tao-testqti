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
    private $translationTest;

    /** @var taoQtiTest_models_classes_QtiTestService|MockObject */
    private $testQtiService;

    /** @var Ontology|MockObject */
    private $ontology;

    /** @var ResourceTranslationRepository|MockObject */
    private $resourceTranslationRepository;

    private TestTranslator $sut;

    protected function setUp(): void
    {
        $this->translationTest = $this->createMock(core_kernel_classes_Resource::class);

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

        $this->translationTest
            ->expects($this->once())
            ->method('isInstanceOf')
            ->with($rootClass)
            ->willReturn(true);

        $translationOriginalResourceUriProperty = $this->createMock(core_kernel_classes_Property::class);
        $languageProperty = $this->createMock(core_kernel_classes_Property::class);
        $translationCompletionProperty = $this->createMock(core_kernel_classes_Property::class);

        $this->ontology
            ->expects($this->exactly(3))
            ->method('getProperty')
            ->withConsecutive(
                [TaoOntology::PROPERTY_TRANSLATION_ORIGINAL_RESOURCE_URI],
                [TaoOntology::PROPERTY_LANGUAGE],
                [TaoTestOntology::PROPERTY_TRANSLATION_COMPLETION],
            )
            ->willReturnOnConsecutiveCalls(
                $translationOriginalResourceUriProperty,
                $languageProperty,
                $translationCompletionProperty
            );

        $originalTestUri = $this->createMock(core_kernel_classes_Resource::class);
        $originalTestUri
            ->expects($this->once())
            ->method('getUri')
            ->willReturn('originalTestUri');

        $translationLanguage = $this->createMock(core_kernel_classes_Resource::class);
        $translationLanguage
            ->expects($this->once())
            ->method('getUri')
            ->willReturn('translationLanguageUri');

        $this->translationTest
            ->expects($this->exactly(2))
            ->method('getOnePropertyValue')
            ->withConsecutive(
                [$translationOriginalResourceUriProperty],
                [$languageProperty]
            )
            ->willReturnOnConsecutiveCalls($originalTestUri, $translationLanguage);

        $originalTest = $this->createMock(core_kernel_classes_Resource::class);

        $this->ontology
            ->expects($this->once())
            ->method('getResource')
            ->with('originalTestUri')
            ->willReturn($originalTest);

        $this->testQtiService
            ->expects($this->once())
            ->method('getJsonTest')
            ->with($originalTest)
            ->willReturn('{"testParts":[{"assessmentSections":[{"sectionParts":[{"href":"originalItemUri"}]}]}]}');

        $translationResource = $this->createMock(ResourceTranslation::class);

        $this->resourceTranslationRepository
            ->expects($this->once())
            ->method('find')
            ->with(new ResourceTranslationQuery(['originalItemUri'], 'translationLanguageUri'))
            ->willReturn(new ResourceCollection($translationResource));

        $translationResource
            ->expects($this->once())
            ->method('getOriginResourceUri')
            ->willReturn('originalItemUri');

        $translationResource
            ->expects($this->once())
            ->method('getResourceUri')
            ->willReturn('translationItemUri');

        $this->testQtiService
            ->expects($this->once())
            ->method('saveJsonTest')
            ->with(
                $this->translationTest,
                '{"testParts":[{"assessmentSections":[{"sectionParts":[{"href":"translationItemUri"}]}]}]}'
            );

        $this->translationTest
            ->expects($this->once())
            ->method('editPropertyValues')
            ->with(
                $translationCompletionProperty,
                TaoTestOntology::PROPERTY_VALUE_TRANSLATION_COMPLETION_TRANSLATED
            );

        $this->assertEquals($this->translationTest, $this->sut->translate($this->translationTest));
    }
}
