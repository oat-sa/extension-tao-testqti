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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Péter Halász <peter@taotesting.com>
 */

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiTest\models\runner\OfflineQtiRunnerService;

class taoQtiTest_actions_OfflineRunner extends taoQtiTest_actions_Runner
{
    /**
     * @throws common_Exception
     * @return void
     */
    public function init()
    {
        try {
            $serviceContext = $this->getRunnerService()->initServiceContext($this->getServiceContext());
            $response = $this->getInitResponse();

            $response['items'] = $this->getOfflineRunnerService()->getItems($serviceContext);
            $response['testBranchingRules'] = $this->getOfflineRunnerService()->getBranchingRules($serviceContext);

            $this->returnJson($response);
        } catch (\Exception $e) {
            $this->returnJson(
                $this->getErrorResponse($e),
                $this->getErrorCode($e)
            );
        }
    }

    /**
     * @return ConfigurableService|OfflineQtiRunnerService
     */
    private function getOfflineRunnerService()
    {
        return $this->getServiceLocator()->get(OfflineQtiRunnerService::SERVICE_ID);
    }
}
