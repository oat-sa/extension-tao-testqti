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

use oat\taoQtiTest\scripts\install\SetUpQueueTasks;
use oat\taoQtiTest\scripts\install\RegisterCreatorServices;
use oat\taoQtiTest\scripts\install\RegisterQtiCategoryPresetProviders;
use oat\taoQtiTest\scripts\install\RegisterQtiFlysystemManager;
use oat\taoQtiTest\scripts\install\RegisterSectionPauseService;
use oat\taoQtiTest\scripts\install\RegisterTestCategoryPresetProviderService;
use oat\taoQtiTest\scripts\install\RegisterTestContainer;
use oat\taoQtiTest\scripts\install\RegisterTestImporters;
use oat\taoQtiTest\scripts\install\SetSynchronisationService;
use oat\taoQtiTest\scripts\install\SetupEventListeners;
use oat\taoQtiTest\scripts\install\SyncChannelInstaller;
use oat\taoQtiTest\scripts\install\SetLinearNextItemWarningConfig;
use oat\taoQtiTest\scripts\install\RegisterFrontendPaths;
use oat\taoQtiTest\scripts\install\RegisterTimerStrategyService;

$extpath = dirname(__FILE__) . DIRECTORY_SEPARATOR;
$taopath = dirname(dirname(__FILE__)) . DIRECTORY_SEPARATOR . 'tao' . DIRECTORY_SEPARATOR;

return [
    'name'        => 'taoQtiTest',
    'label'       => 'QTI test model',
    'description' => 'TAO QTI test implementation',
    'license'     => 'GPL-2.0',
    'version'     => '35.10.2.3',
    'author'      => 'Open Assessment Technologies',
    'requires'    => [
        'taoQtiItem' => '>=20.0.2',
        'taoTests'   => '>=13.2.0',
        'tao'        => '>=38.5.0',
        'generis'    => '>=12.5.0',
        'taoDelivery' => '>=13.3.0',
        'taoItems'   => '>=6.0.0',
    ],
    'models' => [
        'http://www.tao.lu/Ontologies/TAOTest.rdf'
    ],
    'install' => [
        'rdf' => [
            dirname(__FILE__) . '/models/ontology/qtitest.rdf',
            dirname(__FILE__) . '/models/ontology/taoQtiTestItemRunner.rdf',
            dirname(__FILE__) . '/models/ontology/qtiCat.rdf',
        ],
        'php'   => [
            dirname(__FILE__) . '/scripts/install/addQtiTestFolder.php',
            dirname(__FILE__) . '/scripts/install/addQtiTestAcceptableLatency.php',
            dirname(__FILE__) . '/scripts/install/addExtraTestRunnerButtons.php',
            \oat\taoQtiTest\scripts\install\RegisterTestRunnerProviders::class,
            \oat\taoQtiTest\scripts\install\RegisterTestRunnerPlugins::class,
            \oat\taoQtiTest\scripts\install\RegisterTestMetadataExporter::class,
            \oat\taoQtiTest\scripts\install\CreateTestSessionFilesystem::class,
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
            RegisterTimerStrategyService::class
        ]
    ],
    'update' => 'oat\\taoQtiTest\\scripts\\update\\Updater',
    'local' => [
        'php'   => [
            dirname(__FILE__) . '/install/local/addQTIExamples.php'
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
        ['grant', \oat\tao\model\user\TaoRoles::REST_PUBLISHER, ['ext' => 'taoQtiTest', 'mod' => 'RestQtiTests']],
    ],
    'constants' => [
        # actions directory
        "DIR_ACTIONS"           => $extpath . "actions" . DIRECTORY_SEPARATOR,

        # views directory
        "DIR_VIEWS"             => $extpath . "views" . DIRECTORY_SEPARATOR,

        # default module name
        'DEFAULT_MODULE_NAME'   => 'Main',

        #default action name
        'DEFAULT_ACTION_NAME'   => 'index',

        #BASE PATH: the root path in the file system (usually the document root)
        'BASE_PATH'             => $extpath,

        #BASE URL (usually the domain root)
        'BASE_URL'              => ROOT_URL . 'taoQtiTest/',
    ],
    'extra' => [
        'structures' => dirname(__FILE__) . DIRECTORY_SEPARATOR . 'actions' . DIRECTORY_SEPARATOR . 'structures.xml',
    ]
];
