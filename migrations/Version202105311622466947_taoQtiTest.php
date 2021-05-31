<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\oatbox\event\EventManager;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiTest\models\event\AfterAssessmentTestSessionClosedEvent;
use oat\taoQtiTest\models\QtiTestListenerService;
use common_ext_Extension as Extension;
use common_ext_ExtensionsManager as ExtensionsManager;
use common_ext_ExtensionException as ExtensionException;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202105311622466947_taoQtiTest extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'Register AfterAssessmentTestSessionClosedEvent listener + set new config OPTION_ARCHIVE_ENABLED';
    }

    public function up(Schema $schema): void
    {
        /** @var EventManager $eventManager */
        $eventManager = $this->getServiceManager()->get(EventManager::SERVICE_ID);

        $eventManager->attach(
            AfterAssessmentTestSessionClosedEvent::class,
            [QtiTestListenerService::class, 'archiveState']
        );

        $this->getServiceManager()->register(EventManager::SERVICE_ID, $eventManager);

        // add config
        $extension = $this->getExtension();
        $config = $extension->getConfig('QtiTestListenerService')->getOptions();
        $config[QtiTestListenerService::OPTION_ARCHIVE_ENABLED] = true;
        $extension->setConfig('QtiTestListenerService', $config);
    }

    public function down(Schema $schema): void
    {
        /** @var EventManager $eventManager */
        $eventManager = $this->getServiceManager()->get(EventManager::SERVICE_ID);

        $eventManager->detach(
            AfterAssessmentTestSessionClosedEvent::class,
            [QtiTestListenerService::class, 'archiveState']
        );

        $this->getServiceManager()->register(EventManager::SERVICE_ID, $eventManager);

        // remove config
        $extension = $this->getExtension();
        $config = $extension->getConfig('QtiTestListenerService')->getOptions();

        if (array_key_exists(QtiTestListenerService::OPTION_ARCHIVE_ENABLED, $config)) {
            unset($config[QtiTestListenerService::OPTION_ARCHIVE_ENABLED]);
        }

        $extension->setConfig('QtiTestListenerService', $config);
    }

    /**
     * @throws ExtensionException
     *
     * @return Extension
     */
    private function getExtension(): Extension
    {
        /** @var ExtensionsManager $extensionManager */
        $extensionManager = $this->getServiceLocator()->get(ExtensionsManager::SERVICE_ID);

        return $extensionManager->getExtensionById('taoQtiTest');
    }
}
