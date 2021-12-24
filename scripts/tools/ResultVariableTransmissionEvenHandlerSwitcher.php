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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\scripts\tools;

use oat\oatbox\extension\script\ScriptAction;
use oat\oatbox\extension\script\ScriptException;
use oat\oatbox\reporting\Report;
use oat\taoQtiTest\models\classes\eventHandler\ResultTransmissionEventHandler\Api\ResultTransmissionEventHandlerInterface;

/**
 * Class ResultVariableTransmissionEvenHandlerSwitcher
 *
 * @package oat\taoQtiTest\scripts\tools
 *
 *
 * Change event handler:  php index.php 'oat\taoQtiTest\scripts\tools\ResultVariableTransmissionEvenHandlerSwitcher' --class '{className}'
 */
class ResultVariableTransmissionEvenHandlerSwitcher extends ScriptAction
{
    private const OPTION_CLASS = 'class';

    protected function provideOptions(): array
    {
        return [
            self::OPTION_CLASS => [
                'prefix' => 'c',
                'flag' => false,
                'longPrefix' => 'class',
                'required' => true,
                'description' => 'className of handler for result variable transmission events'
            ]
        ];
    }

    protected function provideDescription(): string
    {
        return 'Script allow to switch handlers for result variable transmission events';
    }

    /**
     * @inheritDoc
     */
    protected function run()
    {
        $class = $this->getOption(self::OPTION_CLASS);
        $this->validateInputClass($class);
        $this->getServiceManager()
            ->register(ResultTransmissionEventHandlerInterface::SERVICE_ID, new $class());


        return Report::createSuccess(sprintf(
            'Handler for result variable transmission events successfully changed on%s%s',
            PHP_EOL,
            $class
        ));
    }

    /**
     * @throws ScriptException
     */
    private function validateInputClass(string $className): void
    {
        $implementedInterfaces = class_implements($className);
        if (
            empty($implementedInterfaces) ||
            !in_array(ResultTransmissionEventHandlerInterface::class, $implementedInterfaces, true)
        ) {
            throw new ScriptException(sprintf(
                'Provided class should implement %s',
                ResultTransmissionEventHandlerInterface::class
            ));
        }
    }
}
