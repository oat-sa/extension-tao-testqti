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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA;
 *
 * @author Ricardo Quintanilha <ricardo.quintanilha@taotesting.com>
 */

declare(strict_types=1);

namespace oat\taoQtiTest\model\Service;

use oat\taoQtiTest\model\Domain\Model\ItemResponse;

trait ItemContextAwareTrait
{
    /** @var string */
    private $itemDefinition = '';

    /** @var array|null */
    private $itemState = null;

    /** @var float|null */
    private $itemDuration = null;

    /** @var array|null */
    private $itemResponse = null;

    /** @var float|null */
    private $timestamp;

    public function setItemContext(
        string $itemDefinition,
        ?array $itemState,
        ?float $itemDuration,
        ?array $itemResponse,
        ?float $timestamp = null
    ): void {
        $this->itemDefinition = $itemDefinition;
        $this->itemState = $itemState;
        $this->itemDuration = $itemDuration;
        $this->itemResponse = $itemResponse;
        $this->timestamp = $timestamp;
    }

    public function getItemResponse(): ItemResponse
    {
        return new ItemResponse(
            $this->itemDefinition,
            $this->itemState,
            $this->itemResponse,
            $this->itemDuration,
            $this->timestamp
        );
    }

    public function getTimestamp(): ?float
    {
        return $this->timestamp;
    }
}
