<?php

/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA;
 *
 * @author Ricardo Quintanilha <ricardo.quintanilha@taotesting.com>
 */

declare(strict_types=1);

namespace oat\taoQtiTest\model\Container;

use oat\generis\model\DependencyInjection\ContainerServiceProviderInterface;
use oat\oatbox\event\EventManager;
use oat\oatbox\log\LoggerService;
use oat\taoQtiTest\model\Domain\Model\ItemResponseRepositoryInterface;
use oat\taoQtiTest\model\Domain\Model\ToolsStateRepositoryInterface;
use oat\taoQtiTest\model\Infrastructure\QtiItemResponseRepository;
use oat\taoQtiTest\model\Infrastructure\QtiToolsStateRepository;
use oat\taoQtiTest\model\Service\ExitTestService;
use oat\taoQtiTest\model\Service\ListItemsService;
use oat\taoQtiTest\model\Service\MoveService;
use oat\taoQtiTest\model\Service\PauseService;
use oat\taoQtiTest\model\Service\SkipService;
use oat\taoQtiTest\model\Service\StoreTraceVariablesService;
use oat\taoQtiTest\model\Service\TimeoutService;
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
            ->set(ListItemsService::class, ListItemsService::class)
            ->public()
            ->args(
                [
                    service(QtiRunnerService::SERVICE_ID),
                    service(LoggerService::SERVICE_ID)
                ]
            );

        $services
            ->set(ExitTestService::class, ExitTestService::class)
            ->public()
            ->args(
                [
                    service(QtiRunnerService::SERVICE_ID),
                    service(ItemResponseRepositoryInterface::class),
                    service(ToolsStateRepositoryInterface::class),
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

        $services
            ->set(PauseService::class, PauseService::class)
            ->public()
            ->args(
                [
                    service(QtiRunnerService::SERVICE_ID),
                    service(ItemResponseRepositoryInterface::class),
                ]
            );

        $services
            ->set(SkipService::class, SkipService::class)
            ->public()
            ->args(
                [
                    service(QtiRunnerService::SERVICE_ID),
                    service(ItemResponseRepositoryInterface::class),
                    service(ToolsStateRepositoryInterface::class),
                ]
            );

        $services
            ->set(StoreTraceVariablesService::class, StoreTraceVariablesService::class)
            ->public()
            ->args(
                [
                    service(QtiRunnerService::SERVICE_ID),
                    service(EventManager::SERVICE_ID),
                    service(LoggerService::SERVICE_ID),
                ]
            );

        $services
            ->set(TimeoutService::class, TimeoutService::class)
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
