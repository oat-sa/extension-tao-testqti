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
 * Copyright (c) 2013-2014 (original work) Open Assessment Technologies SA
 * 
 */

use oat\tao\model\TaoOntology;

/**
 * Crud services implements basic CRUD services, orginally intended for 
 * REST controllers/ HTTP exception handlers . 
 * 
 * Consequently the signatures and behaviors is closer to REST and throwing HTTP like exceptions
 * 
 * @author Absar Gilani, absar.gilani@gmail.com
 *   
 */
class taoQtiTest_models_classes_CrudQtiTestsService
    extends tao_models_classes_CrudService
{

	/** (non-PHPdoc)
	 * @see tao_models_classes_CrudSservice::getClassService()
	 */
	protected function getClassService() {
		return taoQtiTest_models_classes_QtiTestService::singleton();
	}

    /**
     * (non-PHPdoc)
     * @see tao_models_classes_CrudService::delete()
     */    
    public function delete($uri)
    {
        $success = $this->getClassService()->deleteTest(new core_kernel_classes_Resource($uri));
    }

    /**
     * @author Rashid Mumtaz & Absar - PCG Team - {absar.gilani6@gmail.com & rashid.mumtaz372@gmail.com}
     * @param string $uploadedFile
     * @param \core_kernel_classes_Class $class
     * @param bool $enableMetadataGuardians
     * @param bool $enableMetadataValidators
     * @param bool $itemMustExist
     * @param bool $itemMustBeOverwritten
     * @return common_report_Report
     */
	public function importQtiTest($uploadedFile, $class = null, $enableMetadataGuardians = true, $enableMetadataValidators = true, $itemMustExist = false, $itemMustBeOverwritten = false)
	{
        try {
            //The zip extraction is a long process that can exceed the 30s timeout
            helpers_TimeOutHelper::setTimeOutLimit(helpers_TimeOutHelper::LONG);
            $class = is_null($class) ? new core_kernel_classes_Class(TaoOntology::TEST_CLASS_URI) : $class;
            $importer = taoQtiTest_models_classes_QtiTestService::singleton();

            if ($enableMetadataGuardians === false) {
                $importer->disableMetadataGuardians();
            }

            if ($enableMetadataValidators === false) {
                $importer->disableMetadataValidators();
            }

            if ($itemMustExist === true) {
                $importer->enableItemMustExist();
            }

            if ($itemMustBeOverwritten === true) {
                $importer->enableItemMustBeOverwritten();
            }

            $report = $importer->importMultipleTests($class, $uploadedFile);
            helpers_TimeOutHelper::reset();
            return $report;
        } catch (common_exception_UserReadableException $e) {
            return new common_report_Report(common_report_Report::TYPE_ERROR, __($e->getUserMessage()));
        }
	}
}
