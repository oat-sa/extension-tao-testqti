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
 * Copyright (c) 2020  (original work) Open Assessment Technologies SA;
 *
 * @author Oleksandr Zagovorychev <zagovorichev@gmail.com>
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\runner\synchronisation\synchronisationService;

use common_exception_InconsistentData;
use oat\oatbox\service\ConfigurableService;
use oat\taoQtiTest\models\runner\synchronisation\TestRunnerAction;
use ResolverException;

class TestRunnerActionResolver extends ConfigurableService
{
    /**
     * @param array $data
     * @param array $availableActions
     * @return TestRunnerAction
     * @throws common_exception_InconsistentData
     * @throws ResolverException
     */
    public function resolve(array $data, array $availableActions): TestRunnerAction
    {
        $this->checkData($data);

        $actionName = $data['action'];
        $actionClass = (string) ($availableActions[$actionName] ?? '');
        $this->checkClass($actionClass, $actionName);

        return $this->propagate(new $actionClass($actionName, $data['timestamp'], $data['parameters']));
    }

    /**
     * @param $data
     * @throws common_exception_InconsistentData
     */
    protected function checkData($data): void
    {
        if (!isset(
            $data['action'],
            $data['timestamp'],
            $data['parameters'])
        ) {
            throw new common_exception_InconsistentData(
                'Action parameters have to contain "action", "timestamp" and "parameters" fields.'
            );
        }

        if (
        !is_array($data['parameters'])
        ) {
            throw new common_exception_InconsistentData(
                'Action parameters have to contain "parameters" field as an array.'
            );
        }
    }

    /**
     * @param $actionClass
     * @param string $actionName
     * @throws ResolverException
     */
    protected function checkClass(string $actionClass, string $actionName): void
    {
        if (!is_a($actionClass, TestRunnerAction::class, true)) {
            throw new ResolverException('Action name "' . $actionName . '" could not be resolved.');
        }
    }
}
