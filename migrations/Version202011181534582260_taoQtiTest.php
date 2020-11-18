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
final class Version202011181534582260_taoQtiTest extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'Register Pause-on-Error plugin';
    }

    public function up(Schema $schema): void
    {
        $registry = PluginRegistry::getRegistry();
        if (!$registry->isRegistered('taoQtiTest/runner/plugins/controls/connectivity/pauseOnError')) {
            $registry->register(TestPlugin::fromArray([
                'id' => 'pauseOnError',
                'name' => 'Reacts to errors',
                'module' => 'taoQtiTest/runner/plugins/controls/connectivity/pauseOnError',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'When an error occurs, lets the user pause the test or reload the page',
                'category' => 'controls',
                'active' => false,
                'tags' => [ 'core', 'technical' ]
            ]));
        }
    }

    public function down(Schema $schema): void
    {
        $registry = PluginRegistry::getRegistry();
        if ($registry->isRegistered('taoQtiTest/runner/plugins/controls/connectivity/pauseOnError')) {
            $registry->remove('taoQtiTest/runner/plugins/controls/connectivity/pauseOnError');
        }
    }
}
