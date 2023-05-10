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
 * Copyright (c) 2017-2022 (original work) Open Assessment Technologies SA ;
 */

namespace oat\taoQtiTest\models\runner\synchronisation\action;

use common_Exception;
use common_exception_Error;
use common_exception_InconsistentData;
use common_Logger;
use Exception;
use oat\taoQtiTest\model\Service\MoveCommand;
use oat\taoQtiTest\model\Service\MoveService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\synchronisation\TestRunnerAction;

/**
 * Move forward or back item into the test context.
 *
 * @package oat\taoQtiTest\models\runner\synchronisation\action
 */
class Move extends TestRunnerAction
{
    /**
     * Process the move action.
     *
     * Validate required fields.
     * Stop/Start timer and save item state.
     * Save item response and wrap the move to runner service.
     * Start next timer.
     *
     * @throws common_Exception
     * @throws common_exception_Error
     * @throws common_exception_InconsistentData
     */
    public function process(): array
    {
        $this->validate();

        try {
            if ($this->getRequestParameter('offline') === true) {
                $this->setOffline();
            }

            $serviceContext = $this->getServiceContext();

            $moveCommand = new MoveCommand(
                $this->getServiceContext(),
                $this->hasRequestParameter('start')
            );

            $this->setNavigationContextToCommand($moveCommand);
            $this->setItemContextToCommand($moveCommand);
            $this->setToolsStateContextToCommand($moveCommand);

            /** @var MoveService $moveService */
            $moveService = $this->getPsrContainer()->get(MoveService::class);

            $response = $moveService($moveCommand);

            common_Logger::d('Test session state : ' . $serviceContext->getTestSession()->getState());

            return $response->toArray();
        } catch (Exception $e) {
            common_Logger::e(
                $e->getMessage(),
                ['deliveryExecutionId' => $this->getServiceContext()->getTestExecutionUri()]
            );

            return $this->getErrorResponse($e);
        }
    }

    /**
     * Direction and scope are required for move action.
     *
     * @return array
     */
    protected function getRequiredFields(): array
    {
        return array_merge(parent::getRequiredFields(), ['direction', 'scope']);
    }
}
