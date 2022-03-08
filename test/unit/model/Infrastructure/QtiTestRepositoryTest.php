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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\model\Service;

use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\generis\test\TestCase;
use oat\taoDeliveryRdf\model\DeliveryAssemblyService;
use oat\taoQtiItem\model\qti\Item;
use oat\taoQtiItem\model\qti\Service;
use oat\taoQtiTest\model\Domain\Model\QtiTest;
use oat\taoQtiTest\model\Infrastructure\QtiTestRepository;
use oat\taoQtiTest\models\TestModelService;
use PHPUnit\Framework\MockObject\MockObject;

class QtiTestRepositoryTest extends TestCase
{
    private const DELIVERY_URI = 'deliveryAbc123';
    private const TEST_URI = 'testAbc123';

    /** @var QtiTestRepository */
    private $subject;

    /** @var Ontology|MockObject */
    private $ontology;

    /** @var TestModelService|MockObject */
    private $testModelService;

    /** @var Service|MockObject */
    private $qtiItemService;

    public function setUp(): void
    {
        $this->ontology = $this->createMock(Ontology::class);
        $this->testModelService = $this->createMock(TestModelService::class);
        $this->qtiItemService = $this->createMock(Service::class);

        $this->subject = new QtiTestRepository(
            $this->ontology,
            $this->testModelService,
            $this->qtiItemService
        );
    }

    public function testFindByDelivery(): void
    {
        $this->setUpFindByDelivery();

        $language = 'en-US';
        $item = $this->createMock(core_kernel_classes_Resource::class);
        $qtiItem = $this->createMock(Item::class);

        $qtiItem->method('getAttributeValue')
            ->with('xml:lang')
            ->willReturn($language);

        $this->testModelService
            ->method('getItems')
            ->willReturn(
                [
                    $item,
                ]
            );

        $this->qtiItemService
            ->method('getDataItemByRdfItem')
            ->with($item)
            ->willReturn($qtiItem);

        $this->assertEquals(
            new QtiTest(self::TEST_URI, $language),
            $this->subject->findByDelivery(self::DELIVERY_URI)
        );
    }

    public function testFindByDeliveryWithoutTestItemsWillReturnNull(): void
    {
        $this->setUpFindByDelivery();

        $this->testModelService
            ->method('getItems')
            ->willReturn([]);

        $this->assertEquals(
            new QtiTest(self::TEST_URI, null),
            $this->subject->findByDelivery(self::DELIVERY_URI)
        );
    }

    public function testFindByDeliveryWithoutRdfTestItemWillReturnNull(): void
    {
        $this->setUpFindByDelivery();

        $item = $this->createMock(core_kernel_classes_Resource::class);

        $this->testModelService
            ->method('getItems')
            ->willReturn(
                [
                    $item,
                ]
            );

        $this->qtiItemService
            ->method('getDataItemByRdfItem')
            ->with($item)
            ->willReturn(null);

        $this->assertEquals(
            new QtiTest(self::TEST_URI, null),
            $this->subject->findByDelivery(self::DELIVERY_URI)
        );
    }

    private function setUpFindByDelivery(): void
    {
        $test = $this->createMock(core_kernel_classes_Resource::class);
        $delivery = $this->createMock(core_kernel_classes_Resource::class);
        $deliveryTestProperty = $this->createMock(core_kernel_classes_Property::class);

        $delivery->method('getProperty')
            ->with(DeliveryAssemblyService::PROPERTY_ORIGIN)
            ->willReturn($deliveryTestProperty);

        $delivery->method('getOnePropertyValue')
            ->with($deliveryTestProperty)
            ->willReturn($test);

        $test->method('getUri')
            ->willReturn(self::TEST_URI);

        $this->ontology
            ->expects($this->at(0))
            ->method('getResource')
            ->with(self::DELIVERY_URI)
            ->willReturn($delivery);

        $this->ontology
            ->expects($this->at(1))
            ->method('getResource')
            ->with(self::TEST_URI)
            ->willReturn($test);
    }
}
