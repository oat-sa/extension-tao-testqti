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
 * Copyright (c) 2017-2022 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiTest\models;

use oat\oatbox\service\ConfigurableService;
use oat\tao\model\taskQueue\QueueDispatcherInterface;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoDelivery\models\classes\execution\event\DeliveryExecutionState;
use oat\taoQtiTest\models\classes\tasks\QtiStateOffload\AbstractQtiStateManipulationTask;
use oat\taoQtiTest\models\classes\tasks\QtiStateOffload\StateOffloadTask;
use oat\taoQtiTest\models\event\AfterAssessmentTestSessionClosedEvent;
use oat\taoQtiTest\models\event\QtiTestStateChangeEvent;
use oat\taoQtiTest\models\runner\communicator\TestStateChannel;
use oat\taoQtiTest\models\runner\ExtendedState;
use oat\taoQtiTest\models\runner\QtiRunnerMessageService;
use oat\taoQtiTest\models\runner\time\QtiTimeStorage;
use qtism\runtime\tests\AssessmentTestSession;

/**
 * Class QtiTestListenerService
 * @package oat\taoQtiTest\models
 */
class QtiTestListenerService extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/QtiTestListenerService';

    const OPTION_ARCHIVE_EXCLUDE = 'archive-exclude';

    /**
     * @var string Constant to turn off test state archiving.
     */
    const ARCHIVE_EXCLUDE_TEST = 'archive-exclude-test';

    /**
     * @var string Constant to turn off item state archiving.
     */
    const ARCHIVE_EXCLUDE_ITEMS = 'archive-exclude-items';

    /**
     * @var string Constant to turn off extended test state archiving.
     */
    const ARCHIVE_EXCLUDE_EXTRA = 'archive-exclude-extra';

    public function __construct($options = [])
    {
        parent::__construct($options);

        $archiveExcludeOption = $this->getOption(self::OPTION_ARCHIVE_EXCLUDE);

        if (is_null($archiveExcludeOption) || !is_array($archiveExcludeOption)) {
            $this->setOption(self::OPTION_ARCHIVE_EXCLUDE, []);
        }
    }

    /**
     *
     * @param QtiTestStateChangeEvent $event
     */
    public function sessionStateChanged(QtiTestStateChangeEvent $event)
    {
        $sessionMemento = $event->getSessionMemento();
        $this->logStateEvent($sessionMemento->getSession());
    }

    /**
     *
     * @param DeliveryExecutionState $event
     */
    public function executionStateChanged(DeliveryExecutionState $event)
    {
        if ($event->getPreviousState() == DeliveryExecution::STATE_ACTIVE) {
            $testSessionService = $this->getServiceManager()->get(TestSessionService::SERVICE_ID);
            $session = $testSessionService->getTestSession($event->getDeliveryExecution());
            if ($session) {
                $this->logStateEvent($session);
            }
        }
    }

    /**
     * Logs the event with its related message to be dispatched to the client through the communication channel.
     * @param AssessmentTestSession $session
     */
    protected function logStateEvent(AssessmentTestSession $session)
    {
        $route = $session->getRoute();
        if ($route->valid()) {
            $messageService = $this->getServiceManager()->get(QtiRunnerMessageService::SERVICE_ID);
            $stateService = $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID);

            $data = [
                'state' => $session->getState(),
                'message' => $messageService->getStateMessage($session),
            ];

            $stateService->addEvent($session->getSessionId(), TestStateChannel::CHANNEL_NAME, $data);
        }
    }

    /**
     * Archive Test States
     *
     * This method archives the Test States (Test + Items) related to the DeliveryExecution throwing $event.
     * Please note that it is only relevant for the new QTI Test Runner.
     *
     * @param AfterAssessmentTestSessionClosedEvent $event
     */
    public function archiveState(AfterAssessmentTestSessionClosedEvent $event)
    {
        $archivingExclusions = $this->getOption(self::OPTION_ARCHIVE_EXCLUDE);

        // Retrieve the Test Session Id (Item State Identifiers are based on it).
        $sessionId = $event->getSession()->getSessionId();
        $userId = $event->getUserId();

        if (!in_array(self::ARCHIVE_EXCLUDE_ITEMS, $archivingExclusions)) {
            $itemRefs = $event->getSession()->getRoute()->getAssessmentItemRefs();
            foreach ($itemRefs as $itemRef) {
                $this->dispatchOffload($userId, $sessionId . $itemRef->getIdentifier(), 'Item');
            }
        }

        if (!in_array(self::ARCHIVE_EXCLUDE_TEST, $archivingExclusions)) {
            $this->dispatchOffload($userId, $sessionId, 'Test');
            $this->dispatchOffload(
                $userId,
                QtiTimeStorage::getStorageKeyFromTestSessionId($sessionId),
                'Test Timeline'
            );
        }

        if (!in_array(self::ARCHIVE_EXCLUDE_EXTRA, $archivingExclusions)) {
            $this->dispatchOffload(
                $userId,
                ExtendedState::getStorageKeyFromTestSessionId($sessionId),
                'Extended State'
            );
        }
    }

    private function dispatchOffload(string $userId, string $callId, string $stateLabel): void
    {
        $this->getQueueDispatcher()->createTask(new StateOffloadTask(), [
            AbstractQtiStateManipulationTask::PARAM_USER_ID_KEY => $userId,
            AbstractQtiStateManipulationTask::PARAM_CALL_ID_KEY => $callId,
            AbstractQtiStateManipulationTask::PARAM_STATE_LABEL_KEY => $stateLabel
        ]);
    }

    private function getQueueDispatcher(): QueueDispatcherInterface
    {
        return $this->getServiceManager()->get(QueueDispatcherInterface::SERVICE_ID);
    }
}
