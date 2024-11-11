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
use oat\tao\model\Translation\Exception\ResourceTranslationException;
use oat\taoQtiTest\models\Translation\Service\TestTranslator;
use oat\taoQtiTest\models\Translation\Service\TranslationPostCreationService;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Throwable;

class TranslationPostCreationServiceTest extends TestCase
{
    /** @var core_kernel_classes_Resource|MockObject */
    private $resource;

    /** @var TestTranslator|MockObject */
    private $testTranslator;

    /** @var LoggerInterface|MockObject */
    private $logger;

    private TranslationPostCreationService $sut;

    protected function setUp(): void
    {
        $this->resource = $this->createMock(core_kernel_classes_Resource::class);

        $this->testTranslator = $this->createMock(TestTranslator::class);
        $this->logger = $this->createMock(LoggerInterface::class);

        $this->sut = new TranslationPostCreationService($this->testTranslator, $this->logger);
    }

    public function testService(): void
    {
        $this->testTranslator
            ->expects($this->once())
            ->method('translate')
            ->with($this->resource)
            ->willReturn($this->resource);

        $this->logger
            ->expects($this->never())
            ->method('error');

        $this->assertEquals($this->resource, $this->sut->__invoke($this->resource));
    }

    public function testServiceException(): void
    {
        $this->testTranslator
            ->expects($this->once())
            ->method('translate')
            ->with($this->resource)
            ->willThrowException($this->createMock(Throwable::class));

        $this->logger
            ->expects($this->once())
            ->method('error');

        $this->resource
            ->expects($this->once())
            ->method('getUri')
            ->willReturn('resourceUri');

        $this->expectException(ResourceTranslationException::class);
        $this->expectExceptionMessage('An error occurred while trying to translate the test resourceUri.');

        $this->sut->__invoke($this->resource);
    }
}
