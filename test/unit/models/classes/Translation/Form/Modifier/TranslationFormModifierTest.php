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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes\Translation\Form\Modifier;

use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\tao\model\TaoOntology;
use oat\taoQtiTest\models\Translation\Form\Modifier\TranslationFormModifier;
use oat\taoQtiTest\models\Translation\Service\QtiIdentifierRetriever;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use tao_helpers_form_Form;
use tao_helpers_Uri;

class TranslationFormModifierTest extends TestCase
{
    /** @var tao_helpers_form_Form|MockObject */
    private tao_helpers_form_Form $form;

    private string $encodedProperty;

    /** @var Ontology|MockObject */
    private Ontology $ontology;

    /** @var QtiIdentifierRetriever|MockObject */
    private QtiIdentifierRetriever $qtiIdentifierRetriever;

    /** @var FeatureFlagCheckerInterface|MockObject */
    private FeatureFlagCheckerInterface $featureFlagChecker;

    private TranslationFormModifier $sut;

    protected function setUp(): void
    {
        $this->form = $this->createMock(tao_helpers_form_Form::class);
        $this->encodedProperty = tao_helpers_Uri::encode(TaoOntology::PROPERTY_UNIQUE_IDENTIFIER);

        $this->ontology = $this->createMock(Ontology::class);
        $this->qtiIdentifierRetriever = $this->createMock(QtiIdentifierRetriever::class);
        $this->featureFlagChecker = $this->createMock(FeatureFlagCheckerInterface::class);

        $this->sut = new TranslationFormModifier(
            $this->ontology,
            $this->qtiIdentifierRetriever,
            $this->featureFlagChecker
        );
    }

    public function testModifyTranslationDisabled(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_TRANSLATION_ENABLED')
            ->willReturn(false);

        $this->form
            ->expects($this->never())
            ->method($this->anything());

        $this->ontology
            ->expects($this->never())
            ->method($this->anything());

        $this->qtiIdentifierRetriever
            ->expects($this->never())
            ->method($this->anything());

        $this->form
            ->expects($this->never())
            ->method('setValue');

        $this->sut->modify($this->form);
    }

    public function testModifyTranslationEnabledButValueSet(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_TRANSLATION_ENABLED')
            ->willReturn(true);

        $this->form
            ->expects($this->once())
            ->method('getValue')
            ->with($this->encodedProperty)
            ->willReturn('value');

        $this->ontology
            ->expects($this->never())
            ->method($this->anything());

        $this->qtiIdentifierRetriever
            ->expects($this->never())
            ->method($this->anything());

        $this->form
            ->expects($this->never())
            ->method('setValue');

        $this->sut->modify($this->form);
    }

    public function testModifyTranslationEnabledButNoIdentifier(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_TRANSLATION_ENABLED')
            ->willReturn(true);

        $this->form
            ->expects($this->exactly(2))
            ->method('getValue')
            ->withConsecutive(
                [$this->encodedProperty],
                ['uri']
            )
            ->willReturnOnConsecutiveCalls(null, 'instanceUri');

        $instance = $this->createMock(core_kernel_classes_Resource::class);

        $this->ontology
            ->expects($this->once())
            ->method('getResource')
            ->with('instanceUri')
            ->willReturn($instance);

        $this->qtiIdentifierRetriever
            ->expects($this->once())
            ->method('retrieve')
            ->with($instance)
            ->willReturn(null);

        $this->form
            ->expects($this->never())
            ->method('setValue');

        $this->sut->modify($this->form);
    }

    public function testModify(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_TRANSLATION_ENABLED')
            ->willReturn(true);

        $this->form
            ->expects($this->exactly(2))
            ->method('getValue')
            ->withConsecutive(
                [$this->encodedProperty],
                ['uri']
            )
            ->willReturnOnConsecutiveCalls(null, 'instanceUri');

        $instance = $this->createMock(core_kernel_classes_Resource::class);

        $this->ontology
            ->expects($this->once())
            ->method('getResource')
            ->with('instanceUri')
            ->willReturn($instance);

        $this->qtiIdentifierRetriever
            ->expects($this->once())
            ->method('retrieve')
            ->with($instance)
            ->willReturn('qtiIdentifier');

        $this->form
            ->expects($this->once())
            ->method('setValue')
            ->with($this->encodedProperty, 'qtiIdentifier');

        $this->sut->modify($this->form);
    }
}
