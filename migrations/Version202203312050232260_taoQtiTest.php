<?php

declare(strict_types=1);

namespace oat\taoQtiTest\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\tao\model\ClientLibRegistry;
use oat\tao\model\asset\AssetService;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202203312050232260_taoQtiTest extends AbstractMigration
{

    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $clientLibRegistry = ClientLibRegistry::getRegistry();
        $clientLibRegistry->remove('taoQtiTest/runner');
    }

    public function down(Schema $schema): void
    {
        $assetService = $this->getServiceManager()->get(AssetService::SERVICE_ID);
        $taoTestRunnerQtiDir = $assetService->getJsBaseWww('taoQtiTest') . 'node_modules/@oat-sa/tao-test-runner-qti/dist';
        $clientLibRegistry = ClientLibRegistry::getRegistry();
        $clientLibRegistry->register('taoQtiTest/runner', $taoTestRunnerQtiDir);
    }
}
