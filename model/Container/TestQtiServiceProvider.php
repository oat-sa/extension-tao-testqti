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
 * Copyright (c) 2021-2024 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\model\Container;

use oat\generis\model\data\Ontology;
use oat\generis\model\DependencyInjection\ContainerServiceProviderInterface;
use oat\oatbox\event\EventManager;
use oat\oatbox\log\LoggerService;
use oat\tao\model\featureFlag\FeatureFlagChecker;
use oat\taoDelivery\model\execution\DeliveryExecutionService;
use oat\taoDelivery\model\execution\StateServiceInterface;
use oat\taoDelivery\model\RuntimeService;
use oat\taoQtiTest\model\Domain\Model\ItemResponseRepositoryInterface;
use oat\taoQtiTest\model\Domain\Model\QtiTestRepositoryInterface;
use oat\taoQtiTest\model\Domain\Model\ToolsStateRepositoryInterface;
use oat\taoQtiTest\model\Infrastructure\QtiItemResponseRepository;
use oat\taoQtiTest\model\Infrastructure\QtiItemResponseValidator;
use oat\taoQtiTest\model\Infrastructure\QtiToolsStateRepository;
use oat\taoQtiTest\model\Infrastructure\QtiTestRepository;
use oat\taoQtiTest\model\Infrastructure\Validation\ChoiceResponseValidationStrategy;
use oat\taoQtiTest\model\Infrastructure\Validation\ExtraQtiInteractionResponseValidator;
use oat\taoQtiTest\model\Service\ConcurringSessionService;
use oat\taoQtiTest\model\Service\ExitTestService;
use oat\taoQtiTest\model\Service\ListItemsService;
use oat\taoQtiTest\model\Service\MoveService;
use oat\taoQtiTest\model\Service\PauseService;
use oat\taoQtiTest\model\Service\PluginManagerService;
use oat\taoQtiTest\model\Service\SkipService;
use oat\taoQtiTest\model\Service\StoreTraceVariablesService;
use oat\taoQtiTest\model\Service\TimeoutService;
use oat\taoQtiTest\models\classes\scale\ScaleHandler;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\time\TimerAdjustmentServiceInterface;
use oat\taoQtiTest\models\TestModelService;
use oat\taoQtiTest\models\TestSessionService;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use common_ext_ExtensionsManager as ExtensionsManager;
use taoQtiTest_models_classes_QtiTestService as QtiTestService;

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
                    service(QtiRunnerService::SERVICE_ID),
                    service(FeatureFlagChecker::class),
                    service(QtiItemResponseValidator::class),
                    service(ExtraQtiInteractionResponseValidator::class),
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

        $services
            ->set(QtiTestRepositoryInterface::class, QtiTestRepository::class)
            ->public()
            ->args(
                [
                    service(Ontology::SERVICE_ID),
                    service(TestModelService::SERVICE_ID),
                ]
            );

        $services
            ->set(ConcurringSessionService::class, ConcurringSessionService::class)
            ->public()
            ->args(
                [
                    service(LoggerService::SERVICE_ID),
                    service(QtiRunnerService::SERVICE_ID),
                    service(RuntimeService::SERVICE_ID),
                    service(DeliveryExecutionService::SERVICE_ID),
                    service(FeatureFlagChecker::class),
                    service(StateServiceInterface::SERVICE_ID),
                    service(TestSessionService::SERVICE_ID),
                    service(TimerAdjustmentServiceInterface::SERVICE_ID),
                ]
            );

        $services
            ->set(QtiItemResponseValidator::class, QtiItemResponseValidator::class)
            ->public();

        $services
            ->set(PluginManagerService::class, PluginManagerService::class)
            ->args(
                [
                    service(Ontology::SERVICE_ID),
                    service(ExtensionsManager::SERVICE_ID),
                ]
            )
            ->public();

        $services->set(ChoiceResponseValidationStrategy::class, ChoiceResponseValidationStrategy::class);
        $services
            ->set(ExtraQtiInteractionResponseValidator::class, ExtraQtiInteractionResponseValidator::class)
            ->public()
            ->args(
                [
                    service(ChoiceResponseValidationStrategy::class)
                ]
            );

        $services->set(ScaleHandler::class)
            ->args(
                [
                    service(QtiTestService::class),
                ]
            )
            ->public();
    }
}
