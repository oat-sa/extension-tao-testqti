<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiTest\scripts\install\RegisterQtiPackageExporter;

final class Version202212131248212260_taoQtiTest extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Patch QtiTestExporter config by proper test exporter class';
    }

    public function up(Schema $schema): void
    {
        $this->runAction(new RegisterQtiPackageExporter);
    }

    public function down(Schema $schema): void
    {
        $this->throwIrreversibleMigrationException();
    }
}
