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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes\Validation;

use oat\taoQtiTest\models\Validation\BranchRuleValidation;
use oat\taoQtiTest\models\Validation\BranchRuleException;
use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\MockObject\MockObject;
use qtism\data\storage\xml\XmlDocument;
use qtism\data\AssessmentTest;

class BranchRuleValidationTest extends TestCase
{
    private BranchRuleValidation $validator;

    protected function setUp(): void
    {
        $this->validator = new BranchRuleValidation();
    }

    public function testValidateWithValidBranchRules(): void
    {
        // Create mock XmlDocument
        $xmlDoc = $this->createMock(XmlDocument::class);
        $assessmentTest = $this->createMock(AssessmentTest::class);

        // Create mock branch rule with valid target
        $branchRule = $this->createMockBranchRule('section1');
        $targetElement = $this->createMockElement('section1');

        $xmlDoc->method('getDocumentComponent')->willReturn($assessmentTest);
        $assessmentTest->method('getComponentsByClassName')
            ->with('branchRule')
            ->willReturn([$branchRule]);
        $assessmentTest->method('getComponentByIdentifier')
            ->with('section1')
            ->willReturn($targetElement);

        // Should not throw exception for valid branch rules
        $this->validator->validate($xmlDoc);
        $this->assertTrue(true); // Test passes if no exception is thrown
    }

    public function testValidateWithMissingTarget(): void
    {
        $this->expectException(BranchRuleException::class);
        $this->expectExceptionMessage('BranchRule element is missing target attribute');

        // Create mock XmlDocument
        $xmlDoc = $this->createMock(XmlDocument::class);
        $assessmentTest = $this->createMock(AssessmentTest::class);

        // Create mock branch rule with empty target
        $branchRule = $this->createMockBranchRule('');

        $xmlDoc->method('getDocumentComponent')->willReturn($assessmentTest);
        $assessmentTest->method('getComponentsByClassName')
            ->with('branchRule')
            ->willReturn([$branchRule]);

        $this->validator->validate($xmlDoc);
    }

    public function testValidateWithNonExistentTarget(): void
    {
        $this->expectException(BranchRuleException::class);
        $this->expectExceptionMessage('BranchRule target "nonexistent" does not exist in the document');

        // Create mock XmlDocument
        $xmlDoc = $this->createMock(XmlDocument::class);
        $assessmentTest = $this->createMock(AssessmentTest::class);

        // Create mock branch rule with non-existent target
        $branchRule = $this->createMockBranchRule('nonexistent');

        $xmlDoc->method('getDocumentComponent')->willReturn($assessmentTest);
        $assessmentTest->method('getComponentsByClassName')
            ->with('branchRule')
            ->willReturn([$branchRule]);
        $assessmentTest->method('getComponentByIdentifier')
            ->with('nonexistent')
            ->willReturn(null);

        $this->validator->validate($xmlDoc);
    }

    public function testValidateWithMultipleBranchRuleErrors(): void
    {
        $this->expectException(BranchRuleException::class);
        $this->expectExceptionMessage('BranchRule element is missing target attribute; BranchRule target "invalid" does not exist in the document');

        // Create mock XmlDocument
        $xmlDoc = $this->createMock(XmlDocument::class);
        $assessmentTest = $this->createMock(AssessmentTest::class);

        // Create mock branch rules with different errors
        $branchRule1 = $this->createMockBranchRule(''); // Missing target
        $branchRule2 = $this->createMockBranchRule('invalid'); // Non-existent target

        $xmlDoc->method('getDocumentComponent')->willReturn($assessmentTest);
        $assessmentTest->method('getComponentsByClassName')
            ->with('branchRule')
            ->willReturn([$branchRule1, $branchRule2]);
        $assessmentTest->method('getComponentByIdentifier')
            ->with('invalid')
            ->willReturn(null);

        $this->validator->validate($xmlDoc);
    }

    public function testValidateWithNoBranchRules(): void
    {
        // Create mock XmlDocument
        $xmlDoc = $this->createMock(XmlDocument::class);
        $assessmentTest = $this->createMock(AssessmentTest::class);

        $xmlDoc->method('getDocumentComponent')->willReturn($assessmentTest);
        $assessmentTest->method('getComponentsByClassName')
            ->with('branchRule')
            ->willReturn([]);

        // Should not throw exception when no branch rules exist
        $this->validator->validate($xmlDoc);
        $this->assertTrue(true); // Test passes if no exception is thrown
    }

    public function testValidateWithMultipleValidBranchRules(): void
    {
        // Create mock XmlDocument
        $xmlDoc = $this->createMock(XmlDocument::class);
        $assessmentTest = $this->createMock(AssessmentTest::class);

        // Create multiple valid branch rules
        $branchRule1 = $this->createMockBranchRule('section1');
        $branchRule2 = $this->createMockBranchRule('section2');

        $targetElement1 = $this->createMockElement('section1');
        $targetElement2 = $this->createMockElement('section2');

        $xmlDoc->method('getDocumentComponent')->willReturn($assessmentTest);
        $assessmentTest->method('getComponentsByClassName')
            ->with('branchRule')
            ->willReturn([$branchRule1, $branchRule2]);

        // Configure the mock to return different elements based on the identifier
        $assessmentTest->method('getComponentByIdentifier')
            ->willReturnCallback(function($identifier) use ($targetElement1, $targetElement2) {
                switch ($identifier) {
                    case 'section1':
                        return $targetElement1;
                    case 'section2':
                        return $targetElement2;
                    default:
                        return null;
                }
            });

        // Should not throw exception for multiple valid branch rules
        $this->validator->validate($xmlDoc);
        $this->assertTrue(true); // Test passes if no exception is thrown
    }

    /**
     * Create a mock branch rule with the given target
     */
    private function createMockBranchRule(string $target): MockObject
    {
        $branchRule = $this->createMock(\qtism\data\rules\BranchRule::class);
        $branchRule->method('getTarget')->willReturn($target);
        return $branchRule;
    }

    /**
     * Create a mock element with the given identifier
     */
    private function createMockElement(string $identifier): MockObject
    {
        $element = $this->createMock(\qtism\data\QtiComponent::class);
        // Don't try to configure getIdentifier as it may not exist
        // The mock element just needs to exist (not be null)
        return $element;
    }
}
