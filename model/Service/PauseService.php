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

use oat\taoQtiTest\model\Domain\Model\ItemResponseRepositoryInterface;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\RunnerService;

class PauseService
{
    /** @var RunnerService */
    private $runnerService;

    /** @var ItemResponseRepositoryInterface */
    private $itemResponseRepository;

    public function __construct(
        RunnerService $runnerService,
        ItemResponseRepositoryInterface $itemResponseRepository
    ) {
        $this->runnerService = $runnerService;
        $this->itemResponseRepository = $itemResponseRepository;
    }

    public function __invoke(PauseCommand $command): ActionResponse
    {
        $serviceContext = $command->getServiceContext();

        $this->saveItemResponse($command, $serviceContext);

        $this->runnerService->check($serviceContext);

        $serviceContext->init();

        $result = $this->runnerService->pause($serviceContext);

        if ($result === false) {
            return ActionResponse::empty();
        }

        return ActionResponse::success();
    }

    protected function saveItemResponse(
        PauseCommand $command,
        QtiRunnerServiceContext $serviceContext
    ): void {
        if ($this->runnerService->isTerminated($serviceContext)) {
            return;
        }

        $itemResponse = $command->getItemResponse();

        $timerTarget = $this->runnerService->getTestConfig()
            ->getConfigValue('timer.target');

        if ($timerTarget === 'server') {
            $itemResponse->removeDuration();
        }

        $this->itemResponseRepository->save($itemResponse, $serviceContext);
    }
}
