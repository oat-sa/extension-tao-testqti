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

use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\tao\model\TaoOntology;
use oat\tao\model\Translation\Entity\ResourceTranslatableStatus;
use oat\taoQtiTest\models\Translation\Service\ResourceTranslatableStatusHandler;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use taoQtiTest_models_classes_QtiTestService;

class ResourceTranslatableStatusHandlerTest extends TestCase
{
    /** @var core_kernel_classes_Resource|MockObject */
    private $test;

    /** @var taoQtiTest_models_classes_QtiTestService|MockObject */
    private $testQtiService;

    /** @var Ontology|MockObject */
    private $ontology;

    private ResourceTranslatableStatusHandler $sut;
    private ResourceTranslatableStatus $status;

    protected function setUp(): void
    {
        $this->test = $this->createMock(core_kernel_classes_Resource::class);
        $this->testQtiService = $this->createMock(taoQtiTest_models_classes_QtiTestService::class);
        $this->ontology = $this->createMock(Ontology::class);
        $this->status = new ResourceTranslatableStatus(
            'testUri',
            TaoOntology::CLASS_URI_TEST,
            'languageUri',
            true,
            true
        );

        $this->sut = new ResourceTranslatableStatusHandler($this->testQtiService, $this->ontology);
    }

    public function testMustMarkAsEmptyIfTestHasNoItems(): void
    {
        $this->ontology
            ->expects($this->once())
            ->method('getResource')
            ->with('testUri')
            ->willReturn($this->test);

        $this->testQtiService
            ->expects($this->once())
            ->method('getItems')
            ->with($this->test)
            ->willReturn([]);

        $this->sut->__invoke($this->status);

        $this->assertTrue($this->status->isEmpty());
    }

    public function testMustMarkAsNotEmptyIfTestHasNoItems(): void
    {
        $this->ontology
            ->expects($this->once())
            ->method('getResource')
            ->with('testUri')
            ->willReturn($this->test);

        $this->testQtiService
            ->expects($this->once())
            ->method('getItems')
            ->with($this->test)
            ->willReturn([
                $this->createMock(core_kernel_classes_Resource::class)
            ]);

        $this->sut->__invoke($this->status);

        $this->assertFalse($this->status->isEmpty());
    }
}
