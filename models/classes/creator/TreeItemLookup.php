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
use oat\taoItems\model\CategoryService;

/**
 * Service to manage the assignment of users to deliveries
 */
class TreeItemLookup extends ConfigurableService implements ItemLookup
{
    const SERVICE_ID = 'taoQtiTest/Creator/tree';

    public function getCategoryService()
    {
        return $this->getServiceManager()->get(CategoryService::SERVICE_ID);
    }

    public function getItems(\core_kernel_classes_Class $itemClass, array $propertyFilters = [], $offset = 0, $limit = 30)
    {
        $factory = new GenerisTreeFactory(true, [$itemClass->getUri()], $limit, $offset, [], $propertyFilters);
        $treeData = $factory->buildTree($itemClass);

        return $this->formatTreeData([$treeData]);
    }

    private function formatTreeData(array $treeData)
    {
        return array_map(function($data){

            $formated = [
                'label' => $data['data'],
                'type'  => $data['type'],
                'uri'   => $data['attributes']['data-uri'],
                'categories' => $this->getCategoryService()->getItemCategories(new \core_kernel_classes_Resource($data['attributes']['data-uri']))
            ];
            if(isset($data['state'])){
                $formated['state'] = $data['state'];
            }
            if(isset($data['count'])){
                $formated['count'] = $data['count'];
            }
            if(isset($data['children'])){
                $formated['children'] = $this->formatTreeData($data['children']);
            }
            return $formated;
        }, $treeData);
    }
}
