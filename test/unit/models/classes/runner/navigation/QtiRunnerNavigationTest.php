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
 * Copyright (c) 2023 (original work) Open Assessment Technologies SA.
 */

namespace oat\taoQtiTest\test\unit\models\classes\runner\navigation;

use oat\generis\test\TestCase;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoDelivery\model\execution\DeliveryExecutionInterface;
use oat\taoDelivery\model\execution\ServiceProxy as TaoDeliveryServiceProxy;
use oat\taoQtiTest\models\runner\navigation\QtiRunnerNavigation;
use oat\taoQtiTest\models\runner\QtiRunnerPausedException;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\session\TestSession;
use qtism\runtime\tests\AssessmentTestSessionState;
use common_Logger;
use core_kernel_classes_Resource;

class QtiRunnerNavigationTest extends TestCase
{
    /**
     * @runInSeparateProcess as it modifies the global state
     */
    public function testMoveFailsForSuspendedSession(): void
    {
        if (!class_exists(TaoDeliveryServiceProxy::class)) {
            $this->markTestSkipped('This test needs ' . TaoDeliveryServiceProxy::class);
        }

        $testSession = $this->createMock(TestSession::class);
        $testSession
            ->expects($this->atLeastOnce())
            ->method('getState')
            ->willReturn(AssessmentTestSessionState::SUSPENDED);

        $context = $this->createMock(QtiRunnerServiceContext::class);
        $context
            ->expects($this->atLeastOnce())
            ->method('getTestSession')
            ->willReturn($testSession);

        QtiRunnerNavigation::setLogger($this->createMock(common_Logger::class));

        $this->expectException(QtiRunnerPausedException::class);

        QtiRunnerNavigation::move('next', 'item', $context, 'ref');
    }

    /**
     * @runInSeparateProcess as it modifies the global state
     */
    public function testMoveFailsForPausedExecution(): void
    {
        if (!class_exists(TaoDeliveryServiceProxy::class)) {
            $this->markTestSkipped('This test needs ' . TaoDeliveryServiceProxy::class);
        }

        $stateMock = $this->createMock(core_kernel_classes_Resource::class);
        $stateMock
            ->method('getUri')
            ->willReturn(DeliveryExecutionInterface::STATE_PAUSED);

        $execution = $this->createMock(DeliveryExecution::class);
        $execution
            ->method('getState')
            ->willReturn($stateMock);

        $context = $this->createMock(QtiRunnerServiceContext::class);
        $context
            ->expects($this->once())
            ->method('getTestExecutionUri')
            ->willReturn('http://execution/uri');

        $serviceMock = $this->createMock(TaoDeliveryServiceProxy::class);
        $serviceMock
            ->expects($this->once())
            ->method('getDeliveryExecution')
            ->with('http://execution/uri')
            ->willReturn($execution);

        $testSession = $this->createMock(TestSession::class);
        $testSession
            ->expects($this->atLeastOnce())
            ->method('getState')
            ->willReturn(AssessmentTestSessionState::INTERACTING);

        $context
            ->expects($this->atLeastOnce())
            ->method('getTestSession')
            ->willReturn($testSession);

        QtiRunnerNavigation::setDeliveryExecutionServiceProxy($serviceMock);
        QtiRunnerNavigation::setLogger($this->createMock(common_Logger::class));

        $this->expectException(QtiRunnerPausedException::class);

        QtiRunnerNavigation::move('next', 'item', $context, 'ref');
    }
}
