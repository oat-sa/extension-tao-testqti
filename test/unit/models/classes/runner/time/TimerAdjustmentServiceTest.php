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
 * Copyright (c) 2020  (original work) Open Assessment Technologies SA;
 */
declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes\runner\time;

use oat\generis\test\TestCase;
use oat\taoQtiTest\models\runner\time\AdjustmentMap;
use oat\taoQtiTest\models\runner\time\QtiTimer;
use oat\taoQtiTest\models\runner\time\TimerAdjustmentService;
use qtism\data\QtiIdentifiable;

class TimerAdjustmentServiceTest extends TestCase
{
    public function testGetAdjustment(): void
    {
        $source = $this->createMock(QtiIdentifiable::class);
        $source->method('getIdentifier')->willReturn('PHPUnitItemId');
        $qtiTimer = $this->createMock(QtiTimer::class);

        $adjustmentMap = $this->createMock(AdjustmentMap::class);
        $adjustmentMap->method('get')->willReturn(10);
        $qtiTimer->method('getAdjustmentMap')->willReturn($adjustmentMap);

        $service = new TimerAdjustmentService();
        $this->assertSame(10, $service->getAdjustment($source, $qtiTimer));
    }
}
