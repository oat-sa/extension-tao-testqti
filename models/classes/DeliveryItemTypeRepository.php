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
 * Copyright (c) 2023 (original work) Open Assessment Technologies SA ;
 *
 */

namespace oat\taoQtiTest\models;

use oat\oatbox\service\ConfigurableService;

class DeliveryItemTypeRepository extends ConfigurableService
{
    public const SERVICE_ID = 'taoQtiTest/DeliveryItemTypeRepository';

    private const OPTION_DEFAULT_ITEM_TYPE = 'defaultItemType';

    /**
     * Sets the default item type the viewer should manage
     */
    public function setDefaultItemType(string $type)
    {
        $this->setOption(self::OPTION_DEFAULT_ITEM_TYPE, $type);
    }

    /**
     * Gets the default item type the viewer should manage
     * @return string|bool
     */
    public function getDefaultItemType()
    {
        if ($this->hasOption(self::OPTION_DEFAULT_ITEM_TYPE)) {
            return $this->getOption(self::OPTION_DEFAULT_ITEM_TYPE);
        }

        return false;
    }

    /**
     * Gets the type of item the viewer should manage
     * @todo determine the item type from the $resultIdentifier
     * @param string $resultIdentifier
     * @return string
     */
    public function getDeliveryItemType($resultIdentifier)
    {
        return $this->getDefaultItemType();
    }
}
