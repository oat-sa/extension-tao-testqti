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

declare(strict_types=1);

namespace oat\taoQtiTest\models\runner\time;

use JsonSerializable;
use oat\taoTests\models\runner\time\TimerAdjustmentMapInterface;
use oat\taoTests\models\runner\time\ArraySerializable;

class AdjustmentMap implements TimerAdjustmentMapInterface, JsonSerializable, ArraySerializable
{
    public const ACTION_DECREASE = 'decrease';
    public const ACTION_INCREASE = 'increase';

    private $map = [];

    /**
     * @inheritDoc
     */
    public function increase(string $sourceId, int $seconds): TimerAdjustmentMapInterface
    {
        return $this->put($sourceId, self::ACTION_INCREASE, $seconds);
    }

    /**
     * @inheritDoc
     */
    public function decrease(string $sourceId, int $seconds): TimerAdjustmentMapInterface
    {
        return $this->put($sourceId, self::ACTION_DECREASE, $seconds);
    }

    /**
     * @inheritDoc
     */
    public function get(string $sourceId): int
    {
        if (!isset($this->map[$sourceId])) {
            return 0;
        }

        return $this->map[$sourceId][self::ACTION_INCREASE] - $this->map[$sourceId][self::ACTION_DECREASE];
    }

    /**
     * @inheritDoc
     */
    public function remove(string $sourceId): TimerAdjustmentMapInterface
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

    private function put(string $sourceId, string $action, int $seconds): TimerAdjustmentMapInterface
    {
        if (empty($sourceId) || !$this->isValidAction($action) || !$seconds) {
            throw new \InvalidArgumentException('Provided arguments should not be empty.');
        }
        $this->ensureEntryInitialized($sourceId);
        $this->map[$sourceId][$action] += $seconds;

        return $this;
    }

    private function isValidAction(string $action): bool
    {
        return in_array($action, [self::ACTION_INCREASE, self::ACTION_DECREASE], true);
    }

    private function ensureEntryInitialized(string $sourceId)
    {
        if (!isset($this->map[$sourceId][self::ACTION_INCREASE])) {
            $this->map[$sourceId][self::ACTION_INCREASE] = 0;
        }
        if (!isset($this->map[$sourceId][self::ACTION_DECREASE])) {
            $this->map[$sourceId][self::ACTION_DECREASE] = 0;
        }
    }
}
