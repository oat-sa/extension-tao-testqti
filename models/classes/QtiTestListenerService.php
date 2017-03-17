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
use qtism\runtime\tests\AssessmentTestSessionState;

/**
 * Class QtiTestListenerService
 * @package oat\taoQtiTest\models
 */
class QtiTestListenerService extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/QtiTestListenerService';

    public function sessionStateChanged(QtiTestStateChangeEvent $event)
    {
        \common_Logger::i('########### StateChanged');
        $sessionMemento = $event->getSessionMemento();
        $session = $sessionMemento->getSession();
        if (in_array($sessionMemento->getState(), [AssessmentTestSessionState::SUSPENDED, AssessmentTestSessionState::CLOSED])) {

            $messageService = $this->getServiceLocator()->get(QtiRunnerMessageService::SERVICE_ID);

            $data = [
                'state' => $sessionMemento->getState(),
                'message' => $messageService->getStateMessage($session),
            ];

            $stateService = $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID);
            $stateService->addEvent($sessionMemento->getSession()->getSessionId(), TestStateChannel::CHANNEL_NAME, $data);
        }
    }


    public function executionStateChanged(DeliveryExecutionState $event)
    {
        $testSessionId = $event->getDeliveryExecution()->getIdentifier();
        $runnerService = $this->getServiceManager()->get(QtiRunnerService::SERVICE_ID);

        if ($event->getPreviousState() == DeliveryExecution::STATE_ACTIVE) {
            
            $data = [
                'state' => $event->getState(),
                'previousState' => $event->getPreviousState(),
            ];

            $stateService = $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID);
            $stateService->addEvent($testSessionId, TestStateChannel::CHANNEL_NAME, $data);
        }

    }
}
