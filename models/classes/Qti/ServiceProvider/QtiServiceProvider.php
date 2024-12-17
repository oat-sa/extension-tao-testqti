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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\Qti\ServiceProvider;

use oat\generis\model\DependencyInjection\ContainerServiceProviderInterface;
use oat\oatbox\log\LoggerService;
use oat\taoQtiItem\model\qti\converter\CaseConversionService;
use oat\taoQtiTest\models\Qti\Converter\TestConverter;
use oat\taoQtiTest\models\Qti\Identifier\Service\QtiIdentifierSetter;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use taoQtiTest_models_classes_QtiTestService;
use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

class QtiServiceProvider implements ContainerServiceProviderInterface
{
    public function __invoke(ContainerConfigurator $configurator): void
    {
        $services = $configurator->services();

        $services
            ->set(QtiIdentifierSetter::class, QtiIdentifierSetter::class)
            ->args([
                service(taoQtiTest_models_classes_QtiTestService::class),
                service(LoggerService::SERVICE_ID),
            ]);

        $services
            ->set(TestConverter::class)
            ->args([
                service(CaseConversionService::class),
            ])
            ->public();
    }
}
