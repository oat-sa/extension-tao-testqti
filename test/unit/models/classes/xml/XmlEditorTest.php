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
 * Copyright (c) 2020-2023 (original work) Open Assessment Technologies SA.
 */

namespace oat\taoQtiTest\test\unit\models\classes\xml;

use common_ext_Extension;
use common_ext_ExtensionsManager;
use core_kernel_classes_Resource;
use oat\tao\model\featureFlag\FeatureFlagChecker;
use oat\taoQtiTest\models\xmlEditor\XmlEditor;
use PHPUnit\Framework\MockObject\MockObject;
use qtism\data\storage\xml\XmlDocument;
use qtism\data\storage\xml\XmlStorageException;
use SplObjectStorage;
use oat\generis\test\TestCase;
use taoQtiTest_models_classes_QtiTestConverterException;
use taoQtiTest_models_classes_QtiTestService;
use taoQtiTest_models_classes_QtiTestServiceException;
use Zend\ServiceManager\ServiceLocatorInterface;

class XmlEditorTest extends TestCase
{
    /** @var XmlDocument */
    private $xmlDoc;

    /** @var core_kernel_classes_Resource|MockObject */
    private $testResourceMock;

    /** @var ServiceLocatorInterface */
    private $serviceLocatorMock;

    /** @var taoQtiTest_models_classes_QtiTestService|MockObject */
    private $qtiTestServiceMock;

    /** @var FeatureFlagChecker|MockObject */
    private $featureFlagCheckerMock;

    public function setUp(): void
    {
        $doc = new XmlDocument();
        $doc->load(__DIR__ . '/../../../../samples/xml/test.xml');
        $this->xmlDoc = $doc;

        $this->testResourceMock = $this->createMock(core_kernel_classes_Resource::class);
        $this->qtiTestServiceMock = $this->createMock(taoQtiTest_models_classes_QtiTestService::class);
        $this->qtiTestServiceMock
            ->method('getDoc')
            ->with($this->testResourceMock)
            ->willReturn($this->xmlDoc);
        $this->featureFlagCheckerMock = $this->createMock(FeatureFlagChecker::class);

        $this->serviceLocatorMock = $this->getServiceLocatorMock([
            taoQtiTest_models_classes_QtiTestService::class => $this->qtiTestServiceMock,
            FeatureFlagChecker::class => $this->featureFlagCheckerMock,
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

        // phpcs:disable Generic.Files.LineLength
        $xmlMock = <<<'EOL'
<?xml version="1.0" encoding="UTF-8"?>
<assessmentTest xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        identifier="UnitTestQtiItem" title="UnitTestQtiItem" toolName="tao" toolVersion="3.4.0-sprint130"
xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd">
    <testPart identifier="testPart-1" navigationMode="linear" submissionMode="individual">
        <itemSessionControl maxAttempts="0" showFeedback="false" allowReview="true" showSolution="false"
            allowComment="false" allowSkipping="true" validateResponses="false"/>
        <assessmentSection identifier="assessmentSection-1" required="true" fixed="false" title="Section 1"
            visible="true" keepTogether="true"/>
    </testPart>
</assessmentTest>
EOL;
        // phpcs:enable Generic.Files.LineLength

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
                            ],
                            "observers" => new SplObjectStorage(),
                        ]
                    ],
                    "testFeedbacks" => [
                    ],
                    "observers" => new SplObjectStorage(),
                ]
            ],
            "testFeedbacks" => [
            ],
            "observers" => new SplObjectStorage(),
        ];

        $this->qtiTestServiceMock
            ->expects($this->once())
            ->method('saveJsonTest')
            ->with($this->testResourceMock, json_encode($expectArrayTest));

        $service->setServiceLocator($this->serviceLocatorMock);
        $service->saveStringTest($this->testResourceMock, $xmlMock);
    }

    /**
     * @dataProvider getFeatureIsLockedData
     */
    public function testIsLocked($configFlag, $newFeatureFlag, $legacyFeatureFlag, $expectedLock)
    {
        $service = new XmlEditor([XmlEditor::OPTION_XML_EDITOR_LOCK => $configFlag]);
        $service->setServiceLocator($this->serviceLocatorMock);

        $this->featureFlagCheckerMock
            ->method('isEnabled')
            ->withConsecutive(['FEATURE_FLAG_XML_EDITOR_ENABLED'], ['XML_EDITOR_ENABLED'])
            ->willReturnOnConsecutiveCalls($newFeatureFlag, $legacyFeatureFlag);

        $this->assertEquals($expectedLock, $service->isLocked());
    }

    public function getFeatureIsLockedData(): array
    {
        return [
            'unlocked by config' => [
                false,
                false,
                false,
                false
            ],
            'unlocked by new feature flag' => [
                true,
                true,
                false,
                false
            ],
            'unlocked by legacy feature flag' => [
                true,
                false,
                true,
                false
            ],
            'locked' => [
                true,
                false,
                false,
                true
            ],
        ];
    }
}
