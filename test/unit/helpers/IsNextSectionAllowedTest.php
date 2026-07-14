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
 * Foundation, 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\helpers;

use oat\generis\test\TestCase;
use oat\taoQtiTest\models\runner\config\RunnerConfig;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\session\TestSession;
use qtism\common\collections\StringCollection;
use qtism\data\AssessmentItemRef;
use taoQtiTest_helpers_TestRunnerUtils as TestRunnerUtils;

class IsNextSectionAllowedTest extends TestCase
{
    public function testReturnsFalseWhenFeatureDisabled(): void
    {
        $session = $this->createSessionMock([]);
        $context = $this->createContextMock(false, ['x-tao-option-nextSection']);

        $this->assertFalse(TestRunnerUtils::isNextSectionAllowed($session, $context));
        $this->assertSame('feature-disabled', TestRunnerUtils::getNextSectionDenialReason($session, $context));
    }

    public function testReturnsFalseWhenFeatureEnabledButNoCategory(): void
    {
        $session = $this->createSessionMock([]);
        $context = $this->createContextMock(true, []);

        $this->assertFalse(TestRunnerUtils::isNextSectionAllowed($session, $context));
        $this->assertSame('missing-category', TestRunnerUtils::getNextSectionDenialReason($session, $context));
    }

    public function testReturnsTrueWhenFeatureEnabledWithNextSectionCategory(): void
    {
        $session = $this->createSessionMock(['x-tao-option-nextSection']);
        $context = $this->createContextMock(true, ['x-tao-option-nextSection']);

        $this->assertTrue(TestRunnerUtils::isNextSectionAllowed($session, $context));
        $this->assertNull(TestRunnerUtils::getNextSectionDenialReason($session, $context));
    }

    public function testReturnsTrueWhenFeatureEnabledWithNextSectionWarningCategory(): void
    {
        $session = $this->createSessionMock(['x-tao-option-nextSectionWarning']);
        $context = $this->createContextMock(true, ['x-tao-option-nextSectionWarning']);

        $this->assertTrue(TestRunnerUtils::isNextSectionAllowed($session, $context));
        $this->assertNull(TestRunnerUtils::getNextSectionDenialReason($session, $context));
    }

    private function createSessionMock(array $categories): TestSession
    {
        $itemRef = $this->createMock(AssessmentItemRef::class);
        $itemRef
            ->method('getCategories')
            ->willReturn(new StringCollection($categories));

        $session = $this->createMock(TestSession::class);
        $session
            ->method('getCurrentAssessmentItemRef')
            ->willReturn($itemRef);

        return $session;
    }

    private function createContextMock(bool $nextSectionEnabled, array $categories): QtiRunnerServiceContext
    {
        $testConfig = $this->createMock(RunnerConfig::class);
        $testConfig
            ->method('getConfigValue')
            ->with('nextSection')
            ->willReturn($nextSectionEnabled);

        $itemRef = $this->createMock(AssessmentItemRef::class);
        $itemRef
            ->method('getCategories')
            ->willReturn(new StringCollection($categories));

        $context = $this->createMock(QtiRunnerServiceContext::class);
        $context
            ->method('getTestConfig')
            ->willReturn($testConfig);
        $context
            ->method('getCurrentAssessmentItemRef')
            ->willReturn($itemRef);

        return $context;
    }
}
