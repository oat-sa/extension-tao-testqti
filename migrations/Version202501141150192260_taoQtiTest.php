<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\taoQtiTest\models\TestModelService;
use oat\taoQtiTest\models\export\Formats\Package3p0\TestPackageExport;

/**
 * Auto-generated Migration: Please modify to your needs!
 *
 * phpcs:disable Squiz.Classes.ValidClassName
 */
final class Version202501141150192260_taoQtiTest extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add QTI 3.0 Package Export handler to TestModel service configuration';
    }

    public function up(Schema $schema): void
    {
        $testModelService = $this->getServiceLocator()->get(TestModelService::SERVICE_ID);

        if (!$testModelService->hasOption('exportHandlers')) {
            return;
        }

        $handlers = $testModelService->getOption('exportHandlers');

        $hasHandler = false;
        foreach ($handlers as $handler) {
            if ($handler instanceof TestPackageExport) {
                $hasHandler = true;
                break;
            }
        }

        if (!$hasHandler) {
            $handlers[] = new TestPackageExport();
            $testModelService->setOption('exportHandlers', $handlers);
            $this->getServiceLocator()->register(TestModelService::SERVICE_ID, $testModelService);
        }
    }

    public function down(Schema $schema): void
    {
        $testModelService = $this->getServiceLocator()->get(TestModelService::SERVICE_ID);

        if (!$testModelService->hasOption('exportHandlers')) {
            return;
        }

        $handlers = $testModelService->getOption('exportHandlers');

        $filteredHandlers = array_filter($handlers, function($handler) {
            return !($handler instanceof TestPackageExport);
        });

        $testModelService->setOption('exportHandlers', $filteredHandlers);
        $this->getServiceLocator()->register(TestModelService::SERVICE_ID, $testModelService);
    }
}
