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

use common_ext_Extension;
use common_ext_ExtensionsManager;
use Exception;
use InvalidArgumentException;
use oat\oatbox\extension\script\ScriptAction;
use \common_report_Report as Report;

/**
 * Manage the timer-mode option for the TestRunner.
 * For the time being these modes are supported:
 * - 'server': The timer is managed by the server. It starts with the test and ends with it.
 *   Any interruption occurring on the client will be ignored, unless the test is explicitly
 *   paused by calling the pause action.
 * - 'client': The timer is managed by the client application. It is synchronized upon each
 *   navigation move. In case of interruption, the timer is paused and resumed when the item
 *   is in the interacting state. Time spent outside will be discarded, like while navigating
 *   between items or waiting for network. Between synchronisation steps the timer value is
 *   stored in the client storage. If this storage is emptied, the duration elapsed after the
 *   last synchronisation will be lost. This may happen if the browser's local storage is cleaned,
 *   or if the test is resumed from a different browser or computer.
 *
 * Usage:
 *     php index.php '\oat\taoQtiTest\scripts\cli\TimerMode' [options]
 *
 *   Optional Arguments:
 *     -g,       --get        Displays the timer mode
 *     -s mode, --set mode    Changes the timer mode
 *     -h,       --help       Prints a help statement
 *
 * Examples:
 * - Displays the current mode:
 *     php index.php '\oat\taoQtiTest\scripts\cli\TimerMode' -g
 *     php index.php '\oat\taoQtiTest\scripts\cli\TimerMode' --get
 *
 * - Change the timer mode to 'client'
 *     php index.php '\oat\taoQtiTest\scripts\cli\TimerMode' -s client
 *     php index.php '\oat\taoQtiTest\scripts\cli\TimerMode' --set client
 *
 * - Displays help:
 *     php index.php '\oat\taoQtiTest\scripts\cli\TimerMode' -h
 *     php index.php '\oat\taoQtiTest\scripts\cli\TimerMode' --help
 */
class TimerMode extends ScriptAction
{
    public const CONFIG_FILE = 'testRunner';
    public const GET_TIMER_MODE = 'show';
    public const SET_TIMER_MODE = 'mode';
    public const SUPPORTED_MODES = [
        'server',
        'client'
    ];

    protected function provideUsage()
    {
        return [
            'prefix' => 'h',
            'longPrefix' => 'help',
            'description' => 'Prints a help statement'
        ];
    }

    protected function provideOptions()
    {
        return [
            self::GET_TIMER_MODE => [
                'prefix' => 'g',
                'longPrefix' => 'get',
                'cast' => 'string',
                'flag' => true,
                'required' => false,
                'description' => 'Displays the timer mode',
            ],
            self::SET_TIMER_MODE => [
                'prefix' => 's',
                'longPrefix' => 'set',
                'cast' => 'string',
                'flag' => false,
                'required' => false,
                'description' => 'Changes the timer mode (valid values: "server", "client")',
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

        if ($this->getOption(self::GET_TIMER_MODE)) {
            return $report;
        }

        try {
            $mode = $this->getOption(self::SET_TIMER_MODE);

            $this->validate($mode);

            $this->setTimerMode($mode);

            $report->add(
                Report::createSuccess(sprintf('The test runner timer mode was successfully set to "%s"', $mode))
            );
        } catch (Exception $exception) {
            $report->add(
                Report::createError(sprintf('Failed to change the timer mode: %s', $exception->getMessage()))
            );
        }

        return $report;
    }

    private function validate(?string $mode): void
    {
        if (empty($mode)) {
            throw new InvalidArgumentException('The timer mode must be provided');
        }

        if (!in_array($mode, self::SUPPORTED_MODES, true)) {
            throw new InvalidArgumentException('The timer mode must be one of: ' . implode(', ', self::SUPPORTED_MODES));
        }
    }

    private function getExtensionsManagerService(): common_ext_ExtensionsManager
    {
        return $this->getServiceLocator()->get(common_ext_ExtensionsManager::SERVICE_ID);
    }

    private function getExtension(): common_ext_Extension
    {
        return $this->getExtensionsManagerService()->getExtensionById('taoQtiTest');
    }

    private function getTimerMode(): string
    {
        $config = $this->getExtension()->getConfig(self::CONFIG_FILE);
        return $config['timer']['target'];
    }

    private function setTimerMode(string $mode): void
    {
        $taoQtiTestExtension = $this->getExtension();
        $taoQtiTestExtension->setConfig(
            self::CONFIG_FILE,
            array_replace_recursive($taoQtiTestExtension->getConfig(self::CONFIG_FILE), ['timer' => ['target' => $mode]])
        );
    }
}
