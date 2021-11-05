<?php

declare(strict_types=1);

namespace oat\taoQtiTest\model\Service;

use oat\taoQtiTest\model\Domain\Model\ItemResponse;
use oat\taoQtiTest\model\Domain\Model\ItemResponseRepositoryInterface;
use oat\taoQtiTest\model\Domain\Model\ToolsState;
use oat\taoQtiTest\model\Domain\Model\ToolsStateRepositoryInterface;
use oat\taoQtiTest\models\runner\PersistableRunnerServiceInterface;
use oat\taoQtiTest\models\runner\RunnerService;

class MoveService
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

    public function __invoke(MoveCommand $command): ActionResponse
    {
        $serviceContext = $command->getServiceContext();

        $this->saveItemResponse($command);
        $this->saveToolsState($command);

        $serviceContext->getTestSession()->initItemTimer();

        $result = $this->runnerService->move(
            $serviceContext,
            $command->getDirection(),
            $command->getScope(),
            $command->getRef()
        );

        if ($this->runnerService instanceof PersistableRunnerServiceInterface) {
            $this->runnerService->persist($serviceContext);
        }

        if ($command->hasStartTimer()) {
            $this->runnerService->startTimer($serviceContext);
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

    private function saveItemResponse(MoveCommand $command): void
    {
        $itemResponse = new ItemResponse(
            $command->getItemDefinition(),
            $command->getItemState(),
            $command->getItemResponse(),
            $command->getItemDuration()
        );

        $this->itemResponseRepository->save($itemResponse, $command->getServiceContext());
    }

    private function saveToolsState(MoveCommand $command): void
    {
        $this->toolsStateRepository->save(
            new ToolsState($command->getToolStates()),
            $command->getServiceContext()
        );
    }
}
