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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
namespace oat\taoQtiTest\models;

use oat\oatbox\service\ConfigurableService;
use oat\tao\model\state\StateMigration;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoDelivery\models\classes\execution\event\DeliveryExecutionState;
use oat\taoQtiTest\models\event\QtiTestStateChangeEvent;
use oat\taoQtiTest\models\runner\communicator\TestStateChannel;
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
     * @param \oat\taoDelivery\models\classes\execution\event\DeliveryExecutionState $event
     */
    public function archiveState(DeliveryExecutionState $event)
    {
        if ($event->getState() == DeliveryExecution::STATE_FINISHIED) {
            /** @var TestSessionService $testSessionService */
            $testSessionService = $this->getServiceManager()->get(TestSessionService::SERVICE_ID);
            $session = $testSessionService->getTestSession($event->getDeliveryExecution());
            $userId = $event->getDeliveryExecution()->getUserIdentifier();

            // Retrieve the Test Session Id (Item State Identifiers are based on it).
            $sessionId = $session->getSessionId();

            /** @var StateMigration $finishedService */
            $finishedService = $this->getServiceManager()->get(StateMigration::SERVICE_ID);
            
            // Remove all Item States that belong to the Test.
            $itemRefs = $session->getRoute()->getAssessmentItemRefs();
            
            foreach ($itemRefs as $itemRef) {
                $callId = $sessionId.$itemRef->getIdentifier();
                if ($finishedService->archive($userId, $callId)) {
                    $finishedService->removeState($userId, $callId);
                    \common_Logger::t('Item State archived for user : '.$userId.' and callId : '. $callId);
                }
            }

            // Remove the Test State.
            if ($finishedService->archive($userId, $sessionId)) {
                $finishedService->removeState($userId, $sessionId);
                \common_Logger::t('Test State archived for user : '.$userId.' and callId : '. $sessionId);
            }
            
            // Remove QtiTimeLine State (Only relevant for new QTI Test Runner).
            $timeLineStorageId = QtiTimeStorage::getStorageKeyFromTestSessionId($sessionId);
            if ($finishedService->archive($userId, $timeLineStorageId)) {
                $finishedService->removeState($userId, $timeLineStorageId);
                \common_Logger::t('Test Timeline State archived for user : '.$userId.' and storageId : '. $timeLineStorageId);
            }

            // Remove Extended State
            $extendedStorageId = ExtendedStateService::getStorageKeyFromTestSessionId($sessionId);
            if ($finishedService->archive($userId, $extendedStorageId)) {
                $finishedService->removeState($userId, $extendedStorageId);
                \common_Logger::t('Extended State archived for user : '.$userId.' and storageId : '. $extendedStorageId);
            }

        }
    }
}
