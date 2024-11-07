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

namespace oat\taoQtiTest\models\Translation\ServiceProvider;

use oat\generis\model\data\Ontology;
use oat\generis\model\DependencyInjection\ContainerServiceProviderInterface;
use oat\oatbox\log\LoggerService;
use oat\tao\model\TaoOntology;
use oat\tao\model\Translation\Repository\ResourceTranslationRepository;
use oat\tao\model\Translation\Service\TranslationCreationService;
use oat\tao\model\Translation\Service\TranslationSyncService as TaoTranslationSyncService;
use oat\tao\model\Translation\Service\TranslationUniqueIdSetter;
use oat\taoQtiTest\models\Qti\Identifier\Service\QtiIdentifierSetter;
use oat\taoQtiTest\models\Translation\Service\TestTranslator;
use oat\taoQtiTest\models\Translation\Service\TranslationPostCreationService;
use oat\taoQtiTest\models\Translation\Service\TranslationSyncService;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use taoQtiTest_models_classes_QtiTestService;

use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

class TranslationServiceProvider implements ContainerServiceProviderInterface
{
    public function __invoke(ContainerConfigurator $configurator): void
    {
        $services = $configurator->services();

        $services
            ->set(TestTranslator::class, TestTranslator::class)
            ->args([
                service(taoQtiTest_models_classes_QtiTestService::class),
                service(Ontology::SERVICE_ID),
                service(ResourceTranslationRepository::class),
                service(LoggerService::SERVICE_ID),
            ]);

        $services
            ->set(TranslationSyncService::class, TranslationSyncService::class)
            ->args([
                service(TestTranslator::class),
                service(LoggerService::SERVICE_ID),
            ]);

        $services
            ->get(TaoTranslationSyncService::class)
            ->call(
                'addSynchronizer',
                [
                    TaoOntology::CLASS_URI_TEST,
                    service(TranslationSyncService::class),
                ]
            );

        $services
            ->set(TranslationPostCreationService::class, TranslationPostCreationService::class)
            ->args([
                service(TestTranslator::class),
                service(LoggerService::SERVICE_ID),
            ]);

        $services
            ->get(TranslationUniqueIdSetter::class)
            ->call(
                'addQtiIdentifierSetter',
                [
                    service(QtiIdentifierSetter::class),
                    TaoOntology::CLASS_URI_TEST,
                ]
            );

        $services
            ->get(TranslationCreationService::class)
            ->call(
                'addPostCreation',
                [
                    TaoOntology::CLASS_URI_TEST,
                    service(TranslationPostCreationService::class)
                ]
            )
            ->call(
                'addPostCreation',
                [
                    TaoOntology::CLASS_URI_TEST,
                    service(TranslationUniqueIdSetter::class),
                ]
            );
    }
}
