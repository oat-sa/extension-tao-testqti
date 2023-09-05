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

final class ActionResponse
{
    /** @var bool */
    private $isSuccess = false;

    /** @var array|null */
    private $testContext;

    /** @var array|null */
    private $testMap;

    /** @var array */
    private $extraAttributes = [];

    private function __construct()
    {
    }

    public static function empty(): self
    {
        return new self();
    }

    public static function success(?array $testContext = null, ?array $testMap = null): self
    {
        $response = new self();

        $response->isSuccess = true;
        $response->testContext = $testContext;
        $response->testMap = $testMap;

        return $response;
    }

    public function withAttribute(string $name, $value): self
    {
        $response = clone $this;

        $response->extraAttributes[$name] = $value;

        return $response;
    }

    public function toArray(): array
    {
        $payload = array_merge(
            [
                'success' => $this->isSuccess,
                'testContext' => $this->testContext,
                'testMap' => $this->testMap,
            ],
            $this->extraAttributes
        );

        return array_filter(
            $payload,
            function ($value): bool {
                return $value !== null;
            }
        );
    }
}
