<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use common_Exception;
use Doctrine\DBAL\Schema\Schema;
use oat\oatbox\service\exception\InvalidServiceManagerException;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoItems\model\render\ItemAssetsInterface;
use oat\taoItems\model\render\NoneItemAssets;
use oat\taoItems\model\render\NoneItemReplacement;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202007062037452260_taoQtiTest extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'Register ' . NoneItemReplacement::class;
    }

    /**
     * @param Schema $schema
     *
     * @throws common_Exception
     * @throws InvalidServiceManagerException
     */
    public function up(Schema $schema): void
    {
        $this->getServiceManager()->register(
            ItemAssetsInterface::SERVICE_ID,
            new NoneItemAssets()
        );
    }

    /**
     * @param Schema $schema
     *
     * @throws InvalidServiceManagerException
     */
    public function down(Schema $schema): void
    {
        $this->getServiceManager()->unregister(ItemAssetsInterface::SERVICE_ID);
    }
}
