<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use common_ext_ExtensionsManager as ExtensionsManager;
use common_exception_Error as Error;
use oat\taoQtiTest\scripts\install\DisableBRSinTestAuthoring;
use common_ext_ExtensionException as ExtensionException;
use oat\oatbox\service\exception\InvalidServiceManagerException;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202107210931372260_taoQtiTest extends AbstractMigration
{

    /**
     * @return string
     */
    public function getDescription(): string
    {
        return 'Disable feature flag BRS (search by metadata) within Test Authoring';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->propagate(new DisableBRSinTestAuthoring())([]);
    }

    /**
     * @throws Error
     * @throws InvalidServiceManagerException
     * @throws ExtensionException
     */
    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
         /** @var ExtensionsManager $extensionManager */
         $extensionManager = $this->getServiceManager()->get(ExtensionsManager::SERVICE_ID);
         $extension = $extensionManager->getExtensionById('tao');
 
         $config = $extension->getConfig('client_lib_config_registry');
         unset($config['taoQtiTest/controller/creator/views/item']);
 
         $extension->setConfig('client_lib_config_registry', $config);
    }
}
