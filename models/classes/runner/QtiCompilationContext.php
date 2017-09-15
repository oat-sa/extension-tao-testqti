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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 */

namespace oat\taoQtiTest\models\runner;

class QtiCompilationContext implements CompilationContext
{
    private $testCompilationUri;
    
    private $testExecutionUri;
    
    private $publicDirectory;
    
    private $privateDirectory;
    
    public function __construct($testCompilationUri, $testExecutionUri)
    {
        $this->testCompilationUri = $testCompilationUri;
        $this->testExecutionUri = $testExecutionUri;
        
        $fileStorage = \tao_models_classes_service_FileStorage::singleton();
        $directoryIds = explode('|', $testCompilationUri);
        
        $this->privateDirectory = $fileStorage->getDirectoryById($directoryIds[0]);
        $this->publicDirectory = $fileStorage->getDirectoryById($directoryIds[1]);
    }
    
    public function getTestCompilationUri()
    {
        return $this->testCompilationUri;
    }
    
    public function getPublicDirectory()
    {
        return $this->publicDirectory;
    }
    
    public function getPrivateDirectory()
    {
        return $this->privateDirectory;
    }
    
    public function getCompilationDirectory()
    {
        return [
            'private' => $this->getPrivateDirectory(),
            'public' => $this->getPublicDirectory()
        ];
    }
    
    public function getTestExecutionUri()
    {
        return $this->testExecutionUri;
    }
}
