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

use oat\taoQtiTest\models\runner\synchronisation\TestRunnerAction;

/**
 * Class Skip
 *
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
     */
    public function process()
    {
        $this->validate();

        $ref       = ($this->getRequestParameter('ref') === false) ? null : $this->getRequestParameter('ref');
        $itemDuration = null;
        $consumedExtraTime = null;

        $scope = $this->getRequestParameter('scope');
        $start = ($this->getRequestParameter('start') !== false);

        try {
            $serviceContext = $this->getServiceContext();
            $this->getRunnerService()->endTimer($serviceContext, $itemDuration, $consumedExtraTime, $this->getStart());

            $this->setOffline();

            $result = $this->getRunnerService()->skip($serviceContext, $scope, $ref);

            $response = [
                'success' => $result,
            ];

            if ($result) {
                $response['testContext'] = $this->getRunnerService()->getTestContext($serviceContext);
            }

            if ($start == true) {
                // start the timer only when move starts the item session
                // and after context build to avoid timing error
                $this->getRunnerService()->startTimer($serviceContext, $this->getStart());
            }
        } catch (\Exception $e) {
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