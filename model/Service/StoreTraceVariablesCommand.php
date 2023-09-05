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

use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;

final class StoreTraceVariablesCommand
{
    /** @var QtiRunnerServiceContext */
    private $serviceContext;

    /** @var array */
    private $traceVariables;

    /** @var string|null */
    private $itemIdentifier;

    public function __construct(QtiRunnerServiceContext $serviceContext, array $traceVariables, ?string $itemIdentifier)
    {
        $this->serviceContext = $serviceContext;
        $this->traceVariables = $traceVariables;
        $this->itemIdentifier = $itemIdentifier;
    }

    public function getServiceContext(): QtiRunnerServiceContext
    {
        return $this->serviceContext;
    }

    public function getTraceVariables(): array
    {
        return $this->traceVariables;
    }

    public function getItemIdentifier(): ?string
    {
        return $this->itemIdentifier;
    }
}
