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

namespace oat\taoQtiTest\models\test;

use qtism\data\AssessmentItemRef;
use qtism\data\AssessmentSection;
use qtism\data\AssessmentTest;
use qtism\data\ItemSessionControl;
use qtism\data\TestPart;

class ItemSessionControlEnricher
{
    private const DEFAULT_MAX_ATTEMPTS = 0;

    public function enrichImportedTest(AssessmentTest $test): void
    {
        foreach ($test->getTestParts()->getArrayCopy() as $testPart) {
            $this->enrichTestPart($testPart);
        }
    }

    private function enrichTestPart(TestPart $testPart): void
    {
        $this->ensureItemSessionControl($testPart);

        foreach ($testPart->getAssessmentSections()->getArrayCopy() as $assessmentSection) {
            $this->enrichAssessmentSection($assessmentSection);
        }
    }

    private function enrichAssessmentSection(AssessmentSection $assessmentSection): void
    {
        $this->ensureItemSessionControl($assessmentSection);

        $sectionParts = $assessmentSection->getSectionParts();
        if ($sectionParts === null) {
            return;
        }

        foreach ($sectionParts->getArrayCopy() as $sectionPart) {
            if ($sectionPart instanceof AssessmentSection) {
                $this->enrichAssessmentSection($sectionPart);
            } elseif ($sectionPart instanceof AssessmentItemRef) {
                $this->ensureItemSessionControl($sectionPart);
            }
        }
    }

    private function ensureItemSessionControl(TestPart|AssessmentSection|AssessmentItemRef $node): void
    {
        if ($node->hasItemSessionControl()) {
            return;
        }

        $node->setItemSessionControl($this->createDefaultItemSessionControl());
    }

    private function createDefaultItemSessionControl(): ItemSessionControl
    {
        $control = new ItemSessionControl();
        $control->setMaxAttempts(self::DEFAULT_MAX_ATTEMPTS);
        $control->setShowFeedback(false);
        $control->setAllowReview(true);
        $control->setShowSolution(false);
        $control->setAllowComment(false);
        $control->setAllowSkipping(true);
        $control->setValidateResponses(false);

        return $control;
    }
}
