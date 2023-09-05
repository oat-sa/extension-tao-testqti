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

use oat\taoQtiTest\model\Domain\Model\ItemResponse;
use oat\taoQtiTest\model\Domain\Model\ItemResponseRepositoryInterface;
use oat\taoQtiTest\models\runner\QtiRunnerEmptyResponsesException;
use oat\taoQtiTest\models\runner\QtiRunnerItemResponseException;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\RunnerServiceContext;
use taoQtiTest_helpers_TestRunnerUtils as TestRunnerUtils;

class QtiItemResponseRepository implements ItemResponseRepositoryInterface
{
    /** @var QtiRunnerService */
    private $runnerService;

    public function __construct(QtiRunnerService $runnerService)
    {
        $this->runnerService = $runnerService;
    }

    public function save(ItemResponse $itemResponse, RunnerServiceContext $serviceContext): void
    {
        if ($this->runnerService->isTerminated($serviceContext)) {
            return;
        }

        $this->endItemTimer($itemResponse, $serviceContext);
        $this->saveItemState($itemResponse, $serviceContext);
        $this->saveItemResponses($itemResponse, $serviceContext);
    }

    private function endItemTimer(ItemResponse $itemResponse, RunnerServiceContext $serviceContext): void
    {
        if ($itemResponse->getDuration() === null) {
            return;
        }

        $this->runnerService->endTimer(
            $serviceContext,
            $itemResponse->getDuration(),
            $itemResponse->getTimestamp()
        );
    }

    private function saveItemState(ItemResponse $itemResponse, RunnerServiceContext $serviceContext): void
    {
        if (
            empty($itemResponse->getItemIdentifier())
            || $itemResponse->getState() === null
        ) {
            return;
        }

        $this->runnerService->setItemState(
            $serviceContext,
            $itemResponse->getItemIdentifier(),
            $itemResponse->getState()
        );
    }

    private function saveItemResponses(ItemResponse $itemResponse, RunnerServiceContext $serviceContext): void
    {
        if (
            empty($itemResponse->getItemIdentifier())
            || $itemResponse->getResponse() === null
        ) {
            return;
        }

        $itemDefinition = $this->runnerService->getItemHref($serviceContext, $itemResponse->getItemIdentifier());

        if (empty($itemDefinition)) {
            return;
        }

        if (
            $serviceContext->getCurrentAssessmentItemRef() === false
            || $serviceContext->getCurrentAssessmentItemRef()->getIdentifier() !== $itemResponse->getItemIdentifier()
        ) {
            throw new QtiRunnerItemResponseException(__('Item response identifier does not match current item'));
        }

        $responses = $this->runnerService->parsesItemResponse(
            $serviceContext,
            $itemDefinition,
            $itemResponse->getResponse()
        );

        if (
            $this->runnerService->getTestConfig()->getConfigValue('enableAllowSkipping')
            && !TestRunnerUtils::doesAllowSkipping($serviceContext->getTestSession())
            && $this->runnerService->emptyResponse($serviceContext, $responses)
        ) {
            throw new QtiRunnerEmptyResponsesException();
        }

        $this->runnerService->storeItemResponse($serviceContext, $itemDefinition, $responses);
    }
}
