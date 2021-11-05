<?php

declare(strict_types=1);

namespace oat\taoQtiTest\model\Container;

use oat\generis\model\DependencyInjection\ContainerServiceProviderInterface;
use oat\taoQtiTest\model\Domain\Model\ItemResponseRepositoryInterface;
use oat\taoQtiTest\model\Domain\Model\ToolsStateRepositoryInterface;
use oat\taoQtiTest\model\Infrastructure\QtiItemResponseRepository;
use oat\taoQtiTest\model\Infrastructure\QtiToolsStateRepository;
use oat\taoQtiTest\model\Service\MoveService;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

class TestQtiServiceProvider implements ContainerServiceProviderInterface
{
    public function __invoke(ContainerConfigurator $configurator): void
    {
        $services = $configurator->services();

        $services
            ->set(ItemResponseRepositoryInterface::class, QtiItemResponseRepository::class)
            ->public()
            ->args(
                [
                    service(QtiRunnerService::SERVICE_ID)
                ]
            );

        $services
            ->set(ToolsStateRepositoryInterface::class, QtiToolsStateRepository::class)
            ->public()
            ->args(
                [
                    service(QtiRunnerService::SERVICE_ID)
                ]
            );

        $services
            ->set(MoveService::class, MoveService::class)
            ->public()
            ->args(
                [
                    service(QtiRunnerService::SERVICE_ID),
                    service(ItemResponseRepositoryInterface::class),
                    service(ToolsStateRepositoryInterface::class),
                ]
            );
    }
}
