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
use oat\oatbox\service\ServiceManager;
use oat\oatbox\filesystem\FileSystemService;
use qtism\common\enums\BaseType;
use qtism\common\enums\Cardinality;

class QtiFlysystemFileTest extends GenerisPhpUnitTestRunner
{
    protected $serviceLocator;
    protected $filesystem;
    
    public function setUp()
    {
        $this->serviceLocator = ServiceManager::getServiceManager();
        $this->filesystem = $this->serviceLocator->get(FileSystemService::SERVICE_ID)->getFileSystem('taoQtiTestSessionFilesystem');
        
        $this->cleanUp();
    }
    
    public function tearDown()
    {
        $this->cleanUp();
    }
    
    private function cleanUp()
    {
        if ($this->filesystem->has('unittest')) {
            $this->filesystem->delete('unittest');
        }
        
        if ($this->filesystem->has('unittest' . QtiFlysystemFile::FILENAME_MD_PREFIX)) {
            $this->filesystem->delete('unittest' . QtiFlysystemFile::FILENAME_MD_PREFIX);
        }
    }
    
    public function testSimpleInstantiationNonExistingFile()
    {
        $file = new QtiFlysystemFile('taoQtiTestSessionFilesystem', 'unittest');
        $file->setServiceLocator($this->serviceLocator);
        $this->assertFalse($file->exists());
    }
    
    public function testSimpleInstantiationExistingFileWithFileName()
    {
        $this->filesystem->write('unittest', 'text');
        $this->filesystem->write('unittest' . QtiFlysystemFile::FILENAME_MD_PREFIX, 'filename.txt');
        
        $file = new QtiFlysystemFile('taoQtiTestSessionFilesystem', 'unittest');
        $file->setServiceLocator($this->serviceLocator);
        
        $this->assertTrue($file->exists());
        $this->assertEquals('text/plain', $file->getMimeType());
        $this->assertTrue($file->hasFilename());
        $this->assertEquals('filename.txt', $file->getFilename());
        $this->assertEquals('text', $file->getData());
        $this->assertEquals('unittest', $file->getIdentifier());
        $this->assertEquals(BaseType::FILE, $file->getBaseType());
        $this->assertEquals(Cardinality::SINGLE, $file->getCardinality());
        $this->assertInternalType('resource', $file->getStream());
    }
    
    /**
     * @depends testSimpleInstantiationExistingFileWithFileName
     */
    public function testSimpleInstantiationExistingFileWithoutFileName()
    {
        $this->filesystem->write('unittest', 'text');
        
        $file = new QtiFlysystemFile('taoQtiTestSessionFilesystem', 'unittest');
        $file->setServiceLocator($this->serviceLocator);
        
        $this->assertTrue($file->exists());
        $this->assertFalse($file->hasFilename());
        $this->assertEquals('', $file->getFilename());
    }
}
