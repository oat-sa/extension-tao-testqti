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
 * Copyright (c) 2013-2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
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

$extpath = dirname(__FILE__).DIRECTORY_SEPARATOR;
$taopath = dirname(dirname(__FILE__)).DIRECTORY_SEPARATOR.'tao'.DIRECTORY_SEPARATOR;

return array(
    'name'        => 'taoQtiTest',
    'label'       => 'QTI test model',
    'description' => 'TAO QTI test implementation',
    'license'     => 'GPL-2.0',
    'version'     => '30.5.3',
    'author'      => 'Open Assessment Technologies',
    'requires'    => array(
        'taoQtiItem' => '>=18.0.0',
        'taoTests'   => '>=8.3.0',
        'tao'        => '>=24.4.0',
        'generis'    => '>=7.12.1',
        'taoDelivery' => '>=11.0.0',
        'taoItems'   => '>=6.0.0',
    ),
	'models' => array(
		'http://www.tao.lu/Ontologies/TAOTest.rdf'
	),
	'install' => array(
		'rdf' => array(
			dirname(__FILE__) . '/models/ontology/qtitest.rdf',
		    dirname(__FILE__) . '/models/ontology/taoQtiTestItemRunner.rdf',
			dirname(__FILE__) . '/models/ontology/qtiCat.rdf',
		),
		'php'	=> array(
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
            SetLinearNextItemWarningConfig::class
        )
    ),
    'update' => 'oat\\taoQtiTest\\scripts\\update\\Updater',
    'local'	=> array(
        'php'	=> array(
            dirname(__FILE__).'/install/local/addQTIExamples.php'
        )
    ),
    'managementRole' => 'http://www.tao.lu/Ontologies/TAOTest.rdf#TaoQtiManagerRole',
    'acl' => array(
        array('grant', 'http://www.tao.lu/Ontologies/TAOTest.rdf#TaoQtiManagerRole', array('ext'=>'taoQtiTest')),
        array('grant', 'http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole', array('ext'=>'taoQtiTest', 'mod' => 'ItemRunner')),
        array('grant', 'http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole', array('ext'=>'taoQtiTest', 'mod' => 'TestRunner')),
        array('grant', 'http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole', array('ext'=>'taoQtiTest', 'mod' => 'Runner')),
        array('grant', 'http://www.tao.lu/Ontologies/TAOTest.rdf#TestsManagerRole', array('ext'=>'taoQtiTest', 'mod' => 'Creator')),
        array('grant', 'http://www.tao.lu/Ontologies/TAOTest.rdf#TestsManagerRole', array('ext'=>'taoQtiTest', 'mod' => 'Items')),
        array('grant', 'http://www.tao.lu/Ontologies/TAOTest.rdf#TestsManagerRole', array('ext'=>'taoQtiTest', 'mod' => 'RestQtiTests')),
        array('grant', \oat\tao\model\user\TaoRoles::REST_PUBLISHER, array('ext'=>'taoQtiTest', 'mod' => 'RestQtiTests')),
    ),
	'constants' => array(
		# actions directory
		"DIR_ACTIONS"			=> $extpath."actions".DIRECTORY_SEPARATOR,

		# views directory
		"DIR_VIEWS"				=> $extpath."views".DIRECTORY_SEPARATOR,

		# default module name
		'DEFAULT_MODULE_NAME'	=> 'Main',

		#default action name
		'DEFAULT_ACTION_NAME'	=> 'index',

		#BASE PATH: the root path in the file system (usually the document root)
		'BASE_PATH'				=> $extpath,

		#BASE URL (usually the domain root)
		'BASE_URL'				=> ROOT_URL	.'taoQtiTest/',
	),
    'extra' => array(
        'structures' => dirname(__FILE__).DIRECTORY_SEPARATOR.'actions'.DIRECTORY_SEPARATOR.'structures.xml',
    )
);
