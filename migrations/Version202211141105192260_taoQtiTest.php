<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiTest\models\export\Formats\Metadata\TestPackageExport;
use oat\taoQtiTest\models\export\Formats\Package2p1\TestPackageExport as TestPackage2p1Export;
use oat\taoQtiTest\models\TestModelService;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202211141105192260_taoQtiTest extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'Updates TestModel with proper Metadata Exporter handler';
    }

    public function up(Schema $schema): void
    {
        class_alias(TestPackageExport::class, 'oat\\taoQtiTest\\models\\export\\metadata\\TestMetadataByClassExportHandler');

        $testModelService = $this->getServiceLocator()->get(TestModelService::SERVICE_ID);

        if (!$testModelService->hasOption('exportHandlers')) {
            return;
        }

        $testModelService->setOption('exportHandlers', $testModelService->getOption('exportHandlers'));

        $this->getServiceLocator()->register(TestModelService::SERVICE_ID, $testModelService);
    }

    public function down(Schema $schema): void
    {
        $this->throwIrreversibleMigrationException();
    }
}
