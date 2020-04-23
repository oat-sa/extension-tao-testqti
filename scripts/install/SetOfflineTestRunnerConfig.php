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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Péter Halász <peter@taotesting.com>
 */

namespace oat\taoQtiTest\scripts\install;

use common_ext_action_InstallAction;
use common_report_Report as Report;
use oat\taoQtiTest\scripts\cli\TestRunnerOfflineMode;

/**
 * Class SetOfflineTestRunnerConfig
 * @package oat\taoQtiTest\scripts\install
 * @deprecated Please, use new script tao\taoQtiTest\script\cli\TestRunnerOfflineMode
 */
class SetOfflineTestRunnerConfig extends common_ext_action_InstallAction
{
    public function __invoke($params)
    {
        return new Report(Report::TYPE_WARNING, sprintf('This script deprecated, please, use %s to handle offline mode', TestRunnerOfflineMode::class));
    }
}
