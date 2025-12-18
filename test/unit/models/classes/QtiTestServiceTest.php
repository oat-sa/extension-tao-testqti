<?php

namespace oat\taoQtiTest\test\unit\models\classes;

use common_exception_InconsistentData;
use core_kernel_classes_Property as KernelProperty;
use core_kernel_classes_Resource as KernelResource;
use DOMDocument;
use oat\generis\model\data\Ontology;
use oat\generis\model\fileReference\FileReferenceSerializer;
use PHPUnit\Framework\MockObject\MockObject;
use oat\generis\test\ServiceManagerMockTrait;
use oat\generis\test\TestCase;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\filesystem\File;
use oat\oatbox\service\ServiceManager;
use oat\tao\model\IdentifierGenerator\Generator\IdentifierGeneratorInterface;
use oat\tao\model\IdentifierGenerator\Generator\IdentifierGeneratorProxy;
use oat\tao\model\service\ApplicationService;
use oat\taoQtiTest\models\test\AssessmentTestXmlFactory;
use oat\taoQtiTest\models\test\Template\DefaultConfigurationRegistry;
use taoQtiTest_models_classes_QtiTestService as QtiTestService;
use Zend\ServiceManager\ServiceLocatorInterface;

class QtiTestServiceTest extends TestCase
{
    use ServiceManagerMockTrait;

    // phpcs:disable Generic.Files.LineLength
    private const TEST_TEMPLATE = <<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<assessmentTest xmlns="http://www.imsglobal.org/xsd/imsqti_v2p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" identifier="{testId}" title="{testTitle}" toolName="tao" toolVersion="{taoVersion}" xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p2 http://www.imsglobal.org/xsd/qti/qtiv2p2/imsqti_v2p2.xsd">
  <testPart identifier="testPart-1" navigationMode="linear" submissionMode="individual">
    <itemSessionControl maxAttempts="0" showFeedback="false" allowReview="true" showSolution="false" allowComment="false" allowSkipping="true" validateResponses="false"/>
    <assessmentSection identifier="assessmentSection-1" required="true" fixed="false" title="Section 1" visible="true" keepTogether="true"/>
  </testPart>
</assessmentTest>
XML;
    // phpcs:enable Generic.Files.LineLength

    private const PLATFORM_VERSION = 'v1-test';

    private Directory|MockObject $defaultDirectoryMock;
    private FileReferenceSerializer|MockObject $fileReferenceSerializerMock;
    private KernelProperty|MockObject $testContentPropertyMock;
    private AssessmentTestXmlFactory $xmlFactory;
    private DefaultConfigurationRegistry $xmlTemplateOptionsRegistry;
    private QtiTestService $sut;
    private IdentifierGeneratorInterface|MockObject $identifierGeneratorProxy;

    /**
     * @before
     */
    public function init(): void
    {
        $this->defaultDirectoryMock = $this->createMock(Directory::class);
        $this->fileReferenceSerializerMock = $this->createMock(FileReferenceSerializer::class);
        $this->testContentPropertyMock = $this->createMock(KernelProperty::class);
        $this->xmlTemplateOptionsRegistry = $this->createPartialMock(DefaultConfigurationRegistry::class, ['getMap']);
        $this->xmlFactory = new AssessmentTestXmlFactory(
            [
                AssessmentTestXmlFactory::OPTION_CONFIGURATION_REGISTRY => $this->xmlTemplateOptionsRegistry
            ]
        );

        $this->xmlTemplateOptionsRegistry
            ->method('getMap')
            ->willReturn(
                [
                    DefaultConfigurationRegistry::ID => [
                        'partIdPrefix'       => 'testPart',
                        'sectionIdPrefix'    => 'assessmentSection',
                        'sectionTitlePrefix' => 'Section 1',
                        'categories'         => [],
                        'navigationMode'     => 0,
                        'submissionMode'     => 0,
                        'maxAttempts'        => 0,
                    ],
                ]
            );

        $this->identifierGeneratorProxy = $this->createMock(IdentifierGeneratorInterface::class);

        $serviceLocator = $this->createServiceManagerMock();

        $this->xmlFactory->setServiceLocator($serviceLocator);
        $this->xmlTemplateOptionsRegistry->setServiceLocator($serviceLocator);

        $this->sut = $this->createPartialMock(
            QtiTestService::class,
            ['getDefaultDir', 'getQtiTestTemplateFileAsString', 'getServiceManager']
        );

        $this->sut
            ->method('getDefaultDir')
            ->willReturn($this->defaultDirectoryMock);

        $this->sut
            ->method('getServiceManager')
            ->willReturn($serviceLocator);

        $this->sut->setServiceLocator($serviceLocator);
        $this->sut->setModel(
            $this->createModelMock()
        );
    }

    public function testCreateContent(): void
    {
        $test = $this->createTestMock('https://example.com', '0label-with_sømę-exötïč_charæctêrß');

        $this->identifierGeneratorProxy
            ->expects($this->once())
            ->method('generate')
            ->with([
                IdentifierGeneratorInterface::OPTION_RESOURCE => $test
            ])
            ->willReturn('t-0label-with-sm-ext-charctr');

        /** @noinspection PhpUnhandledExceptionInspection */
        static::assertSame(
            $this->createDirectoryMock(
                $test,
                $this->createNewFileMock($test)
            ),
            $this->sut->createContent($test)
        );
    }

