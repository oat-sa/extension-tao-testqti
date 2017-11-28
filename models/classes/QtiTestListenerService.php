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

    public function __construct($options = array())
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

        $session = $event->getSession();
        $userId = $event->getUserId();

        // Retrieve the Test Session Id (Item State Identifiers are based on it).
        $sessionId = $session->getSessionId();

        /** @var StateMigration $stateMigrationService */
        $stateMigrationService = $this->getServiceManager()->get(StateMigration::SERVICE_ID);

        if (!in_array(self::ARCHIVE_EXCLUDE_ITEMS, $archivingExclusions)) {
            // Remove all Item States that belong to the Test.
            $itemRefs = $session->getRoute()->getAssessmentItemRefs();

            foreach ($itemRefs as $itemRef) {
                $callId = $sessionId . $itemRef->getIdentifier();
                if ($stateMigrationService->archive($userId, $callId)) {
                    $stateMigrationService->removeState($userId, $callId);
                    \common_Logger::t('Item State archived for user : ' . $userId . ' and callId : ' . $callId);
                }
            }
        }

        if (!in_array(self::ARCHIVE_EXCLUDE_TEST, $archivingExclusions)) {
            // Remove the Test State.
            if ($stateMigrationService->archive($userId, $sessionId)) {
                $stateMigrationService->removeState($userId, $sessionId);
                \common_Logger::t('Test State archived for user : ' . $userId . ' and callId : ' . $sessionId);
            }

            // Remove QtiTimeLine State (Only relevant for new QTI Test Runner).
            $timeLineStorageId = QtiTimeStorage::getStorageKeyFromTestSessionId($sessionId);
            if ($stateMigrationService->archive($userId, $timeLineStorageId)) {
                $stateMigrationService->removeState($userId, $timeLineStorageId);
                \common_Logger::t('Test Timeline State archived for user : ' . $userId . ' and storageId : ' . $timeLineStorageId);
            }
        }

        if (!in_array(self::ARCHIVE_EXCLUDE_EXTRA, $archivingExclusions)) {
            // Remove Extended State
            $extendedStorageId = ExtendedState::getStorageKeyFromTestSessionId($sessionId);
            if ($stateMigrationService->archive($userId, $extendedStorageId)) {
                $stateMigrationService->removeState($userId, $extendedStorageId);
                \common_Logger::t('Extended State archived for user : ' . $userId . ' and storageId : ' . $extendedStorageId);
            }
        }
    }
}
