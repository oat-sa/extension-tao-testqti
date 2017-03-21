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
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoDelivery\models\classes\execution\event\DeliveryExecutionState;
use oat\taoQtiTest\models\event\QtiTestStateChangeEvent;
use oat\taoQtiTest\models\runner\communicator\TestStateChannel;
use oat\taoQtiTest\models\runner\QtiRunnerMessageService;
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
        if (in_array($sessionMemento->getState(), [AssessmentTestSessionState::SUSPENDED, AssessmentTestSessionState::CLOSED])) {
            $this->logStateEvent($sessionMemento->getSession());
        }
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
            if ($session && in_array($session->getState(), [AssessmentTestSessionState::SUSPENDED, AssessmentTestSessionState::CLOSED])) {
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
        $messageService = $this->getServiceManager()->get(QtiRunnerMessageService::SERVICE_ID);
        $stateService = $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID);

        $data = [
            'state' => $session->getState(),
            'message' => $messageService->getStateMessage($session),
        ];

        $stateService->addEvent($session->getSessionId(), TestStateChannel::CHANNEL_NAME, $data);
    }
}
