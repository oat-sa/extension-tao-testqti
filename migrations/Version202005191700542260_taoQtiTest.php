<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\oatbox\service\ServiceManagerAwareInterface;
use \common_report_Report as Report;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202005191700542260_taoQtiTest extends AbstractMigration implements ServiceManagerAwareInterface
{
    public function getDescription(): string
    {
        return 'A test migration for extension taoQtiTest (2).';
    }

    public function up(Schema $schema): void
    {
        $this->getLogger()->debug("taoQtiTest Migration 2 UP.");
        $this->addReport(Report::createInfo('taoQtiTest Migration 2 UP Report!'));
    }

    public function down(Schema $schema): void
    {
        $this->getLogger()->debug("taoQtiTest Migration 2 DOWN.");
        $this->addReport(Report::createInfo('taoQtiTest Migration 2 DOWN Report!'));
    }
}
