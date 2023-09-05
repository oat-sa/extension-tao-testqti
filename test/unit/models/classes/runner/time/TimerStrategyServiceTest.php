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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiTest\test\unit\models\classes\runner\time;

use oat\generis\test\TestCase;
use oat\taoQtiTest\models\runner\time\TimerStrategyService;

class TimerStrategyServiceTest extends TestCase
{
    /**
     * @dataProvider dataProviderTestRoundToMinutes
     * @param int $expected
     * @param int $time
     * @param int $multiplier
     */
    public function testRoundToMinutes($expected, $time, $multiplier)
    {
        $this->assertEquals(
            $expected,
            (new TimerStrategyService())->getExtraTime($time, $multiplier)
        );
    }

    /**
     * @return array
     */
    public function dataProviderTestRoundToMinutes()
    {
        return [
            [0, 60, 1],
            [1350, 2700, 1.5],
            [120, 30, 5],
            [0, 300, 0],
            [300, 300, 2],
            [330, 330, 2]
        ];
    }

    /**
     * @dataProvider dataProviderTestGetMultipliedTime
     * @param int $expected
     * @param int $time
     * @param int $multiplier
     */
    public function testGetMultipliedTime($expected, $time, $multiplier)
    {
        $this->assertEquals(
            $expected,
            (new TimerStrategyService())->getMultipliedTime($time, $multiplier)
        );
    }

    /**
     * @return array
     */
    public function dataProviderTestGetMultipliedTime()
    {
        return [
            [60, 60, 1],
            [90, 60, 1.5],
            [150, 30, 5],
            [300, 300, 0.5],
            [300, 300, 0]
        ];
    }
}
