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

namespace oat\taoQtiTest\models\runner\time;

use oat\taoTests\models\runner\time\TimerAdjustmentMapInterface;
use oat\taoTests\models\runner\time\ArraySerializable;

class AdjustmentMap implements TimerAdjustmentMapInterface, \JsonSerializable, ArraySerializable
{
    private $map = [];

    /**
     * @inheritDoc
     */
    public function put($sourceId, $action, $seconds)
    {
        if (empty($sourceId) || !$this->isValidAction($action) || !$seconds) {
            return false;
        }
        $this->ensureEntryInitialized($sourceId);
        $this->map[$sourceId][$action] += $seconds;

        return $this;
    }

    /**
     * @inheritDoc
     */
    public function get($sourceId)
    {
        if (!isset($this->map[$sourceId])) {
            return 0;
        }

        return $this->map[$sourceId][self::ACTION_INCREASE] - $this->map[$sourceId][self::ACTION_DECREASE];
    }

    /**
     * @inheritDoc
     */
    public function clear()
    {
        $this->map = [];

        return $this;
    }

    /**
     * @inheritDoc
     */
    public function remove($sourceId)
    {
        unset($this->map[$sourceId]);

        return $this;
    }

    public function jsonSerialize()
    {
        return $this->map;
    }

    public function toArray()
    {
        return $this->map;
    }

    public function fromArray($map)
    {
        $this->map = [];
        if (is_array($map)) {
            $this->map = $map;
        }
    }

    private function isValidAction($action)
    {
        return in_array($action, [self::ACTION_INCREASE, self::ACTION_DECREASE], true);
    }

    private function ensureEntryInitialized($sourceId)
    {
        if (!isset($this->map[$sourceId][self::ACTION_INCREASE])) {
            $this->map[$sourceId][self::ACTION_INCREASE] = 0;
        }
        if (!isset($this->map[$sourceId][self::ACTION_DECREASE])) {
            $this->map[$sourceId][self::ACTION_DECREASE] = 0;
        }
    }
}