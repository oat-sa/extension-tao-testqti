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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiTest\test\unit\models\classes\runner;

use oat\generis\test\TestCase;
use oat\oatbox\filesystem\File;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\TestDefinitionSerializerService;
use tao_models_classes_service_StorageDirectory;
use oat\generis\test\MockObject;

class TestDefinitionSerializerServiceTest extends TestCase
{
    const TEST_DEFINITION = '<?xml version="1.0" encoding="UTF-8"?>
        <assessmentTest xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" identifier="Test-1" title="Test 1" toolName="tao" xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd">
            <testPart identifier="testPart-1" navigationMode="linear" submissionMode="individual">
                <itemSessionControl allowSkipping="true" validateResponses="false"/>
                <assessmentSection identifier="assessmentSection-1" title="Section 1">
                    <itemSessionControl showSolution="false" />
                    <assessmentItemRef identifier="item-1" href="http://sample/first.rdf#i156576550888883">
                        <itemSessionControl maxAttempts="0"/>
                    </assessmentItemRef>
                </assessmentSection>
            </testPart>
        </assessmentTest>';

    /**
     * @var array
     */
    private $parsedDefinition = [
        '@attributes' => [
            'identifier' => 'Test-1',
            'title' => 'Test 1',
            'toolName' => 'tao'
        ],
        'testPart' => [
            [
                '@attributes' => [
                    'identifier' => 'testPart-1',
                    'navigationMode' => 'linear',
                    'submissionMode' => 'individual'
                ],
                'itemSessionControl' => [
                    '@attributes' => [
                        'validateResponses' => 'false',
                        'allowSkipping' => 'true'
                    ]
                ],
                'assessmentSection' => [
                    [
                        '@attributes' => [
                            'identifier' => 'assessmentSection-1',
                            'title' => 'Section 1'
                        ],
                        'itemSessionControl' => [
                            '@attributes' => ['showSolution' => 'false']
                        ],
                        'assessmentItemRef' => [
                            [
                                '@attributes' => [
                                    'identifier' => 'item-1',
                                    'href' => 'http://sample/first.rdf#i156576550888883'
                                ],
                                'itemSessionControl' => [
                                    '@attributes' => ['maxAttempts' => 0]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ]
    ];

    /** @var TestDefinitionSerializerService */
    private $testDefinitionSerializerService;

    /** @var \tao_models_classes_service_FileStorage|MockObject */
    private $fileStorageServiceMock;

    /** @var tao_models_classes_service_StorageDirectory|MockObject */
    private $directoryMock;

    /** @var File|MockObject */
    private $indexFileMock;

    /** @var File|MockObject */
    private $fileMock;

    /** @var QtiRunnerServiceContext|MockObject */
    private $qtiRunnerServiceContext;

    public function setUp(): void
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

        $this->directoryMock = $this
            ->getMockBuilder(tao_models_classes_service_StorageDirectory::class)
            ->disableOriginalConstructor()
            ->getMock();

        $this->indexFileMock = $this
            ->getMockBuilder(File::class)
            ->disableOriginalConstructor()
            ->getMock();

        $this->fileMock = $this
            ->getMockBuilder(File::class)
            ->disableOriginalConstructor()
            ->getMock();

        $this->indexFileMock->method('read')
            ->willReturn('tests/i153233799330111609/tao-qtitest-testdefinition.xml');

        $this->fileMock->method('read')
            ->willReturn(self::TEST_DEFINITION);

        $this->fileStorageServiceMock
            ->method('getDirectoryById')
            ->willReturn($this->directoryMock);

        $serviceLocatorMock = $this->getServiceLocatorMock([
            \tao_models_classes_service_FileStorage::SERVICE_ID => $this->fileStorageServiceMock,
        ]);

        $this->testDefinitionSerializerService->setServiceLocator($serviceLocatorMock);
    }

    public function testGetSerializedTestDefinition()
    {
        $this->fileStorageServiceMock
            ->expects($this->once())
            ->method('getDirectoryById')
            ->with('test');

        $this->directoryMock
            ->expects($this->exactly(2))
            ->method('getFile')
            ->withConsecutive(
                ['.index/qti-test.txt'],
                ['tests/i153233799330111609/tao-qtitest-testdefinition.xml']
            )
            ->will($this->onConsecutiveCalls($this->indexFileMock, $this->fileMock));

        $this->assertEquals(
            $this->parsedDefinition,
            $this->testDefinitionSerializerService->getSerializedTestDefinition($this->qtiRunnerServiceContext)
        );
    }
}
