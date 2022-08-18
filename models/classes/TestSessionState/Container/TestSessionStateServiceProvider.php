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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA
 *
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\TestSessionState\Container;

use oat\generis\model\DependencyInjection\ContainerServiceProviderInterface;
use oat\oatbox\log\LoggerService;
use oat\tao\model\state\StateMigration;
use oat\tao\model\taskQueue\QueueDispatcherInterface;
use oat\taoQtiTest\models\QtiTestUtils;
use oat\taoQtiTest\models\TestSessionService;
use oat\taoQtiTest\models\TestSessionState\Api\TestSessionStateRestorationInterface;
use oat\taoQtiTest\models\TestSessionState\TestSessionStateRestorationService;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

class TestSessionStateServiceProvider implements ContainerServiceProviderInterface
{
    public function __invoke(ContainerConfigurator $configurator): void
    {
        $services = $configurator->services();
        $services
            ->set(TestSessionStateRestorationInterface::class, TestSessionStateRestorationService::class)
            ->public()
            ->args(
                [
                    service(TestSessionService::SERVICE_ID),
                    service(QtiTestUtils::SERVICE_ID),
                    service(StateMigration::SERVICE_ID),
                    service(LoggerService::SERVICE_ID),
                    service(QueueDispatcherInterface::SERVICE_ID),
                ]
            );
    }
}
