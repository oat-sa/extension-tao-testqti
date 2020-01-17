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
 * Copyright (c) 2017-2019 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiTest\scripts\install;

use common_report_Report as Report;
use oat\oatbox\extension\InstallAction;
use oat\taoTests\models\runner\providers\ProviderRegistry;
use oat\taoTests\models\runner\providers\TestProvider;

/**
 * Installation action that registers the test runner providers
 *
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
class RegisterTestRunnerProviders extends InstallAction
{

    public static $providers = [
    //runner
        [
            'id'          => 'qti',
            'name'        => 'QTI runner',
            'module'      => 'taoQtiTest/runner/provider/qti',
            'bundle'      => 'taoQtiTest/loader/taoQtiTestRunner.min',
            'description' => 'QTI implementation of the test runner',
            'category'    => 'runner',
            'active'      => true,
            'tags'        => [ 'core', 'qti', 'runner' ]
        ],

        //communicator
        [
            'id'       => 'request',
            'name'     => 'request communicator',
            'module'   => 'core/communicator/request',
            'category' => 'communicator',
            'active'   => true,
            'tags'     => [ ]
        ], [
            'id'       => 'poll',
            'name'     => 'poll communicator',
            'module'   => "core/communicator/poll",
            'category' => 'communicator',
            'active'   => true,
            'tags'     => [ ]
        ],

        //proxy
        [
            'id' => 'qtiServiceProxy',
            'module' => 'taoQtiTest/runner/proxy/qtiServiceProxy',
            'bundle' => 'taoQtiTest/loader/taoQtiTestRunner.min',
            'category' => 'proxy',
            'active'   => true,
            'tags'     => [ ]
        ]
    ];

    public function __invoke($params)
    {
        $registry = ProviderRegistry::getRegistry();
        $count = 0;

        foreach (self::$providers as $provider) {
            if ($registry->register(TestProvider::fromArray($provider))) {
                $count++;
            }
        }

        return new Report(Report::TYPE_SUCCESS, $count .  ' providers registered.');
    }
}
