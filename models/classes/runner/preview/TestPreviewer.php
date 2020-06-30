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

namespace oat\taoQtiTest\models\runner\preview;

use common_Exception;
use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\service\ConfigurableService;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;

class TestPreviewer extends ConfigurableService
{
    use OntologyAwareTrait;

    /**
     * @throws common_Exception
     */
    public function run(string $testUri): array
    {
        $runnerService = $this->getRunnerService();
        $runnerService->mapAsTestPreview();
        $runnerService->getQtiRunnerMap()->mapAsTestPreview();

        $serviceContext = $this->getServiceContext($testUri);

        /** @var QtiRunnerServiceContext $serviceContext */
        $serviceContext = $runnerService->initServiceContext($serviceContext);

        $testData = $runnerService->getTestData($serviceContext);
        $testContext = $runnerService->getTestContext($serviceContext);
        $testMap = $runnerService->getTestMap($serviceContext);

        return [
            'success' => true,
            'testData' => $testData,
            'testContext' => $testContext,
            'testMap' => $testMap,
        ];
    }

    private function getRunnerService(): QtiRunnerService
    {
        return $this->getServiceLocator()->get(QtiRunnerService::SERVICE_ID);
    }

    private function getServiceContext(string $testUri): QtiRunnerServiceContext
    {
        return $this->getServiceManager()->get(TestPreviewerContextGenerator::class)->generate($testUri);
    }
}
