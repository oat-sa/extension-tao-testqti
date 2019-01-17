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
            $serviceContext = $this->getServiceContext();

            $this->saveToolStates();

            if ($this->getRequestParameter('offline') === true) {
                $this->setOffline();
            }

            $result = $this->getRunnerService()->pause($serviceContext);

            $response = [
                'success' => $result
            ];
        } catch (Exception $e) {
            $response = $this->getErrorResponse($e);
        }

        return $response;
    }
}
