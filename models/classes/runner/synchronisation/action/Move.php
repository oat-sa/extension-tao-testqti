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
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;

/**
 * Class Move
 *
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
     * @return array
     */
    public function process()
    {
        $this->validate();

        $ref       = ($this->getRequestParameter('ref') === false) ? null : $this->getRequestParameter('ref');
        $direction = $this->getRequestParameter('direction');
        $scope     = $this->getRequestParameter('scope');
        $start     = ($this->getRequestParameter('start') !== false);

        try {

            /** @var QtiRunnerServiceContext $serviceContext */
            $serviceContext = $this->getServiceContext(false);

            if (!$this->getRunnerService()->isTerminated($serviceContext)) {
                $this->endItemTimer($this->getStart());
                $this->saveItemState();
            }
            $this->initServiceContext();

            $this->saveItemResponses(false);

            $this->setOffline();

            $serviceContext->getTestSession()->initItemTimer($this->getStart());
            $result = $this->getRunnerService()->move($serviceContext, $direction, $scope, $ref);

            $response = [
                'success' => $result,
            ];

            if ($result) {
                $response['testContext'] = $this->getRunnerService()->getTestContext($serviceContext);
            }

            \common_Logger::d('Test session state : ' . $serviceContext->getTestSession()->getState());

            if ($start === true) {

                // start the timer only when move starts the item session
                // and after context build to avoid timing error
                $this->getRunnerService()->startTimer($serviceContext, $this->getStart());
            }

        } catch (\Exception $e) {
            \common_Logger::e($e->getMessage());
            $response = $this->getErrorResponse($e);
        }

        return $response;
    }

    /**
     * Direction and scope are required for move action.
     *
     * @return array
     */
    protected function getRequiredFields()
    {
        return array_merge(parent::getRequiredFields(), ['direction', 'scope']);
    }
}