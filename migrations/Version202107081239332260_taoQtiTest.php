<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoTests\models\runner\plugins\PluginRegistry;
use oat\taoTests\models\runner\plugins\TestPlugin;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202107081239332260_taoQtiTest extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'added taoQtiTest/runner/plugins/content/accessibility/rtlHandler plugin';
    }

    public function up(Schema $schema): void
    {
        $registry = PluginRegistry::getRegistry();
        $registry->register(TestPlugin::fromArray([
            'id' => 'rtlHandler',
            'name' => 'RTL handler',
            'module' => 'taoQtiTest/runner/plugins/content/accessibility/rtlHandler',
            'bundle' => 'taoQtiTest/loader/testPlugins.min',
            'description' => 'Supply for items configured with RTL language in scope of LTR tests',
            'category' => 'content',
            'active' => true,
            'tags' => []
        ]));
    }

    public function down(Schema $schema): void
    {
        $registry = PluginRegistry::getRegistry();
        $registry->remove('taoQtiTest/runner/plugins/content/accessibility/rtlHandler');
    }
}
