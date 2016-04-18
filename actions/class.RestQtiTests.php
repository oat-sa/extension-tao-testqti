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
 */

/**
 *
 * @author Absar Gilani & Rashid - PCG Team - {absar.gilani6@gmail.com}

 */
class taoQtiTest_actions_RestQtiTests extends tao_actions_CommonRestModule {
 	
	 const QTI_TESTPACKAGE = 'qtiTestContent' ;	 	

	public function __construct()
	{
	    parent::__construct();
		//The service that implements or inherits get/getAll/getRootClass ... for that particular type of resources
		$this->service = taoQtiTest_models_classes_CrudQtiTestsService::singleton();
	}

	/**
	 * Optionnaly a specific rest controller may declare
	 * aliases for parameters used for the rest communication
	 */
	protected function getParametersAliases()
	{
	    return array_merge(parent::getParametersAliases(), array(
		"qtiPackage" => self::QTI_TESTPACKAGE,	   
	    ));
	}
	
	
	protected function importQtiPackage(){
		try {
			if(isset($_FILES["qtiPackage"])){
				if($_FILES["qtiPackage"]["name"]) {
					$filename = $_FILES["qtiPackage"]["name"];
					$source = $_FILES["qtiPackage"]["tmp_name"];
					$type = $_FILES["qtiPackage"]["type"];

					$name = explode(".", $filename);
					$accepted_types = array('application/zip', 'application/x-zip-compressed', 'multipart/x-zip', 'application/x-compressed');
					foreach ($accepted_types as $mime_type) {
						if ($mime_type == $type) {
							$okay = true;
							break;
						}
					}
					$continue = strtolower($name[1]) == 'zip' ? true : false;
					if (!$continue) {
						throw new common_exception_InvalidArgumentType();
					}
					$path = dirname(__FILE__) . '/';  // absolute path to the directory where zipper.php is in
					$filenoext = basename($filename, '.zip');  // absolute path to the directory where zipper.php is in (lowercase)
					$filenoext = basename($filenoext, '.ZIP');  // absolute path to the directory where zipper.php is in (when uppercase)
					$targetdir = $path . $filenoext; // target directory
					$targetzip = $path . $filename; // target zip file
					/* create directory if not exists', otherwise overwrite */
					/* target directory is same as filename without extension */
					if (is_dir($targetdir)) rmdir_recursive($targetdir);
					if(move_uploaded_file($source, $targetzip)) {
						$report = $this->service->importQtiTest($targetzip);
					}
				}else{
					throw new common_exception_InvalidArgumentType();
				}			
			}
		}
		catch (Exception $e) {
            return common_report_Report::createFailure($e->getMessage());
        }
		return $report;
	}
	/**
	 * Optionnal Requirements for parameters to be sent on every service
	 *
	 */
	protected function getParametersRequirements()
	{
	    return array(
		/** you may use either the alias or the uri, if the parameter identifier
		 *  is set it will become mandatory for the method/operation in $key
		* Default Parameters Requirents are applied
		* type by default is not required and the root class type is applied
         *    @example :"post"=> array("login", "password")
		*/
		"post"=> array("qtiPackage"),
	    );
	}
	
	/**
	 *
	 * @author Rashid and Absar -PCG Team
	 */	 
	protected function post() {
		try {
			$parameters = $this->getParameters();
			/**
			 * This code snippet  import QTI Package or create new item
			 *
			 * @author Rashid Mumtaz & Absar - PCG Team - {absar.gilani6@gmail.com & rashid.mumtaz372@gmail.com}
			 * @license GPLv2  http://www.opensource.org/licenses/gpl-2.0.php
			 * @package taoItems
			 *
			 *
			 */
				if(isset($parameters[self::QTI_TESTPACKAGE])){
					// Import QTI Package			
					$data = $this->importQtiPackage($parameters);
					foreach ($data as $r) {
						$values = $r->getData();
						$testid = $values->rdfsResource->getUri();
							foreach ($values->items as $item) 			 
								$itemsid[] = $item->getUri();                                          			
					}		
					$data = array('testId' => $testid, 'testItems' => $itemsid);
				}			
			
		} catch (Exception $e) {
			return $this->returnFailure($e);
		}
		return $this->returnSuccess($data);
	}
}
