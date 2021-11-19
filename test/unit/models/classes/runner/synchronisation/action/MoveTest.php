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

namespace oat\taoQtiTest\test\unit\models\classes\runner\synchronisation\action;

use common_exception_InconsistentData;
use Exception;
use oat\generis\test\TestCase;
use oat\oatbox\event\EventManager;
use oat\taoQtiTest\model\Service\ActionResponse;
use oat\taoQtiTest\model\Service\MoveService;
use oat\taoQtiTest\models\event\ItemOfflineEvent;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\session\TestSession;
use oat\taoQtiTest\models\runner\synchronisation\action\Move;
use PHPUnit\Framework\MockObject\MockObject;

class MoveTest extends TestCase
{
    /** @var QtiRunnerService|MockObject */
    private $runnerService;

    /** @var QtiRunnerServiceContext|MockObject */
    private $runnerServiceContext;

    /** @var TestSession|MockObject */
    private $testSession;

    /** @var EventManager|MockObject */
    private $eventManager;

    /** @var MoveService|MockObject */
    private $moveService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->moveService = $this->createMock(MoveService::class);
        $this->runnerService = $this->createMock(QtiRunnerService::class);
        $this->runnerServiceContext = $this->createMock(QtiRunnerServiceContext::class);
        $this->testSession = $this->createMock(TestSession::class);
        $this->eventManager = $this->createMock(EventManager::class);

        $this->runnerService
            ->method('getServiceContext')
            ->willReturn($this->runnerServiceContext);

        $this->runnerServiceContext
            ->method('getTestSession')
            ->willReturn($this->testSession);
    }

    public function testReturnsSuccessfulResponse(): void
    {
        $expectedActionResponse = ActionResponse::success(['itemIdentifier' => 'item-1']);
        $this->expectActionResponse($expectedActionResponse);

        $subject = $this->createSubject($this->getRequiredRequestParameters());

        $this->assertEquals($expectedActionResponse->toArray(), $subject->process());
    }

    public function testReturnsUnsuccessfulResponseWhenServiceReturnsEmptyResponse(): void
    {
        $this->expectActionResponse(ActionResponse::empty());

        $subject = $this->createSubject($this->getRequiredRequestParameters());

        $this->assertEquals(['success' => false], $subject->process());
    }

    public function testReturnsErrorResponseWhenServiceThrows(): void
    {
        $this->expectServiceThrows(new Exception('Error message', 100));

        $expectedResponse = [
            'success' => false,
            'type' => 'exception',
            'code' => 100,
            'message' => 'An error occurred!',
        ];

        $subject = $this->createSubject($this->getRequiredRequestParameters());

        $this->assertEquals($expectedResponse, $subject->process());
    }

    public function testThrowsWhenValidationFails(): void
    {
        $this->expectException(common_exception_InconsistentData::class);
        $this->expectExceptionMessage('Some parameters are missing. Required parameters are : testDefinition, testCompilation, serviceCallId, direction, scope');

        $this->createSubject(['missing parameters'])
            ->process();
    }

    public function testTriggersItemOfflineEvent(): void
    {
        $requestParameters = array_merge(
            $this->getRequiredRequestParameters(),
            [
                'offline' => true,
                'itemDefinition' => 'expectedItemDefinition',
            ]
        );

        $this->eventManager
            ->expects($this->once())
            ->method('trigger')
            ->with(
                $this->isInstanceOf(ItemOfflineEvent::class)
            );

        $this->createSubject($requestParameters)
            ->process();
    }

    private function createSubject(array $requestParameters = []): Move
    {
        $subject = new Move('test', microtime(), $requestParameters);

        $services = [
            QtiRunnerService::SERVICE_ID => $this->runnerService,
            EventManager::SERVICE_ID => $this->eventManager,
            MoveService::class => $this->moveService,
        ];

        return $subject->setServiceLocator($this->getServiceLocatorMock($services));
    }

    private function getRequiredRequestParameters(): array
    {
        return [
            'testDefinition' => null,
            'testCompilation' => null,
            'serviceCallId' => null,
            'direction' => null,
            'scope' => null,
        ];
    }

    private function expectActionResponse(ActionResponse $actionResponse): void
    {
        $this->moveService->method('__invoke')
            ->willReturn($actionResponse);
    }

    private function expectServiceThrows(Exception $exception)
    {
        $this->moveService
            ->method('__invoke')
            ->willThrowException($exception);
    }
}
