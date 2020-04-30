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

use common_Exception;
use common_exception_InconsistentData;
use common_Logger;
use oat\oatbox\service\ConfigurableService;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\synchronisation\synchronisationService\TestRunnerActionResolver;
use ResolverException;

class SynchronisationService extends ConfigurableService
{

    public const SERVICE_ID = 'taoQtiTest/synchronisationService';
    public const ACTIONS_OPTION = 'actions';

    /**
     * Typical amount of time added on TimePoints to avoid timestamp collisions.
     * This value will be used to adjust intervals between moves in the synced time line.
     */
    public const TIMEPOINT_INTERVAL = .001;

    /**
     * Wrap the process to appropriate action and aggregate results
     *
     * @param $data
     * @param $serviceContext QtiRunnerServiceContext
     * @return array
     * @throws common_exception_InconsistentData
     */
    public function process($data, QtiRunnerServiceContext $serviceContext): array
    {
        $this->checkData($data);

        // first, extract the actions and build usable instances
        $actions = $this->getActions($data);

        return $this->getAllActionsResponses($actions, $serviceContext);
    }

    /**
     * Get available actions from config
     *
     * @return array
     */
    public function getAvailableActions(): array
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
    public function setAvailableActions(array $actions = []): void
    {
        $this->setOption(self::ACTIONS_OPTION, $actions);
    }

    /**
     * @param array $data
     * @return array
     */
    private function getActions(array $data): array
    {
        /** @var TestRunnerActionResolver $resolver */
        $resolver = $this->getServiceLocator()->get(TestRunnerActionResolver::class);

        $actions = [];
        foreach ($data as $entry) {
            try {
                $actions[] = $resolver->resolve($entry,$this->getAvailableActions());
            } catch (common_exception_InconsistentData $e) {
                $responseAction = $entry;
                $responseAction['error'] = $e->getMessage();
                $responseAction['success'] = false;
                $actions[] = $responseAction;
            } catch (ResolverException $e) {
                $responseAction = $entry;
                $responseAction['error'] = $e->getMessage();
                $responseAction['success'] = false;
                $actions[] = $responseAction;
            }
        }

        // ensure the actions are in chronological order
        usort($actions, static function ($a, $b) {
            return $a instanceof TestRunnerAction ? $a->getTimestamp() - $b->getTimestamp() : 0;
        });

        return $actions;
    }

    /**
     * @param array $actions
     * @return float
     */
    private function computeDuration(array $actions): float
    {
        $duration = 0;
        foreach ($actions as $action) {
            if ($action instanceof TestRunnerAction && $action->hasRequestParameter('itemDuration')) {
                $duration += $action->getRequestParameter('itemDuration') + self::TIMEPOINT_INTERVAL;
            }
        }
        return $duration;
    }

    /**
     * @param float $now
     * @param array $actions
     * @param float $lastRegistered
     * @return float
     */
    private function getLastRegisteredTime(float $now, array $actions, float $lastRegistered): float
    {
        // also compute the total duration to synchronise
        $duration = $this->computeDuration($actions);

        $elapsed = $now - $lastRegistered;
        if ($duration > $elapsed) {
            common_Logger::t('Ignoring the last timestamp to take into account the actual duration to sync. Could introduce TimeLine inconsistency!');
            $lastRegistered = $now - $duration;
        }
        return $lastRegistered;
    }

    /**
     * @param TestRunnerAction $action
     * @param float $now
     * @param float $last
     * @param QtiRunnerServiceContext $serviceContext
     * @return array
     */
    private function getActionResponse(
        TestRunnerAction $action,
        float $now,
        float $last,
        QtiRunnerServiceContext $serviceContext
    ): array
    {
        try {
            $serviceContext->setSyncingMode($action->getRequestParameter('offline'));
            if ($action->hasRequestParameter('itemDuration') && $serviceContext->isSyncingMode()) {
                $last += $action->getRequestParameter('itemDuration') + self::TIMEPOINT_INTERVAL;
                $action->setTime($last);
            } else {
                $action->setTime($now);
            }

            $action->setServiceContext($serviceContext);
            $responseAction = $action->process();
        } catch (common_Exception $e) {
            $responseAction = ['error' => $e->getMessage()];
            $responseAction['success'] = false;
        }

        $responseAction['name'] = $action->getName();
        $responseAction['timestamp'] = $action->getTimeStamp();
        $responseAction['requestParameters'] = $action->getRequestParameters();

        return $responseAction;
    }

    /**
     * @param array $actions
     * @param QtiRunnerServiceContext $serviceContext
     * @return array
     */
    private function getAllActionsResponses(array $actions, QtiRunnerServiceContext $serviceContext): array
    {
        // determine the start timestamp of the actions:
        // - check if the total duration of actions to sync is comprised within
        //   the elapsed time since the last TimePoint.
        // - otherwise compute the start timestamp from now minus the duration
        //   (caution! this could introduce inconsistency in the TimeLine as the ranges could be interlaced)
        $now = microtime(true);
        $last = $this->getLastRegisteredTime(
            $now,
            $actions,
            $serviceContext->getTestSession()->getTimer()->getLastRegisteredTimestamp());

        $response = [];

        foreach ($actions as $action) {
            if ($action instanceof TestRunnerAction) {
                $response[] = $this->getActionResponse($action, $now, $last, $serviceContext);
            } else {
                $response[] = $action; // if error happened
            }
            // no need to break on the first error as all actions expected with a response by the fe part
        }

        try {
            $this->getRunnerService()->persist($serviceContext);
        } catch (common_Exception $e) {
            // log the error message but return the data
            common_Logger::e($e->getMessage());
        }

        return $response;
    }

    /**
     * Resolve a runner action to synchronize
     *
     * @param $data
     * @return TestRunnerAction
     * @throws ResolverException
     * @throws common_exception_InconsistentData
     */
    private function resolve($data): TestRunnerAction
    {

    }

    /**
     * @return QtiRunnerService
     */
    private function getRunnerService(): QtiRunnerService
    {
        return $this->getServiceLocator()->get(QtiRunnerService::SERVICE_ID);
    }

    /**
     * @param $data
     * @throws common_exception_InconsistentData
     */
    protected function checkData($data): void
    {
        if (empty($data)) {
            throw new common_exception_InconsistentData('No action to check. Processing action requires data.');
        }
    }
}
