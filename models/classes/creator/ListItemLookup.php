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

use core_kernel_classes_Class;
use oat\generis\model\data\permission\PermissionHelper;
use oat\generis\model\data\permission\PermissionInterface;
use oat\generis\model\OntologyAwareTrait;
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

    public const SERVICE_ID = 'taoQtiTest/CreatorItems/list';

    /**
     * Retrieve QTI Items for the given parameters.
     *
     * @param core_kernel_classes_Class $itemClass       the item class
     * @param array                      $propertyFilters the lookup format
     * @param int                        $offset          for paging
     * @param int                        $limit           for paging
     *
     * @return array the items
     *
     * @throws \common_exception_Error
     */
    public function getItems(
        core_kernel_classes_Class $itemClass,
        array $propertyFilters = [],
        $offset = 0,
        $limit = 30
    ): array {
        $result = $this->getListResourceLookupService()->getResources(
            $itemClass,
            [],
            $propertyFilters,
            $offset,
            $limit
        );

        $nodeIds = array_map(
            static function (array $node): string {
                return $node['uri'];
            },
            $result['nodes']
        );

        $accessible = $this->getPermissionHelper()->filterByPermission($nodeIds, PermissionInterface::RIGHT_READ);

        foreach ($result['nodes'] as $i => &$node) {
            if (!in_array($node['uri'], $accessible, true)) {
                unset($result['nodes'][$i]);
                $result['total']--;

                continue;
            }

            $node['categories'] = $this->getCategoryService()->getItemCategories($this->getResource($node['uri']));
        }

        return $result;
    }

    /**
     * Get the ListResourceLookup
     */
    protected function getListResourceLookupService()
    {
        return $this->getServiceLocator()->get(ListResourceLookup::SERVICE_ID);
    }

    private function getCategoryService(): CategoryService
    {
        /** @noinspection PhpIncompatibleReturnTypeInspection */
        return $this->getServiceLocator()->get(CategoryService::SERVICE_ID);
    }

    private function getPermissionHelper(): PermissionHelper
    {
        /** @noinspection PhpIncompatibleReturnTypeInspection */
        return $this->getServiceLocator()->get(PermissionHelper::class);
    }
}
