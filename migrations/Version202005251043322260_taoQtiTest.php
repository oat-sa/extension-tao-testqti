<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202005251043322260_taoQtiTest extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'A successful migration test for extension taoQtiTest (3).';
    }

    public function up(Schema $schema): void
    {
        $this->getLogger()->debug("taoQtiTest Migration 3 UP.");
    }

    public function down(Schema $schema): void
    {
        $this->getLogger()->debug("taoQtiTest Migration 3 DOWN.");
    }
}
