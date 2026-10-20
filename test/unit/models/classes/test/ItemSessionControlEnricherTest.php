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
 * Foundation, Inc., 31 Milk Street, # 960789, Boston, MA 02196, USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes\test;

use oat\generis\test\TestCase;
use oat\taoQtiTest\models\test\ItemSessionControlEnricher;
use qtism\data\AssessmentItemRef;
use qtism\data\AssessmentSection;
use qtism\data\AssessmentTest;
use qtism\data\ItemSessionControl;
use qtism\data\storage\xml\XmlDocument;
use qtism\data\TestPart;

class ItemSessionControlEnricherTest extends TestCase
{
    private const GOLDEN_TEST_PATH = __DIR__
        . '/../../../../../../vendor/qtism/qtism/test/samples/ims/tests/golden_required_items_and_sections/golden_required_items_and_sections.xml';

    private ItemSessionControlEnricher $sut;

    protected function setUp(): void
    {
        $this->sut = new ItemSessionControlEnricher();
    }

    public function testEnrichImportedTestAddsControlsToGoldenSample(): void
    {
        $document = new XmlDocument();
        $document->load(self::GOLDEN_TEST_PATH, true);

        $test = $document->getDocumentComponent();
        self::assertInstanceOf(AssessmentTest::class, $test);

        $this->sut->enrichImportedTest($test);

        $this->assertAllSessionControlsPresent($test);
        $this->assertDefaultControl($test->getTestParts()->getArrayCopy()[0]->getItemSessionControl());
    }

    public function testEnrichDoesNotOverwriteExistingControl(): void
    {
        $document = new XmlDocument();
        $document->load(self::GOLDEN_TEST_PATH, true);

        $test = $document->getDocumentComponent();
        self::assertInstanceOf(AssessmentTest::class, $test);

        /** @var TestPart $testPart */
        $testPart = $test->getTestParts()->getArrayCopy()[0];
        $existing = new ItemSessionControl();
        $existing->setMaxAttempts(3);
        $existing->setShowFeedback(true);
        $testPart->setItemSessionControl($existing);

        $this->sut->enrichImportedTest($test);

        self::assertSame(3, $testPart->getItemSessionControl()->getMaxAttempts());
        self::assertTrue($testPart->getItemSessionControl()->mustShowFeedback());

        $this->assertAllSessionControlsPresent($test);
    }

    private function assertAllSessionControlsPresent(AssessmentTest $test): void
    {
        foreach ($test->getTestParts()->getArrayCopy() as $testPart) {
            self::assertTrue($testPart->hasItemSessionControl());

            foreach ($testPart->getAssessmentSections()->getArrayCopy() as $section) {
                $this->assertSectionTreeHasControls($section);
            }
        }
    }

    private function assertSectionTreeHasControls(AssessmentSection $section): void
    {
        self::assertTrue($section->hasItemSessionControl());

        $sectionParts = $section->getSectionParts();
        if ($sectionParts === null) {
            return;
        }

        foreach ($sectionParts->getArrayCopy() as $sectionPart) {
            if ($sectionPart instanceof AssessmentSection) {
                $this->assertSectionTreeHasControls($sectionPart);
            } elseif ($sectionPart instanceof AssessmentItemRef) {
                self::assertTrue($sectionPart->hasItemSessionControl());
                $this->assertDefaultControl($sectionPart->getItemSessionControl());
            }
        }
    }

    private function assertDefaultControl(ItemSessionControl $control): void
    {
        self::assertSame(0, $control->getMaxAttempts());
        self::assertFalse($control->mustShowFeedback());
        self::assertTrue($control->doesAllowReview());
        self::assertFalse($control->mustShowSolution());
        self::assertFalse($control->doesAllowComment());
        self::assertTrue($control->doesAllowSkipping());
        self::assertFalse($control->mustValidateResponses());
    }
}
