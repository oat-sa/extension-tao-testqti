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
final class Version202011031024012260_taoQtiTest extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'Register Item Scrolling plugin';
    }

    public function up(Schema $schema): void
    {
        $registry = PluginRegistry::getRegistry();
        if (!$registry->isRegistered('taoQtiTest/runner/plugins/content/itemScrolling/itemScrolling')) {
            $registry->register(TestPlugin::fromArray([
                'id' => 'itemScrolling',
                'name' => 'Item Scrolling',
                'module' => 'taoQtiTest/runner/plugins/content/itemScrolling/itemScrolling',
                'description' => 'Add behavior from enable/disable scrolling option',
                'category' => 'content',
                'active' => true,
                'tags' => [  ]
            ]));
        }
    }

    public function down(Schema $schema): void
    {
        $registry = PluginRegistry::getRegistry();
        if ($registry->isRegistered('taoQtiTest/runner/plugins/content/itemScrolling/itemScrolling')) {
            $registry->remove('taoQtiTest/runner/plugins/content/itemScrolling/itemScrolling');
        }
    }
}
