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

namespace oat\taoQtiTest\scripts\install;

use common_report_Report as Report;
use oat\oatbox\extension\InstallAction;
use oat\tao\model\modules\DynamicModule;
use oat\taoItems\model\preview\previewers\ItemPreviewerRegistry;

/**
 * Installation action that registers the test runner providers
 *
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
class RegisterTestRunnerPreviewers extends InstallAction
{

    public static $providers = [
        'previewer' => [
            [
                'id' => 'qtiItem',
                'name' => 'QTI Item Previewer',
                'module' => 'taoQtiTest/previewer/adapter/qtiItem',
                'bundle' => 'taoQtiTest/loader/qtiPreviewer.min',
                'description' => 'QTI implementation of the item previewer',
                'category' => 'previewer',
                'active' => true,
                'tags' => [ 'core', 'qti', 'previewer' ]
            ]
        ]
    ];

    public function __invoke($params)
    {
        $registry = ItemPreviewerRegistry::getRegistry();
        $count = 0;

        foreach(self::$providers as $categoryProviders) {
            foreach($categoryProviders as $providerData){
                if( $registry->register(DynamicModule::fromArray($providerData)) ) {
                    $count++;
                }
            }
        }

        return new Report(Report::TYPE_SUCCESS, $count .  ' providers registered.');
    }
}
