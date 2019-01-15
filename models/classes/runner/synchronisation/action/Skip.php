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
 * Skip item into the test context.
 *
 * @package oat\taoQtiTest\models\runner\synchronisation\action
 */
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
     * @return array
     * @throws common_Exception
     * @throws common_exception_Error
     * @throws common_exception_InconsistentData
     */
    public function process()
    {
        $this->validate();

        $ref = $this->getRequestParameter('ref') ?: null;
        $itemDuration = null;

        $scope = $this->getRequestParameter('scope');
        $start = $this->getRequestParameter('start') !== false;

        try {
            $serviceContext = $this->getServiceContext();

            $this->saveToolStates();

            $this->getRunnerService()->endTimer($serviceContext, $itemDuration, $this->getTime());

            if ($this->getRequestParameter('offline') === true) {
                $this->setOffline();
            }

            $result = $this->getRunnerService()->skip($serviceContext, $scope, $ref);

            $response = [
                'success' => $result,
            ];

            if ($result) {
                $response['testContext'] = $this->getRunnerService()->getTestContext($serviceContext);
                if ($serviceContext->containsAdaptive()) {
                    // Force map update.
                    $response['testMap'] = $this->getRunnerService()->getTestMap($serviceContext, true);
                }
            }

            if ($start == true) {
                // start the timer only when move starts the item session
                // and after context build to avoid timing error
                $this->getRunnerService()->startTimer($serviceContext, $this->getTime());
            }
        } catch (Exception $e) {
            $response = $this->getErrorResponse($e);
        }

        return $response;
    }

    /**
     * Scope parameter is required.
     *
     * @return array
     */
    protected function getRequiredFields()
    {
        return array_merge(parent::getRequiredFields(), ['scope']);
    }
}
