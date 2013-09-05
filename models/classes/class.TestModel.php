<?php
/*  
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
 * Copyright (c) 2008-2010 (original work) Deutsche Institut für Internationale Pädagogische Forschung (under the project TAO-TRANSFER);
 *               2009-2012 (update and modification) Public Research Centre Henri Tudor (under the project TAO-SUSTAIN & TAO-DEV);
 * 
 */

/**
 * the qti TestModel
 *
 * @access public
 * @author Joel Bout, <joel.bout@tudor.lu>
 * @package taoQtiTest
 * @subpackage models_classes
 */
class taoQtiTest_models_classes_TestModel
	implements taoTests_models_classes_TestModel
{
    // --- ASSOCIATIONS ---


    // --- ATTRIBUTES ---
    const CONFIG_QTITEST_FOLDER = 'qtiTestFolder';

    // --- OPERATIONS ---
    /**
     * default constructor to ensure the implementation
     * can be instanciated
     */
    public function __construct() {
        common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
    }
    
    /**
     * (non-PHPdoc)
     * @see taoTests_models_classes_TestModel::prepareContent()
     */
    public function prepareContent( core_kernel_classes_Resource $test, $items = array()) {
        $service = taoQtiTest_models_classes_QtiTestService::singleton();
        $service->setItems($test, $items);
    }
    
    /**
     * (non-PHPdoc)
     * @see taoTests_models_classes_TestModel::deleteContent()
     */
    public function deleteContent( core_kernel_classes_Resource $test) {
        $service = taoQtiTest_models_classes_QtiTestService::singleton();
        $service->deleteContent($test);
    }
    
    /**
     * (non-PHPdoc)
     * @see taoTests_models_classes_TestModel::getItems()
     */
    public function getItems( core_kernel_classes_Resource $test) {
    	$service = taoQtiTest_models_classes_QtiTestService::singleton();
        $service->getItems($test);
    }

    /**
     * (non-PHPdoc)
     * @see taoTests_models_classes_TestModel::onChangeTestLabel()
     */
    public function onChangeTestLabel( core_kernel_classes_Resource $test) {
    	// do nothing
    }
    
    /**
     * (non-PHPdoc)
     * @see taoTests_models_classes_TestModel::getAuthoring()
     */
    public function getAuthoring( core_kernel_classes_Resource $test) {
        $ext = common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
    	$widget = new Renderer($ext->getConstant('DIR_VIEWS').'templates'.DIRECTORY_SEPARATOR.'authoring_button.tpl');
		$widget->setData('uri', $test->getUri());
		$widget->setData('label', __('Authoring %s', $test->getLabel()));
    	return $widget->render();
    }
    
    /**
     * (non-PHPdoc)
     * @see taoTests_models_classes_TestModel::compile()
     */
    public function compile( core_kernel_classes_Resource $test, core_kernel_file_File $destinationDirectory) {
        
        // the magic happens here
        
		
		$service = new tao_models_classes_service_ServiceCall(new core_kernel_classes_Resource(INSTANCE_QTITEST_TESTRUNNERSERVICE));
		$param = new tao_models_classes_service_ConstantParameter(
		    new core_kernel_classes_Resource('Your magic parameter'),
		    "unicorns"
        );
		$service->addInParameter($param);
		// another parameter
		
		return $service;
    }
    
    public static function setQtiTestDirectory(core_kernel_file_File $folder) {
    	$ext = common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
    	$ext->setConfig(self::CONFIG_QTITEST_FOLDER, $folder->getUri());
    }
    
    public static function getQtiTestDirectory() {
    	
    	$ext = common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
        $uri = $ext->getConfig(self::CONFIG_QTITEST_FOLDER);
        if (empty($uri)) {
        	throw new common_Exception('No default repository defined for uploaded files storage.');
        }
		return new core_kernel_file_File($uri);
	}
	
	public function cloneContent( core_kernel_classes_Resource $source, core_kernel_classes_Resource $destination) {
	    
	}
}

?>