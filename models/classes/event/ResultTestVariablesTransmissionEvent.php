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
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\classes\event;

use oat\oatbox\event\Event;

class ResultTestVariablesTransmissionEvent implements Event
{
    /** @var string */
    private $deliveryExecutionId;
    /** @var array */
    private $variables;
    /** @var string */
    private $transmissionId;
    /** @var string */
    private $testUri;

    public function __construct(
        string $deliveryExecutionId,
        array  $variables,
        string $transmissionId,
        string $testUri = ''
    )
    {
        $this->deliveryExecutionId = $deliveryExecutionId;
        $this->variables = $variables;
        $this->transmissionId = $transmissionId;
        $this->testUri = $testUri;
    }

    public function getName(): string
    {
        return self::class;
    }

    public function getDeliveryExecutionId(): string
    {
        return $this->deliveryExecutionId;
    }

    public function getVariables(): array
    {
        return $this->variables;
    }

    public function getTransmissionId(): string
    {
        return $this->transmissionId;
    }

    public function getTestUri(): string
    {
        return $this->testUri;
    }
}
