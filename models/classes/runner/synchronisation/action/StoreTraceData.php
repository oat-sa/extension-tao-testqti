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
use oat\taoQtiTest\model\Service\StoreTraceVariablesCommand;
use oat\taoQtiTest\model\Service\StoreTraceVariablesService;
use oat\taoQtiTest\models\runner\synchronisation\TestRunnerAction;

class StoreTraceData extends TestRunnerAction
{
    /**
     * Process the storeTraceData action.
     *
     * Validate required fields.
     * Store trace data through runner service.
     * Trigger TraceVariableStored event.
     *
     * @throws common_Exception
     * @throws common_exception_Error
     * @throws common_exception_InconsistentData
     */
    public function process(): array
    {
        $this->validate();

        try {
            $traceVariables = json_decode(
                html_entity_decode($this->getRequestParameter('traceData')),
                true
            );

            $command = new StoreTraceVariablesCommand(
                $this->getServiceContext(),
                $traceVariables,
                $this->getRequestParameter('itemDefinition') ?: null
            );

            /** @var StoreTraceVariablesService $storeTraceVariables */
            $storeTraceVariables = $this->getPsrContainer()->get(StoreTraceVariablesService::class);

            $response = $storeTraceVariables($command);

            common_Logger::d('Stored ' . count($traceVariables) . ' trace variables');

            return $response->toArray();
        } catch (Exception $e) {
            common_Logger::e($e->getMessage(), ['deliveryExecutionId' => $this->getServiceContext()->getTestExecutionUri()]);
            return $this->getErrorResponse($e);
        }
    }

    protected function getRequiredFields(): array
    {
        return array_merge(parent::getRequiredFields(), ['traceData']);
    }
}
