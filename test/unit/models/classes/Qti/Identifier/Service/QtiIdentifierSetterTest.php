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

namespace oat\taoQtiTest\test\unit\models\classes\Qti\Identifier\Service;

use core_kernel_classes_Resource;
use oat\tao\model\Translation\Service\AbstractQtiIdentifierSetter;
use oat\taoQtiTest\models\Qti\Identifier\Service\QtiIdentifierSetter;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use taoQtiTest_models_classes_QtiTestService;

class QtiIdentifierSetterTest extends TestCase
{
    /** @var core_kernel_classes_Resource|MockObject */
    private core_kernel_classes_Resource $resource;

    /** @var taoQtiTest_models_classes_QtiTestService|MockObject */
    private taoQtiTest_models_classes_QtiTestService $qtiTestService;

    private QtiIdentifierSetter $sut;

    protected function setUp(): void
    {
        $this->resource = $this->createMock(core_kernel_classes_Resource::class);
        $this->qtiTestService = $this->createMock(taoQtiTest_models_classes_QtiTestService::class);

        $this->sut = new QtiIdentifierSetter(
            $this->qtiTestService,
            $this->createMock(LoggerInterface::class)
        );
    }

    public function testSetWithItemData(): void
    {
        $this->qtiTestService
            ->expects($this->once())
            ->method('getJsonTest')
            ->with($this->resource)
            ->willReturn(json_encode(['identifier' => 'oldIdentifier']));

        $this->qtiTestService
            ->expects($this->once())
            ->method('saveJsonTest')
            ->with($this->resource, json_encode(['identifier' => 'newIdentifier']));

        $this->sut->set([
            AbstractQtiIdentifierSetter::OPTION_RESOURCE => $this->resource,
            AbstractQtiIdentifierSetter::OPTION_IDENTIFIER => 'newIdentifier',
        ]);
    }
}
