<?php

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
}
