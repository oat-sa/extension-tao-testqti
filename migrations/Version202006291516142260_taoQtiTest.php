<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use common_Exception;
use Doctrine\DBAL\Schema\Schema;
use oat\oatbox\service\exception\InvalidServiceManagerException;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiTest\models\test\AssessmentTestXmlBuilder;
use oat\taoQtiTest\models\test\AssessmentTestXmlBuilderInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202006291516142260_taoQtiTest extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'Register ' . AssessmentTestXmlBuilder::class;
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
            AssessmentTestXmlBuilderInterface::SERVICE_ID,
            new AssessmentTestXmlBuilder()
        );
    }

    /**
     * @param Schema $schema
     *
     * @throws InvalidServiceManagerException
     */
    public function down(Schema $schema): void
    {
        $this->getServiceManager()->unregister(AssessmentTestXmlBuilderInterface::SERVICE_ID);
    }
}
