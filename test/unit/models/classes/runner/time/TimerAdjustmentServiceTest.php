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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA ;
 */

namespace oat\taoQtiTest\test\unit\models\classes\runner\time;

use oat\generis\test\TestCase;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoQtiTest\models\runner\session\TestSession;
use oat\taoQtiTest\models\runner\StorageManager;
use oat\taoQtiTest\models\runner\time\QtiTimer;
use oat\taoQtiTest\models\runner\time\TimerAdjustmentService;
use oat\taoQtiTest\models\TestSessionService;
use qtism\data\QtiIdentifiable;
use qtism\data\TimeLimits;

class TimerAdjustmentServiceTest extends TestCase
{
    public function testIncrease_WhenRequested_ThenIncreaseIsRegisteredToAllActiveTimeConstraints()
    {
        $serviceLocatorMock = $this->getServiceLocatorMock([
            StorageManager::SERVICE_ID => $this->getStorageManagerMock(),
            TestSessionService::SERVICE_ID => $this->getTestSessionServiceMock(),
        ]);

        $service = new TimerAdjustmentService();
        $service->setServiceLocator($serviceLocatorMock);
        $service->increase($this->getDeliveryExecutionMock(), 60);
    }

    public function testDecrease_WhenRequested_ThenDecreaseIsRegisteredToAllActiveTimeConstraints()
    {
        $this->markTestIncomplete();
    }

    public function testDecrease_WhenRequestedDecreaseIsLargerThanMaxPossible_ThenMaxPossibleIsDecreased()
    {
        $this->markTestIncomplete();
    }

    /**
     * @return DeliveryExecution|\PHPUnit\Framework\MockObject\MockObject
     */
    private function getDeliveryExecutionMock()
    {
        return $this->createMock(DeliveryExecution::class);
    }

    /**
     * @return TestSessionService|\PHPUnit\Framework\MockObject\MockObject
     */
    private function getTestSessionServiceMock()
    {
        $itemMock = $this->createMock(QtiIdentifiable::class);
        $itemMock->method('getTimeLimits')->willReturn(new TimeLimits(null, 60));
        $itemMock->method('getIdentifier')->willReturn('itemId-1');

        $testSessionMock = $this->createMock(TestSession::class);
        $testSessionMock->method('getTimer')->willReturn(new QtiTimer());
        $testSessionMock->method('getCurrentAssessmentItemRef')->willReturn();
        $testSessionMock->method('getCurrentAssessmentSection')->willReturn();
        $testSessionMock->method('getCurrentTestPart')->willReturn();
        $testSessionMock->method('getAssessmentTest')->willReturn();
        $testSessionServiceMock = $this->createMock(TestSessionService::class);
        $testSessionServiceMock->method('getTestSession')->willReturn($testSessionMock);

        return $testSessionServiceMock;
    }

    /**
     * @return StorageManager|\PHPUnit\Framework\MockObject\MockObject
     */
    private function getStorageManagerMock()
    {
        return $this->createMock(StorageManager::class);
    }
}
