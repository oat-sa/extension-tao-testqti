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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\scripts\cli;

use oat\oatbox\extension\script\ScriptAction;
use oat\oatbox\reporting\Report;

class TimerMode extends ScriptAction
{
    public const SET_TIMER_MODE = 'set';
    public const SUPPORTED_MODES = [
        'server',
        'client'
    ];

    protected function provideOptions()
    {
        return [
            self::SET_TIMER_MODE => [
                'prefix' => 's',
                'longPrefix' => 'set',
                'cast' => 'string',
                'flag' => false,
                'required' => false,
                'description' => 'Set the timer mode',
            ],
        ];
    }

    protected function provideDescription()
    {
        return 'This command sets the test runner timer mode';
    }

    protected function run()
    {
        $report = Report::createInfo(sprintf('The test runner timer mode is currently set to "%s"', $this->getTimerMode()));

        $mode = $this->getOption(self::SET_TIMER_MODE);
        if ($mode) {
            if ($this->setTimerMode($mode)) {
                $report->add(
                    Report::createSuccess(
                        sprintf('The test runner timer mode was successfully set to "%s"', $mode)
                    )
                );
            } else {
                $report->add(
                    Report::createError(
                        sprintf('The test runner timer mode "%s" is not supported and it was not applied', $mode)
                    )
                );
            }
        }

        return $report;
    }

    private function getExtensionsManagerService()
    {
        return $this->getServiceLocator()->get(\common_ext_ExtensionsManager::SERVICE_ID);
    }

    private function getTimerMode(): string
    {
        /** @var \common_ext_Extension $taoQtiTestExtension */
        $taoQtiTestExtension = $this->getExtensionsManagerService()->getExtensionById('taoQtiTest');
        $config = $taoQtiTestExtension->getConfig('testRunner');
        return $config['timer']['target'];
    }

    private function setTimerMode(string $mode): bool
    {
        if (in_array($mode, self::SUPPORTED_MODES, true)) {

            /** @var \common_ext_Extension $taoQtiTestExtension */
            $taoQtiTestExtension = $this->getExtensionsManagerService()->getExtensionById('taoQtiTest');
            $config = $taoQtiTestExtension->getConfig('testRunner');
            $config['timer']['target'] = $mode;
            $taoQtiTestExtension->setConfig('testRunner', $config);

            return true;
        }

        return false;
    }
}
