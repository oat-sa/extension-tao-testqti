<?php

namespace oat\taoQtiTest\test\unit\models\classes\runner\synchronisation\action;

use common_exception_InconsistentData;
use Exception;
use oat\generis\test\TestCase;
use oat\taoQtiTest\model\Service\ActionResponse;
use oat\taoQtiTest\model\Service\PauseService;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\session\TestSession;
use oat\taoQtiTest\models\runner\synchronisation\action\Pause;
use oat\generis\test\MockObject;

class PauseTest extends TestCase
{
    /** @var QtiRunnerService|\PHPUnit\Framework\MockObject\MockObject */
    private $runnerService;

    /** @var QtiRunnerServiceContext|MockObject */
    private $serviceContext;

    /** @var TestSession|MockObject */
    private $testSession;

    /** @var PauseService|MockObject */
    private $pauseService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->pauseService = $this->createMock(PauseService::class);
        $this->runnerService = $this->createMock(QtiRunnerService::class);
        $this->serviceContext = $this->createMock(QtiRunnerServiceContext::class);
        $this->testSession = $this->createMock(TestSession::class);

        $this->runnerService
            ->method('getServiceContext')
            ->willReturn($this->serviceContext);

        $this->serviceContext
            ->method('getTestSession')
            ->willReturn($this->testSession);
    }

    public function testReturnsSuccessfulResponse(): void
    {
        $expectedActionResponse = ActionResponse::success();
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
        $this->expectExceptionMessage('Some parameters are missing. Required parameters are : testDefinition, testCompilation, serviceCallId');

        $this->createSubject(['missing parameters'])
            ->process();
    }

    private function createSubject(array $requestParameters = []): Pause
    {
        $subject = new Pause('test', microtime(), $requestParameters);

        $services = [
            QtiRunnerService::SERVICE_ID => $this->runnerService,
            PauseService::class => $this->pauseService
        ];

        return $subject->setServiceLocator($this->getServiceLocatorMock($services));
    }

    private function getRequiredRequestParameters(): array
    {
        return [
            'testDefinition' => null,
            'testCompilation' => null,
            'serviceCallId' => null,
        ];
    }

    private function expectActionResponse(ActionResponse $actionResponse): void
    {
        $this->pauseService
            ->method('__invoke')
            ->willReturn($actionResponse);
    }

    private function expectServiceThrows(Exception $exception)
    {
        $this->pauseService
            ->method('__invoke')
            ->willThrowException($exception);
    }
}
