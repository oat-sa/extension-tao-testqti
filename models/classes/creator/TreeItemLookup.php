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

use common_exception_Error;
use core_kernel_classes_Class;
use core_kernel_classes_Resource;
use oat\oatbox\service\ConfigurableService;
use oat\tao\model\resources\ResourceLookup;
use oat\tao\model\resources\TreeResourceLookup;
use oat\taoItems\model\CategoryService;

/**
 * Look up items and format them as a tree hierarchy
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
class TreeItemLookup extends ConfigurableService implements ItemLookup
{
    use PermissionLookupTrait;

    public const SERVICE_ID = 'taoQtiTest/CreatorItems/tree';

    public function getCategoryService(): CategoryService
    {
        /** @noinspection PhpIncompatibleReturnTypeInspection */
        return $this->getServiceLocator()->get(CategoryService::SERVICE_ID);
    }

    public function getTreeResourceLookupService(): ResourceLookup
    {
        /** @noinspection PhpIncompatibleReturnTypeInspection */
        return $this->getServiceLocator()->get(TreeResourceLookup::SERVICE_ID);
    }

    /**
     * Retrieve QTI Items in their hierarchy, for the given parameters as format them as tree.
     *
     * @param core_kernel_classes_Class $itemClass       the item class
     * @param array                     $propertyFilters propUri/propValue to search items
     * @param int                       $offset          for paging
     * @param int                       $limit           for paging
     *
     * @return array the items
     *
     * @throws common_exception_Error
     */
    public function getItems(
        core_kernel_classes_Class $itemClass,
        array $propertyFilters = [],
        $offset = 0,
        $limit = 30
    ): array {
        $data = $this->getTreeResourceLookupService()->getResources($itemClass, [], $propertyFilters, $offset, $limit);
        $nodes =  $this->formatTreeData($data);
        $nodes = $this->fillPermissions($nodes);
        return $nodes;
    }

    /**
     * Reformat the the tree : state and count
     * Add the item's categories
     *
     * @param array $treeData
     *
     * @return array the formatted data
     *
     * @throws common_exception_Error
     */
    private function formatTreeData(array $treeData): array
    {
        foreach ($treeData as &$item) {
            if ($item['type'] === 'instance') {
                $item['categories'] = $this->getCategoryService()->getItemCategories(
                    new core_kernel_classes_Resource($item['uri'])
                );
            } elseif (isset($item['children'])) {
                $item['children'] = $this->formatTreeData($item['children']);
            }
        }
        return $treeData;
    }
}
