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
use DOMDocument;
use oat\oatbox\service\ConfigurableService;
use oat\oatbox\service\ServiceNotFoundException;
use oat\tao\model\service\ApplicationService;
use qtism\data\AssessmentSection;
use qtism\data\AssessmentSectionCollection;
use qtism\data\AssessmentTest;
use qtism\data\ItemSessionControl;
use qtism\data\NavigationMode;
use qtism\data\storage\xml\XmlDocument;
use qtism\data\storage\xml\XmlStorageException;
use qtism\data\SubmissionMode;
use qtism\data\TestPart;
use qtism\data\TestPartCollection;
use RuntimeException;

class AssessmentTestXmlFactory extends ConfigurableService implements AssessmentTestXmlFactoryInterface
{
    public const DEFAULT_QTI_VERSION = '2.1';
    public const DEFAULT_ASSESSMENT_SECTION_ID = 'assessmentSection-1';
    public const DEFAULT_ASSESSMENT_SECTION_TITLE = 'Section 1';

    public const DEFAULT_TEST_PART_ID = 'testPart-1';
    public const DEFAULT_TEST_PART_NAVIGATION_MODE = NavigationMode::LINEAR;
    public const DEFAULT_TEST_PART_SUBMISSION_MODE = SubmissionMode::INDIVIDUAL;
    public const DEFAULT_TEST_MAX_ATTEMPTS = 0;

    public const OPTION_QTI_VERSION = 'qti_version';

    public const OPTION_ASSESSMENT_SECTION_ID = 'assessment_section_id';
    public const OPTION_ASSESSMENT_SECTION_TITLE = 'assessment_section_title';

    public const OPTION_TEST_PART_ID = 'test_part_id';
    public const OPTION_TEST_PART_NAVIGATION_MODE = 'navigation_mode';
    public const OPTION_TEST_PART_SUBMISSION_MODE = 'submission_mode';
    public const OPTION_TEST_MAX_ATTEMPTS = 'max_attempts';

    public const OPTION_EXTENSIONS = 'extensions';

    /**
     * @param string $testIdentifier
     * @param string $testTitle
     *
     * @return DOMDocument
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
     * @throws common_exception_Error
     * @throws common_ext_ExtensionException
     */
    protected function createTest(string $testIdentifier, string $testTitle): AssessmentTest
    {
        $itemSectionControl = new ItemSessionControl();
        $itemSectionControl->setMaxAttempts($this->getMaxAttempts());

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
            $this->getNavigationMode(),
            $this->getSubmissionMode()
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

    private function getAssessmentSectionId(): string
    {
        return $this->getOption(self::OPTION_ASSESSMENT_SECTION_ID) ?? self::DEFAULT_ASSESSMENT_SECTION_ID;
    }

    private function getAssessmentSectionTitle(): string
    {
        return $this->getOption(self::OPTION_ASSESSMENT_SECTION_TITLE) ?? self::DEFAULT_ASSESSMENT_SECTION_TITLE;
    }

    private function getQtiVersion(): string
    {
        return $this->getOption(self::OPTION_QTI_VERSION) ?? self::DEFAULT_QTI_VERSION;
    }

    private function getTestPartId(): string
    {
        return $this->getOption(self::OPTION_TEST_PART_ID) ?? self::DEFAULT_TEST_PART_ID;
    }

    private function getNavigationMode(): int
    {
        return $this->getOption(self::OPTION_TEST_PART_NAVIGATION_MODE) ?? self::DEFAULT_TEST_PART_NAVIGATION_MODE;
    }

    private function getSubmissionMode(): int
    {
        return $this->getOption(self::OPTION_TEST_PART_SUBMISSION_MODE) ?? self::DEFAULT_TEST_PART_SUBMISSION_MODE;
    }

    private function getMaxAttempts(): int
    {
        return $this->getOption(self::OPTION_TEST_MAX_ATTEMPTS) ?? self::DEFAULT_TEST_MAX_ATTEMPTS;
    }

    private function getApplicationService(): ApplicationService
    {
        /** @noinspection PhpIncompatibleReturnTypeInspection */
        return $this->getServiceLocator()->get(ApplicationService::SERVICE_ID);
    }
}
