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
 * Copyright (c) 2013 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 * 
 */

/**
 * Imprthandler for QTI packages
 *
 * @access public
 * @author Joel Bout, <joel@taotesting.com>
 * @package taoQTI
 * @subpackage models_classes_import
 */
class taoQtiTest_models_classes_import_TestImport implements tao_models_classes_import_ImportHandler
{

    /**
     * (non-PHPdoc)
     * @see tao_models_classes_import_ImportHandler::getLabel()
     */
    public function getLabel() {
    	return __('QTI Test Package');
    }
    
    /**
     * (non-PHPdoc)
     * @see tao_models_classes_import_ImportHandler::getForm()
     */
    public function getForm() {
    	$form = new taoQtiTest_models_classes_import_TestImportForm();
    	return $form->getForm();
    }

    /**
     * (non-PHPdoc)
     * @see tao_models_classes_import_ImportHandler::import()
     */
    public function import($class, $form) {
		
        $fileInfo = $form->getValue('source');
        
        if(isset($fileInfo['uploaded_file'])){
			
			$uploadedFile = $fileInfo['uploaded_file'];
			
//			$validate = count($form->getValue('disable_validation')) == 0 ? true : false;
			
			helpers_TimeOutHelper::setTimeOutLimit(helpers_TimeOutHelper::LONG);	//the zip extraction is a long process that can exced the 30s timeout
			
			try {
			    
			    $test = taoTests_models_classes_TestsService::singleton()->createInstance($class);
			     
			    $itemClass = new core_kernel_classes_Class(TAO_ITEM_CLASS);
			    $subClass = $itemClass->createSubClass($test->getLabel());
			    $report = taoQtiTest_models_classes_QtiTestService::singleton()->importTest($test, $uploadedFile, $subClass);
			} catch (taoQTI_models_classes_QTI_exception_ExtractException $e) {
			    $report = common_report_Report::createFailure(__('unable to extract archive content, please check your tmp dir'));
			} catch (taoQTI_models_classes_QTI_exception_ParsingException $e) {
                $report = common_report_Report::createFailure(__('Validation of the imported file has failed '.$e->getMessage()));
				//$this->setData('importErrors', $qtiParser->getErrors());
			} catch (common_Exception $e) {
		        $report = common_report_Report::createFailure(__('An error occurs during the import'));
			}
			helpers_TimeOutHelper::reset();
			tao_helpers_File::remove($uploadedFile);
		} else {
		   throw new common_exception_Error('No source file for import');
		}
		return $report;
    }

}