<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use Exception;
use oat\tao\scripts\tools\migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202005221224102260_taoQtiTest extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'A successful migration test for extension taoQtiTest (2).';
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
