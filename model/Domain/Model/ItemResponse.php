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

namespace oat\taoQtiTest\model\Domain\Model;

final class ItemResponse
{
    /** @var string */
    private $itemIdentifier;

    /** @var array|null */
    private $state;

    /** @var array|null */
    private $response;

    /** @var float|null */
    private $duration;

    public function __construct(string $itemIdentifier, ?array $state, ?array $response, ?float $duration)
    {
        $this->itemIdentifier = $itemIdentifier;
        $this->state = $state;
        $this->response = $response;
        $this->duration = $duration;
    }

    public function getItemIdentifier(): string
    {
        return $this->itemIdentifier;
    }

    public function getState(): ?array
    {
        return $this->state;
    }

    public function getResponse(): ?array
    {
        return $this->response;
    }

    public function getDuration(): ?float
    {
        return $this->duration;
    }
}
