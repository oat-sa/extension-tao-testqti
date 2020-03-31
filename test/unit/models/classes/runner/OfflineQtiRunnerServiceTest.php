<?php

namespace oat\taoQtiTest\test\unit\models\classes\runner;

use oat\generis\test\TestCase;
use oat\taoQtiTest\models\runner\OfflineQtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\RunnerServiceContext;
use oat\generis\test\MockObject;

class OfflineQtiRunnerServiceTest extends TestCase
{
    /** @var OfflineQtiRunnerService */
    private $offlineQtiRunnerService;

    /** @var QtiRunnerService|MockObject */
    private $qtiRunnerServiceMock;

    /** @var RunnerServiceContext|MockObject */
    private $serviceContextMock;

    /**
     * @throws \common_exception_Error
     */
    public function setUp(): void
    {
        $this->offlineQtiRunnerService = new OfflineQtiRunnerService();

        $this->qtiRunnerServiceMock = $this->getQtiRunnerServiceMock();

        $this->serviceContextMock = $this
            ->getMockBuilder(RunnerServiceContext::class)
            ->getMock();


        $serviceLocatorMock = $this->getServiceLocatorMock([
            QtiRunnerService::SERVICE_ID => $this->qtiRunnerServiceMock,
        ]);

        $this->offlineQtiRunnerService->setServiceLocator($serviceLocatorMock);
    }

    public function testGetItems()
    {
        $this->assertEquals([
            'I01' => [
                'baseUrl' => 'itemPublicUrl',
                'itemData' => [
                    'data' => [
                        'responses' => [
                            'responseIdentifier' => [
                                'test' => 'test',
                            ],
                        ],
                    ],
                ],
                'itemState' => 'itemState',
                'itemIdentifier' => 'I01',
                'portableElements' => 'itemPortableElements',
            ],
        ], $this->offlineQtiRunnerService->getItems($this->serviceContextMock));
    }

    private function getQtiRunnerServiceMock()
    {
        $qtiRunnerServiceMock = $this
            ->getMockBuilder(QtiRunnerService::class)
            ->getMock();

        $qtiRunnerServiceMock
            ->method('getItemVariableElementsData')
            ->willReturn([
                'responseIdentifier' => [
                    'test' => 'test',
                ],
            ]);

        $qtiRunnerServiceMock
            ->method('getItemData')
            ->willReturn([
                'data' => [
                    'responses' => [
                        'responseIdentifier' => [],
                    ],
                ],
            ]);

        $qtiRunnerServiceMock
            ->method('getTestMap')
            ->willReturn([
                'parts' => [
                    'P01' => [
                        'sections' => [
                            'S01' => [
                                'items' => [
                                    'I01' => [],
                                ],
                            ],
                        ],
                    ],
                ],
            ]);

        $qtiRunnerServiceMock
            ->method('getItemPublicUrl')->willReturn('itemPublicUrl');

        $qtiRunnerServiceMock
            ->method('getItemState')->willReturn('itemState');

        $qtiRunnerServiceMock
            ->method('getItemPortableElements')->willReturn('itemPortableElements');

        return $qtiRunnerServiceMock;
    }
}
