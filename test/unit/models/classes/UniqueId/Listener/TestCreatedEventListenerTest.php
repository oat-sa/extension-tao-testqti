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

namespace oat\taoQtiTest\test\unit\models\classes\UniqueId\Listener;

use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\tao\model\TaoOntology;
use oat\taoQtiTest\models\UniqueId\Listener\TestCreatedEventListener;
use oat\taoQtiTest\models\UniqueId\Service\QtiIdentifierRetriever;
use oat\taoTests\models\event\TestCreatedEvent;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;

class TestCreatedEventListenerTest extends TestCase
{
    /** @var TestCreatedEvent|MockObject */
    private TestCreatedEvent $testCreatedEvent;

    /** @var core_kernel_classes_Resource|MockObject */
    private core_kernel_classes_Resource $test;

    /** @var core_kernel_classes_Property|MockObject */
    private core_kernel_classes_Property $property;

    /** @var FeatureFlagCheckerInterface|MockObject */
    private FeatureFlagCheckerInterface $featureFlagChecker;

    /** @var Ontology|MockObject */
    private Ontology $ontology;

    /** @var QtiIdentifierRetriever|MockObject */
    private QtiIdentifierRetriever $qtiIdentifierRetriever;

    /** @var LoggerInterface|MockObject */
    private LoggerInterface $logger;

    private TestCreatedEventListener $sut;

    protected function setUp(): void
    {
        $this->testCreatedEvent = $this->createMock(TestCreatedEvent::class);
        $this->test = $this->createMock(core_kernel_classes_Resource::class);
        $this->property = $this->createMock(core_kernel_classes_Property::class);

        $this->featureFlagChecker = $this->createMock(FeatureFlagCheckerInterface::class);
        $this->ontology = $this->createMock(Ontology::class);
        $this->qtiIdentifierRetriever = $this->createMock(QtiIdentifierRetriever::class);
        $this->logger = $this->createMock(LoggerInterface::class);

        $this->sut = new TestCreatedEventListener(
            $this->featureFlagChecker,
            $this->ontology,
            $this->qtiIdentifierRetriever,
            $this->logger
        );
    }

    public function testPopulateUniqueIdFeatureDisabled(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_FLAG_UNIQUE_NUMERIC_QTI_IDENTIFIER')
            ->willReturn(false);

        $this->ontology
            ->expects($this->never())
            ->method($this->anything());
        $this->logger
            ->expects($this->never())
            ->method($this->anything());
        $this->testCreatedEvent
            ->expects($this->never())
            ->method($this->anything());
        $this->test
            ->expects($this->never())
            ->method($this->anything());
        $this->qtiIdentifierRetriever
            ->expects($this->never())
            ->method($this->anything());

        $this->sut->populateUniqueId($this->testCreatedEvent);
    }

    public function testPopulateUniqueId(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_FLAG_UNIQUE_NUMERIC_QTI_IDENTIFIER')
            ->willReturn(true);

        $this->ontology
            ->expects($this->once())
            ->method('getProperty')
            ->with(TaoOntology::PROPERTY_UNIQUE_IDENTIFIER)
            ->willReturn($this->property);

        $this->testCreatedEvent
            ->expects($this->once())
            ->method('getTestUri')
            ->willReturn('testUri');

        $this->ontology
            ->expects($this->once())
            ->method('getResource')
            ->with('testUri')
            ->willReturn($this->test);

        $this->test
            ->expects($this->once())
            ->method('getOnePropertyValue')
            ->with($this->property)
            ->willReturn(null);

        $this->logger
            ->expects($this->never())
            ->method('info');

        $this->qtiIdentifierRetriever
            ->expects($this->once())
            ->method('retrieve')
            ->with($this->test)
            ->willReturn('qtiIdentifier');

        $this->test
            ->expects($this->once())
            ->method('setPropertyValue')
            ->with($this->property, 'qtiIdentifier');

        $this->sut->populateUniqueId($this->testCreatedEvent);
    }

    public function testPopulateUniqueIdValueSet(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_FLAG_UNIQUE_NUMERIC_QTI_IDENTIFIER')
            ->willReturn(true);

        $this->ontology
            ->expects($this->once())
            ->method('getProperty')
            ->with(TaoOntology::PROPERTY_UNIQUE_IDENTIFIER)
            ->willReturn($this->property);

        $this->testCreatedEvent
            ->expects($this->once())
            ->method('getTestUri')
            ->willReturn('testUri');

        $this->ontology
            ->expects($this->once())
            ->method('getResource')
            ->with('testUri')
            ->willReturn($this->test);

        $this->test
            ->expects($this->once())
            ->method('getOnePropertyValue')
            ->with($this->property)
            ->willReturn('propertyValue');

        $this->logger
            ->expects($this->once())
            ->method('info');

        $this->qtiIdentifierRetriever
            ->expects($this->never())
            ->method('retrieve');

        $this->test
            ->expects($this->never())
            ->method('setPropertyValue');

        $this->sut->populateUniqueId($this->testCreatedEvent);
    }
}
