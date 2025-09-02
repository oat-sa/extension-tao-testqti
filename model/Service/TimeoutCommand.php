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
 * Copyright (c) 2021-2025 (original work) Open Assessment Technologies SA;
 *
 * @author Ricardo Quintanilha <ricardo.quintanilha@taotesting.com>
 */

declare(strict_types=1);

namespace oat\taoQtiTest\model\Service;

use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;

final class TimeoutCommand implements
    ItemContextAwareInterface,
    NavigationContextAwareInterface,
    ToolsStateAwareInterface
{
    use ItemContextAwareTrait;
    use NavigationContextAwareTrait;
    use ToolsStateAwareTrait;

    public const FEATURE_FLAG_TIMEOUT_PERMANENT_LATE_SUBMISSION = 'FEATURE_FLAG_TIMEOUT_PERMANENT_LATE_SUBMISSION';

    public function __construct(
        private readonly QtiRunnerServiceContext $serviceContext,
        private readonly bool $hasStartTimer,
        private readonly bool $lateSubmissionAllowed,
        private readonly bool $permanentLateSubmission = false,
    ) {
    }

    public function getServiceContext(): QtiRunnerServiceContext
    {
        return $this->serviceContext;
    }

    public function hasStartTimer(): bool
    {
        return $this->hasStartTimer;
    }

    public function isLateSubmissionAllowed(): bool
    {
        return $this->lateSubmissionAllowed || $this->permanentLateSubmission;
    }
}
