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
/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */

namespace oat\taoQtiTest\models;

use oat\taoItems\model\ItemCompilerIndex;

/**
 * Class QtiTestCompilerIndex
 *
 * @package oat\taoQtiTest\models
 */
class QtiTestCompilerIndex implements ItemCompilerIndex
{
    /**
     * The index of compiled items, keys are the items identifiers
     * @var array
     */
    private $index = [];

    /**
     * Stores context info of a compiled Item into the index
     * @param string $id
     * @param string $language
     * @param mixed $data
     * @return $this
     */
    public function setItem($id, $language, $data)
    {
        $this->index[$language][$id] = $data;
        return $this;
    }

    /**
     * Gets context info of a compiled Item.
     * 
     * In case of no compiled item context is found with $language, the implementation
     * will try to retrieve a context related to the default installation language. In case of
     * no context can be retrieved for the default language, the method returns NULL.
     * 
     * @param string $id
     * @param string $language
     * @return mixed
     */
    public function getItem($id, $language)
    {
        if (isset($this->index[$language]) && isset($this->index[$language][$id])) {
            return $this->index[$language][$id];
        } elseif (isset($this->index[DEFAULT_LANG]) && isset($this->index[DEFAULT_LANG][$id])) {
            return $this->index[DEFAULT_LANG][$id];
        }
        
        return null;
    }

    /**
     * Gets a particular value from context info of a compiled Item.
     * 
     * In case of no value can be found with $language for the given item $id,
     * the implementation will try to retrieve a value for the default installation
     * language. Otherwise, the method returns NULL.
     * 
     * @param string $id
     * @param string $language
     * @param string $name
     * @return mixed
     */
    public function getItemValue($id, $language, $name)
    {
        $attributes = $this->getItem($id, $language);
        if ($attributes && isset($attributes[$name])) {
            return $attributes[$name];
        }
        
        // Try Default Language.
        $attributes = $this->getItem($id, DEFAULT_LANG);
        if ($attributes && isset($attributes[$name])) {
            return $attributes[$name];
        }
        
        return null;
    }

    /**
     * Unpacks index from a string
     * @param string $data
     * @param string $language
     * @throws \common_exception_InconsistentData
     */
    public function unserialize($data, $language = null)
    {
        if (!is_string($data)) {
            throw new \common_exception_InconsistentData('The encoded index data should be provided as a string');
        }
        
        $index = json_decode($data, true);
        
        if (!is_array($index)) {
            throw new \common_exception_InconsistentData('The decoded index data should be an array');
        }
        
        if ($language) {
            $this->index[$language] = $index;
        } else {
            $this->index = $index;
        }
    }

    /**
     * Packs the index into a string
     * @param string $language
     * @return string
     */
    public function serialize($language = null)
    {
        if ($language) {
            if (isset($this->index[$language])) {
                return json_encode($this->index[$language]);
            } else {
                return json_encode([]);
            }
        } else {
            return json_encode($this->index);
        }
    }
}
