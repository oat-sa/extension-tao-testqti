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
use oat\taoQtiTest\model\Service\MoveCommand;
use oat\taoQtiTest\model\Service\MoveService;
use oat\taoQtiTest\model\Service\PauseCommand;
use oat\taoQtiTest\model\Service\PauseService;
use oat\taoQtiTest\models\runner\synchronisation\TestRunnerAction;

/**
 * Pause the test
 *
 * @package oat\taoQtiTest\models\runner\synchronisation\action
 */
class Pause extends TestRunnerAction
{
    /**
     * Process the pause action.
     *
     * @return array
     * @throws common_Exception
     * @throws common_exception_Error
     * @throws common_exception_InconsistentData
     */
    public function process()
    {
        $this->validate();

        try {
            if ($this->getRequestParameter('offline') === true) {
                $this->setOffline();
            }

            $command = new PauseCommand($this->getServiceContext());

            $this->setItemContextToCommand($command);

            /** @var PauseService $pause */
            $pause = $this->getServiceLocator()->get(PauseService::class);

            $response = $pause($command);

            return $response->toArray();
        } catch (Exception $e) {
            return $this->getErrorResponse($e);
        }
    }
}
