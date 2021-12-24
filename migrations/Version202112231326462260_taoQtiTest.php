<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\oatbox\event\EventManager;
use oat\oatbox\reporting\Report;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiTest\models\classes\event\ResultTestVariablesTransmissionEvent;
use oat\taoQtiTest\models\classes\evnetHandler\ResultTransmissionEventHandler\Api\ResultTransmissionEventHandlerInterface;
use oat\taoQtiTest\models\classes\evnetHandler\ResultTransmissionEventHandler\AsynchronousResultTransmissionEventHandler;
use oat\taoQtiTest\models\event\ResultItemVariablesTransmissionEvent;
use oat\taoQtiTest\scripts\tools\ResultVariableTransmissionEvenHandlerSwitcher;

final class Version202112231326462260_taoQtiTest extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $eventManager = $this->getEventManager();
        $this->attachResultItemVariablesTransmissionEvent($eventManager);
        $this->attachResultTestVariablesTransmissionEvent($eventManager);
        $this->getServiceManager()->register(EventManager::SERVICE_ID, $eventManager);


        $command = sprintf(
            'php index \'%s\' --class \'%s\'',
            ResultVariableTransmissionEvenHandlerSwitcher::class,
            AsynchronousResultTransmissionEventHandler::class
        );
        $this->addReport(Report::createSuccess(
            'You can change result variable transmission events handler by running command:' . PHP_EOL . $command
        ));
    }

    public function down(Schema $schema): void
    {
        $eventManager = $this->getEventManager();
        $this->detachResultItemVariablesTransmissionEvent($eventManager);
        $this->detachResultTestVariablesTransmissionEvent($eventManager);
        $this->getServiceManager()->register(EventManager::SERVICE_ID, $eventManager);
    }

    private function getEventManager(): EventManager
    {
        return $this->getServiceLocator()->get(EventManager::class);
    }

    private function attachResultItemVariablesTransmissionEvent(EventManager $eventManager): void
    {
        $eventManager->attach(
            ResultItemVariablesTransmissionEvent::class,
            [ResultTransmissionEventHandlerInterface::SERVICE_ID, 'transmitResultItemVariable']
        );

        $this->addReport(
            Report::createSuccess(
                sprintf(
                    'Subscribed %s::%s to %s event',
                    ResultTransmissionEventHandlerInterface::class,
                    'transmitResultItemVariable',
                    ResultItemVariablesTransmissionEvent::class
                )
            )
        );
    }

    private function detachResultItemVariablesTransmissionEvent(EventManager $eventManager): void
    {
        $eventManager->detach(
            ResultItemVariablesTransmissionEvent::class,
            [ResultTransmissionEventHandlerInterface::SERVICE_ID, 'transmitResultItemVariable']
        );
        $this->addReport(
            Report::createSuccess(
                sprintf(
                    'Unsubscribed %s::%s to %s event',
                    ResultTransmissionEventHandlerInterface::class,
                    'transmitResultItemVariable',
                    ResultItemVariablesTransmissionEvent::class
                )
            )
        );
    }

    private function attachResultTestVariablesTransmissionEvent(EventManager $eventManager): void
    {
        $eventManager->attach(
            ResultTestVariablesTransmissionEvent::class,
            [ResultTransmissionEventHandlerInterface::SERVICE_ID, 'transmitResultTestVariable']
        );

        $this->addReport(
            Report::createSuccess(
                sprintf(
                    'Subscribed %s::%s to %s event',
                    ResultTransmissionEventHandlerInterface::class,
                    'transmitResultTestVariable',
                    ResultTestVariablesTransmissionEvent::class
                )
            )
        );
    }

    private function detachResultTestVariablesTransmissionEvent(EventManager $eventManager): void
    {
        $eventManager->detach(
            ResultTestVariablesTransmissionEvent::class,
            [ResultTransmissionEventHandlerInterface::SERVICE_ID, 'transmitResultTestVariable']
        );
        $this->addReport(
            Report::createSuccess(
                sprintf(
                    'Unsubscribed %s::%s to %s event',
                    ResultTransmissionEventHandlerInterface::class,
                    'transmitResultTestVariable',
                    ResultTestVariablesTransmissionEvent::class
                )
            )
        );
    }
}
