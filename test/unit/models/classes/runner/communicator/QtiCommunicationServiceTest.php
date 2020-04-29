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

namespace oat\taoQtiTest\test\unit\models\classes\runner\communicator;

use common_exception_InconsistentData;
use oat\generis\test\TestCase;
use oat\taoQtiTest\models\runner\communicator\CommunicationChannel;
use oat\taoQtiTest\models\runner\communicator\QtiCommunicationService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;

class QtiCommunicationServiceTest extends TestCase
{
    public function testProcessInputEmptyInput(): void
    {
        $communicationService = new QtiCommunicationService();
        $contextMock = $this->createMock(QtiRunnerServiceContext::class);
        $responses = $communicationService->processInput($contextMock, []);
        $this->assertSame([], $responses);
    }

    public function testProcessInputWrongInput(): void
    {
        $this->expectException(common_exception_InconsistentData::class);
        $this->expectExceptionMessage('Wrong message chunk received by the bidirectional communication service: either channel or message content is missing!');

        $communicationService = new QtiCommunicationService();
        $contextMock = $this->createMock(QtiRunnerServiceContext::class);
        $communicationService->processInput($contextMock, ['a']);
    }

    /**
     * @throws common_exception_InconsistentData
     */
    public function testProcessInputFallback(): void
    {
        $communicationService = new QtiCommunicationService();
        $contextMock = $this->createMock(QtiRunnerServiceContext::class);
        $responses = $communicationService->processInput($contextMock, [
            ['channel' => '1', 'message' => ''],
            ['channel' => '1', 'message' => ''],
        ]);
        $this->assertSame([null, null], $responses);
    }

    /**
     * @throws common_exception_InconsistentData
     */
    public function testProcessInput(): void
    {
        $communicationService = new QtiCommunicationService([
            'channels' => [
                'input' => [
                    'test' => TestChannel::class,
                ],
            ],
        ]);
        $contextMock = $this->createMock(QtiRunnerServiceContext::class);
        $responses = $communicationService->processInput($contextMock, [
            ['channel' => 'test', 'message' => []],
        ]);
        $this->assertSame([
            ['test process']
        ], $responses);
    }

    public function testProcessOutputEmpty(): void
    {
        $communicationService = new QtiCommunicationService();
        $contextMock = $this->createMock(QtiRunnerServiceContext::class);
        $responses = $communicationService->processOutput($contextMock);
        $this->assertSame([], $responses);
    }

    public function testProcessOutput(): void
    {
        $communicationService = new QtiCommunicationService([
            'channels' => [
                'output' => [
                    'test' => TestChannel::class,
                ],
            ],
        ]);
        $contextMock = $this->createMock(QtiRunnerServiceContext::class);
        $responses = $communicationService->processOutput($contextMock);
        $this->assertSame([
            [
                'channel' => 'PHPUnitTest channel',
                'message' => [
                    'test process'
                ],
            ],
        ], $responses);
    }
}

class TestChannel implements CommunicationChannel
{
    public function getName(): string
    {
        return 'PHPUnitTest channel';
    }

    public function process(QtiRunnerServiceContext $context, array $data = []): array
    {
        return ['test process'];
    }
}
