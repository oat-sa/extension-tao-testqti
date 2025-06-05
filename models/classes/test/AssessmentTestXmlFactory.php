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
 * Copyright (c) 2020-2025 (original work) Open Assessment Technologies SA;
 *
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\test;

use common_exception_Error;
use common_ext_ExtensionException;
use DOMDocument;
use oat\oatbox\service\ConfigurableService;
use oat\oatbox\service\exception\InvalidService;
use oat\oatbox\service\exception\InvalidServiceManagerException;
use oat\oatbox\service\ServiceNotFoundException;
use oat\tao\model\service\ApplicationService;
use oat\taoQtiTest\models\test\Template\DefaultConfigurationRegistry;
use qtism\data\AssessmentSection;
use qtism\data\AssessmentSectionCollection;
use qtism\data\AssessmentTest;
use qtism\data\ItemSessionControl;
use qtism\data\storage\xml\XmlDocument;
use qtism\data\storage\xml\XmlStorageException;
use qtism\data\TestPart;
use qtism\data\TestPartCollection;
use RuntimeException;

class AssessmentTestXmlFactory extends ConfigurableService implements AssessmentTestXmlFactoryInterface
{
    public const OPTION_QTI_VERSION            = 'qti_version';
    public const OPTION_EXTENSIONS             = 'extensions';
    public const OPTION_CONFIGURATION_REGISTRY = 'configurationRegistry';

    private const DEFAULT_QTI_VERSION = '2.2';

    /**
     * @param string $testIdentifier
     * @param string $testTitle
     *
     * @return DOMDocument
     * @throws InvalidService
     * @throws InvalidServiceManagerException
     * @throws XmlStorageException
     * @throws common_exception_Error
     * @throws common_ext_ExtensionException
     */
    public function create(string $testIdentifier, string $testTitle): string
    {
        $test = $this->createTest($testIdentifier, $testTitle);

        $this->extendTest($test);

        $xmlDoc = new XmlDocument($this->getQtiVersion(), $test);

        return $xmlDoc->saveToString();
    }

    /**
     * @param string $testIdentifier
     * @param string $testTitle
     *
     * @return AssessmentTest
     * @throws InvalidService
     * @throws InvalidServiceManagerException
     * @throws common_exception_Error
     * @throws common_ext_ExtensionException
     */
    protected function createTest(string $testIdentifier, string $testTitle): AssessmentTest
    {
        $itemSectionControl = new ItemSessionControl();
        $itemSectionControl->setMaxAttempts($this->getConfigurationRegistry()->getMaxAttempts());

        $assessmentSection = new AssessmentSection(
            $this->getAssessmentSectionId(),
            $this->getAssessmentSectionTitle(),
            true
        );
        $assessmentSection->setRequired(true);

        $assessmentSections = new AssessmentSectionCollection([$assessmentSection]);

        $testPart = new TestPart(
            $this->getTestPartId(),
            $assessmentSections,
            $this->getConfigurationRegistry()->getNavigationMode(),
            $this->getConfigurationRegistry()->getSubmissionMode()
        );

        $testPart->setItemSessionControl($itemSectionControl);
        $testPartCollection = new TestPartCollection([$testPart]);

        $test = new AssessmentTest($testIdentifier, $testTitle, $testPartCollection);
        $test->setToolName('tao');
        $test->setToolVersion($this->getApplicationService()->getPlatformVersion());

        return $test;
    }

    private function extendTest(AssessmentTest $test): void
    {
        $testExtensionsClassNames = $this->getOption(self::OPTION_EXTENSIONS);

        if (!$testExtensionsClassNames || !is_array($testExtensionsClassNames)) {
            return;
        }

        foreach ($testExtensionsClassNames as $testExtensionsClassName) {
            try {
                $testExtension = $this->getServiceLocator()->get($testExtensionsClassName);
            } catch (ServiceNotFoundException $e) {
                $testExtension = new $testExtensionsClassName();
            }

            if (!$testExtension instanceof TestExtensionInterface) {
                throw new RuntimeException('A test extension should inherit ' . TestExtensionInterface::class);
            }

            $testExtension->extend($test);
        }
    }

    /**
     * @return string
     *
     * @throws InvalidService
     * @throws InvalidServiceManagerException
     */
    private function getAssessmentSectionId(): string
    {
        return "{$this->getConfigurationRegistry()->getSectionIdPrefix()}-1";
    }

    /**
     * @return string
     *
     * @throws InvalidService
     * @throws InvalidServiceManagerException
     */
    private function getAssessmentSectionTitle(): string
    {
        return $this->getConfigurationRegistry()->getSectionTitlePrefix();
    }

    private function getQtiVersion(): string
    {
        return $this->getOption(self::OPTION_QTI_VERSION) ?? self::DEFAULT_QTI_VERSION;
    }

    /**
     * @return string
     *
     * @throws InvalidService
     * @throws InvalidServiceManagerException
     */
    private function getTestPartId(): string
    {
        return "{$this->getConfigurationRegistry()->getPartIdPrefix()}-1";
    }

    private function getApplicationService(): ApplicationService
    {
        /** @noinspection PhpIncompatibleReturnTypeInspection */
        return $this->getServiceLocator()->get(ApplicationService::SERVICE_ID);
    }

    /**
     * @return DefaultConfigurationRegistry
     *
     * @throws InvalidService
     * @throws InvalidServiceManagerException
     */
    private function getConfigurationRegistry(): DefaultConfigurationRegistry
    {
        return $this->getSubService(self::OPTION_CONFIGURATION_REGISTRY, DefaultConfigurationRegistry::class);
    }
}
