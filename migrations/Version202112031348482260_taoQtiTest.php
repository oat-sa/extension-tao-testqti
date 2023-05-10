<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use common_ext_Extension as Extension;
use common_ext_ExtensionsManager as ExtensionsManager;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202112031348482260_taoQtiTest extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Set up the default item store TTL for cached proxy.';
    }

    public function up(Schema $schema): void
    {
        $extension = $this->getExtension();

        $config = $extension->getConfig(self::CONFIG_FILE);
        $config['item-store-ttl'] = self::DEFAULT_TTL;
        $extension->setConfig(self::CONFIG_FILE, $config);
    }

    public function down(Schema $schema): void
    {
        $extension = $this->getExtension();

        $config = $extension->getConfig(self::CONFIG_FILE);
        unset($config['item-store-ttl']);
        $extension->setConfig(self::CONFIG_FILE, $config);
    }

    private const CONFIG_FILE = 'testRunner';

    private const DEFAULT_TTL = 15 * 60;

    private function getExtension(): Extension
    {
        /** @var ExtensionsManager $extensionManager */
        $extensionManager = $this->getServiceLocator()->get(ExtensionsManager::SERVICE_ID);

        return $extensionManager->getExtensionById('taoQtiTest');
    }
}
