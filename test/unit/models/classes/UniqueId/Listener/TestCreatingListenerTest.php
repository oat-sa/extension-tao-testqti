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
 * Copyright (c) 2024-2025 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes\UniqueId\Listener;

use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\tao\model\IdentifierGenerator\Generator\IdentifierGeneratorInterface;
use oat\tao\model\TaoOntology;
use oat\tao\model\Translation\Service\AbstractQtiIdentifierSetter;
use oat\taoQtiTest\models\Qti\Identifier\Service\QtiIdentifierSetter;
use oat\taoQtiTest\models\UniqueId\Listener\TestCreationListener;
use oat\taoTests\models\event\TestCreatedEvent;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class TestCreatingListenerTest extends TestCase
{
    /** @var core_kernel_classes_Resource|MockObject */
    private core_kernel_classes_Resource $resource;

    /** @var FeatureFlagCheckerInterface|MockObject */
    private FeatureFlagCheckerInterface $featureFlagChecker;

    /** @var Ontology|MockObject */
    private Ontology $ontology;

    /** @var IdentifierGeneratorInterface|MockObject */
    private IdentifierGeneratorInterface $identifierGenerator;

    /** @var QtiIdentifierSetter|MockObject */
    private QtiIdentifierSetter $qtiIdentifierSetter;

    private TestCreationListener $sut;

    protected function setUp(): void
    {
        $this->resource = $this->createMock(core_kernel_classes_Resource::class);

        $this->featureFlagChecker = $this->createMock(FeatureFlagCheckerInterface::class);
        $this->ontology = $this->createMock(Ontology::class);
        $this->identifierGenerator = $this->createMock(IdentifierGeneratorInterface::class);
        $this->qtiIdentifierSetter = $this->createMock(QtiIdentifierSetter::class);

        $this->sut = new TestCreationListener(
            $this->featureFlagChecker,
            $this->ontology,
            $this->identifierGenerator,
            $this->qtiIdentifierSetter
        );
    }

    public function testFeatureDisabled(): void
    {
        $this->ontology
            ->expects($this->once())
            ->method('getResource')
            ->with('testUri')
            ->willReturn($this->resource);

        $this->resource
            ->expects($this->once())
            ->method('getRootId')
            ->willReturn(TaoOntology::CLASS_URI_TEST);

        $this->identifierGenerator
            ->expects($this->once())
            ->method('generate')
            ->with([IdentifierGeneratorInterface::OPTION_RESOURCE => $this->resource])
            ->willReturn('QWERTYUI');

        $this->qtiIdentifierSetter
            ->expects($this->once())
            ->method('set')
            ->with([
                AbstractQtiIdentifierSetter::OPTION_RESOURCE => $this->resource,
                AbstractQtiIdentifierSetter::OPTION_IDENTIFIER => 'QWERTYUI',
            ]);

        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_FLAG_UNIQUE_NUMERIC_QTI_IDENTIFIER')
            ->willReturn(false);

        $this->resource
            ->expects($this->never())
            ->method('editPropertyValues');

        $this->sut->populateUniqueId(new TestCreatedEvent('testUri'));
    }

    public function testIsNotTest(): void
    {
        $this->ontology
            ->expects($this->once())
            ->method('getResource')
            ->with('testUri')
            ->willReturn($this->resource);

        $this->resource
            ->expects($this->once())
            ->method('getRootId')
            ->willReturn('notTestRootId');

        $this->identifierGenerator
            ->expects($this->never())
            ->method('generate');

        $this->qtiIdentifierSetter
            ->expects($this->never())
            ->method('set');

        $this->featureFlagChecker
            ->expects($this->never())
            ->method('isEnabled');

        $this->resource
            ->expects($this->never())
            ->method('editPropertyValues');

        $this->sut->populateUniqueId(new TestCreatedEvent('testUri'));
    }

    public function testSuccess(): void
    {
        $this->ontology
            ->expects($this->once())
            ->method('getResource')
            ->with('testUri')
            ->willReturn($this->resource);

        $this->resource
            ->expects($this->once())
            ->method('getRootId')
            ->willReturn(TaoOntology::CLASS_URI_TEST);

        $this->identifierGenerator
            ->expects($this->once())
            ->method('generate')
            ->with([IdentifierGeneratorInterface::OPTION_RESOURCE => $this->resource])
            ->willReturn('QWERTYUI');

        $this->qtiIdentifierSetter
            ->expects($this->once())
            ->method('set')
            ->with([
                AbstractQtiIdentifierSetter::OPTION_RESOURCE => $this->resource,
                AbstractQtiIdentifierSetter::OPTION_IDENTIFIER => 'QWERTYUI',
            ]);

        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_FLAG_UNIQUE_NUMERIC_QTI_IDENTIFIER')
            ->willReturn(true);

        $property = $this->createMock(core_kernel_classes_Property::class);

        $this->ontology
            ->expects($this->once())
            ->method('getProperty')
            ->with(TaoOntology::PROPERTY_UNIQUE_IDENTIFIER)
            ->willReturn($property);

        $this->resource
            ->expects($this->once())
            ->method('editPropertyValues')
            ->with($property, 'QWERTYUI');

        $this->sut->populateUniqueId(new TestCreatedEvent('testUri'));
    }
}
