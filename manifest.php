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
 * Copyright (c) 2013-2019 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

use oat\tao\model\user\TaoRoles;
use oat\taoQtiTest\scripts\install\CreateTestSessionFilesystem;
use oat\taoQtiTest\scripts\install\RegisterCreatorServices;
use oat\taoQtiTest\scripts\install\RegisterFrontendPaths;
use oat\taoQtiTest\scripts\install\RegisterQtiCategoryPresetProviders;
use oat\taoQtiTest\scripts\install\RegisterQtiFlysystemManager;
use oat\taoQtiTest\scripts\install\RegisterSectionPauseService;
use oat\taoQtiTest\scripts\install\RegisterTestCategoryPresetProviderService;
use oat\taoQtiTest\scripts\install\RegisterTestContainer;
use oat\taoQtiTest\scripts\install\RegisterTestImporters;
use oat\taoQtiTest\scripts\install\RegisterTestMetadataExporter;
use oat\taoQtiTest\scripts\install\RegisterTestRunnerPlugins;
use oat\taoQtiTest\scripts\install\RegisterTestRunnerProviders;
use oat\taoQtiTest\scripts\install\RegisterTimerAdjustmentService;
use oat\taoQtiTest\scripts\install\RegisterTimerStrategyService;
use oat\taoQtiTest\scripts\install\SetLinearNextItemWarningConfig;
use oat\taoQtiTest\scripts\install\SetSynchronisationService;
use oat\taoQtiTest\scripts\install\SetupEventListeners;
use oat\taoQtiTest\scripts\install\SetUpQueueTasks;
use oat\taoQtiTest\scripts\install\SyncChannelInstaller;

$extpath = __DIR__ . DIRECTORY_SEPARATOR;
$taopath = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'tao' . DIRECTORY_SEPARATOR;

return [
    'name'        => 'taoQtiTest',
    'label'       => 'QTI test model',
    'description' => 'TAO QTI test implementation',
    'license'     => 'GPL-2.0',
    'version'     => '38.6.0',
    'author'      => 'Open Assessment Technologies',
    'requires'    => [
        'taoQtiItem' => '>=24.0.0',
        'taoTests'   => '>=14.0.0',
        'tao'        => '>=42.12.0',
        'generis'    => '>=12.20.0',
        'taoDelivery' => '>=14.10.0',
        'taoItems'   => '>=6.0.0',
    ],
    'models' => [
        'http://www.tao.lu/Ontologies/TAOTest.rdf'
    ],
    'install' => [
        'rdf' => [
            __DIR__ . '/models/ontology/qtitest.rdf',
            __DIR__ . '/models/ontology/taoQtiTestItemRunner.rdf',
            __DIR__ . '/models/ontology/qtiCat.rdf',
        ],
        'php'   => [
            __DIR__ . '/scripts/install/addQtiTestFolder.php',
            __DIR__ . '/scripts/install/addQtiTestAcceptableLatency.php',
            __DIR__ . '/scripts/install/addExtraTestRunnerButtons.php',
            RegisterTestRunnerProviders::class,
            RegisterTestRunnerPlugins::class,
            RegisterTestMetadataExporter::class,
            CreateTestSessionFilesystem::class,
            RegisterQtiFlysystemManager::class,
            RegisterTestImporters::class,
            SetupEventListeners::class,
            RegisterCreatorServices::class,
            RegisterTestCategoryPresetProviderService::class,
            RegisterQtiCategoryPresetProviders::class,
            RegisterSectionPauseService::class,
            SetSynchronisationService::class,
            SyncChannelInstaller::class,
            RegisterTestContainer::class,
            SetUpQueueTasks::class,
            SetLinearNextItemWarningConfig::class,
            RegisterFrontendPaths::class,
            RegisterTimerStrategyService::class,
            RegisterTimerAdjustmentService::class
        ]
    ],
    'update' => 'oat\\taoQtiTest\\scripts\\update\\Updater',
    'local' => [
        'php'   => [
            __DIR__ . '/install/local/addQTIExamples.php'
        ]
    ],
    'managementRole' => 'http://www.tao.lu/Ontologies/TAOTest.rdf#TaoQtiManagerRole',
    'acl' => [
        ['grant', 'http://www.tao.lu/Ontologies/TAOTest.rdf#TaoQtiManagerRole', ['ext' => 'taoQtiTest']],
        ['grant', 'http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole', ['ext' => 'taoQtiTest', 'mod' => 'ItemRunner']],
        ['grant', 'http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole', ['ext' => 'taoQtiTest', 'mod' => 'TestRunner']],
        ['grant', 'http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole', ['ext' => 'taoQtiTest', 'mod' => 'Runner']],
        ['grant', 'http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole', ['ext' => 'taoQtiTest', 'mod' => 'OfflineRunner']],
        ['grant', 'http://www.tao.lu/Ontologies/TAOTest.rdf#TestsManagerRole', ['ext' => 'taoQtiTest', 'mod' => 'Creator']],
        ['grant', 'http://www.tao.lu/Ontologies/TAOTest.rdf#TestsManagerRole', ['ext' => 'taoQtiTest', 'mod' => 'Items']],
        ['grant', 'http://www.tao.lu/Ontologies/TAOTest.rdf#TestsManagerRole', ['ext' => 'taoQtiTest', 'mod' => 'RestQtiTests']],
        ['grant', TaoRoles::REST_PUBLISHER, ['ext' => 'taoQtiTest', 'mod' => 'RestQtiTests']],
    ],
    'constants' => [
        # actions directory
        'DIR_ACTIONS'         => $extpath . 'actions' . DIRECTORY_SEPARATOR,

        # views directory
        'DIR_VIEWS'           => $extpath . 'views' . DIRECTORY_SEPARATOR,

        # default module name
        'DEFAULT_MODULE_NAME' => 'Main',

        #default action name
        'DEFAULT_ACTION_NAME' => 'index',

        #BASE PATH: the root path in the file system (usually the document root)
        'BASE_PATH'           => $extpath,

        #BASE URL (usually the domain root)
        'BASE_URL'              => ROOT_URL . 'taoQtiTest/',
    ],
    'extra' => [
        'structures' => __DIR__ . DIRECTORY_SEPARATOR . 'actions' . DIRECTORY_SEPARATOR . 'structures.xml',
    ]
];
