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
use oat\taoQtiTest\model\Service\ExitTestCommand;
use oat\taoQtiTest\model\Service\ExitTestService;
use oat\taoQtiTest\models\runner\synchronisation\TestRunnerAction;

/**
 * Exit the current test abruptly
 *
 * @package oat\taoQtiTest\models\runner\synchronisation\action
 */
class ExitTest extends TestRunnerAction
{
    /**
     * Process the exitTest action.
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
            $command = new ExitTestCommand($this->getServiceContext());

            $this->setNavigationContextToCommand($command);
            $this->setItemContextToCommand($command);
            $this->setToolsStateContextToCommand($command);

            /** @var ExitTestService $exitTest */
            $exitTest = $this->getPsrContainer()->get(ExitTestService::class);

            $response = $exitTest($command);

            return $response->toArray();
        } catch (Exception $e) {
            common_Logger::e(
                $e->getMessage(),
                ['deliveryExecutionId' => $this->getServiceContext()->getTestExecutionUri()]
            );

            return $this->getErrorResponse($e);
        }
    }
}
