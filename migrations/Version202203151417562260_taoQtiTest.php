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
final class Version202203151417562260_taoQtiTest extends AbstractMigration
{
    private const CONFIG_FILE = 'testRunner';

    public function getDescription(): string
    {
        return 'Set up default config for test-runner review panel';
    }

    public function up(Schema $schema): void
    {
        $extension = $this->getExtension();

        $config = $extension->getConfig(self::CONFIG_FILE);
        $config['plugins']['review']['reviewLayout'] = 'default';
        $config['plugins']['review']['displaySectionTitles'] = true;
        $config['plugins']['review']['displayItemTooltip'] = false;
        $extension->setConfig(self::CONFIG_FILE, $config);

    }

    public function down(Schema $schema): void
    {
        $extension = $this->getExtension();

        $config = $extension->getConfig(self::CONFIG_FILE);
        unset($config['plugins']['review']);
        $extension->setConfig(self::CONFIG_FILE, $config);
    }

    private function getExtension(): Extension
    {
        /** @var ExtensionsManager $extensionManager */
        $extensionManager = $this->getServiceLocator()->get(ExtensionsManager::SERVICE_ID);

        return $extensionManager->getExtensionById('taoQtiTest');
    }
}
