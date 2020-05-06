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
 * Copyright (c) 2020  (original work) Open Assessment Technologies SA;
 *
 * @author Oleksandr Zagovorychev <zagovorichev@gmail.com>
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes\runner\synchronisation;

use common_exception_InconsistentData;
use oat\generis\test\TestCase;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\synchronisation\SynchronisationService;
use oat\taoQtiTest\models\runner\synchronisation\synchronisationService\ResponseGenerator;
use oat\taoQtiTest\models\runner\synchronisation\TestRunnerAction;

class SynchronisationServiceTest extends TestCase
{
    public function testProcessIncorrectDataException(): void
    {
        $this->expectException(common_exception_InconsistentData::class);
        $this->expectExceptionMessage('No action to check. Processing action requires data.');
        
        $service = new SynchronisationService();
        $serviceContext = $this->createMock(QtiRunnerServiceContext::class);
        $service->process([], $serviceContext);
    }

    /**
     * @throws common_exception_InconsistentData - global exception when data is not correct
     */
    public function testProcess(): void
    {
        $testRunnerActionMock = $this->createMock(TestRunnerAction::class);

        $responseGeneratorMock = $this->createMock(ResponseGenerator::class);
        $responseGeneratorMock->method('prepareActions')->willReturn([
            $testRunnerActionMock,
            $testRunnerActionMock,
            ['error 1'],
            $testRunnerActionMock,
            ['array with error'],
            ['another error'],
        ]);

        $responseGeneratorMock->method('getActionResponse')->willReturn(['phpunit action response']);
        $responseGeneratorMock->method('getLastActionTimestamp')->willReturn(1588580875.00);

        $qtiRunnerServiceMock = $this->createMock(QtiRunnerService::class);
        $qtiRunnerServiceMock->method('persist')->willReturnSelf();

        $serviceLocator = $this->getServiceLocatorMock([
            ResponseGenerator::class => $responseGeneratorMock,
            QtiRunnerService::SERVICE_ID => $qtiRunnerServiceMock,
        ]);

        $service = new SynchronisationService();
        $service->setServiceLocator($serviceLocator);

        $serviceContext = $this->createMock(QtiRunnerServiceContext::class);

        $response = $service->process([
            'a'
        ], $serviceContext);

        $this->assertSame([
            ['phpunit action response'],
            ['phpunit action response'],
            ['error 1'],
            ['phpunit action response'],
            ['array with error'],
            ['another error'],
        ], $response);
    }
}
