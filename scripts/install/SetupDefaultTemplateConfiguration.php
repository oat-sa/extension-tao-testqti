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
use qtism\data\SubmissionMode;
use ReflectionMethod;

class SetupDefaultTemplateConfiguration extends ScriptAction
{
    public const PART_ID_PREFIX       = 'partIdPrefix';
    public const SECTION_ID_PREFIX    = 'sectionIdPrefix';
    public const SECTION_TITLE_PREFIX = 'sectionTitlePrefix';
    public const CATEGORIES           = 'categories';
    public const NAVIGATION_MODE      = 'navigationMode';
    public const SUBMISSION_MODE      = 'submissionMode';
    public const MAX_ATTEMPTS         = 'maxAttempts';

    private const ARRAY_VALUE_DELIMITER = ',';

    private const OPTION_DEFAULT_VALUES = [
        self::PART_ID_PREFIX       => 'testPart',
        self::SECTION_ID_PREFIX    => 'assessmentSection',
        self::SECTION_TITLE_PREFIX => 'Section',
        self::CATEGORIES           => '',
        self::NAVIGATION_MODE      => NavigationMode::LINEAR,
        self::SUBMISSION_MODE      => SubmissionMode::INDIVIDUAL,
        self::MAX_ATTEMPTS         => 0,
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
            self::PART_ID_PREFIX       => [
                'prefix'      => 'pi',
                'longPrefix'  => self::PART_ID_PREFIX,
                'description' => sprintf(
                    'Test part ID prefix, "%s" by default',
                    self::OPTION_DEFAULT_VALUES[self::PART_ID_PREFIX]
                ),
            ],
            self::SECTION_ID_PREFIX    => [
                'prefix'      => 'si',
                'longPrefix'  => self::SECTION_ID_PREFIX,
                'description' => sprintf(
                    'Test section ID prefix, "%s" by default',
                    self::OPTION_DEFAULT_VALUES[self::SECTION_ID_PREFIX]
                ),
            ],
            self::SECTION_TITLE_PREFIX => [
                'prefix'      => 'st',
                'longPrefix'  => self::SECTION_TITLE_PREFIX,
                'description' => sprintf(
                    'Test section title prefix, "%s" by default',
                    self::OPTION_DEFAULT_VALUES[self::SECTION_TITLE_PREFIX]
                ),
            ],
            self::CATEGORIES           => [
                'prefix'      => 'c',
                'longPrefix'  => self::CATEGORIES,
                'description' => sprintf(
                    'Test item categories separated by "%s", "%s" by default',
                    self::ARRAY_VALUE_DELIMITER,
                    self::OPTION_DEFAULT_VALUES[self::CATEGORIES]
                ),
            ],
            self::NAVIGATION_MODE      => [
                'prefix'      => 'nm',
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
            self::SUBMISSION_MODE      => [
                'prefix'      => 'sm',
                'longPrefix'  => self::SUBMISSION_MODE,
                'description' => sprintf(
                    'Test part submission mode, %s, %d by default',
                    implode(
                        ', ',
                        array_map(
                            static function (string $submissionModeLabel, int $submissionModeValue): string {
                                return "$submissionModeValue – $submissionModeLabel";
                            },
                            array_keys(SubmissionMode::asArray()),
                            SubmissionMode::asArray()
                        )
                    ),
                    self::OPTION_DEFAULT_VALUES[self::SUBMISSION_MODE]
                ),
            ],
            self::MAX_ATTEMPTS         => [
                'prefix'      => 'm',
                'longPrefix'  => self::MAX_ATTEMPTS,
                'description' => sprintf(
                    'Test element max attempts, %d by default',
                    self::OPTION_DEFAULT_VALUES[self::MAX_ATTEMPTS]
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

            $method = [$registry, 'set' . ucfirst($optionName)];

            $setValues[$optionName] = $this->setRegistryValue($method, $value);
        }

        return $this->createReport($setValues);
    }

    private function createReport(array $setValues): Report
    {
        $setValues = array_filter(
            $setValues,
            static function ($value): bool {
                return null !== $value;
            }
        );

        return $setValues
            ? Report::createSuccess(
                sprintf(
                    "Applied the following configuration to `%s`\n%s",
                    DefaultConfigurationRegistry::class,
                    json_encode($setValues, JSON_PRETTY_PRINT)
                )
            )
            : Report::createFailure(
                sprintf('No values set to `%s`', DefaultConfigurationRegistry::class)
            );
    }

    private function setRegistryValue(array $method, $value)
    {
        if (!is_callable($method)) {
            return null;
        }

        $type = $this->getArgumentType($method);

        if ('array' === $type) {
            $value = $value ? explode(',', $value) : [];
        } else {
            settype($value, $type);
        }

        $method($value);

        return $value;
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
