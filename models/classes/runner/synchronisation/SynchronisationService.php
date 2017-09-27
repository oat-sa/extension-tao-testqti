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

namespace oat\taoQtiTest\models\runner\synchronisation;

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;

class SynchronisationService extends ConfigurableService
{

    const SERVICE_ID = 'taoQtiTest/synchronisationService';
    const ACTIONS_OPTION = 'actions';

    /**
     * Typical amount of time added on TimePoints to avoid timestamp collisions.
     * This value will be used to adjust intervals between moves in the synced time line.
     */
    const TIMEPOINT_INTERVAL = .001;

    /**
     * Wrap the process to appropriate action and aggregate results
     *
     * @param $data
     * @param $serviceContext QtiRunnerServiceContext
     * @return array
     * @throws \common_exception_InconsistentData
     */
    public function process($data, $serviceContext)
    {
        if (empty($data)) {
            throw new \common_exception_InconsistentData('No action to check. Processing action requires data.');
        }

        // first, extract the actions and build usable instances
        $actions = [];
        $duration = 0;
        foreach ($data as $entry) {
            $action = $this->resolve($entry);
            $actions[] = $action;
            
            if ($action->hasRequestParameter('itemDuration')) {
                $duration += $action->getRequestParameter('itemDuration') + self::TIMEPOINT_INTERVAL;
            }
        }
        
        // ensure the total duration of actions to sync is comprised within the elapsed time since the last sync.
        $now = microtime(true);
        $last = $serviceContext->getTestSession()->getTimer()->getLastRegisteredTimestamp();
        $elapsed = $now - $last;
        if ($duration > $elapsed) {
            throw new \common_exception_InconsistentData('Client duration exceed the elapsed server time!');
        }
        
        // the actions should be chronological
        usort($actions, function($a, $b) {
           return $a->getTimestamp() - $b->getTimestamp(); 
        });

        $response = [];

        /** @var TestRunnerAction $action */
        foreach( $actions as $action) {
            try {
                if ($action->hasRequestParameter('itemDuration')) {
                    $last += $action->getRequestParameter('itemDuration') + self::TIMEPOINT_INTERVAL;
                }
                $action->setTime($last);

                $action->setServiceContext($serviceContext);
                $responseAction = $action->process();
            } catch (\common_Exception $e) {
                $responseAction = ['error' => $e->getMessage()];
                $responseAction['success'] = false;
            }

            $responseAction['name'] = $action->getName();
            $responseAction['timestamp'] = $action->getTimeStamp();

            $response[] = $responseAction;

            if ($responseAction['success'] === false) {
                break;
            }
        }

        $this->getRunnerService()->persist($serviceContext);

        return $response;
    }

    /**
     * Get available actions from config
     *
     * @return array
     */
    public function getAvailableActions()
    {
        return is_array($this->getOption(self::ACTIONS_OPTION))
            ? $this->getOption(self::ACTIONS_OPTION)
            : [];
    }

    /**
     * Set available actions to config
     *
     * @param array $actions
     */
    public function setAvailableActions(array $actions = [])
    {
        $this->setOption(self::ACTIONS_OPTION, $actions);
    }


    /**
     * Resolve a runner action to synchronize
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

    /**
     * @return QtiRunnerService
     */
    protected function getRunnerService()
    {
        return $this->getServiceLocator()->get(QtiRunnerService::SERVICE_ID);
    }
}