    public function testExceptionOnExistingContent(): void
    {
        $test = $this->createTestMock('https://example.com', 'label');

        $this->expectExceptionObject(
            new common_exception_InconsistentData("Data directory for test {$test->getUri()} already exists.")
        );

        $this->createDirectoryMock(
            $test,
            null,
            true
        );

        /** @noinspection PhpUnhandledExceptionInspection */
        $this->sut->createContent($test);
    }

    public function testExistingContentFile(): void
    {
        $test = $this->createTestMock('https://example.com', 'label');

        /** @noinspection PhpUnhandledExceptionInspection */
        static::assertSame(
            $this->createDirectoryMock(
                $test,
                $this->createExistingFileMock($test),
                true,
                false
            ),
            $this->sut->createContent($test, false, false)
        );
    }

    private function createTemplateDocument(): DOMDocument
    {
        $document = new DOMDocument('1.0', 'UTF-8');

        $document->loadXML(self::TEST_TEMPLATE);

        return $document;
    }

    private function createTestDom(KernelResource $test): DOMDocument
    {
        $document = $this->createTemplateDocument();

        $this
            ->updateDocumentTitle($document, $test)
            ->documentElement->setAttribute(
                'identifier',
                't-0label-with-sm-ext-charctr'
            );
        $document->documentElement->setAttribute('toolVersion', self::PLATFORM_VERSION);

        return $document;
    }

    private function updateDocumentTitle(DOMDocument $document, KernelResource $test): DOMDocument
    {
        $document->documentElement->setAttribute('title', $test->getLabel());

        return $document;
    }

    private function createNewFileMock(KernelResource $test): File
    {
        $fileMock = $this->createMock(File::class);

        $fileMock
            ->expects(static::once())
            ->method('write')
            ->with(
                $this->createTestDom($test)->saveXML()
            )
            ->willReturn(true);

        return $fileMock;
    }

    private function createExistingFileMock(KernelResource $test): File
    {
        $documentTemplate = $this->createTemplateDocument();

        $fileMock = $this->createMock(File::class);

        $fileMock
            ->expects(static::once())
            ->method('exists')
            ->willReturn(true);

        $fileMock
            ->expects(static::once())
            ->method('read')
            ->willReturn($documentTemplate->saveXML());

        $fileMock
            ->expects(static::once())
            ->method('update')
            ->with(
                $this->updateDocumentTitle($documentTemplate, $test)->saveXML()
            )
            ->willReturn(true);

        return $fileMock;
    }

    private function createTestMock(string $uri, string $label): KernelResource
    {
        $testMock = $this->createMock(KernelResource::class);

        $testMock
            ->method('getUri')
            ->willReturn($uri);

        $testMock
            ->method('getLabel')
            ->willReturn($label);

        return $testMock;
    }

    /**
     * @param KernelResource|MockObject $test
     * @param File|MockObject|null      $file
     * @param bool                      $exists
     * @param bool                      $preventOverride
     *
     * @return Directory
     */
    private function createDirectoryMock(
        KernelResource $test,
        File $file = null,
        bool $exists = false,
        $preventOverride = true
    ): Directory {
        $mainInvocationRule = !$exists || !$preventOverride ? static::once() : static::never();

        $directoryMock = $this->createMock(Directory::class);

        $directoryMock
            ->expects(static::once())
            ->method('exists')
            ->willReturn($exists);

        $directoryMock
            ->expects(clone $mainInvocationRule)
            ->method('getFile')
            ->with('tao-qtitest-testdefinition.xml')
            ->willReturn($file);

        $this->defaultDirectoryMock
            ->expects(static::once())
            ->method('getDirectory')
            ->with(md5($test->getUri()))
            ->willReturn($directoryMock);

        $serializedDirectoryData = 'serialized_directory_data';

        $this->fileReferenceSerializerMock
            ->expects(clone $mainInvocationRule)
            ->method('serialize')
            ->with($directoryMock)
            ->willReturn($serializedDirectoryData);

        $test
            ->expects(clone $mainInvocationRule)
            ->method('editPropertyValues')
            ->with($this->testContentPropertyMock, $serializedDirectoryData);

        return $directoryMock;
    }

    private function createServiceManagerMock(): ServiceManager
    {
        return $this->getServiceManagerMock([
            ApplicationService::SERVICE_ID => $this->createApplicationServiceMock(),
            FileReferenceSerializer::SERVICE_ID => $this->fileReferenceSerializerMock,
            AssessmentTestXmlFactory::class => $this->xmlFactory,
            DefaultConfigurationRegistry::class => $this->xmlTemplateOptionsRegistry,
            IdentifierGeneratorProxy::class => $this->identifierGeneratorProxy,
        ]);
    }

    private function createModelMock(): Ontology
    {
        $modelMock = $this->createMock(Ontology::class);

        $modelMock
            ->method('getProperty')
            ->willReturnMap(
                [
                    ['http://www.tao.lu/Ontologies/TAOTest.rdf#TestContent', $this->testContentPropertyMock],
                ]
            );

        return $modelMock;
    }

    private function createApplicationServiceMock(): ApplicationService
    {
        $applicationServiceMock = $this->createMock(ApplicationService::class);

        $applicationServiceMock
            ->method('getPlatformVersion')
            ->willReturn(self::PLATFORM_VERSION);

        return $applicationServiceMock;
    }
}
