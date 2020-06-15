<?php

namespace oat\taoQtiTest\test\unit\models\classes\xml;

use core_kernel_classes_Resource;
use oat\generis\test\TestCase;
use oat\taoQtiTest\models\xmlEditor\XmlEditor;
use PHPUnit\Framework\MockObject\MockObject;
use qtism\data\storage\xml\XmlDocument;
use \taoQtiTest_models_classes_QtiTestService;
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

    public function setUp(): void
    {
        $doc = new XmlDocument();
        $doc->load(__DIR__ . '/../../../../samples/xml/test.xml');
        $this->xmlDoc = $doc;
        $this->testResourceMock = $this->createMock(core_kernel_classes_Resource::class);
        $qtiTestServiceMock = $this->createMock(taoQtiTest_models_classes_QtiTestService::class);
        $qtiTestServiceMock->method('getDoc')->with($this->testResourceMock)->willReturn($this->xmlDoc);
        $this->serviceLocatorMock = $this->getServiceLocatorMock([
            taoQtiTest_models_classes_QtiTestService::class => $qtiTestServiceMock
        ]);
    }

    public function testGetTestXml()
    {
        $service = new XmlEditor();
        $service->setServiceLocator($this->serviceLocatorMock);
        $xmlString = $service->getTestXml($this->testResourceMock);
        $this->assertEquals($this->xmlDoc->saveToString(), $xmlString);
    }

    public function testIsLocked()
    {
        $service = new XmlEditor([XmlEditor::OPTION_XML_EDITOR_LOCK => false]);
        $this->assertEquals(false, $service->isLocked());
    }
}
