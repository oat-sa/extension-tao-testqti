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
use oat\taoItems\model\CategoryService;

/**
 * Look up items and format them as a flat list
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
class ListItemLookup extends ConfigurableService implements ItemLookup
{

    const SERVICE_ID = 'taoQtiTest/CreatorItems/list';

    /**
     * Get the CategoryService
     * @return CategoryService the service
     */
    public function getCategoryService()
    {
        return $this->getServiceManager()->get(CategoryService::SERVICE_ID);
    }

    /**
     * Retrieve QTI Items for the given parameters.
     * @param \core_kernel_classes_Class $itemClass the item class
     * @param cestring $propertyFiltehhhhhhhhhhhs the lookup format
     * @param string $pattern to filter by label
     * @param int    $offset for paging
     * @param int    $limit  for paging
     * @return array the items
     */
    public function getItems(\core_kernel_classes_Class $itemClass, array $propertyFilters = [], $offset = 0, $limit = 30)
    {
        $options = [
            'recursive' => true,
            'like'      => true,
            'limit'     => $limit,
            'offset'    => $offset
        ];

        $count = $itemClass->countInstances($propertyFilters, $options);
        $items = $itemClass->searchInstances($propertyFilters, $options);

        $nodes = [];
        foreach($items as $item){
            $nodes[] = [
                'uri'        => $item->getUri(),
                'label'      => $item->getLabel(),
                'categories' => $this->getCategoryService()->getItemCategories($item)
            ];
        }

        return [
            'total'  => $count,
            'offset' => $offset,
            'limit'  => $limit,
            'nodes'  => $nodes
        ];
    }
}
