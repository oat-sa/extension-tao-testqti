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

use core_kernel_classes_Class as ClassResource;
use core_kernel_classes_Property as Property;
use core_kernel_classes_Resource as Resource;
use oat\generis\model\data\Ontology;
use oat\taoQtiTest\models\classes\metadata\ChecksumGenerator;
use PHPUnit\Framework\TestCase;

class ChecksumGeneratorTest extends TestCase
{
    public function setUp(): void
    {
        $this->propertyMock = $this->createMock(Property::class);
        $this->ontologyMock = $this->createMock(Ontology::class);
        $this->checksumGenerator = new ChecksumGenerator($this->ontologyMock);
    }

    public function testGetRangeChecksum(): void
    {
        $classMock = $this->createMock(ClassResource::class);
        $resourceMock = $this->createMock(Resource::class);

        $classMock->method('getNestedResources')->willReturn(
            [
                [
                    'id' => 'id',
                    'isclass' => 1,
                ],
                [
                    'id' => 'non_class_id',
                    'isclass' => 0,
                ],
                [
                    'id' => 'non_class_id_2',
                    'isclass' => 0,
                ]
            ]
        );

        $resourceMock->expects($this->exactly(2))
            ->method('getLabel')
            ->willReturn('label');

        $this->propertyMock->method('getRange')->willReturn($classMock);
        $this->ontologyMock
            ->expects($this->exactly(2))
            ->method('getResource')
            ->with($this->logicalOr(
                $this->equalTo('non_class_id'),
                $this->equalTo('non_class_id_2')
            ))
            ->willReturn($resourceMock);

        $this->assertEquals(
            'c315a4bd4fa0f4479b1ea4b5998aa548eed3b670',
            $this->checksumGenerator->getRangeChecksum($this->propertyMock)
        );
    }
}
