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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
/**
 * A registry of category presets providers (not of preset themselves)
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */

namespace oat\taoQtiTest\models;

use common_ext_Extension;
use common_ext_ExtensionsManager;
use oat\oatbox\AbstractRegistry;

class TestCategoryPresetRegistry extends AbstractRegistry
{

    /**
     * Specify in which extensions the config will be stored
     *
     * @return common_ext_Extension
     */
    protected function getExtension()
    {
        return common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
    }

    /**
     * config file in which the data will be stored
     *
     * @return string
     */
    protected function getConfigId()
    {
        return 'test_category_preset_registry';
    }


}