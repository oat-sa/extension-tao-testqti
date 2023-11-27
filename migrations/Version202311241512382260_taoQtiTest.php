<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiTest\scripts\install\RegisterTestRunnerPlugins;
use oat\taoTests\models\runner\plugins\PluginRegistry;

/**
 * Auto-generated Migration: Please modify to your needs!
 *
 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202311241512382260_taoQtiTest extends AbstractMigration
{
    public const PLUGIN_URI = 'taoQtiTest/runner/plugins/controls/session/preventConcurrency';

    public function getDescription(): string
    {
        return 'Register plugin to prevent session concurrency';
    }

    public function up(Schema $schema): void
    {
        $registry = PluginRegistry::getRegistry();

        if (!$registry->isRegistered(self::PLUGIN_URI)) {
            $registry->register(RegisterTestRunnerPlugins::getPlugin('preventConcurrency'));
        }
    }

    public function down(Schema $schema): void
    {
        $registry = PluginRegistry::getRegistry();

        if ($registry->isRegistered(self::PLUGIN_URI)) {
            $registry->remove(self::PLUGIN_URI);
        }
    }
}
