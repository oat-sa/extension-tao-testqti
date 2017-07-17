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
 *
 */
namespace oat\taoQtiTest\models;

use oat\oatbox\service\ConfigurableService;
use oat\generis\model\fileReference\FileReferenceSerializer;
use oat\oatbox\filesystem\Directory;

/**
 * the qti TestModel
 *
 * @access public
 * @author Joel Bout, <joel.bout@tudor.lu>
 * @package taoQtiTest
 */
class TestModelService extends ConfigurableService implements \taoTests_models_classes_TestModel, \tao_models_classes_import_ImportProvider, \tao_models_classes_export_ExportProvider
{

    const SERVICE_ID = 'taoQtiTest/TestModel';

    /**
     * default constructor to ensure the implementation
     * can be instanciated
     * @param array $options
     *
     */
    public function __construct($options = array()) {
        parent::__construct($options);
        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
    }

    /**
     * (non-PHPdoc)
     * @see taoTests_models_classes_TestModel::prepareContent()
     */
    public function prepareContent( \core_kernel_classes_Resource $test, $items = array()) {
        $service = \taoQtiTest_models_classes_QtiTestService::singleton();
        $service->save($test, $items);
    }

    /**
     * (non-PHPdoc)
     * @see taoTests_models_classes_TestModel::deleteContent()
     */
    public function deleteContent( \core_kernel_classes_Resource $test) {
        $service = \taoQtiTest_models_classes_QtiTestService::singleton();
        $service->deleteContent($test);
    }

    /**
     * (non-PHPdoc)
     * @see taoTests_models_classes_TestModel::getItems()
     */
    public function getItems( \core_kernel_classes_Resource $test) {
    	$service = \taoQtiTest_models_classes_QtiTestService::singleton();
        return $service->getItems($test);
    }

    /**
     * (non-PHPdoc)
     * @see taoTests_models_classes_TestModel::onChangeTestLabel()
     */
    public function onChangeTestLabel( \core_kernel_classes_Resource $test) {
    	// do nothing
    }

    /**
     * @deprecated
     * @see taoTests_models_classes_TestModel::getAuthoring()
     */
    public function getAuthoring( \core_kernel_classes_Resource $test) {
    	return "";
    }

    /**
     * @see taoTests_models_classes_TestModel::getAuthoringUrl()
     */
    public function getAuthoringUrl( \core_kernel_classes_Resource $test) {
        return _url('index', 'Creator', 'taoQtiTest', array('uri' => $test->getUri()));
    }

    /**
     * Clone a QTI Test Resource.
     *
     * @param \core_kernel_classes_Resource $source The resource to be cloned.
     * @param \core_kernel_classes_Resource $destination An existing resource to be filled as the clone of $source.
     */
    public function cloneContent(\core_kernel_classes_Resource $source, \core_kernel_classes_Resource $destination)
    {
        $service = \taoQtiTest_models_classes_QtiTestService::singleton();
        $existingDir = $service->getQtiTestDir($source);
        $destinationDir = $service->getQtiTestDir($destination, false);

        if ($existingDir->exists()) {
            $iterator = $existingDir->getFlyIterator(Directory::ITERATOR_FILE|Directory::ITERATOR_RECURSIVE);
            /** @var File $file */
            foreach($iterator as $file) {
                $destinationDir->getFile($existingDir->getRelPath($file))->write($file->readStream());
            }
        } else {
            \common_Logger::w('Test "' . $source->getUri() . '" had no content, nothing to clone');
        }
    }

    public function getImportHandlers() {
        if ($this->hasOption('importHandlers')){
            return $this->getOption('importHandlers');
        } else {
            return array();
        }
    }

    public function getExportHandlers() {
        if ($this->hasOption('exportHandlers')){
            return $this->getOption('exportHandlers');
        } else {
            return array();
        }
    }

    public function getCompilerClass() {
        return $this->getOption('testCompilerClass');
    }


    public function getPackerClass() {
        return 'oat\\taoQtiTest\\models\\pack\\QtiTestPacker';
    }
}
