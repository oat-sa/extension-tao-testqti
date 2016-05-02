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

use qtism\common\datatypes\File;
use qtism\common\datatypes\RuntimeException;
use qtism\common\enums\BaseType;
use qtism\common\enums\Cardinality;

class StateStorageQtiFile implements File
{
    protected $key;
    protected $mimeType;
    protected $filename;
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

    public function getData()
    {
        \common_Logger::i(__FUNCTION__);
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

    public function getStream()
    {
        \common_Logger::i(__FUNCTION__);
        // TODO: Implement getStream() method.
    }

    public function getIdentifier()
    {
        \common_Logger::i(__FUNCTION__);
        return $this->key;
    }

    public function equals($obj)
    {
        \common_Logger::i(__FUNCTION__);
        // TODO: Implement equals() method.
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

    public function getPath()
    {
        \common_Logger::e(__FUNCTION__);
    }

    /**
     * Return filename
     * @return string|void
     */
    public function __toString()
    {
        \common_Logger::i(__FUNCTION__);
        return $this->getIdentifier();
    }
}