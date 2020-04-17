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

namespace oat\taoQtiTest\models\runner\time\storageFormat;

use oat\taoQtiTest\models\runner\time\AdjustmentMap;
use oat\taoQtiTest\models\runner\time\QtiTimeLine;
use oat\taoTests\models\runner\time\TimeLine;
use oat\taoTests\models\runner\time\TimerAdjustmentMapInterface;

trait QtiTimeStorageObjectDecodingTrait
{
    private function decodeTimeline(array $data): array
    {
        if (array_key_exists(self::STORAGE_KEY_TIME_LINE, $data)
            && !$data[self::STORAGE_KEY_TIME_LINE] instanceof TimeLine) {
            $timeLine = new QtiTimeLine();
            $timeLine->fromArray($data[self::STORAGE_KEY_TIME_LINE]);
            $data[self::STORAGE_KEY_TIME_LINE] = $timeLine;
        }

        return $data;
    }

    private function decodeAdjustmentMap(array $data): array
    {
        if (array_key_exists(self::STORAGE_KEY_TIMER_ADJUSTMENT_MAP, $data)
            && !$data[self::STORAGE_KEY_TIMER_ADJUSTMENT_MAP] instanceof TimerAdjustmentMapInterface) {
            $map = new AdjustmentMap();
            $map->fromArray($data[self::STORAGE_KEY_TIMER_ADJUSTMENT_MAP]);
            $data[self::STORAGE_KEY_TIMER_ADJUSTMENT_MAP] = $map;
        }

        return $data;
    }
}
