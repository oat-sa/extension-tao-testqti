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

namespace oat\taoQtiTest\model\Infrastructure;

use oat\taoQtiTest\model\Domain\Model\ToolsState;
use oat\taoQtiTest\model\Domain\Model\ToolsStateRepositoryInterface;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\RunnerServiceContext;

class QtiToolsStateRepository implements ToolsStateRepositoryInterface
{
    /** @var QtiRunnerService */
    private $runnerService;

    public function __construct(QtiRunnerService $runnerService)
    {
        $this->runnerService = $runnerService;
    }

    public function save(ToolsState $toolsState, RunnerServiceContext $serviceContext): void
    {
        if (empty($toolsState->getStates())) {
            return;
        }

        $toolStates = $toolsState->getStates();

        array_walk(
            $toolStates,
            function (&$toolState) {
                $toolState = json_encode($toolState);
            }
        );

        $this->runnerService->setToolsStates($serviceContext, $toolStates);
    }
}
