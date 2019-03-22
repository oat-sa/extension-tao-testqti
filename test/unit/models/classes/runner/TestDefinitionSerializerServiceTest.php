<?php

namespace oat\taoQtiTest\models\runner {
    function simplexml_load_file($filePath) {
        return [
            'testPart' => [
                '@attributes' => [ 'identifier' => 'P01' ],
                'assessmentSection' => [
                    '@attributes' => [ 'identifier' => 'S01' ],
                    'assessmentItemRef' => [
                        0 => [
                            '@attributes' => [ 'identifier' => 'I01' ],
                        ],
                        1 => [
                            '@attributes' => [ 'identifier' => 'I02' ],
                        ],
                    ],
                ],
            ],
        ];
    }
}

namespace oat\taoQtiTest\test\unit\models\classes\runner {

    use oat\generis\model\kernel\Factory\ResourceFactory;
    use oat\generis\test\TestCase;
    use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
    use oat\taoQtiTest\models\runner\TestDefinitionSerializerService;
    use tao_models_classes_service_StorageDirectory;

    class TestDefinitionSerializerServiceTest extends TestCase
    {
        /** @var TestDefinitionSerializerService */
        private $testDefinitionSerializerService;

        /** @var \tao_models_classes_service_FileStorage|\PHPUnit_Framework_MockObject_MockObject */
        private $fileStorageServiceMock;

        /** @var QtiRunnerServiceContext|\PHPUnit_Framework_MockObject_MockObject */
        private $qtiRunnerServiceContext;

        /** @var ResourceFactory|\PHPUnit_Framework_MockObject_MockObject */
        private $resourceFactoryMock;

        /**
         * @throws \common_exception_Error
         */
        public function setUp()
        {
            $this->testDefinitionSerializerService = new TestDefinitionSerializerService();

            $this->fileStorageServiceMock = $this
                ->getMockBuilder(\tao_models_classes_service_FileStorage::class)
                ->getMock();

            $this->qtiRunnerServiceContext = $this
                ->getMockBuilder(QtiRunnerServiceContext::class)
                ->disableOriginalConstructor()
                ->getMock();

            $this->qtiRunnerServiceContext
                ->method('getTestCompilationUri')
                ->willReturn('test|test');

            $this->qtiRunnerServiceContext
                ->method('getTestDefinitionUri')
                ->willReturn('test');

            $directoryMock = $this
                ->getMockBuilder(tao_models_classes_service_StorageDirectory::class)
                ->disableOriginalConstructor()
                ->getMock();

            $this->fileStorageServiceMock
                ->method('getDirectoryById')
                ->willReturn($directoryMock);

            $this->resourceFactoryMock = $this->getResourceFactoryMock();

            $serviceLocatorMock = $this->getServiceLocatorMock([
                \tao_models_classes_service_FileStorage::SERVICE_ID => $this->fileStorageServiceMock,
                ResourceFactory::SERVICE_ID => $this->resourceFactoryMock,
            ]);

            $this->testDefinitionSerializerService->setServiceLocator($serviceLocatorMock);
        }

        /**
         * @throws \common_exception_Error
         * @throws \common_exception_InconsistentData
         * @throws \core_kernel_persistence_Exception
         * @throws \oat\tao\model\websource\WebsourceNotFound
         */
        public function testGetSerializedTestDefinition()
        {
            $this->assertEquals([
                'testPart' => [
                    0 => [
                        '@attributes' => [
                            'identifier' => 'P01',
                        ],
                        'assessmentSection' => [
                            0 => [
                                '@attributes' => [
                                    'identifier' => 'S01',
                                ],
                                'assessmentItemRef' => [
                                    0 => [
                                        '@attributes' => [
                                            'identifier' => 'I01',
                                        ],
                                    ],
                                    1 => [
                                        '@attributes' => [
                                            'identifier' => 'I02',
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ], $this->testDefinitionSerializerService->getSerializedTestDefinition($this->qtiRunnerServiceContext));
        }

        /**
         * @return ResourceFactory|\PHPUnit_Framework_MockObject_MockObject
         */
        private function getResourceFactoryMock()
        {
            $resourceFactoryMock = $this
                ->getMockBuilder(ResourceFactory::class)
                ->getMock();

            $resourceFactoryMock
                ->method('create')
                ->will($this->returnCallback(function ($fqcn) {
                    return $this
                        ->getMockBuilder($fqcn)
                        ->disableOriginalConstructor()
                        ->getMock();
                }));

            return $resourceFactoryMock;
        }
    }
}
