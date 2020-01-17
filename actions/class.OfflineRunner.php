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
use oat\taoQtiTest\models\runner\map\TestMapBranchRuleExtender;
use oat\taoQtiTest\models\runner\OfflineQtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\TestDefinitionSerializerService;

class taoQtiTest_actions_OfflineRunner extends taoQtiTest_actions_Runner
{
    /**
     * @throws common_Exception
     * @return void
     */
    public function init()
    {
        try {
            /** @var QtiRunnerServiceContext $serviceContext */
            $serviceContext = $this->getRunnerService()->initServiceContext($this->getServiceContext());
            $response = $this->getInitResponse($serviceContext);

            if ($response['success'] === true) {
                $response['testMap'] = $this->attachBranchingRulesToResponse($response['testMap'], $serviceContext);
                $response['items'] = $this->getOfflineRunnerService()->getItems($serviceContext);
            }

            $this->returnJson($response);
        } catch (\Exception $e) {
            $this->returnJson(
                $this->getErrorResponse($e),
                $this->getErrorCode($e)
            );
        }
    }

    /**
     * Attaches the branching rules to the test map
     * @param array $testMap
     * @param QtiRunnerServiceContext $serviceContext
     * @return array
     * @throws common_exception_Error
     * @throws common_exception_InconsistentData
     * @throws core_kernel_persistence_Exception
     * @throws \oat\tao\model\websource\WebsourceNotFound
     */
    private function attachBranchingRulesToResponse(array $testMap, QtiRunnerServiceContext $serviceContext)
    {
        $serializedTestDefinition = $this->getTestDefinitionSerializerService()->getSerializedTestDefinition($serviceContext);
        $branchRuleExtender = new TestMapBranchRuleExtender();

        return $branchRuleExtender->getTestMapWithBranchRules($testMap, $serializedTestDefinition);
    }

    /**
     * @return ConfigurableService|OfflineQtiRunnerService
     */
    private function getOfflineRunnerService()
    {
        return $this->getServiceLocator()->get(OfflineQtiRunnerService::SERVICE_ID);
    }

    /**
     * @return ConfigurableService|TestDefinitionSerializerService
     */
    private function getTestDefinitionSerializerService()
    {
        return $this->getServiceLocator()->get(TestDefinitionSerializerService::SERVICE_ID);
    }
}
