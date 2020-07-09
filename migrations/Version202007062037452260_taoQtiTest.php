<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use common_Exception;
use Doctrine\DBAL\Schema\Schema;
use oat\oatbox\service\exception\InvalidServiceManagerException;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiTest\models\render\QtiPackageImportPreprocessing;
use oat\taoQtiTest\models\render\NoneQtiPackageImportPreprocessing;


/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202007062037452260_taoQtiTest extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'Register ' . NoneQtiPackageImportPreprocessing::class;
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
            QtiPackageImportPreprocessing::SERVICE_ID,
            new NoneQtiPackageImportPreprocessing()
        );
    }

    /**
     * @param Schema $schema
     *
     * @throws InvalidServiceManagerException
     */
    public function down(Schema $schema): void
    {
        $this->getServiceManager()->unregister(QtiPackageImportPreprocessing::SERVICE_ID);
    }
}
