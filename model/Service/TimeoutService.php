<?php

/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 *
 * Copyright (c) 2021-2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\model\Service;

use oat\taoQtiTest\model\Domain\Model\ItemResponseRepositoryInterface;
use oat\taoQtiTest\model\Domain\Model\ToolsStateRepositoryInterface;
use oat\taoQtiTest\models\classes\runner\QtiRunnerInvalidResponsesException;
use oat\taoQtiTest\models\runner\PersistableRunnerServiceInterface;
use oat\taoQtiTest\models\runner\QtiRunnerEmptyResponsesException;
use oat\taoQtiTest\models\runner\RunnerService;

class TimeoutService
{
    /** @var RunnerService */
    private $runnerService;

    /** @var ItemResponseRepositoryInterface */
    private $itemResponseRepository;

    /** @var ToolsStateRepositoryInterface */
    private $toolsStateRepository;

    public function __construct(
        RunnerService $runnerService,
        ItemResponseRepositoryInterface $itemResponseRepository,
        ToolsStateRepositoryInterface $toolsStateRepository
    ) {
        $this->runnerService = $runnerService;
        $this->itemResponseRepository = $itemResponseRepository;
        $this->toolsStateRepository = $toolsStateRepository;
    }

    public function __invoke(TimeoutCommand $command): ActionResponse
    {
        $serviceContext = $command->getServiceContext();

        if ($command->isLateSubmissionAllowed()) {
            try {
                $this->itemResponseRepository->save($command->getItemResponse(), $serviceContext, true);
            } catch (QtiRunnerInvalidResponsesException | QtiRunnerEmptyResponsesException) {
                // allow the session to time out omitting the invalid response
            }
        }

        $this->toolsStateRepository->save($command->getToolsState(), $serviceContext);
        $this->runnerService->check($serviceContext);
        $serviceContext->init();

        $result = $this->runnerService->timeout(
            $serviceContext,
            $command->getScope(),
            $command->getRef(),
            $command->isLateSubmissionAllowed()
        );

        if ($command->hasStartTimer()) {
            $this->runnerService->startTimer($serviceContext, $command->getTimestamp());
        }

        if ($this->runnerService instanceof PersistableRunnerServiceInterface) {
            $this->runnerService->persist($serviceContext);
        }

        if ($result === false) {
            return ActionResponse::empty();
        }

        $testMap = $serviceContext->containsAdaptive()
            ? $this->runnerService->getTestMap($serviceContext, true)
            : null;

        return ActionResponse::success(
            $this->runnerService->getTestContext($serviceContext),
            $testMap
        );
    }
}
