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
 * Copyright (c) 2023 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\test;

use common_exception_Error;
use common_ext_ExtensionException;
//use oat\generis\test\TestCase;
use oat\oatbox\service\ConfigurableService;
use oat\oatbox\service\exception\InvalidService;
use oat\oatbox\service\exception\InvalidServiceManagerException;
use oat\oatbox\service\ServiceManager;
use oat\tao\model\service\ApplicationService;
use oat\taoQtiTest\models\test\Template\DefaultConfigurationRegistry;
use qtism\data\AssessmentTest;
use qtism\data\NavigationMode;
use qtism\data\storage\xml\XmlStorageException;
use qtism\data\SubmissionMode;
use PHPUnit\Framework\TestCase;
use RuntimeException;
use SimpleXMLElement;
use Zend\ServiceManager\ServiceLocatorInterface;

class TestDeleterTest extends TestCase
{
    /** @var ServiceLocatorInterface */
    private $serviceLocator;

    /** @var DefaultConfigurationRegistry */
    private $xmlTemplateOptionRegistry;

    /** @var array */
    private $xmlTemplateRegistryOptions = [
        'partIdPrefix'       => 'testPart',
        'sectionIdPrefix'    => 'assessmentSection',
        'sectionTitlePrefix' => 'Section',
        'categories'         => [],
        'navigationMode'     => 0,
        'submissionMode'     => 0,
        'maxAttempts'        => 0,
    ];

    protected function setUp(): void
    {
        $this->xmlTemplateOptionRegistry = $this->createPartialMock(DefaultConfigurationRegistry::class, ['getMap']);
        $this->xmlTemplateOptionRegistry
            ->method('getMap')
            ->willReturnCallback(
                function (): array {
                    return [DefaultConfigurationRegistry::ID => $this->xmlTemplateRegistryOptions];
                }
            );

        $appService = $this->createMock(ApplicationService::class);
        $appService->method('getPlatformVersion')->willReturn('test_version');

        $extension = new class () extends ConfigurableService implements TestExtensionInterface {
            public function extend(AssessmentTest $test): void
            {
                $test->setTitle('changedTitle');
            }
        };

        $badExtension = new class () extends ConfigurableService {
        };

        $this->serviceLocator = $this->createMock(ServiceManager::class);

        $this->serviceLocator
            ->method('get')
            ->willReturnMap(
                [
                    [ApplicationService::SERVICE_ID, $appService],
                    ['extension', $extension],
                    ['badExtension', $badExtension],
                    [DefaultConfigurationRegistry::class, $this->xmlTemplateOptionRegistry],
                ]
            );

        $this->xmlTemplateOptionRegistry->setServiceLocator($this->serviceLocator);
    }

    /**
     * @dataProvider provideData
     *
     * @param array  $options
     * @param string $expectedTestPartId
     * @param string $expectedNavigationMode
     * @param string $expectedSubmissionMode
     * @param string $expectedSectionTitle
     * @param string $expectedSectionId
     * @param int    $expectedMaxAttempts
     *
     * @throws InvalidService
     * @throws InvalidServiceManagerException
     * @throws XmlStorageException
     * @throws common_exception_Error
     * @throws common_ext_ExtensionException
     */
    public function testBuild(
        array $options,
        string $expectedTestPartId,
        string $expectedNavigationMode,
        string $expectedSubmissionMode,
        string $expectedSectionTitle,
        string $expectedSectionId,
        int $expectedMaxAttempts
    ): void {
        $this->xmlTemplateRegistryOptions = $options;

        $builder = $this->createBuilder();

        $xml = $builder->create('testId', 'testLabel');

        static::assertIsString($xml);

        $simpleXml = new SimpleXMLElement($xml);
        static::assertSame('testId', (string)$simpleXml->attributes()['identifier']);
        static::assertSame('testLabel', (string)$simpleXml->attributes()['title']);

        /** @noinspection PhpUndefinedFieldInspection */
        $testPartAttributes = $simpleXml->testPart->attributes();

        static::assertSame(
            $expectedTestPartId,
            (string)$testPartAttributes['identifier']
        );
        static::assertSame(
            $expectedNavigationMode,
            (string)$testPartAttributes['navigationMode']
        );
        static::assertSame(
            $expectedSubmissionMode,
            (string)$testPartAttributes['submissionMode']
        );

        $assessmentSectionAttributes = $simpleXml->testPart->assessmentSection->attributes();
        static::assertSame(
            $expectedSectionId,
            (string)$assessmentSectionAttributes['identifier']
        );
        static::assertSame(
            $expectedSectionTitle,
            (string)$assessmentSectionAttributes['title']
        );

        /** @noinspection PhpUndefinedFieldInspection */
        $itemSessionControl = $simpleXml->testPart->itemSessionControl->attributes();

        static::assertSame(
            $expectedMaxAttempts,
            (int)$itemSessionControl['maxAttempts']
        );
    }
}
