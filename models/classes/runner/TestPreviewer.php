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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA ;
 */

namespace oat\taoQtiTest\models\runner;

use common_Exception;
use common_exception_Error;
use common_exception_InconsistentData;
use common_exception_InvalidArgumentType;
use common_ext_ExtensionException;
use oat\oatbox\service\ConfigurableService;
use oat\oatbox\service\exception\InvalidServiceManagerException;
use oat\taoQtiTest\models\runner\config\QtiRunnerConfig;
use oat\taoQtiTest\models\runner\context\TestPreviewContext;
use oat\taoQtiTest\models\TestSessionService;

class TestPreviewer extends ConfigurableService
{
    /**
     * @return array
     * @throws common_Exception
     * @throws common_exception_Error
     * @throws common_exception_InconsistentData
     * @throws common_exception_InvalidArgumentType
     * @throws common_ext_ExtensionException
     * @throws InvalidServiceManagerException
     */
    public function run()
    {
        $offlineRunnerService = $this->getOfflineQtiRunnerService();
        $runnerService = $this->getRunnerService();
        $serviceContext = $this->getServiceContext();

        /** @var QtiRunnerServiceContext $serviceContext */
        $serviceContext = $runnerService->initServiceContext($serviceContext);

        if ($runnerService->init($serviceContext)) {
            $toolStates = $runnerService->getToolsStates($serviceContext);

            array_walk($toolStates, function (&$toolState) {
                $toolState = json_decode($toolState);
            });

            return [
                'success' => true,
                'testData' => $runnerService->getTestData($serviceContext),
                'testContext' => $runnerService->getTestContext($serviceContext),
                'testMap' => $runnerService->getTestMap($serviceContext),
                'items' => $offlineRunnerService->getItems($serviceContext),
                'toolStates' => $toolStates,
                'lastStoreId' => '1',
            ];
        }
    }

    private function getRunnerService(): QtiRunnerService
    {
        return $this->getServiceLocator()->get(QtiRunnerService::SERVICE_ID);
    }

    private function getOfflineQtiRunnerService(): OfflineQtiRunnerService
    {
        return $this->getServiceLocator()->get(OfflineQtiRunnerService::SERVICE_ID);
    }

    private function getServiceContext(): QtiRunnerServiceContext
    {
        $testDefinitionUri = 'something'; //@TODO
        $testCompilationUri = 'something'; //@TODO
        $testExecutionUri = 'something'; //@TODO

        /** @var QtiRunnerConfig $testConfig */
        $testConfig = $this->getServiceManager()->get(QtiRunnerConfig::SERVICE_ID);

        // create a service context based on the provided URI
        // initialize the test session and related objects
        $serviceContext = new TestPreviewContext($testDefinitionUri, $testCompilationUri, $testExecutionUri);
        $serviceContext->setServiceManager($this->getServiceManager());
        $serviceContext->setTestConfig($testConfig);
        $serviceContext->setUserUri(null);

        /** @var TestSessionService $sessionService */
        $sessionService = $this->getServiceManager()->get(TestSessionService::SERVICE_ID);

        $testSession = $serviceContext->getTestSession();
        $storage = $serviceContext->getStorage();
        $compilationDir = $serviceContext->getCompilationDirectory();

        $sessionService->registerTestSession(
            $testSession,
            $storage,
            $compilationDir
        );

        return $serviceContext;

        //FIXME
        // return $this->getRunnerService()->getServiceContext($testDefinitionUri, $testCompilationUri, $testExecutionUri);
    }
}
