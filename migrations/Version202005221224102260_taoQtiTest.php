<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use Exception;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\oatbox\service\ServiceManagerAwareInterface;
use oat\oatbox\service\ServiceManagerAwareTrait;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202005221224102260_taoQtiTest extends AbstractMigration implements ServiceManagerAwareInterface
{
    use ServiceManagerAwareTrait;

    public function getDescription(): string
    {
        return 'A failing migration test for extension taoQtiTest (2).';
    }

    public function up(Schema $schema): void
    {
        $this->getLogger()->debug("This will now break, because we are throwing an exception.");

        throw new Exception('Migration error!');
    }

    public function down(Schema $schema): void
    {
        $this->getLogger()->debug("Reverting migration.");
    }
}
