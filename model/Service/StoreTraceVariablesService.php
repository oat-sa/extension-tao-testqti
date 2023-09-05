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

use Exception;
use oat\oatbox\event\EventManager;
use oat\taoQtiTest\models\event\TraceVariableStored;
use oat\taoQtiTest\models\runner\RunnerService;
use oat\taoQtiTest\models\runner\RunnerServiceContext;
use Psr\Log\LoggerInterface;

class StoreTraceVariablesService
{
    /** @var RunnerService */
    private $runnerService;

    /** @var EventManager */
    private $eventManager;

    /** @var LoggerInterface */
    private $logger;

    public function __construct(RunnerService $runnerService, EventManager $eventManager, LoggerInterface $logger)
    {
        $this->runnerService = $runnerService;
        $this->eventManager = $eventManager;
        $this->logger = $logger;
    }

    public function __invoke(StoreTraceVariablesCommand $command): ActionResponse
    {
        $serviceContext = $command->getServiceContext();

        $itemRef = $this->getItemRef($command);

        $storedVariables = [];
        foreach ($command->getTraceVariables() as $variableIdentifier => $variableValue) {
            $stored = $this->saveTraceVariable($serviceContext, $itemRef, $variableIdentifier, $variableValue);

            if ($stored) {
                $storedVariables[$variableIdentifier] = $variableValue;
            }
        }

        if (empty($storedVariables)) {
            return ActionResponse::success();
        }

        $this->eventManager->trigger(
            new TraceVariableStored(
                $serviceContext->getTestSession()->getSessionId(),
                $storedVariables
            )
        );

        return ActionResponse::success();
    }

    private function getItemRef(StoreTraceVariablesCommand $command): ?string
    {
        if ($command->getItemIdentifier() === null) {
            return null;
        }

        $itemRef = $this->runnerService->getItemHref(
            $command->getServiceContext(),
            $command->getItemIdentifier()
        );

        $parts = explode('|', $itemRef);

        return $parts[0] ?? $itemRef;
    }

    private function saveTraceVariable(
        RunnerServiceContext $serviceContext,
        ?string $itemRef,
        string $variableIdentifier,
        $variableValue
    ): bool {
        try {
            $this->runnerService->storeTraceVariable(
                $serviceContext,
                $itemRef,
                $variableIdentifier,
                $variableValue
            );


            return true;
        } catch (Exception $exception) {
            $this->logger->warning(
                sprintf('Failed to store trace variable "%s": %s', $variableIdentifier, $exception->getMessage())
            );
        }

        return false;
    }
}
