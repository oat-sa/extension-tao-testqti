<?php

namespace oat\taoQtiTest\test\unit\models\classes\xml;

use core_kernel_classes_Resource;
use oat\generis\test\TestCase;
use oat\taoQtiTest\models\xmlEditor\XmlEditor;
use PHPUnit\Framework\MockObject\MockObject;
use qtism\data\storage\xml\XmlDocument;
use qtism\data\storage\xml\XmlStorageException;
use taoQtiTest_models_classes_QtiTestConverterException;
use \taoQtiTest_models_classes_QtiTestService;
use taoQtiTest_models_classes_QtiTestServiceException;
use Zend\ServiceManager\ServiceLocatorInterface;

class XmlEditorTest extends TestCase
{
    /**
     * @var XmlDocument
     */
    private $xmlDoc;
    /**
     * @var core_kernel_classes_Resource|MockObject
     */
    private $testResourceMock;
    /**
     * @var ServiceLocatorInterface
     */
    private $serviceLocatorMock;
    /**
     * @var MockObject|taoQtiTest_models_classes_QtiTestService
     */
    private $qtiTestServiceMock;

    public function setUp(): void
    {
        $doc = new XmlDocument();
        $doc->load(__DIR__ . '/../../../../samples/xml/test.xml');
        $this->xmlDoc = $doc;
        $this->testResourceMock = $this->createMock(core_kernel_classes_Resource::class);
        $this->qtiTestServiceMock = $this->createMock(taoQtiTest_models_classes_QtiTestService::class);
        $this->qtiTestServiceMock->method('getDoc')->with($this->testResourceMock)->willReturn($this->xmlDoc);
        $this->serviceLocatorMock = $this->getServiceLocatorMock([
            taoQtiTest_models_classes_QtiTestService::class => $this->qtiTestServiceMock
        ]);
    }

    public function testGetTestXml()
    {
        $service = new XmlEditor();
        $service->setServiceLocator($this->serviceLocatorMock);
        $xmlString = $service->getTestXml($this->testResourceMock);
        $this->assertEquals($this->xmlDoc->saveToString(), $xmlString);
    }

    /**
     * @throws XmlStorageException
     * @throws taoQtiTest_models_classes_QtiTestConverterException
     * @throws taoQtiTest_models_classes_QtiTestServiceException
     */
    public function testSaveStringTest()
    {
        $service = new XmlEditor();

        $xmlMock = <<<'EOL'
<?xml version="1.0" encoding="UTF-8"?>
<assessmentTest xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" identifier="UnitTestQtiItem" title="UnitTestQtiItem" toolName="tao" toolVersion="3.4.0-sprint130" xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd">
    <testPart identifier="testPart-1" navigationMode="linear" submissionMode="individual">
        <itemSessionControl maxAttempts="0" showFeedback="false" allowReview="true" showSolution="false" allowComment="false" allowSkipping="true" validateResponses="false"/>
        <assessmentSection identifier="assessmentSection-1" required="true" fixed="false" title="Section 1" visible="true" keepTogether="true"/>
    </testPart>
</assessmentTest>
EOL;

        $expectArrayTest = [
            "qti-type" => "assessmentTest",
            "identifier" => "UnitTestQtiItem",
            "title" => "UnitTestQtiItem",
            "toolName" => "tao",
            "toolVersion" => "3.4.0-sprint130",
            "outcomeDeclarations" => [
            ],
            "testParts" => [
                [
                    "qti-type" => "testPart",
                    "identifier" => "testPart-1",
                    "navigationMode" => 0,
                    "submissionMode" => 0,
                    "preConditions" => [
                    ],
                    "branchRules" => [
                    ],
                    "itemSessionControl" => [
                        "qti-type" => "itemSessionControl",
                        "maxAttempts" => 0,
                        "showFeedback" => false,
                        "allowReview" => true,
                        "showSolution" => false,
                        "allowComment" => false,
                        "validateResponses" => false,
                        "allowSkipping" => true
                    ],
                    "assessmentSections" => [
                        [
                            "qti-type" => "assessmentSection",
                            "title" => "Section 1",
                            "visible" => true,
                            "keepTogether" => true,
                            "rubricBlocks" => [
                            ],
                            "sectionParts" => [
                            ],
                            "identifier" => "assessmentSection-1",
                            "required" => true,
                            "fixed" => false,
                            "preConditions" => [
                            ],
                            "branchRules" => [
                            ]
                        ]
                    ],
                    "testFeedbacks" => [
                    ]
                ]
            ],
            "testFeedbacks" => [
            ]
        ];

        $this->qtiTestServiceMock
            ->expects($this->once())
            ->method('saveJsonTest')
            ->with($this->testResourceMock, json_encode($expectArrayTest));

        $service->setServiceLocator($this->serviceLocatorMock);
        $service->saveStringTest($this->testResourceMock, $xmlMock);
    }

    public function testIsLocked()
    {
        $service = new XmlEditor([XmlEditor::OPTION_XML_EDITOR_LOCK => false]);
        $this->assertEquals(false, $service->isLocked());
    }
}
