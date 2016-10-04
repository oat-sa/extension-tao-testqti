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
 * Copyright (c) 2013-2016 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

/**
 * Actions about Items in a Test context.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 */
class taoQtiTest_actions_Items extends tao_actions_CommonModule
{
    /**
     * Get ALL QTI items within the platform.
     *
     * The response is encoded in JSON and contains only some basic data about items (uri, label keys).
     * A 'pattern' request parameter parameter is allowed to filter results at search time.
     * A 'notempty' ('1', 'true', 'on' and 'yes' values available) request parameter is allowed to filter empty items.
     *
     * This method will be refactored (limit, filtering, etc.) with the resource widget.
     */
    public function get()
    {
        $items = array();
        $propertyFilters = array(TAO_ITEM_MODEL_PROPERTY => TAO_ITEM_MODEL_QTI);
        $options = array('recursive' => true, 'like' => true, 'limit' => 50);
        $notEmpty = filter_var($this->getRequestParameter('notempty'), FILTER_VALIDATE_BOOLEAN);

        if (($pattern = $this->getRequestParameter('pattern')) !== null && $pattern !== '') {
            $propertyFilters[RDFS_LABEL] = $pattern;
        }

        $itemsService = taoItems_models_classes_ItemsService::singleton();
        $itemClass = $itemsService->getRootClass();

        $result = $itemClass->searchInstances($propertyFilters, $options);

        foreach ($result as $qtiItem) {
            if (!$notEmpty || $itemsService->hasItemContent($qtiItem)) {
                $items[] = array(
                    'uri' => $qtiItem->getUri(),
                    'label' => $qtiItem->getLabel()
                );
            }
        }

        $this->returnJson($items);
    }

    /**
     * Get all categories related to a list of items.
     *
     * The response is encoded in JSON and contains the list of items and its categories.
     * parameter uris is required in order to get categories for one or more items
     * @throws common_exception_MissingParameter
     */
    public function getCategories()
    {
        if (!$this->hasRequestParameter('uris')) {
            $this->returnJson(__("At least one mandatory parameter was required but found missing in your request"), 412);
            return;
        }

        $uris = $this->getRequestParameter('uris');
        $uris = (!is_array($uris)) ? array($uris) : $uris;


        $items = $this->getItems($uris);
        $itemCategories = $this->getServiceManager()->get(\oat\taoQtiItem\model\ItemCategoriesService::SERVICE_ID);
        $this->returnJson($itemCategories->getCategories($items));

    }

    /**
     * Get the qti items from a list of uris
     * @param array $itemUris list of item uris to get
     * @return core_kernel_classes_Resource[] $items
     */
    private function getItems(array $itemUris)
    {
        $items = array();

        foreach ($itemUris as $uri) {
            $item = new \core_kernel_classes_Resource($uri);
            if (\taoItems_models_classes_ItemsService::singleton()->hasItemModel($item, array(\oat\taoQtiItem\model\ItemModel::MODEL_URI))) {
                $items[$uri] = $item;
            }
        }

        return $items;
    }
}
