<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\oatbox\event\EventManager;
use oat\tao\model\resources\Event\InstanceCopiedEvent;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiTest\models\classes\event\TestImportedEvent;
use oat\taoQtiTest\models\UniqueId\Listener\TestCreationListener;
use oat\taoTests\models\event\TestCreatedEvent;
use oat\taoTests\models\event\TestDuplicatedEvent;

/**
 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202409111328132261_taoQtiTest extends AbstractMigration
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
            [TestCreationListener::class, 'populateUniqueId']
        );
        $eventManager->attach(
            TestDuplicatedEvent::class,
            [TestCreationListener::class, 'populateUniqueId']
        );
        $eventManager->attach(
            TestImportedEvent::class,
            [TestCreationListener::class, 'populateUniqueId']
        );
        $eventManager->attach(
            InstanceCopiedEvent::class,
            [TestCreationListener::class, 'populateUniqueId']
        );

        $this->getServiceManager()->register(EventManager::SERVICE_ID, $eventManager);
    }

    public function down(Schema $schema): void
    {
        /** @var EventManager $eventManager */
        $eventManager = $this->getServiceManager()->get(EventManager::SERVICE_ID);

        $eventManager->detach(
            TestCreatedEvent::class,
            [TestCreationListener::class, 'populateUniqueId']
        );
        $eventManager->detach(
            TestDuplicatedEvent::class,
            [TestCreationListener::class, 'populateUniqueId']
        );
        $eventManager->detach(
            TestImportedEvent::class,
            [TestCreationListener::class, 'populateUniqueId']
        );
        $eventManager->detach(
            InstanceCopiedEvent::class,
            [TestCreationListener::class, 'populateUniqueId']
        );
        $this->getServiceManager()->register(EventManager::SERVICE_ID, $eventManager);
    }
}
