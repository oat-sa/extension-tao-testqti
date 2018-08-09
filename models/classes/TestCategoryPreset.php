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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 *
 */
namespace oat\taoQtiTest\models;

use JsonSerializable;
use common_exception_InconsistentData;

/**
 * A POPO that represents a test category preset
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
class TestCategoryPreset implements JsonSerializable
{
    /**
     * @var string $id
     */
    private $id;

    /**
     * @var string $label - short preset name
     */
    private $label;

    /**
     * @var string $qtiCategory - the actual qti category that will end up in the QTI markup
     */
    private $qtiCategory;

    /**
     * @var string $description - what is the category purpose
     */
    private $description = '';

    /**
     * @var string $order - to sort the categories
     */
    private $order = 0;

    /**
     * @var string $pluginId - related plugin that the preset depends on
     */
    private $pluginId = '';

    /**
     * @var string $featureFlag - the name of a config flag,
     * the preset will be deactivated based on this optional value.
     */
    private $featureFlag;


    /**
     * Create a test category preset
     * @param string $id
     * @param string $label
     * @param string $qtiCategory
     * @param array $data - optional parameters
     * @throws common_exception_InconsistentData
     */
    public function __construct ($id, $label, $qtiCategory, $data)
    {
        if(! is_string($id) || empty($id)) {
            throw new common_exception_InconsistentData('The category preset needs an id');
        }
        if(! is_string($label) || empty($label)) {
            throw new common_exception_InconsistentData('The category preset needs a label');
        }
        if(! is_string($qtiCategory) || empty($qtiCategory)) {
            throw new common_exception_InconsistentData('The category preset needs a qti category');
        }

        $this->id           = (string) $id;
        $this->label        = (string) $label;
        $this->qtiCategory  = (string) $qtiCategory;

        if(isset($data['description'])) {
            $this->description = (string) $data['description'];
        }
        if(isset($data['order'])) {
            $this->order = (integer) $data['order'];
        }
        if(isset($data['pluginId'])) {
            $this->pluginId = (string) $data['pluginId'];
        }
        if(isset($data['featureFlag'])) {
            $this->featureFlag = (string) $data['featureFlag'];
        }
    }

    public function getId()
    {
        return $this->id;
    }

    public function getLabel()
    {
        return $this->label;
    }

    public function getQtiCategory()
    {
        return $this->qtiCategory;
    }

    public function getDescription()
    {
        return $this->description;
    }

    public function getOrder()
    {
        return $this->order;
    }

    public function getPluginId()
    {
        return $this->pluginId;
    }

    public function getFeatureFlag()
    {
        return (string) $this->featureFlag;
    }

    /**
     * @see JsonSerializable::jsonSerialize
     */
    public function jsonSerialize()
    {
        return $this->toArray();
    }

    /**
     * Convenient method to convert the members to an assoc array
     * @return array the data
     */
    public function toArray()
    {
        return [
            'id'          => $this->id,
            'label'       => $this->label,
            'qtiCategory' => $this->qtiCategory,
            'description' => $this->description,
            'order'       => $this->order,
            'pluginId'    => $this->pluginId,
            'featureFlag' => $this->featureFlag
        ];
    }

    /**
     * Create a test category preset from an assoc array
     * @param array $data
     * @return TestCategoryPreset the new instance
     * @throws common_exception_InconsistentData
     */
    public static function fromArray( array $data )
    {
        if( !isset($data['id']) || !isset($data['label']) || !isset($data['qtiCategory']) ) {
            throw new common_exception_InconsistentData('The test category preset requires an id, a label and a qtiCategory');
        }

        return new self(
            $data['id'],
            $data['label'],
            $data['qtiCategory'],
            $data
        );
    }

}
