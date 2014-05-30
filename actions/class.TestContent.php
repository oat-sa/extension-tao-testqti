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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA;
 *               
 * 
 */
 
/**
 * Tests Content Controller provide access to the files of an test
 *
 * @package taoQtiTest
 */
class taoQtiTest_actions_TestContent extends tao_actions_CommonModule
{
    /**
     * Returns a json encoded array describign a directory
     * 
     * @throws common_exception_MissingParameter
     * @return string
     */
    public function files() {
        if (!$this->hasRequestParameter('uri')) {
            throw new common_exception_MissingParameter('uri', __METHOD__);
        }
        $testUri = $this->getRequestParameter('uri');
        $test = new core_kernel_classes_Resource($testUri);
        
        if (!$this->hasRequestParameter('lang')) {
            throw new common_exception_MissingParameter('lang', __METHOD__);
        }
        $testLang = $this->getRequestParameter('lang');

        $subPath = $this->hasRequestParameter('path') ? $this->getRequestParameter('path') : '/';
        $depth = $this->hasRequestParameter('depth') ? $this->getRequestParameter('depth') : 1;
       
        //build filters
        $filters = array();
        if($this->hasRequestParameter('filters')){
            $filterParameter = $this->getRequestParameter('filters');
            if(!empty($filterParameter)){
                if(preg_match('/\/*/', $filterParameter)){
                    common_Logger::w('Stars mime type are not yet supported, filter "'. $filterParameter . '" will fail');
                }
                $filters = array_map('trim', explode(',', $filterParameter));
            }
        } 
        
        $data = taoQtiTest_helpers_ResourceManager::buildDirectory($test, $testLang, $subPath, $depth, $filters);
        echo json_encode($data);
    }
    
    /**
     * Upload a file to the item directory
     * 
     * @throws common_exception_MissingParameter
     */
    public function upload() {
        if (!$this->hasRequestParameter('uri')) {
            throw new common_exception_MissingParameter('uri', __METHOD__);
        }
        $testUri = $this->getRequestParameter('uri');
        $test = new core_kernel_classes_Resource($testUri);
        
        if (!$this->hasRequestParameter('lang')) {
            throw new common_exception_MissingParameter('lang', __METHOD__);
        }
        $testLang = $this->getRequestParameter('lang');
        
        if (!$this->hasRequestParameter('path')) {
            throw new common_exception_MissingParameter('path', __METHOD__);
        }
        
        //TODO path traversal and null byte poison check ? 
        $baseDir = taoQtiTest_helpers_ResourceManager::getBaseDir($test); 
        $relPath = trim($this->getRequestParameter('path'), '/');
        $relPath = empty($relPath) ? '' : $relPath.'/';
        
        $files = tao_helpers_Http::getFiles();

        $fileName = $files['content']['name'];
        
        move_uploaded_file($files['content']["tmp_name"], $baseDir.$relPath.$fileName);
        
        $fileData = taoQtiTest_helpers_ResourceManager::buildFile($test, $testLang, $relPath.$fileName);
        echo json_encode($fileData);
    }

    /**
     * Download a file to the item directory* 
     * @throws common_exception_MissingParameter
     */
    public function download() {
        if (!$this->hasRequestParameter('uri')) {
            throw new common_exception_MissingParameter('uri', __METHOD__);
        }
        $testUri = $this->getRequestParameter('uri');
        $test = new core_kernel_classes_Resource($testUri);
        
        if (!$this->hasRequestParameter('path')) {
            throw new common_exception_MissingParameter('path', __METHOD__);
        }
        
        $baseDir = taoQtiTest_helpers_ResourceManager::getBaseDir($test); 
        $path = $baseDir.ltrim($this->getRequestParameter('path'), '/');
        
        tao_helpers_Http::returnFile($path);
    }
    
    /**
     * Delete a file from the item directory
     * 
     * @throws common_exception_MissingParameter
     */
    public function delete() {

        $deleted = false;

        if (!$this->hasRequestParameter('uri')) {
            throw new common_exception_MissingParameter('uri', __METHOD__);
        }
        $testUri = $this->getRequestParameter('uri');
        $test = new core_kernel_classes_Resource($testUri);
        
        if (!$this->hasRequestParameter('path')) {
            throw new common_exception_MissingParameter('path', __METHOD__);
        }
        
        $baseDir = taoQtiTest_helpers_ResourceManager::getBaseDir($test); 
        $path = $baseDir.ltrim($this->getRequestParameter('path'), '/');

        //TODO path traversal and null byte poison check ? 
        if(is_file($path) && !is_dir($path)){
            $deleted = unlink($path);
        } 
        echo json_encode(array('deleted' => $deleted));
    }
}
