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

final class TimeoutCommand
{
    use ItemContextAwareTrait;
    use NavigationContextAwareTrait;
    use ToolsStateAwareTrait;

    /** @var QtiRunnerServiceContext */
    private $serviceContext;

    /** @var bool */
    private $hasStartTimer;

    /** @var bool */
    private $lateSubmissionAllowed;

    public function __construct(
        QtiRunnerServiceContext $serviceContext,
        bool $hasStartTimer,
        bool $lateSubmissionAllowed
    ) {
        $this->serviceContext = $serviceContext;
        $this->hasStartTimer = $hasStartTimer;
        $this->lateSubmissionAllowed = $lateSubmissionAllowed;
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
        return $this->lateSubmissionAllowed;
    }
}
