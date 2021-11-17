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

use common_Exception;
use oat\taoQtiTest\model\Domain\Model\ItemResponseRepositoryInterface;
use oat\taoQtiTest\model\Domain\Model\ToolsStateRepositoryInterface;
use oat\taoQtiTest\models\runner\PersistableRunnerServiceInterface;
use oat\taoQtiTest\models\runner\RunnerService;

class ExitTestService
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

    /**
     * @throws common_Exception
     */
    public function __invoke(ExitTestCommand $command): ActionResponse
    {
        $serviceContext = $command->getServiceContext();

        $this->runnerService->check($serviceContext);
        $serviceContext->init();

        $this->itemResponseRepository->save($command->getItemResponse(), $serviceContext);
        $this->toolsStateRepository->save($command->getToolsState(), $serviceContext);

        $result = $this->runnerService->exitTest($serviceContext);

        if ($this->runnerService instanceof PersistableRunnerServiceInterface) {
            $this->runnerService->persist($serviceContext);
        }

        if ($result === false) {
            return ActionResponse::empty();
        }

        return ActionResponse::success();
    }
}
