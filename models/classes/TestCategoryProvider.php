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
 * @author Christophe Noël <christophe@taotesting.com>
 */

namespace oat\taoQtiTest\models;


use oat\oatbox\service\ConfigurableService;

class TestCategoryProvider extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/testCategoryProvider';

    public function getCategories() {
        return [
            TestCategory::fromArray([
                'id'            => 'endTestWarning',
                'label'         => __('End Test Warning'),
                'qtiCategory'   => 'x-tao-option-endTestWarning',
                'description'   => __('displays a warning before the user finishes the test'),
                'order'         => 100
            ]),
            TestCategory::fromArray([
                'id'            => 'nextPartWarning',
                'label'         => __('Next Part Warning'),
                'qtiCategory'   => 'x-tao-option-nextPartWarning',
                'description'   => __('displays a warning before the user finishes the part'),
                'order'         => 50
            ])
        ];
    }
}