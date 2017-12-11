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
 * Copyright (c) 2013-2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

use oat\generis\model\OntologyRdfs;
use oat\taoQtiTest\models\creator\CreatorItems;
use oat\taoItems\model\CategoryService;
use qtism\common\utils\Format;

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
     *
     * @deprecated use getItems instead
     */
    public function get()
    {
        $items = array();
        $propertyFilters = array(taoItems_models_classes_ItemsService::PROPERTY_ITEM_MODEL => taoItems_models_classes_itemModel::CLASS_URI_QTI);
        $options = array('recursive' => true, 'like' => true, 'limit' => 50);
        $notEmpty = filter_var($this->getRequestParameter('notempty'), FILTER_VALIDATE_BOOLEAN);

        if (($pattern = $this->getRequestParameter('pattern')) !== null && $pattern !== '') {
            $propertyFilters[OntologyRdfs::RDFS_LABEL] = $pattern;
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
     * Get the list of items classes
     */
    public function getItemClasses()
    {
        try {
            $data = $this->getCreatorItemsService()->getItemClasses();
        } catch(\common_Exception $e){

            return $this->returnFailure($e);
        }

        return $this->returnSuccess([$data]);
    }

    /**
     * Retrieve non empty QTI Items, using different parameters :
     *  - format (list or tree)
     *  - classUri (top class)
     *  - pattern (label filtering)
     *  - offset/limit (paginate)
     */
    public function getItems()
    {
        try {
            if(!$this->hasRequestParameter('classUri')){
                throw new \InvalidArgumentException('Missing parameter classUri');
            }
            if(!$this->hasRequestParameter('format')){
                throw new \InvalidArgumentException('Missing parameter format');
            }


            $classUri = $this->getRequestParameter('classUri');
            $format   = $this->getRequestParameter('format');
            $search   = $this->hasRequestParameter('search') ? $this->getRawParameter('search') : '';
            $limit    = $this->hasRequestParameter('limit') ? $this->getRequestParameter('limit') : 30;
            $offset   = $this->hasRequestParameter('offset') ? $this->getRequestParameter('offset') : 0;

            if(! empty($search) ){
                $decodedSearch = json_decode($search, true);
                if(is_array($decodedSearch) && count($decodedSearch) > 0){
                    $search = $decodedSearch;
                }
            }

            $itemClass = new \core_kernel_classes_Class($classUri);
            $data = $this->getCreatorItemsService()->getQtiItems($itemClass, $format, $search, $offset, $limit);
        } catch(\Exception $e){
            return $this->returnFailure($e);
        }

        return $this->returnSuccess($data);
    }


    /**
     * Get all categories related to a list of items.
     *
     * The response is encoded in JSON and contains the list of items and its categories.
     * parameter uris is required in order to get categories for one or more items
     * @throws common_exception_MissingParameter
     *
     * @deprecated the categories are retrieved with the items in getItems instead
     */
    public function getCategories()
    {
        if (!$this->hasRequestParameter('uris')) {
            $this->returnJson(__("At least one mandatory parameter was required but found missing in your request"), 412);
            return;
        }

        $categories = [];
        $uris = $this->getRequestParameter('uris');
        $uris = (!is_array($uris)) ? array($uris) : $uris;

        $items = $this->getQtiItems($uris);

        if (count($items) > 0) {
            $service = $this->getServiceManager()->get(CategoryService::SERVICE_ID);
            $itemsCategories = $service->getItemsCategories($items);

            //filter all values that wouldn't be valid XML identifiers
            foreach ($itemsCategories as $itemUri => $itemCategories){
                $filtered = array_filter($itemCategories, function($categorie){
                    return Format::isIdentifier($categorie);
                });
                if(count($filtered) > 0){
                    $categories[$itemUri] = $filtered;
                }
            }
        }
        $this->returnJson($categories);
    }

    /**
     * Get the qti items from a list of uris
     * @param array $itemUris list of item uris to get
     * @return core_kernel_classes_Resource[] $items
     */
    private function getQtiItems(array $itemUris)
    {
        $items = array();

        foreach ($itemUris as $uri) {
            $item = new \core_kernel_classes_Resource($uri);
            if ($this->getItemService()->hasItemModel($item, array(\oat\taoQtiItem\model\ItemModel::MODEL_URI))) {
                $items[$uri] = $item;
            }
        }

        return $items;
    }

    /**
     * Get the ItemService
     * @return \taoItems_models_classes_ItemsService the service
     */
    private function getItemService()
    {
        return \taoItems_models_classes_ItemsService::singleton();
    }

    /**
     * Get the CreatorItems service
     * @return CreatorItems the service
     */
    private function getCreatorItemsService()
    {
        return $this->getServiceManager()->get(CreatorItems::SERVICE_ID);
    }

    /**
     * Helps you to format 200 responses,
     * using the usual format [success,data]
     * @param mixed $data the response data to encode
     * @return string the json
     */
    protected function returnSuccess($data)
    {
        $returnArray = [
            'success' => true,
            'data' => $data
        ];

        return $this->returnJson($returnArray);
    }

    /**
     * Helps you to format failures responses.
     * @param \Exception $e
     * @return string the json
     */
    protected function returnFailure(\Exception $exception)
    {

        \common_Logger::e($exception);

        $returnArray = [
            'success' => false,
            'errorCode' => 500,
            'errorMsg' => $exception->getMessage()
        ];

        return $this->returnJson($returnArray, 500);
    }
}
