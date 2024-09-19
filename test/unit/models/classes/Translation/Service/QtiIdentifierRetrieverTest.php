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
use Exception;
use oat\taoQtiTest\models\UniqueId\Service\QtiIdentifierRetriever;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use taoQtiTest_models_classes_QtiTestService;
use Throwable;

class QtiIdentifierRetrieverTest extends TestCase
{
    /** @var core_kernel_classes_Resource|MockObject */
    private core_kernel_classes_Resource $test;

    /** @var taoQtiTest_models_classes_QtiTestService|MockObject */
    private taoQtiTest_models_classes_QtiTestService $qtiTestService;

    /** @var LoggerInterface|MockObject */
    private $logger;

    private QtiIdentifierRetriever $sut;

    protected function setUp(): void
    {
        $this->test = $this->createMock(core_kernel_classes_Resource::class);

        $this->qtiTestService = $this->createMock(taoQtiTest_models_classes_QtiTestService::class);
        $this->logger = $this->createMock(LoggerInterface::class);

        $this->sut = new QtiIdentifierRetriever($this->qtiTestService, $this->logger);
    }

    public function testRetrieve(): void
    {
        $this->qtiTestService
            ->expects($this->once())
            ->method('getJsonTest')
            ->with($this->test)
            ->willReturn('{"identifier":"qtiIdentifier"}');

        $this->assertEquals('qtiIdentifier', $this->sut->retrieve($this->test));
    }

    public function testRetrieveNoIdentifier(): void
    {
        $this->qtiTestService
            ->expects($this->once())
            ->method('getJsonTest')
            ->with($this->test)
            ->willReturn('[]');

        $this->assertEquals(null, $this->sut->retrieve($this->test));
    }

    public function testRetrieveException(): void
    {
        $this->qtiTestService
            ->expects($this->once())
            ->method('getJsonTest')
            ->with($this->test)
            ->willThrowException(new Exception('error'));

        $this->logger
            ->expects($this->once())
            ->method('error')
            ->with('An error occurred while retrieving test data: error');

        $this->expectException(Throwable::class);

        $this->sut->retrieve($this->test);
    }
}
