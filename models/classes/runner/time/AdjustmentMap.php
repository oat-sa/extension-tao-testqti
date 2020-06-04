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
    public function increase(string $sourceId, string $type, int $seconds): TimerAdjustmentMapInterface
    {
        return $this->put($sourceId, $type, self::ACTION_INCREASE, $seconds);
    }

    /**
     * @inheritDoc
     */
    public function decrease(string $sourceId, string $type, int $seconds): TimerAdjustmentMapInterface
    {
        return $this->put($sourceId, $type, self::ACTION_DECREASE, $seconds);
    }

    /**
     * @inheritDoc
     */
    public function get(string $sourceId): int
    {
        $adjustmentTime = 0;
        if (!isset($this->map[$sourceId])) {
            return $adjustmentTime;
        }

        foreach ($this->map[$sourceId] as $type => $adjustments) {
            $adjustmentTime += $this->getByType($sourceId, $type);
        }

        return $adjustmentTime;
    }

    public function getByType(string $sourceId, string $type): int
    {
        if (!isset($this->map[$sourceId][$type])) {
            return 0;
        }

        return $this->map[$sourceId][$type][self::ACTION_INCREASE] - $this->map[$sourceId][$type][self::ACTION_DECREASE];
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

    private function put(string $sourceId, string $type, string $action, int $seconds): TimerAdjustmentMapInterface
    {
        if (empty($sourceId) || !$this->isValidAction($action) || !$seconds) {
            throw new \InvalidArgumentException('Provided arguments should not be empty.');
        }
        $this->ensureEntryInitialized($sourceId, $type);
        $this->map[$sourceId][$type][$action] += $seconds;

        return $this;
    }

    private function isValidAction(string $action): bool
    {
        return in_array($action, [self::ACTION_INCREASE, self::ACTION_DECREASE], true);
    }

    private function ensureEntryInitialized(string $sourceId, string $type): void
    {
        $this->ensureEntryActionInitialized($sourceId, $type, self::ACTION_INCREASE);
        $this->ensureEntryActionInitialized($sourceId, $type, self::ACTION_DECREASE);
    }

    private function ensureEntryActionInitialized(string $sourceId, string $type, string $action): void
    {
        if (!isset($this->map[$sourceId][$type][$action])) {
            $this->map[$sourceId][$type][$action] = 0;
        }
    }
}
