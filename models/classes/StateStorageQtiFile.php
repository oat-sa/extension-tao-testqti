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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiTest\models;

use Psr\Http\Message\StreamInterface;
use qtism\common\datatypes\File;
use qtism\common\datatypes\RuntimeException;
use qtism\common\enums\BaseType;
use qtism\common\enums\Cardinality;

class StateStorageQtiFile implements File
{
    /**
     * When dealing with files, compare, read, write, ...
     * in CHUNK_SIZE to not eat up memory.
     *
     * @var integer
     */
    const CHUNK_SIZE = 2048;

    /**
     * Key to identify file variable
     * @var string
     */
    protected $key;

    /**
     * File name
     * @var string
     */
    protected $filename;

    /**
     * Mime type of file content
     * @var string
     */
    protected $mimeType;

    /**
     * Content
     * @var string
     */
    protected $data;

    /**
     * StateStorageQtiFile constructor.
     * @param $key
     * @param string $mimeType
     * @param string $filename
     * @param string $data
     */
    public function __construct($key, $mimeType='', $filename='', $data='')
    {
        $this->key = $key;
        $this->mimeType = $mimeType;
        $this->filename = $filename;
        $this->data = $data;
    }

    /**
     * Get data
     * @return string
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     * Get the mime type
     * @return mixed
     */
    public function getMimeType()
    {
        return $this->mimeType;
    }

    /**
     * Check if filename is set
     * @return bool
     */
    public function hasFilename()
    {
        return $this->getFilename() !== '';
    }

    /**
     * Get filename
     * @return mixed
     */
    public function getFilename()
    {
        return $this->filename;
    }

    /**
     * Return the stream of file $data
     * @todo use PSR7 stream, but not respect File::getStream signature
     * @return Resource
     */
    public function getStream()
    {
        if (empty($this->data)) {
            return false;
        }

        $temp = tmpfile();
        fwrite($temp, $this->getData());
        fseek($temp, 0);

        return $temp;
    }

    /**
     * Get identifier of the file e.q. $key
     * @return string
     */
    public function getIdentifier()
    {
        return $this->key;
    }

    /**
     * Compare two File by checking filename, mime type & content
     * @param mixed $obj
     * @return bool
     */
    public function equals($obj)
    {
        if (!$obj instanceof File) {
            return false;
        }

        if ($this->getFilename() !== $obj->getFilename()) {
            return false;
        }

        if ($this->getMimeType() !== $obj->getMimeType()) {
            return false;
        }

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

    /**
     * Return base type for file e.q. 9
     * @return int
     */
    public function getBaseType()
    {
        return BaseType::FILE;
    }

    /**
     * Return cardinality type for file e.q. 0
     * @return int
     */
    public function getCardinality()
    {
        return Cardinality::SINGLE;
    }

    /**
     * Return filename
     * @return string|void
     */
    public function __toString()
    {
        return $this->getIdentifier();
    }

    /**
     * Transform current file to binary content
     * @return string
     */
    public function toBinary()
    {
        // Filename
        $len = strlen($this->filename);
        $packedFilename = pack('S', $len) . $this->filename;

        // MIME type.
        $len = strlen($this->mimeType);
        $packedMimeType = pack('S', $len) . $this->mimeType;

        // Data
        return $packedFilename . $packedMimeType . $this->data;
    }
}