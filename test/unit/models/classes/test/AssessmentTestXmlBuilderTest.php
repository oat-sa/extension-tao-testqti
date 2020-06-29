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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA;
 *
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\test;


use common_exception_Error;
use common_ext_ExtensionException;
use oat\generis\test\TestCase;
use oat\oatbox\service\ConfigurableService;
use oat\tao\model\service\ApplicationService;
use qtism\data\AssessmentTest;
use qtism\data\NavigationMode;
use qtism\data\storage\xml\XmlStorageException;
use qtism\data\SubmissionMode;
use RuntimeException;
use SimpleXMLElement;
use Zend\ServiceManager\ServiceLocatorInterface;

class AssessmentTestXmlBuilderTest extends TestCase
{
    /** @var ServiceLocatorInterface */
    private $serviceLocator;

    protected function setUp(): void
    {
        $appService = $this->createMock(ApplicationService::class);
        $appService->method('getPlatformVersion')->willReturn('test_version');

        $extension = new class extends ConfigurableService implements TestExtensionInterface {
            public function extend(AssessmentTest $test): void
            {
                $test->setTitle('changedTitle');
            }
        };

        $badExtension = new class extends ConfigurableService {
        };

        $this->serviceLocator = $this->getServiceLocatorMock(
            [
                ApplicationService::SERVICE_ID => $appService,
                'extension' => $extension,
                'badExtension' => $badExtension,
            ]
        );
    }

    /**
     * @dataProvider provideData
     *
     * @param array $options
     * @param array $expected
     *
     * @throws XmlStorageException
     * @throws common_exception_Error
     * @throws common_ext_ExtensionException
     */
    public function testBuild(array $options, array $expected): void
    {
        $builder = $this->createBuilder($options);

        $xml = $builder->build('testId', 'testLabel');

        $this->assertIsString($xml);

        $simpleXml = new SimpleXMLElement($xml);
        $this->assertSame('testId', (string)$simpleXml->attributes()['identifier']);
        $this->assertSame('testLabel', (string)$simpleXml->attributes()['title']);

        /** @noinspection PhpUndefinedFieldInspection */
        $testPartAttributes = $simpleXml->testPart->attributes();

        $this->assertSame(
            $expected[AssessmentTestXmlBuilder::OPTION_TEST_PART_ID],
            (string)$testPartAttributes['identifier']
        );
        $this->assertSame(
            $expected[AssessmentTestXmlBuilder::OPTION_TEST_PART_NAVIGATION_MODE],
            (string)$testPartAttributes['navigationMode']
        );
        $this->assertSame(
            $expected[AssessmentTestXmlBuilder::OPTION_TEST_PART_SUBMISSION_MODE],
            (string)$testPartAttributes['submissionMode']
        );

        /** @noinspection PhpUndefinedFieldInspection */
        $itemSessionControl = $simpleXml->testPart->itemSessionControl->attributes();

        $this->assertSame(
            $expected[AssessmentTestXmlBuilder::OPTION_TEST_MAX_ATTEMPTS],
            (int)$itemSessionControl['maxAttempts']
        );
    }

    /**
     * @throws XmlStorageException
     * @throws common_exception_Error
     * @throws common_ext_ExtensionException
     */
    public function testExtension(): void
    {
        $builder = $this->createBuilder(
            [
                AssessmentTestXmlBuilder::OPTION_POSTPROCESSING => ['extension']
            ]
        );

        $xml = $builder->build('identifier', 'title');

        $simpleXml = new SimpleXMLElement($xml);
        $this->assertSame('identifier', (string)$simpleXml->attributes()['identifier']);
        $this->assertSame('changedTitle', (string)$simpleXml->attributes()['title']);
    }

    /**
     * @throws XmlStorageException
     * @throws common_exception_Error
     * @throws common_ext_ExtensionException
     */
    public function testBadExtension(): void
    {
        $this->expectException(RuntimeException::class);

        $builder = $this->createBuilder(
            [
                AssessmentTestXmlBuilder::OPTION_POSTPROCESSING => ['badExtension']
            ]
        );

        $builder->build('identifier', 'title');
    }

    public function provideData(): array
    {
        return [
            [
                [],
                [
                    AssessmentTestXmlBuilder::OPTION_TEST_PART_ID              => AssessmentTestXmlBuilder::DEFAULT_TEST_PART_ID,
                    AssessmentTestXmlBuilder::OPTION_TEST_PART_NAVIGATION_MODE => 'linear',
                    AssessmentTestXmlBuilder::OPTION_TEST_PART_SUBMISSION_MODE => 'individual',
                    AssessmentTestXmlBuilder::OPTION_ASSESSMENT_SECTION_TITLE  => AssessmentTestXmlBuilder::DEFAULT_ASSESSMENT_SECTION_TITLE,
                    AssessmentTestXmlBuilder::OPTION_ASSESSMENT_SECTION_ID     => AssessmentTestXmlBuilder::DEFAULT_ASSESSMENT_SECTION_ID,
                    AssessmentTestXmlBuilder::OPTION_TEST_MAX_ATTEMPTS         => AssessmentTestXmlBuilder::DEFAULT_TEST_MAX_ATTEMPTS,
                ]
            ],
            [
                [
                    AssessmentTestXmlBuilder::OPTION_TEST_PART_ID              => 'customTestPartId',
                    AssessmentTestXmlBuilder::OPTION_TEST_PART_NAVIGATION_MODE => NavigationMode::NONLINEAR,
                    AssessmentTestXmlBuilder::OPTION_TEST_PART_SUBMISSION_MODE => SubmissionMode::SIMULTANEOUS,
                    AssessmentTestXmlBuilder::OPTION_ASSESSMENT_SECTION_TITLE  => 'customSectionTitle',
                    AssessmentTestXmlBuilder::OPTION_ASSESSMENT_SECTION_ID     => 'customSectionId',
                    AssessmentTestXmlBuilder::OPTION_TEST_MAX_ATTEMPTS         => 10,
                ],
                [
                    AssessmentTestXmlBuilder::OPTION_TEST_PART_ID              => 'customTestPartId',
                    AssessmentTestXmlBuilder::OPTION_TEST_PART_NAVIGATION_MODE => 'nonlinear',
                    AssessmentTestXmlBuilder::OPTION_TEST_PART_SUBMISSION_MODE => 'simultaneous',
                    AssessmentTestXmlBuilder::OPTION_ASSESSMENT_SECTION_TITLE  => 'customSectionTitle',
                    AssessmentTestXmlBuilder::OPTION_ASSESSMENT_SECTION_ID     => 'customSectionId',
                    AssessmentTestXmlBuilder::OPTION_TEST_MAX_ATTEMPTS         => 10,
                ]
            ]
        ];
    }

    private function createBuilder(array $params = []): AssessmentTestXmlBuilder
    {
        $builder = new AssessmentTestXmlBuilder($params);

        $builder->setServiceLocator($this->serviceLocator);

        return $builder;
    }
}
