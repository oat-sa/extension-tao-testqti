<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiTest\models\export\Formats\Metadata\TestPackageExport as TestPackageMetadataExport;
use oat\taoQtiTest\models\export\Formats\Package2p1\TestPackageExport as TestPackage2p1Export;
use oat\taoQtiTest\models\export\Formats\Package2p2\TestPackageExport as TestPackage2p2Export;
use oat\taoQtiTest\models\TestModelService;

final class Version202211031203542260_taoQtiTest extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Updates TestModel with proper exporter handlers';
    }

    public function up(Schema $schema): void
    {
        if(!class_exists('oat\\taoQtiTest\\models\\export\\metadata\\TestMetadataByClassExportHandler')) {
            class_alias(TestPackageMetadataExport::class, 'oat\\taoQtiTest\\models\\export\\metadata\\TestMetadataByClassExportHandler');
        }

        if(!class_exists('taoQtiTest_models_classes_export_TestExport')) {
            class_alias(TestPackage2p1Export::class, 'taoQtiTest_models_classes_export_TestExport');
        }

        if(!class_exists('taoQtiTest_models_classes_export_TestExport22')) {
            class_alias(TestPackage2p2Export::class, 'taoQtiTest_models_classes_export_TestExport22');
        }

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
