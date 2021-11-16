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

use common_Exception;
use common_exception_Error;
use common_exception_InconsistentData;
use Exception;
use oat\taoQtiTest\model\Service\SkipCommand;
use oat\taoQtiTest\model\Service\SkipService;
use oat\taoQtiTest\models\runner\synchronisation\TestRunnerAction;

class Skip extends TestRunnerAction
{
    /**
     * Process the skip action.
     *
     * Validate required fields.
     * Stop timer.
     * Wrap the skip to runner service.
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

            $command = new SkipCommand(
                $this->getServiceContext(),
                $this->hasRequestParameter('start')
            );

            $this->setNavigationContextToCommand($command);
            $this->setItemContextToCommand($command);
            $this->setToolsStateContextToCommand($command);

            /** @var SkipService $skip */
            $skip = $this->getPsrContainer()->get(SkipService::class);

            $response = $skip($command);

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
