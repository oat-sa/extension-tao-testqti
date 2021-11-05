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

    public function setItemContext(
        string $itemDefinition,
        ?array $itemState,
        ?float $itemDuration,
        ?array $itemResponse
    ): void {
        $this->itemDefinition = $itemDefinition;
        $this->itemState = $itemState;
        $this->itemDuration = $itemDuration;
        $this->itemResponse = $itemResponse;
    }

    public function getItemDefinition(): string
    {
        return $this->itemDefinition;
    }

    public function getItemDuration(): ?float
    {
        return $this->itemDuration;
    }

    public function getItemState(): ?array
    {
        return $this->itemState;
    }

    public function getItemResponse(): ?array
    {
        return $this->itemResponse;
    }
}
