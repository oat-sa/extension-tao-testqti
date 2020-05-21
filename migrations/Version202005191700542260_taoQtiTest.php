<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\oatbox\service\ServiceManagerAwareInterface;
use oat\oatbox\service\ServiceManagerAwareTrait;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202005191700542260_taoQtiTest extends AbstractMigration implements ServiceManagerAwareInterface
{
    use ServiceManagerAwareTrait;

    public function getDescription(): string
    {
        return 'A test migration for extension taoQtiTest (2).';
    }

    public function up(Schema $schema): void
    {
        $this->getLogger()->debug("taoQtiTest Migration 2 UP.");
    }

    public function down(Schema $schema): void
    {
        $this->getLogger()->debug("taoQtiTest Migration 2 DOWN.");
    }
}
