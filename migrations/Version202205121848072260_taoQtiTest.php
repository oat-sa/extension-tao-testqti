<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use common_ext_Extension as Extension;
use common_ext_ExtensionsManager as ExtensionsManager;

final class Version202205121848072260_taoQtiTest extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'Set up test runner configuration option "test-taker-review-partially-answered-is-answered"';
    }

    public function up(Schema $schema): void
    {
        $extension = $this->getExtension();

        $config = $extension->getConfig(self::CONFIG_FILE);
        $config['test-taker-review-partially-answered-is-answered'] = true;
        $extension->setConfig(self::CONFIG_FILE, $config);
    }

    public function down(Schema $schema): void
    {
        $extension = $this->getExtension();

        $config = $extension->getConfig(self::CONFIG_FILE);
        unset($config['test-taker-review-partially-answered-is-answered']);
        $extension->setConfig(self::CONFIG_FILE, $config);
    }

    private const CONFIG_FILE = 'testRunner';

    private function getExtension(): Extension
    {
        /** @var ExtensionsManager $extensionManager */
        $extensionManager = $this->getServiceLocator()->get(ExtensionsManager::SERVICE_ID);

        return $extensionManager->getExtensionById('taoQtiTest');
    }
}
