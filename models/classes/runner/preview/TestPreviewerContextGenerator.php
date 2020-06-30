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

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiTest\models\runner\config\QtiRunnerConfig;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\TestSessionService;
use qtism\data\AssessmentTest;
use qtism\data\storage\xml\XmlStorageException;

class TestPreviewerContextGenerator extends ConfigurableService
{
    public function generate(string $testUri): QtiRunnerServiceContext
    {
        /** @var QtiRunnerConfig $testConfig */
        $testConfig = $this->getServiceManager()->get(QtiRunnerConfig::SERVICE_ID);

        $assessmentTest = $this->getAssessmentTest($testUri);

        $serviceContext = new TestPreviewContext($assessmentTest);

        $serviceContext->setServiceManager($this->getServiceManager());
        $serviceContext->setTestConfig($testConfig);
        $serviceContext->setUserUri(null);

        /** @var TestSessionService $sessionService */
        $sessionService = $this->getServiceManager()->get(TestSessionService::SERVICE_ID);

        $testSession = $serviceContext->getTestSession();
        $testSession->beginTestSession();

        $serviceContext->setTestSession($testSession);

        $storage = $serviceContext->getStorage();
        $compilationDir = $serviceContext->getCompilationDirectory();

        $sessionService->registerTestSession(
            $testSession,
            $storage,
            $compilationDir
        );

        return $serviceContext;
    }

    /**
     * @throws XmlStorageException
     */
    private function getAssessmentTest(string $testUri): AssessmentTest
    {
        return $this->getServiceLocator()->get(TestPreviewerAssessmentTestGenerator::class)->generate($testUri);
    }
}
