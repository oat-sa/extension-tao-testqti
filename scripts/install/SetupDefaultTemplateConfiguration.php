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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA;
 *
 * @author Sergei Mikhailov <sergei.mikhailov@taotesting.com>
 */

declare(strict_types=1);

namespace oat\taoQtiTest\scripts\install;

use common_report_Report as Report;
use oat\oatbox\extension\script\ScriptAction;
use oat\taoQtiTest\models\test\Template\DefaultConfigurationRegistry;
use qtism\data\NavigationMode;
use ReflectionMethod;

class SetupDefaultTemplateConfiguration extends ScriptAction
{
    public const CATEGORIES      = 'categories';
    public const NAVIGATION_MODE = 'navigationMode';

    private const ARRAY_VALUE_DELIMITER = ',';

    private const OPTION_DEFAULT_VALUES = [
        self::CATEGORIES      => '',
        self::NAVIGATION_MODE => NavigationMode::LINEAR,
    ];

    protected function provideUsage()
    {
        return [
            'prefix'      => 'h',
            'longPrefix'  => 'help',
            'description' => 'Displays this message',
        ];
    }

    protected function provideOptions(): array
    {
        return [
            self::CATEGORIES      => [
                'prefix'      => 'c',
                'longPrefix'  => self::CATEGORIES,
                'description' => sprintf(
                    'Test item categories separated by "%s", "%s" by default',
                    self::ARRAY_VALUE_DELIMITER,
                    self::OPTION_DEFAULT_VALUES[self::CATEGORIES]
                ),
            ],
            self::NAVIGATION_MODE => [
                'prefix'      => 'n',
                'longPrefix'  => self::NAVIGATION_MODE,
                'description' => sprintf(
                    'Test part navigation mode, %s, %d by default',
                    implode(
                        ', ',
                        array_map(
                            static function (string $navigationModeLabel, int $navigationModeValue): string {
                                return "$navigationModeValue – $navigationModeLabel";
                            },
                            array_keys(NavigationMode::asArray()),
                            NavigationMode::asArray()
                        )
                    ),
                    self::OPTION_DEFAULT_VALUES[self::NAVIGATION_MODE]
                ),
            ],
        ];
    }

    protected function provideDescription(): string
    {
        return sprintf('Sets `%s` values.', DefaultConfigurationRegistry::class);
    }

    protected function run(): Report
    {
        $registry = $this->propagate(new DefaultConfigurationRegistry());

        $setValues = [];

        foreach (self::OPTION_DEFAULT_VALUES as $optionName => $defaultValue) {
            $value = $this->getOption($optionName) ?? $defaultValue;

            if (null === $value) {
                continue;
            }

            $method = [$registry, 'set' . ucfirst($optionName)];

            if (!is_callable($method)) {
                continue;
            }

            $type = $this->getArgumentType($method);

            if ('array' === $type) {
                $value = $value ? explode(',', $value) : [];
            } else {
                settype($value, $type);
            }

            $method($value);

            $setValues[$optionName] = $value;
        }

        return $this->createReport($setValues);
    }

    private function createReport(array $setValues): Report
    {
        return $setValues
            ? Report::createSuccess(
                sprintf(
                    "Applied the following configuration to `%s`\n%s",
                    DefaultConfigurationRegistry::class,
                    json_encode($setValues)
                )
            )
            : Report::createFailure(
                sprintf('No values set to `%s`', DefaultConfigurationRegistry::class)
            );
    }

    private function getArgumentType(array $method): string
    {
        /** @noinspection PhpUnhandledExceptionInspection */
        $reflection = new ReflectionMethod(...$method);

        $arguments = $reflection->getParameters();

        $firstArgument = reset($arguments);

        if (!$firstArgument) {
            return 'null';
        }

        return (string)$firstArgument->getType();
    }
}
