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

namespace oat\taoQtiTest\models\UniqueId\ServiceProvider;

use oat\generis\model\data\Ontology;
use oat\generis\model\DependencyInjection\ContainerServiceProviderInterface;
use oat\oatbox\log\LoggerService;
use oat\tao\model\featureFlag\FeatureFlagChecker;
use oat\tao\model\IdentifierGenerator\Generator\IdentifierGeneratorProxy;
use oat\taoQtiTest\models\UniqueId\Form\Modifier\UniqueIdFormModifier;
use oat\taoQtiTest\models\UniqueId\Listener\TestCreationListener;
use oat\taoQtiTest\models\UniqueId\Service\QtiIdentifierRetriever;
use oat\taoQtiTest\models\UniqueId\Service\QtiIdentifierSetter;
use oat\taoTests\models\Form\Modifier\FormModifierProxy;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use taoQtiTest_models_classes_QtiTestService;

use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

class UniqueIdServiceProvider implements ContainerServiceProviderInterface
{
    public function __invoke(ContainerConfigurator $configurator): void
    {
        $services = $configurator->services();

        $services
            ->set(QtiIdentifierRetriever::class, QtiIdentifierRetriever::class)
            ->args([
                service(taoQtiTest_models_classes_QtiTestService::class),
                service(LoggerService::SERVICE_ID),
            ]);

        $services
            ->set(UniqueIdFormModifier::class, UniqueIdFormModifier::class)
            ->args([
                service(Ontology::SERVICE_ID),
                service(QtiIdentifierRetriever::class),
                service(FeatureFlagChecker::class),
            ]);

        $services
            ->get(FormModifierProxy::class)
            ->call(
                'addModifier',
                [
                    service(UniqueIdFormModifier::class),
                ]
            );

        $services
            ->set(QtiIdentifierSetter::class, QtiIdentifierSetter::class)
            ->args([
                service(taoQtiTest_models_classes_QtiTestService::class),
                service(LoggerService::SERVICE_ID),
            ]);

        $services
            ->set(TestCreationListener::class, TestCreationListener::class)
            ->public()
            ->args([
                service(FeatureFlagChecker::class),
                service(Ontology::SERVICE_ID),
                service(IdentifierGeneratorProxy::class),
                service(QtiIdentifierSetter::class),
            ]);
    }
}
