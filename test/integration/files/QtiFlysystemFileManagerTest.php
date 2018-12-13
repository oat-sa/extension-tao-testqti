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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */

namespace oat\taoQtiTest\test\integration\files;

use oat\generis\test\GenerisPhpUnitTestRunner;
use oat\taoQtiTest\models\files\QtiFlysystemFile;
use oat\taoQtiTest\models\files\QtiFlysystemFileManager;
use oat\oatbox\service\ServiceManager;
use oat\oatbox\filesystem\FileSystemService;

class QtiFlysystemFileManagerTest extends GenerisPhpUnitTestRunner
{
    protected $serviceLocator;
    protected $fileManager;
    protected $fileSystem;
    
    public function setUp()
    {
        $this->serviceLocator = ServiceManager::getServiceManager();
        $this->filesystem = $this->serviceLocator->get(FileSystemService::SERVICE_ID)->getFileSystem('taoQtiTestSessionFilesystem');
        $this->fileManager = new QtiFlysystemFileManager();
        $this->fileManager->setFilePrefix('unittest');
        $this->fileManager->setServiceLocator($this->serviceLocator);
        
        $this->cleanUp();
    }
    
    public function tearDown()
    {
        $this->cleanUp();
    }
    
    public function cleanUp()
    {
        foreach ($this->filesystem->listContents('/', true) as $file) {
            $basename = $file['basename'];
            if (strpos($basename, 'unittest') !== false) {
                $this->filesystem->delete($file['path']);
            }
        }
    }
    
    public function testCreateFromDataWithFilename()
    {
        $file = $this->fileManager->createFromData('pouet', 'text/plain', 'myfile.txt');
        
        $this->assertInstanceOf(QtiFlysystemFile::class, $file);
        $this->assertEquals('pouet', $file->getData());
        $this->assertEquals('text/plain', $file->getMimeType());
        $this->assertTrue($file->hasFilename());
        $this->assertEquals('myfile.txt', $file->getFilename());
        $this->assertInternalType('resource', $file->getStream());
    }
    
    /**
     * @depends testCreateFromDataWithFilename
     */
    public function testRetrieve()
    {
        $file = $this->fileManager->createFromData('pouet', 'text/plain', 'myfile.txt');
        $file2 = $this->fileManager->retrieve($file->getIdentifier());
        
        $this->assertEquals($file->getIdentifier(), $file2->getIdentifier());
        $this->assertEquals($file->getMimeType(), $file->getMimeType());
        $this->assertEquals($file->getFilename(), $file->getFilename());
    }
    
    /**
     * @depends testCreateFromDataWithFilename
     */
    public function testDelete()
    {
        $file = $this->fileManager->createFromData('check', 'text/plain', 'myfile.txt');
        $this->assertTrue($this->filesystem->has($file->getIdentifier()));
        
        $this->fileManager->delete($file);
        $this->assertFalse($this->filesystem->has($file->getIdentifier()));
    }
}
