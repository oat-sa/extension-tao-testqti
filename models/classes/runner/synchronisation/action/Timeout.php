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

namespace oat\taoQtiTest\models\runner\synchronisation\action;

use common_exception_InconsistentData as InconsistentData;
use Exception;
use oat\taoQtiTest\model\Service\TimeoutCommand;
use oat\taoQtiTest\model\Service\TimeoutService;
use oat\taoQtiTest\models\runner\synchronisation\TestRunnerAction;

class Timeout extends TestRunnerAction
{
    /**
     * Process the timeout action.
     *
     * Validate required fields.
     * Stop/Start timer and save item state.
     * Save item responses and wrap the timeout to runner service.
     * Persist service context.
     * Start next timer.
     *
     * @throws InconsistentData
     */
    public function process(): array
    {
        $this->validate();

        try {
            if ($this->getRequestParameter('offline') === true) {
                $this->setOffline();
            }

            $command = new TimeoutCommand(
                $this->getServiceContext(),
                $this->hasRequestParameter('start'),
                $this->hasRequestParameter('late')
            );

            $this->setNavigationContextToCommand($command);
            $this->setItemContextToCommand($command);
            $this->setToolsStateContextToCommand($command);

            /** @var TimeoutService $timeout */
            $timeout = $this->getPsrContainer()->get(TimeoutService::class);

            $response = $timeout($command);

            return $response->toArray();
        } catch (Exception $e) {
            return $this->getErrorResponse($e);
        }
    }

    protected function getRequiredFields(): array
    {
        return array_merge(parent::getRequiredFields(), ['scope']);
    }
}
