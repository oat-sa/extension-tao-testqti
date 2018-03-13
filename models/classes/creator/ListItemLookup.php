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

use oat\generis\model\OntologyAwareTrait;
use oat\generis\model\OntologyRdfs;
use oat\oatbox\service\ConfigurableService;
use oat\tao\model\resources\ListResourceLookup;
use oat\taoItems\model\CategoryService;

/**
 * Look up items and format them as a flat list
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
class ListItemLookup extends ConfigurableService implements ItemLookup
{
    use OntologyAwareTrait;

    const SERVICE_ID = 'taoQtiTest/CreatorItems/list';

    /**
     * Get the CategoryService
     */
    public function getCategoryService()
    {
        return $this->getServiceLocator()->get(CategoryService::SERVICE_ID);
    }

    /**
     * Get the ListResourceLookup
     */
    protected function getListResourceLookupService()
    {
        return $this->getServiceLocator()->get(ListResourceLookup::SERVICE_ID);
    }

    /**
     * Retrieve QTI Items for the given parameters.
     * @param \core_kernel_classes_Class $itemClass the item class
     * @param array $propertyFilters the lookup format
     * @param int    $offset for paging
     * @param int    $limit  for paging
     * @return array the items
     */
    public function getItems(\core_kernel_classes_Class $itemClass, array $propertyFilters = [], $offset = 0, $limit = 30)
    {
        $result = $this->getListResourceLookupService()->getResources($itemClass, [], $propertyFilters, $offset, $limit);

        array_map(function($item){
            return array_merge($item, [
                'categories' => $this->getCategoryService()->getItemCategories($this->getResource($item['uri']))
            ]);
        }, $result['nodes']);

        return $result;
    }
}
