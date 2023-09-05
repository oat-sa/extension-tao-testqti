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

use common_Exception;
use common_exception_InconsistentData;
use common_Logger;
use oat\oatbox\service\ConfigurableService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\synchronisation\TestRunnerAction;
use ResolverException;

class ResponseGenerator extends ConfigurableService
{
    /**
     * Typical amount of time added on TimePoints to avoid timestamp collisions.
     * This value will be used to adjust intervals between moves in the synced time line.
     */
    private const TIMEPOINT_INTERVAL = .001;

    /**
     * @param array $data
     * @param array $availableActions
     * @return array
     */
    public function prepareActions(array $data, array $availableActions): array
    {
        /** @var TestRunnerActionResolver $resolver */
        $resolver = $this->getServiceLocator()->get(TestRunnerActionResolver::class);

        $actions = [];
        foreach ($data as $entry) {
            try {
                $actions[] = $resolver->resolve($entry, $availableActions);
            } catch (common_exception_InconsistentData | ResolverException $e) {
                $responseAction = $entry;
                $responseAction['error'] = $e->getMessage();
                $responseAction['success'] = false;
                $actions[] = $this->transform($responseAction);
            }
        }

        // ensure the actions are in chronological order
        usort($actions, static function ($a, $b) {
            $timeA = $a instanceof TestRunnerAction ? $a->getTimestamp() : 0;
            $timeB = $b instanceof TestRunnerAction ? $b->getTimestamp() : 0;
            return $timeA - $timeB;
        });

        return $actions;
    }

    private function transformField(string $fromFieldName, string $toFieldName, array $data): array
    {
        if (array_key_exists($fromFieldName, $data)) {
            $data[$toFieldName] = $data[$fromFieldName];
            unset($data[$fromFieldName]);
        }
        return $data;
    }

    private function transform($data)
    {
        if (is_array($data)) {
            $data = $this->transformField('parameters', 'requestParameters', $data);
            $data = $this->transformField('action', 'name', $data);
        }
        return $data;
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
     * determine the start timestamp of the actions:
     * - check if the total duration of actions to sync is comprised within
     *   the elapsed time since the last TimePoint.
     * - otherwise compute the start timestamp from now minus the duration
     *   (caution! this could introduce inconsistency in the TimeLine as the ranges could be interlaced)
     *
     * @param array $actions
     * @param QtiRunnerServiceContext $serviceContext
     * @param float $timeNow
     * @return float
     */
    public function getLastActionTimestamp(
        array $actions,
        QtiRunnerServiceContext $serviceContext,
        float $timeNow
    ): float {
        $lastRegisteredTimestamp = (float) $serviceContext->getTestSession()->getTimer()->getLastRegisteredTimestamp();
        $actionsDuration = $this->computeDuration($actions);
        $elapsed = $timeNow - $lastRegisteredTimestamp;
        if ($actionsDuration > $elapsed) {
            common_Logger::t(
                'Ignoring the last timestamp to take into account the actual duration to sync. Could introduce '
                    . 'TimeLine inconsistency!'
            );
            $lastRegisteredTimestamp = $timeNow - $actionsDuration;
        }

        return $lastRegisteredTimestamp;
    }

    /**
     * @param TestRunnerAction $action
     * @param float $now
     * @param float $last
     * @param QtiRunnerServiceContext $serviceContext
     * @return array
     */
    public function getActionResponse(
        TestRunnerAction $action,
        float $now,
        float &$last,
        QtiRunnerServiceContext $serviceContext
    ): array {
        try {
            $serviceContext->setSyncingMode($action->getRequestParameter('offline'));
            if ($action->hasRequestParameter('itemDuration') && $serviceContext->isSyncingMode()) {
                $last += $action->getRequestParameter('itemDuration') + self::TIMEPOINT_INTERVAL;
                $action->setTime($last);
            } else {
                $action->setTime($now);
            }

            $action->setServiceContext($serviceContext);
            $actionResponse = $action->process();
        } catch (common_Exception $e) {
            $actionResponse = ['error' => $e->getMessage()];
            $actionResponse['success'] = false;
        }

        $actionResponse['name'] = $action->getName();
        $actionResponse['timestamp'] = $action->getTimeStamp();
        $actionResponse['requestParameters'] = $action->getRequestParameters();

        return $actionResponse;
    }
}
