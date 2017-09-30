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
 * Class ExitTest
 * 
 * Exit the current test abruptly
 *
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
     * @return array
     */
    public function process()
    {
        $this->validate();

        try {

            /** @var QtiRunnerServiceContext $serviceContext */
            $serviceContext = $this->getServiceContext();

            if (!$this->getRunnerService()->isTerminated($serviceContext)) {
                $this->endItemTimer();
                $this->saveItemState();
            }
            $this->initServiceContext();

            $this->saveItemResponses();

            $response = [
                'success' => $this->getRunnerService()->exitTest($serviceContext),
            ];

        } catch (\Exception $e) {
            \common_Logger::e($e->getMessage());
            $response = $this->getErrorResponse($e);
        }

        return $response;
    }
}
