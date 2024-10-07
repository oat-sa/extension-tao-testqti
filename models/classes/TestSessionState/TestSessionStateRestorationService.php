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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA
 *
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\TestSessionState;

use common_exception_NoContent;
use common_exception_NotFound;
use League\Flysystem\FilesystemException;
use oat\tao\model\state\StateMigration;
use oat\tao\model\taskQueue\QueueDispatcherInterface;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoQtiTest\models\classes\tasks\QtiStateOffload\AbstractQtiStateManipulationTask;
use oat\taoQtiTest\models\classes\tasks\QtiStateOffload\StateBackupRemovalTask;
use oat\taoQtiTest\models\QtiTestExtractionFailedException;
use oat\taoQtiTest\models\QtiTestUtils;
use oat\taoQtiTest\models\runner\ExtendedState;
use oat\taoQtiTest\models\runner\time\QtiTimeStorage;
use oat\taoQtiTest\models\TestSessionService;
use oat\taoQtiTest\models\TestSessionState\Api\TestSessionStateRestorationInterface;
use oat\taoQtiTest\models\TestSessionState\Exception\RestorationImpossibleException;
use Psr\Log\LoggerInterface;
use qtism\data\AssessmentSection;
use qtism\data\SectionPartCollection;
use qtism\data\TestPartCollection;

class TestSessionStateRestorationService implements TestSessionStateRestorationInterface
{
    /** @var TestSessionService */
    private $testSessionService;
    /** @var QtiTestUtils */
    private $qtiTestUtils;
    /** @var StateMigration */
    private $stateMigration;
    /** @var LoggerInterface */
    private $logger;
    /** @var QueueDispatcherInterface */
    private $queueDispatcher;

    public function __construct(
        TestSessionService $testSessionService,
        QtiTestUtils $qtiTestUtils,
        StateMigration $stateMigration,
        LoggerInterface $logger,
        QueueDispatcherInterface $queueDispatcher
    ) {
        $this->testSessionService = $testSessionService;
        $this->qtiTestUtils = $qtiTestUtils;
        $this->stateMigration = $stateMigration;
        $this->logger = $logger;
        $this->queueDispatcher = $queueDispatcher;
    }

    /**
     * @inheritDoc
     */
    public function restore(DeliveryExecution $deliveryExecution): void
    {
        $deliveryExecutionId = $deliveryExecution->getIdentifier();
        $userId = $deliveryExecution->getUserIdentifier();

        $this->restoreTestSessionState($userId, $deliveryExecutionId);
        $this->restoreExtendedState($userId, $deliveryExecutionId);
        $this->restoreTimeLineState($userId, $deliveryExecutionId);
        $this->restoreItemsState($deliveryExecution);
    }

    /**
     * @throws RestorationImpossibleException
     */
    private function restoreTestSessionState(string $userId, string $sessionId)
    {
        try {
            $this->stateMigration->restore($userId, $sessionId);
            $this->dispatchBackupRemoval($userId, $sessionId, 'Test Session');
        } catch (FilesystemException $e) {
            throw new RestorationImpossibleException(
                sprintf('[%s] impossible to reach archived test session', $sessionId)
            );
        }
    }

    private function restoreExtendedState(string $userId, string $sessionId): void
    {
        $extendedStorageId = ExtendedState::getStorageKeyFromTestSessionId($sessionId);
        try {
            $this->stateMigration->restore($userId, $extendedStorageId);
            $this->dispatchBackupRemoval($userId, $extendedStorageId, 'Extended');
        } catch (FilesystemException $e) {
            $this->logger->debug(
                sprintf(
                    '[%s] Extended state restoration impossible for user %s',
                    $extendedStorageId,
                    $userId
                )
            );
        }
    }

    private function restoreTimeLineState(string $userId, string $sessionId): void
    {
        $qtiItemStorageId = QtiTimeStorage::getStorageKeyFromTestSessionId($sessionId);
        try {
            $this->stateMigration->restore($userId, $qtiItemStorageId);
            $this->dispatchBackupRemoval($userId, $qtiItemStorageId, 'TimeLine');
        } catch (FilesystemException $e) {
            $this->logger->debug(
                sprintf(
                    '[%s] TimeLine state restoration impossible for user %s',
                    $qtiItemStorageId,
                    $userId
                )
            );
        }
    }

    /**
     * @throws common_exception_NoContent
     * @throws QtiTestExtractionFailedException
     * @throws common_exception_NotFound
     */
    private function restoreItemsState(DeliveryExecution $deliveryExecution): void
    {
        $runtimeInputParameters = $this->testSessionService->getRuntimeInputParameters($deliveryExecution);
        $testDefinition = $this->qtiTestUtils->getTestDefinition($runtimeInputParameters['QtiTestCompilation']);
        $this->walkTestParts($testDefinition->getTestParts(), $deliveryExecution);
    }

    /**
     * @throws common_exception_NotFound
     */
    private function walkTestParts(TestPartCollection $testParts, DeliveryExecution $deliveryExecution)
    {
        foreach ($testParts as $testPart) {
            $this->walkAssessmentSections($testPart->getAssessmentSections(), $deliveryExecution);
        }
    }

    /**
     * @throws common_exception_NotFound
     */
    private function walkAssessmentSections(
        SectionPartCollection $assessmentSections,
        DeliveryExecution $deliveryExecution
    ) {
        foreach ($assessmentSections as $assessmentSection) {
            $this->walkAssessmentSection($assessmentSection, $deliveryExecution);
        }
    }

    /**
     * @throws common_exception_NotFound
     */
    private function walkAssessmentSection(AssessmentSection $assessmentSection, DeliveryExecution $deliveryExecution)
    {
        $userId = $deliveryExecution->getUserIdentifier();
        $deliveryExecutionId = $deliveryExecution->getIdentifier();
        foreach ($assessmentSection->getSectionParts() as $sectionPart) {
            $this->restoreItemState($userId, $deliveryExecutionId . $sectionPart->getIdentifier());
        }
    }

    private function restoreItemState(string $userId, string $callId)
    {
        try {
            $this->stateMigration->restore($userId, $callId);
            $this->dispatchBackupRemoval($userId, $callId, 'Test Item');
        } catch (FilesystemException $e) {
            $this->logger->debug(
                sprintf(
                    '[%s] Test Item state restoration impossible for user %s',
                    $callId,
                    $userId
                )
            );
        }
    }

    private function dispatchBackupRemoval(string $userId, string $callId, string $stateLabel): void
    {
        $this->queueDispatcher->createTask(new StateBackupRemovalTask(), [
            AbstractQtiStateManipulationTask::PARAM_USER_ID_KEY => $userId,
            AbstractQtiStateManipulationTask::PARAM_CALL_ID_KEY => $callId,
            AbstractQtiStateManipulationTask::PARAM_STATE_LABEL_KEY => $stateLabel
        ]);
    }
}
