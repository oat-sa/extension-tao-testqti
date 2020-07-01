<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use common_Exception;
use Doctrine\DBAL\Schema\Schema;
use oat\oatbox\service\exception\InvalidServiceManagerException;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiTest\models\test\AssessmentTestXmlFactory;
use oat\taoQtiTest\models\test\AssessmentTestXmlFactoryInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202006291516142260_taoQtiTest extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'Register ' . AssessmentTestXmlFactory::class;
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
            AssessmentTestXmlFactoryInterface::SERVICE_ID,
            new AssessmentTestXmlFactory()
        );
    }

    /**
     * @param Schema $schema
     *
     * @throws InvalidServiceManagerException
     */
    public function down(Schema $schema): void
    {
        $this->getServiceManager()->unregister(AssessmentTestXmlFactoryInterface::SERVICE_ID);
    }
}
