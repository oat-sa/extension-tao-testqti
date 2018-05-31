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
use oat\tao\model\GenerisTreeFactory;
use oat\tao\model\resources\TreeResourceLookup;
use oat\taoItems\model\CategoryService;

/**
 * Look up items and format them as a tree hierarchy
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
class TreeItemLookup extends ConfigurableService implements ItemLookup
{
    const SERVICE_ID = 'taoQtiTest/CreatorItems/tree';

    /**
     * Get the CategoryService
     * @return CategoryService the service
     */
    public function getCategoryService()
    {
        return $this->getServiceLocator()->get(CategoryService::SERVICE_ID);
    }

    /**
     * @return TreeResourceLookup
     */
    public function getTreeResourceLookupService()
    {
        return $this->getServiceLocator()->get(TreeResourceLookup::SERVICE_ID);
    }

    /**
     * Retrieve QTI Items in their hierarchy, for the given parameters as format them as tree.
     * @param \core_kernel_classes_Class $itemClass the item class
     * @param array $propertyFilters propUri/propValue to search items
     * @param int    $offset for paging
     * @param int    $limit  for paging
     * @return array the items
     */
    public function getItems(\core_kernel_classes_Class $itemClass, array $propertyFilters = [], $offset = 0, $limit = 30)
    {
        $data =  $this->getTreeResourceLookupService()->getResources($itemClass, [], $propertyFilters, $offset, $limit);
        return $this->formatTreeData($data);
    }


    /**
     * Reformat the the tree : state and count
     * Add the item's categories
     * @param array $treeData
     * @return array the formated data
     */
    private function formatTreeData(array $treeData)
    {
        return array_map(function($data){
            $formatted = [
                'categories' => $this->getCategoryService()->getItemCategories(new \core_kernel_classes_Resource($data['uri']))
            ];
            if(isset($data['children'])){
                $formatted['children'] = $this->formatTreeData($data['children']);
            }
            return array_merge($data, $formatted);
        }, $treeData);
    }
}
