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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiTest\models\files;

use qtism\common\datatypes\QtiFile;
use qtism\common\datatypes\files\FileManager;
use oat\oatbox\service\ConfigurableService;
use oat\oatbox\filesystem\FileSystemService;

class QtiFlysystemFileManager extends ConfigurableService implements FileManager
{
    const SERVICE_ID = 'taoQtiTest/qtiFilesystem';
    private $filePrefix = '';
    
    public function setFilePrefix($filePrefix)
    {
        $this->filePrefix = $filePrefix;
    }
    
    public function createFromFile($path, $mimeType, $filename = '')
    {
        $id = $this->generateId();
        $this->getFileSystem()->write($id, file_get_contents($path));
        
        if (empty($filename) === false) {
            $this->getFileSystem()->write($id . QtiFlysystemFile::FILENAME_MD_PREFIX, $filename);
        }
        
        $file = new QtiFlysystemFile('taoQtiTestSessionFilesystem', $id);
        $file->setServiceLocator($this->getServiceLocator());
        
        return $file;
    }
    
    public function createFromData($data, $mimeType, $filename = '')
    {
        $id = $this->generateId();
        $this->getFileSystem()->write($id, $data);
        
        if (empty($filename) === false) {
            $this->getFileSystem()->write($id . QtiFlysystemFile::FILENAME_MD_PREFIX, $filename);
        }
        
        $file = new QtiFlysystemFile('taoQtiTestSessionFilesystem', $id);
        $file->setServiceLocator($this->getServiceLocator());
        
        return $file;
    }
    
    public function retrieve($identifier)
    {
        $file = new QtiFlysystemFile('taoQtiTestSessionFilesystem', $identifier);
        $file->setServiceLocator($this->getServiceLocator());
        
        return $file;
    }
    
    public function delete(QtiFile $file)
    {
        $file->delete();
    }
    
    private function getFileSystem()
    {
        return $this->getServiceLocator()->get(FileSystemService::SERVICE_ID)->getFileSystem('taoQtiTestSessionFilesystem');
    }
    
    private function generateId()
    {
        return $this->filePrefix . uniqid() . mt_rand(0, 1000000);
    }
}
