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

namespace oat\taoQtiTest\models;

use common_exception_Error;
use common_ext_ExtensionException;
use DOMDocument;
use oat\oatbox\service\ConfigurableService;
use oat\tao\model\service\ApplicationService;
use qtism\data\AssessmentSection;
use qtism\data\AssessmentSectionCollection;
use qtism\data\AssessmentTest;
use qtism\data\ItemSessionControl;
use qtism\data\storage\xml\XmlDocument;
use qtism\data\storage\xml\XmlStorageException;
use qtism\data\TestPart;
use qtism\data\TestPartCollection;

class NewAssessmentTestXmlBuilder extends ConfigurableService
{
    /**
     * @param string $testIdentifier
     * @param string $testTitle
     *
     * @return DOMDocument
     * @throws XmlStorageException
     * @throws common_exception_Error
     * @throws common_ext_ExtensionException
     */
    public function build(string $testIdentifier, string $testTitle): string
    {
        $itemSectionControl = new ItemSessionControl();
        $itemSectionControl->setMaxAttempts(0);

        $assessmentSection = new AssessmentSection('assessmentSection-1', 'Section 1', true);
        $assessmentSections = new AssessmentSectionCollection([$assessmentSection]);

        $testPart = new TestPart('testPart-1', $assessmentSections, 'linear', 'individual');
        $testPart->setItemSessionControl($itemSectionControl);
        $testPartCollection = new TestPartCollection([$testPart]);

        $test = new AssessmentTest($testIdentifier, $testTitle, $testPartCollection);
        $test->setToolName('tao');
        $test->setToolVersion($this->getApplicationService()->getPlatformVersion());

        $xmlDoc = new XmlDocument('2.1', $test);

        return $xmlDoc->saveToString();
    }

    private function getApplicationService(): ApplicationService
    {
        /** @noinspection PhpIncompatibleReturnTypeInspection */
        return $this->getServiceLocator()->get(ApplicationService::SERVICE_ID);
    }
}
