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

declare(strict_types=1);

namespace oat\taoQtiTest\models\runner\synchronisation;

use common_Exception;
use common_exception_InconsistentData;
use common_Logger;
use oat\oatbox\service\ConfigurableService;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\synchronisation\synchronisationService\ResponseGenerator;

class SynchronisationService extends ConfigurableService
{

    public const SERVICE_ID = 'taoQtiTest/synchronisationService';
    public const ACTIONS_OPTION = 'actions';

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

        return $this->getResponses($data, $serviceContext, $this->getAvailableActions());
    }

    /**
     * @param $data
     * @param QtiRunnerServiceContext $serviceContext
     * @param array $availableActions
     * @return array
     */
    protected function getResponses($data, QtiRunnerServiceContext $serviceContext, array $availableActions): array
    {
        /** @var ResponseGenerator $responseGenerator */
        $responseGenerator = $this->getServiceLocator()->get(ResponseGenerator::class);

        // extract the actions and build usable instances
        $actions = $responseGenerator->prepareActions($data, $availableActions);

        // determine the start timestamp of the actions:
        // - check if the total duration of actions to sync is comprised within
        //   the elapsed time since the last TimePoint.
        // - otherwise compute the start timestamp from now minus the duration
        //   (caution! this could introduce inconsistency in the TimeLine as the ranges could be interlaced)
        $now = microtime(true);
        $last = $responseGenerator->getLastRegisteredTime(
            $now,
            $actions,
            $serviceContext->getTestSession()->getTimer()->getLastRegisteredTimestamp());

        $response = [];
        foreach ($actions as $action) {
            if ($action instanceof TestRunnerAction) {
                $response[] = $responseGenerator->getActionResponse($action, $now, $last, $serviceContext);
            } else {
                $response[] = $action; // if error happened
            }
            // no need to break on the first error as all actions expected to be with a response by the fe part
        }

        $this->persistContext($serviceContext);

        return $response;
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
     * @param $data
     * @throws common_exception_InconsistentData
     */
    protected function checkData($data): void
    {
        if (empty($data)) {
            throw new common_exception_InconsistentData('No action to check. Processing action requires data.');
        }
    }

    /**
     * @param QtiRunnerServiceContext $serviceContext
     */
    protected function persistContext(QtiRunnerServiceContext $serviceContext): void
    {
        try {
            /** @var QtiRunnerService $runnerService */
            $runnerService = $this->getServiceLocator()->get(QtiRunnerService::SERVICE_ID);
            $runnerService->persist($serviceContext);
        } catch (common_Exception $e) {
            // log the error message but return the data
            common_Logger::e($e->getMessage());
        }
    }
}
