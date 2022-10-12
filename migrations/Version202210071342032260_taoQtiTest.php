<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiTest\scripts\install\SetupStateOffloadQueue;

final class Version202210071342032260_taoQtiTest extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Setup dedicated queue for state offload management';
    }

    public function up(Schema $schema): void
    {
        $setupStateOffloadQueue = $this->buildSetupStateOffloadQueueCommand();
        $this->addReport($setupStateOffloadQueue([]));
    }

    public function down(Schema $schema): void
    {
        $this->throwIrreversibleMigrationException();
    }

    private function buildSetupStateOffloadQueueCommand(): SetupStateOffloadQueue
    {
        return $this->propagate(new SetupStateOffloadQueue());
    }
}
