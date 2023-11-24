<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoTests\models\runner\plugins\PluginRegistry;
use oat\taoTests\models\runner\plugins\TestPlugin;

/**
 * Auto-generated Migration: Please modify to your needs!
 *
 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202311241512382260_taoQtiTest extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Register plugin to prevent session concurrency';
    }

    public function up(Schema $schema): void
    {
        $registry = PluginRegistry::getRegistry();
        if (!$registry->isRegistered('taoQtiTest/runner/plugins/controls/session/preventConcurrency')) {
            $registry->register(TestPlugin::fromArray([
                'id' => 'preventConcurrency',
                'name' => 'Prevent session concurrency',
                'module' => 'taoQtiTest/runner/plugins/controls/session/preventConcurrency',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Detect concurrent deliveries launched from the same user session',
                'category' => 'controls',
                'active' => true,
                'tags' => [ 'core', 'technical' ]
            ]));
        }
    }

    public function down(Schema $schema): void
    {
        $registry = PluginRegistry::getRegistry();
        if ($registry->isRegistered('taoQtiTest/runner/plugins/controls/session/preventConcurrency')) {
            $registry->remove('taoQtiTest/runner/plugins/controls/session/preventConcurrency');
        }
    }
}
