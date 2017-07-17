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

use oat\oatbox\filesystem\File;
use qtism\common\datatypes\QtiFile;
use qtism\common\enums\BaseType;
use qtism\common\enums\Cardinality;

class QtiFlysystemFile extends File implements QtiFile
{
    const FILENAME_MD_PREFIX = '.fmd';
    const CHUNK_SIZE = 2048;
    
    public function __construct($fileSystemId, $path)
    {
        parent::__construct($fileSystemId, $path);
    }
    
    public function getData()
    {
        return $this->read();
    }
    
    public function getMimeType()
    {
        return parent::getMimeType();
    }
    
    public function hasFilename()
    {
        return $this->getFileSystem()->has($this->getPrefix() . self::FILENAME_MD_PREFIX);
    }
    
    public function getFilename()
    {
        $filename = '';
        
        if ($this->hasFilename() === true) {
            $filename = $this->getFileSystem()->read($this->getPrefix() . self::FILENAME_MD_PREFIX);
        }
        
        return $filename;
    }
    
    public function getStream()
    {
        return $this->readStream();
    }
    
    public function getIdentifier()
    {
        return $this->getPrefix();
    }
    
    public function equals($obj)
    {
        if ($obj instanceof QtiFile) {
            if ($this->getFilename() !== $obj->getFilename()) {
                return false;
            }
            else if ($this->getMimeType() !== $obj->getMimeType()) {
                return false;
            }
            else {
                // We have to check the content of the file.
                $myStream = $this->getStream();
                $objStream = $obj->getStream();
                
                while (feof($myStream) === false && feof($objStream) === false) {
                    $myChunk = fread($myStream, self::CHUNK_SIZE);
                    $objChjunk = fread($objStream, self::CHUNK_SIZE);
                    
                    if ($myChunk !== $objChjunk) {
                        @fclose($myStream);
                        @fclose($objStream);
                        
                        return false;
                    }
                }
                
                @fclose($myStream);
                @fclose($objStream);
                
                return true;
            }
        }
        
        return false;
    }
    
    public function getCardinality()
    {
        return Cardinality::SINGLE;
    }
    
    public function getBaseType()
    {
        return BaseType::FILE;
    }
    
    public function __toString()
    {
        return $this->getFileName();
    }
}
