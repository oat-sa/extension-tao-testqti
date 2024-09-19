<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\oatbox\event\EventManager;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiTest\models\UniqueId\Listener\TestCreatedEventListener;
use oat\taoTests\models\event\TestCreatedEvent;

/**
 * Auto-generated Migration: Please modify to your needs!
 *
 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202409111328132260_taoQtiTest extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add new listener to populate translation properties';
    }

    public function up(Schema $schema): void
    {
        /** @var EventManager $eventManager */
        $eventManager = $this->getServiceManager()->get(EventManager::SERVICE_ID);
        $eventManager->attach(
            TestCreatedEvent::class,
            [TestCreatedEventListener::class, 'populateUniqueId']
        );
    }

    public function down(Schema $schema): void
    {
        /** @var EventManager $eventManager */
        $eventManager = $this->getServiceManager()->get(EventManager::SERVICE_ID);
        $eventManager->detach(
            TestCreatedEvent::class,
            [TestCreatedEventListener::class, 'populateUniqueId']
        );
    }
}
