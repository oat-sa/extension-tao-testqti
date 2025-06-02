<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\tao\scripts\update\OntologyUpdater;

/**
 * Sync ontology models for taoQtiTest.
 *
 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202506021216582260_taoQtiTest extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        OntologyUpdater::syncModels();
    }

    public function down(Schema $schema): void
    {
        OntologyUpdater::syncModels();
    }
}
