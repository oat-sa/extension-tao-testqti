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

        // Fix the config as the previous migrations were not adding it.
        // Set the default config if it does not exist.
        if (!array_key_exists('review', $config['plugins'])) {
            $config['plugins']['review'] = [];
        }
        if (!array_key_exists('reviewLayout', $config['plugins']['review'])) {
            $config['plugins']['review']['reviewLayout'] = 'default';
        }
        if (!array_key_exists('displaySectionTitles', $config['plugins']['review'])) {
            $config['plugins']['review']['displaySectionTitles'] = true;
        }

        // Set the new config entry
        $config['plugins']['review']['displayItemTooltip'] = false;

        $extension->setConfig(self::CONFIG_FILE, $config);

    }

    public function down(Schema $schema): void
    {
        $extension = $this->getExtension();

        $config = $extension->getConfig(self::CONFIG_FILE);
        unset($config['plugins']['review']['displayItemTooltip']);
        $extension->setConfig(self::CONFIG_FILE, $config);
    }

    private function getExtension(): Extension
    {
        /** @var ExtensionsManager $extensionManager */
        $extensionManager = $this->getServiceLocator()->get(ExtensionsManager::SERVICE_ID);

        return $extensionManager->getExtensionById('taoQtiTest');
    }
}
