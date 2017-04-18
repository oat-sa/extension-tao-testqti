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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */
namespace oat\taoQtiTest\models\creator;

use oat\oatbox\service\ConfigurableService;

/**
 */
class CreatorItems extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/QtiRunnerService';

    const ITEM_ROOT_CLASS_URI       = 'http://www.tao.lu/Ontologies/TAOItem.rdf#Item';
    const PROPERTY_ITEM_CONTENT_URI = 'http://www.tao.lu/Ontologies/TAOItem.rdf#ItemContent';
    const PROPERTY_ITEM_MODEL_URI   = 'http://www.tao.lu/Ontologies/TAOItem.rdf#ItemModel';
    const ITEM_MODEL_QTI_URI        = 'http://www.tao.lu/Ontologies/TAOItem.rdf#QTI';
    const LABEL_URI                 = 'http://www.w3.org/2000/01/rdf-schema#label';

    private static $formats = ['list', 'tree'];
   
    public function getItemClasses()
    {
        $itemClass = new \core_kernel_classes_Class(self::ITEM_ROOT_CLASS_URI);

        $result = [
            'uri' => $itemClass->getUri(),
            'label' => $itemClass->getLabel(),
            'children' => $this->getSubClasses($itemClass->getSubClasses(false))
        ];

        return $result;
    }

    private function getSubClasses($subClasses)
    {
        $result = [];

        foreach ($subClasses as $subClass) {
            $children = $subClass->getSubClasses(false);
            $entry = [
                'uri' => $subClass->getUri(),
                'label' => $subClass->getLabel()
            ];
            if (count($children) > 0) {
                $entry['children'] = $this->getSubClasses($children);
            }
            array_push($result, $entry);
        }

        return $result;
    }

    public function getQtiItems(\core_kernel_classes_Class $itemClass, $format = 'list', $pattern, $offset = 0, $limit = 30)
    {
        $propertyFilters = [
            self::PROPERTY_ITEM_MODEL_URI => self::ITEM_MODEL_QTI_URI,
            self::PROPERTY_ITEM_CONTENT_URI => '*'
        ];

        if(!is_null($pattern) && strlen(trim($pattern)) > 0){
            $propertyFilters[LABEL_URI] = $pattern;
        }

        $result = [];

        if(in_array($format, self::$formats)){
            $itemLookup = $this->getServiceManager()->get('taoQtiTest/Creator/' . $format);
            if(!is_null($itemLookup) && $itemLookup instanceof ItemLookup){
                $result = $itemLookup->getItems($itemClass, $propertyFilters, $limit, $offset);
            }
        }
        return $result;
    }
}
