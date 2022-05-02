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

use League\Flysystem\FileNotFoundException;
use oat\tao\model\state\StateMigration;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoQtiTest\models\QtiTestUtils;
use oat\taoQtiTest\models\runner\ExtendedState;
use oat\taoQtiTest\models\runner\time\QtiTimeStorage;
use oat\taoQtiTest\models\TestSessionService;
use oat\taoQtiTest\models\TestSessionState\Api\TestSessionStateRestorationServiceInterface;
use oat\taoQtiTest\models\TestSessionState\Exception\RestorationImpossibleException;
use Psr\Log\LoggerInterface;
use qtism\data\AssessmentSection;
use qtism\data\SectionPartCollection;
use qtism\data\TestPart;
use qtism\data\TestPartCollection;

class TestSessionStateRestorationService implements TestSessionStateRestorationServiceInterface
{
    /** @var TestSessionService */
    private $testSessionService;
    /** @var QtiTestUtils */
    private $qtiTestUtils;
    /** @var StateMigration */
    private $stateMigration;
    /** @var LoggerInterface */
    private $logger;

    public function __construct(
        TestSessionService $testSessionService,
        QtiTestUtils $qtiTestUtils,
        StateMigration $stateMigration,
        LoggerInterface $logger
    ) {
        $this->testSessionService = $testSessionService;
        $this->qtiTestUtils = $qtiTestUtils;
        $this->stateMigration = $stateMigration;
        $this->logger = $logger;
    }

    /**
     * @inheritDoc
     */
    public function restore(DeliveryExecution $deliveryExecution): void
    {
        $deliveryExecutionId = $deliveryExecution->getIdentifier();
        $userId = $deliveryExecution->getUserIdentifier();

        try {
            $this->stateMigration->restore($userId, $deliveryExecutionId);
        } catch (FileNotFoundException $e) {
            throw new RestorationImpossibleException();
        }

        $this->restoreExtendedState($userId, $deliveryExecutionId);
        $this->restoreTimeLineState($userId, $deliveryExecutionId);
        $this->restoreItemsState($deliveryExecution);
    }

    private function restoreExtendedState(string $userId, string $sessionId): void
    {
        $extendedStorageId = ExtendedState::getStorageKeyFromTestSessionId($sessionId);
        try {
            $this->stateMigration->restore($userId, $extendedStorageId);
        } catch (FileNotFoundException $e) {
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
        $extendedStorageId = QtiTimeStorage::getStorageKeyFromTestSessionId($sessionId);
        try {
            $this->stateMigration->restore($userId, $extendedStorageId);
        } catch (FileNotFoundException $e) {
            $this->logger->debug(
                sprintf(
                    '[%s] TimeLine state restoration impossible for user %s',
                    $extendedStorageId,
                    $userId
                )
            );
        }
    }

    private function restoreItemsState(DeliveryExecution $deliveryExecution): void
    {
        $runtimeInputParameters = $this->testSessionService->getRuntimeInputParameters($deliveryExecution);
        $testDefinition = $this->qtiTestUtils->getTestDefinition($runtimeInputParameters['QtiTestCompilation']);
        $this->walkTestParts($testDefinition->getTestParts(), $deliveryExecution);
    }


    private function walkTestParts(TestPartCollection $testParts, DeliveryExecution $deliveryExecution)
    {
        foreach ($testParts as $testPart) {
            $this->walkAssessmentSections($testPart->getAssessmentSections(), $deliveryExecution);
        }
    }

    private function walkAssessmentSections(
        SectionPartCollection $assessmentSections,
        DeliveryExecution $deliveryExecution
    ) {
        foreach ($assessmentSections as $assessmentSection) {
            $this->walkAssessmentSection($assessmentSection, $deliveryExecution);
        }
    }


    private function walkAssessmentSection(AssessmentSection $assessmentSection, DeliveryExecution $deliveryExecution)
    {
        foreach ($assessmentSection->getSectionParts() as $sectionPart) {
            $this->restoreItemState(
                $deliveryExecution->getUserIdentifier(),
                $deliveryExecution->getIdentifier() . $sectionPart->getIdentifier()
            );
        }
    }

    private function restoreItemState(string $userId, string $callId)
    {
        try {
            $this->stateMigration->restore($userId, $callId);
        } catch (FileNotFoundException $e) {
            $this->logger->debug(
                sprintf(
                    '[%s] Item state restoration impossible for user %s',
                    $callId,
                    $userId
                )
            );
        }
    }
}
