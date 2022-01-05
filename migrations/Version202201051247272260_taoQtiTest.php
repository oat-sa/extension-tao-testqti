<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\oatbox\reporting\Report;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiTest\models\classes\eventHandler\ResultTransmissionEventHandler\Api\ResultTransmissionEventHandlerInterface;
use oat\taoQtiTest\models\classes\eventHandler\ResultTransmissionEventHandler\ResultTransmissionEventHandler;
use oat\taoQtiTest\models\event\ResultItemVariablesTransmissionEvent;

final class Version202201051247272260_taoQtiTest extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Register default ResultTransmissionEventHandlerInterface service';
    }

    public function up(Schema $schema): void
    {
        $this->getServiceManager()->register(
            ResultTransmissionEventHandlerInterface::SERVICE_ID,
            new ResultTransmissionEventHandler()
        );
        $this->addReport(
            Report::createSuccess(
                sprintf(
                    'Service %s successfully registered as %s',
                    ResultTransmissionEventHandler::class,
                    ResultTransmissionEventHandlerInterface::SERVICE_ID
                )
            )
        );
    }

    public function down(Schema $schema): void
    {
        $this->getServiceManager()->unregister(ResultTransmissionEventHandlerInterface::SERVICE_ID);
        $this->addReport(
            Report::createSuccess(
                sprintf(
                    'Service %s successfully unregistered',
                    ResultTransmissionEventHandlerInterface::SERVICE_ID
                )
            )
        );
    }
}
