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

namespace oat\taoQtiTest\test\unit\models\classes\metadata\metaMetadata;

use core_kernel_classes_Class;
use core_kernel_classes_Literal;
use core_kernel_classes_Property as Property;
use core_kernel_classes_Resource as Resource;
use oat\generis\model\GenerisRdf;
use oat\taoQtiTest\models\classes\metadata\ChecksumGenerator;
use oat\taoQtiTest\models\classes\metadata\metaMetadata\PropertyMapper;
use PHPUnit\Framework\TestCase;

class PropertyMapperTest extends TestCase
{
    public function setUp(): void
    {
        $this->checksumGeneratorMock = $this->createMock(ChecksumGenerator::class);
        $this->metaMetadataCollectionToExport = [
            'label' => RDFS_LABEL,
            'domain' => RDFS_DOMAIN,
            'alias' => GenerisRdf::PROPERTY_ALIAS,
            'multiple' => GenerisRdf::PROPERTY_MULTIPLE
        ];

        $this->subject  = new PropertyMapper($this->checksumGeneratorMock, $this->metaMetadataCollectionToExport);
    }

    public function testGetMetadataProperties(): void
    {
        $property = $this->createMock(Property::class);
        $resourceMock = $this->createMock(Resource::class);
        $property->method('getUri')->willReturn('uri');
        $resourceMock->method('getUri')->willReturn('resource_uri');

        $property
            ->method('getOnePropertyValue')
            ->willReturnOnConsecutiveCalls(
                $resourceMock,
                'value',
                new core_kernel_classes_Literal('literal_value'),
                null
            );

        $this->checksumGeneratorMock
            ->method('getRangeChecksum')
            ->willReturn('c315a4bd4fa0f4479b1ea4b5998aa548eed3b670');


        $result = $this->subject->getMetadataProperties($property);

        $this->assertIsArray($result);
        $this->assertArrayHasKey('uri', $result);
        $this->assertArrayHasKey('label', $result);
        $this->assertArrayHasKey('domain', $result);
        $this->assertArrayHasKey('alias', $result);
        $this->assertArrayNotHasKey('multiple', $result);
        $this->assertArrayHasKey(PropertyMapper::DATATYPE_CHECKSUM, $result);
        $this->assertEquals('uri', $result['uri']);
        $this->assertEquals('resource_uri', $result['label']);
        $this->assertEquals('value', $result['domain']);
        $this->assertEquals('literal_value', $result['alias']);
        $this->assertEquals('c315a4bd4fa0f4479b1ea4b5998aa548eed3b670', $result['checksum']);
    }
}
