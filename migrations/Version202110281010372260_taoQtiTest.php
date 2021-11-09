<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiTest\scripts\install\DisableAloudTextToSpeech;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202110281010372260_taoQtiTest extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'Disables aloud text-to-speech for test authoring';
    }

    public function up(Schema $schema): void
    {
        $this->addReport(
            $this->propagate(
                new DisableAloudTextToSpeech()
            )([])
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        /**
         * Nothing to do here cause the feature is disabled by a default config if you want to enable create a new migration
         */
    }
}
