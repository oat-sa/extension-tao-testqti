<?php

namespace oat\taoQtiTest\test\models\runner\synchronisation\action;

use common_exception_InconsistentData;
use Exception;
use oat\generis\test\TestCase;
use oat\taoQtiTest\model\Service\ActionResponse;
use oat\taoQtiTest\model\Service\ListItemsService;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\synchronisation\action\NextItemData;
use PHPUnit\Framework\MockObject\MockObject;

class NextItemDataTest extends TestCase
{
    /** @var QtiRunnerService|MockObject */
    private $runnerService;

    /** @var QtiRunnerServiceContext|MockObject */
    private $runnerServiceContext;

    /** @var ListItemsService|MockObject */
    private $listItemsService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->listItemsService = $this->createMock(ListItemsService::class);
        $this->runnerService = $this->createMock(QtiRunnerService::class);
        $this->runnerServiceContext = $this->createMock(QtiRunnerServiceContext::class);

        $this->runnerService
            ->method('getServiceContext')
            ->willReturn($this->runnerServiceContext);
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
        $this->expectExceptionMessage(
            'Some parameters are missing. Required parameters are : testDefinition, testCompilation, serviceCallId, '
                . 'itemDefinition'
        );

        $this->createSubject(['missing parameters'])
            ->process();
    }

    private function createSubject($requestParameters = []): NextItemData
    {
        $subject = new NextItemData('test', microtime(), $requestParameters);

        $services = [
            QtiRunnerService::SERVICE_ID => $this->runnerService,
            ListItemsService::class => $this->listItemsService
        ];

        return $subject->setServiceLocator($this->getServiceLocatorMock($services));
    }

    private function getRequiredRequestParameters(): array
    {
        return [
            'testDefinition' => null,
            'testCompilation' => null,
            'serviceCallId' => null,
            'itemDefinition' => null,
        ];
    }

    private function expectActionResponse(ActionResponse $actionResponse): void
    {
        $this->listItemsService
            ->method('__invoke')
            ->willReturn($actionResponse);
    }

    private function expectServiceThrows(Exception $exception)
    {
        $this->listItemsService
            ->method('__invoke')
            ->willThrowException($exception);
    }
}
