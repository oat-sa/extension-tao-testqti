<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202010231329012260_taoQtiTest extends AbstractMigration
{
    public function getDescription(): string
    {
        return "set option 'default-validate-response'";
    }

    public function up(Schema $schema): void
    {
        $extension = $this->getServiceLocator()->get(\common_ext_ExtensionsManager::SERVICE_ID)->getExtensionById('taoQtiTest');
        $config = $extension->getConfig('testRunner');
        $config['default-validate-response'] = true;
        $extension->setConfig('testRunner', $config);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $extension = $this->getServiceLocator()->get(\common_ext_ExtensionsManager::SERVICE_ID)->getExtensionById('taoQtiTest');
        $config = $extension->getConfig('testRunner');
        unset($config['default-validate-response']);
        $extension->setConfig('testRunner', $config);
    }
}
