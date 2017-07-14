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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */

namespace oat\taoQtiTest\models\runner\offline;

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiTest\models\runner\offline\action\MoveAction;
use oat\taoQtiTest\models\runner\offline\action\SkipAction;

class OfflineService extends ConfigurableService
{
    /**
     * Wrap the process to appropriate action and aggregate results
     *
     * @param $data
     * @return string
     * @throws \common_exception_InconsistentData
     */
    public function process($data)
    {
        if (empty($data)) {
            throw new \common_exception_InconsistentData('No action to check. Processing action requires data.');
        }

        $response = [];
        foreach ($data as $entry) {

            $action = $this->resolve($entry);

            try {
                $responseAction = $action->process();
            } catch (\common_Exception $e) {
                $responseAction = ['error' => $e->getMessage()];
            }

            $responseAction['name'] = $action->getName();
            $responseAction['timestamp'] = $action->getTimeStamp();
        }

        return json_encode($response, JSON_PRETTY_PRINT);
    }

    /**
     * Resolve an offline runner action
     *
     * @param $data
     * @return TestRunnerAction
     * @throws \ResolverException
     * @throws \common_exception_InconsistentData
     */
    protected function resolve($data)
    {
        if (!isset($data['action']) || !isset($data['timestamp']) || !isset($data['parameters']) || !is_array($data['parameters'])) {
            throw new \common_exception_InconsistentData(
                'Action parameters have to contain "action", "timestamp" and "parameters" fields.');
        }

        $availableActions = $this->getAvailableActions();
        $actionName = $data['action'];

        $actionClass = null;

        // Search by key (e.q. key)
        if (isset($availableActions[$actionName])) {
            $actionClass = $availableActions[$actionName];
        }

        if (is_null($actionClass) || !is_a($actionClass, TestRunnerAction::class, true)) {
            throw new \ResolverException('Action name "' . $actionName . '" could not be resolved.');
        }

        return $this->getServiceManager()->propagate(new $actionClass($actionName, $data['timestamp'], $data['parameters']));
    }

    protected function getAvailableActions()
    {
        return [
            'move' => MoveAction::class,
            'skip' => SkipAction::class
        ];
    }
}