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
use oat\tao\model\state\StateStorage;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoDelivery\models\classes\execution\event\DeliveryExecutionState;
use oat\taoQtiTest\models\event\QtiTestStateChangeEvent;
use oat\taoQtiTest\models\runner\communicator\TestStateChannel;
use oat\taoQtiTest\models\runner\QtiRunnerMessageService;
use oat\taoQtiTest\models\runner\session\TestSession;
use oat\taoQtiTest\models\runner\time\QtiTimeStorage;
use qtism\data\AssessmentItemRef;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\tests\AssessmentTestSessionState;

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

    public function archiveState(DeliveryExecutionState $event)
    {
        if ($event->getState() == DeliveryExecution::STATE_FINISHIED) {
            /** @var TestSessionService $testSessionService */
            $testSessionService = $this->getServiceManager()->get(TestSessionService::SERVICE_ID);
            $session = $testSessionService->getTestSession($event->getDeliveryExecution());
            $userId = $event->getDeliveryExecution()->getUserIdentifier();

            //get all callIds linked to that session
            $sessionId = $session->getSessionId();

            $itemRefs = $session->getRoute()->getAssessmentItemRefs();


            /** @var StateMigration $finishedService */
            $finishedService = $this->getServiceManager()->get(StateMigration::SERVICE_ID);
            //remove all callIds
            foreach ($itemRefs as $itemRef){
                $callId = $sessionId.$itemRef->getIdentifier();
                if($finishedService->archive($userId, $callId)){
                    $finishedService->removeState($userId, $callId);
                    \common_Logger::t('State archived for user : '.$userId.' and callId : '.$callId);
                }
            }

            if($finishedService->archive($userId, $sessionId)){
                $finishedService->removeState($userId, $sessionId);
                \common_Logger::t('State archived for user : '.$userId.' and callId : '.$sessionId);
            }

        }
    }

}
