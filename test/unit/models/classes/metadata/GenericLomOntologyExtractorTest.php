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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes\metadata;

use DOMDocument;
use oat\generis\model\data\Ontology;
use oat\taoQtiTest\models\classes\metadata\ChecksumGenerator;
use oat\taoQtiTest\models\classes\metadata\GenericLomOntologyExtractor;
use oat\taoQtiTest\models\classes\metadata\MetadataLomService;
use oat\taoQtiTest\models\classes\metadata\metaMetadata\PropertyMapper;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use oat\taoQtiItem\model\qti\metadata\MetadataExtractionException;
use core_kernel_classes_Resource as Resource;
use core_kernel_classes_Property as Property;
use core_kernel_classes_Triple as Triple;

class GenericLomOntologyExtractorTest extends TestCase
{
    private MockObject|Ontology $ontologyMock;
    private PropertyMapper|MockObject $propertyMapperMock;
    private MetadataLomService|MockObject $metadataLomServiceMock;
    private GenericLomOntologyExtractor $subject;

    public function setUp(): void
    {
        $this->ontologyMock = $this->createMock(Ontology::class);
        $this->propertyMapperMock = $this->createMock(PropertyMapper::class);
        $this->metadataLomServiceMock = $this->createMock(MetadataLomService::class);

        $this->subject = new GenericLomOntologyExtractor(
            $this->ontologyMock,
            $this->propertyMapperMock,
            $this->metadataLomServiceMock,
        );
    }

    /**
     * @noinspection PhpParamsInspection
     */
    public function testExtractExceptionForCollectionWithNonResourceContent(): void
    {
        $this->expectException(MetadataExtractionException::class);
        $resourceCollection = ['ResourceThatIsAString'];
        $manifest = new DOMDocument();

        $this->subject->extract($resourceCollection, $manifest);
    }

    public function testExtract(): void
    {
        $resourceMock = $this->createMock(Resource::class);
        $tripleMock1 = $this->createMock(Triple::class);
        $tripleMock2 = $this->createMock(Triple::class);
        $tripleMock3 = $this->createMock(Triple::class);
        $propertyMock = $this->createMock(Property::class);
        $manifest = new DOMDocument();
        $tripleMock1->predicate = 'predicate1';
        $tripleMock2->predicate = 'predicate2';
        $tripleMock3->predicate = 'predicate3';

        $resourceMock->method('getRdfTriples')->willReturn([
            $tripleMock1,
            $tripleMock2,
            $tripleMock3
        ]);

        $propertyMock
            ->method('isProperty')
            ->willReturn(true);

        $this->ontologyMock
            ->method('getProperty')
            ->willReturn($propertyMock);

        $this->propertyMapperMock
            ->method('getMetadataProperties')
            ->willReturnOnConsecutiveCalls(
                ['uri' => 'predicate1'],
                ['uri' => 'predicate2'],
                ['uri' => 'predicate3'],
                ['uri' => 'predicate1'],
                ['uri' => 'predicate2'],
                ['uri' => 'predicate3']
            );

        $this->metadataLomServiceMock
            ->expects($this->once())
            ->method('addPropertiesToMetadataBlock')
            ->with([
                ['uri' => 'predicate1'],
                ['uri' => 'predicate2'],
                ['uri' => 'predicate3'],
            ], $manifest);

        $this->subject->extract([$resourceMock, $resourceMock], $manifest);
    }
}
