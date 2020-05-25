<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use Exception;
use oat\tao\scripts\tools\migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202005251047342260_taoQtiTest extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'A failing migration for taoQtiTest.';
    }

    public function up(Schema $schema): void
    {
        throw new Exception('Database error in migration taoQtiTest migration');

        $this->getLogger()->debug("You've just spotted an issue if you are reading me now. Investigate further.");
    }

    public function down(Schema $schema): void
    {
        $this->getLogger()->debug("taoQtiTest Migration 5 DOWN.");
    }
}
