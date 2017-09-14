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
 * This service let's you access the test creator's items
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
class CreatorItems extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/CreatorItems';

    const ITEM_ROOT_CLASS_URI       = 'http://www.tao.lu/Ontologies/TAOItem.rdf#Item';
    const PROPERTY_ITEM_CONTENT_URI = 'http://www.tao.lu/Ontologies/TAOItem.rdf#ItemContent';
    const PROPERTY_ITEM_MODEL_URI   = 'http://www.tao.lu/Ontologies/TAOItem.rdf#ItemModel';
    const ITEM_MODEL_QTI_URI        = 'http://www.tao.lu/Ontologies/TAOItem.rdf#QTI';
    const LABEL_URI                 = 'http://www.w3.org/2000/01/rdf-schema#label';

    const ITEM_MODEL_SEARCH_OPTION  = 'itemModel';
    const ITEM_CONTENT_SEARCH_OPTION= 'itemContent';

    /**
     * The different lookup formats
     */
    private static $formats = ['list', 'tree'];

    /**
     * Get the list of items classes
     * @return array the classes hierarchy
     */
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

    /**
     * Get the class subclasses
     * @return array the classes hierarchy
     */
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

    /**
     * Retrieve QTI Items for the given parameters
     * @param \core_kernel_classes_Class $itemClass the item class
     * @param string $format the lookup format
     * @param string|array  $search to filter by label if a string or provides the search filters
     * @param int $offset for paging
     * @param int $limit  for paging
     * @return array the items
     */
    public function getQtiItems(\core_kernel_classes_Class $itemClass, $format = 'list', $search = '', $offset = 0, $limit = 30)
    {
        $propertyFilters = [];

        if($this->hasOption(self::ITEM_MODEL_SEARCH_OPTION) && $this->getOption(self::ITEM_MODEL_SEARCH_OPTION) !== false){
            $propertyFilters[self::PROPERTY_ITEM_MODEL_URI] = $this->getOption(self::ITEM_MODEL_SEARCH_OPTION);
        }

        if($this->hasOption(self::ITEM_CONTENT_SEARCH_OPTION) && $this->getOption(self::ITEM_MODEL_SEARCH_OPTION) !== false){
            $propertyFilters[self::PROPERTY_ITEM_CONTENT_URI] = '*';
        }

        if(is_string($search) && strlen(trim($search)) > 0){
            $propertyFilters[self::LABEL_URI] = $search;
        }
        if(is_array($search)){
            foreach($search as $uri => $value){
                if( is_string($uri) &&
                    (is_string($value) && strlen(trim($value)) > 0) ||
                    (is_array($value) && count($value) > 0) ) {
                    $propertyFilters[$uri] = $value;
                }
            }
        }

        $result = [];

        //whitelisting's mandatory to prevent hijacking the dependency injection
        if(in_array($format, self::$formats)){

            //load the lookup dynamically using the format
            $itemLookup = $this->getServiceManager()->get(self::SERVICE_ID . '/' . $format);
            if(!is_null($itemLookup) && $itemLookup instanceof ItemLookup){
                $result = $itemLookup->getItems($itemClass, $propertyFilters, $offset, $limit);
            }
        }
        return $result;
    }
}
