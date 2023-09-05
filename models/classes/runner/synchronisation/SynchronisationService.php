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

use common_exception_InconsistentData;
use oat\oatbox\service\ConfigurableService;
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
        $this->validateSynchronisationData($data);

        /** @var ResponseGenerator $responseGenerator */
        $responseGenerator = $this->getServiceLocator()->get(ResponseGenerator::class);

        // extract the actions and build usable instances
        $actions = $responseGenerator->prepareActions($data, $this->getAvailableActions());

        $timeNow = microtime(true);
        $lastActionTimestamp = $responseGenerator->getLastActionTimestamp($actions, $serviceContext, $timeNow);

        $response = [];
        foreach ($actions as $action) {
            if ($action instanceof TestRunnerAction) {
                $response[] = $responseGenerator->getActionResponse(
                    $action,
                    $timeNow,
                    $lastActionTimestamp,
                    $serviceContext
                );
            } else {
                $response[] = $action; // if error happened
            }
            // no need to break on the first error as all actions expected to be with a response by the fe part
        }

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
    protected function validateSynchronisationData($data): void
    {
        if (empty($data)) {
            throw new common_exception_InconsistentData('No action to check. Processing action requires data.');
        }
    }
}
