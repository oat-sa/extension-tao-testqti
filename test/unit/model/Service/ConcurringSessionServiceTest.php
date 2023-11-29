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
 * Copyright (c) 2023 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\model\Service;

use core_kernel_classes_Class;
use core_kernel_classes_Property;
use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoDelivery\model\execution\DeliveryExecutionInterface;
use oat\taoDelivery\model\execution\DeliveryExecutionService;
use oat\taoDelivery\model\RuntimeService;
use oat\taoQtiTest\model\Service\ConcurringSessionService;
use oat\taoQtiTest\models\container\QtiTestDeliveryContainer;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use PHPSession;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;

class ConcurringSessionServiceTest extends TestCase
{
    private QtiRunnerService $qtiRunnerService;
    private RuntimeService $runtimeService;
    private Ontology $ontology;
    private DeliveryExecutionService $deliveryExecutionService;
    private FeatureFlagCheckerInterface $featureFlagChecker;
    private PHPSession $currentSession;

    /** @var ConcurringSessionService */
    private $subject;

    protected function setUp(): void
    {
        $this->qtiRunnerService = $this->createMock(QtiRunnerService::class);
        $this->runtimeService = $this->createMock(RuntimeService::class);
        $this->ontology = $this->createMock(Ontology::class);
        $this->deliveryExecutionService = $this->createMock(
            DeliveryExecutionService::class
        );
        $this->featureFlagChecker = $this->createMock(
            FeatureFlagCheckerInterface::class
        );
        $this->currentSession = $this->createMock(PHPSession::class);

        $this->subject = new ConcurringSessionService(
            $this->createMock(LoggerInterface::class),
            $this->qtiRunnerService,
            $this->runtimeService,
            $this->ontology,
            $this->deliveryExecutionService,
            $this->featureFlagChecker,
            $this->currentSession
        );
    }

    public function testDoesNothingIfTheFeatureFlagIsDisabled(): void
    {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_FLAG_PAUSE_CONCURRENT_SESSIONS')
            ->willReturn(false);

        $this->ontology
            ->expects($this->never())
            ->method('getClass');

        $this->qtiRunnerService
            ->expects($this->never())
            ->method('endTimer');
        $this->qtiRunnerService
            ->expects($this->never())
            ->method('pause');

        $execution = $this->createMock(DeliveryExecution::class);
        $execution
            ->expects($this->never())
            ->method('getUserIdentifier');

        $this->subject->pauseConcurrentSessions($execution);
    }

    /**
     * @dataProvider doesNothingIfTheExecutionIsForAnAnonymousUserDataProvider
     */
    public function testDoesNothingIfTheExecutionIsForAnAnonymousUser(
        ?string $userId
    ): void {
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_FLAG_PAUSE_CONCURRENT_SESSIONS')
            ->willReturn(true);

        $this->ontology
            ->expects($this->never())
            ->method('getClass');

        $this->qtiRunnerService
            ->expects($this->never())
            ->method('endTimer');
        $this->qtiRunnerService
            ->expects($this->never())
            ->method('pause');

        $execution = $this->createMock(DeliveryExecution::class);
        $execution
            ->expects($this->once())
            ->method('getUserIdentifier')
            ->willReturn($userId);

        $this->subject->pauseConcurrentSessions($execution);
    }

    public function doesNothingIfTheExecutionIsForAnAnonymousUserDataProvider(): array
    {
        return [
            "Null user identifier" => [null],
            "Empty user identifier" => [''],
            "User identifier provided as 'anonymous'" => ['anonymous'],
        ];
    }

    public function testPausesExecutionsForOtherDeliveries(): void
    {
        error_reporting(0xFFFFFFFF);
        $this->featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_FLAG_PAUSE_CONCURRENT_SESSIONS')
            ->willReturn(true);

        $executionClass = $this->createMock(core_kernel_classes_Class::class);
        $propertyClass = $this->createMock(core_kernel_classes_Property::class);
        $executionResource = $this->createMock(core_kernel_classes_Resource::class);
        $deliveryResource = $this->createMock(core_kernel_classes_Resource::class);
        $otherExecutionResource = $this->createMock(core_kernel_classes_Resource::class);
        $otherDeliveryResource = $this->createMock(core_kernel_classes_Resource::class);
        $runningState = $this->createMock(core_kernel_classes_Resource::class);
        $executionDomainObject = $this->createMock(DeliveryExecution::class);
        $otherExecutionDomainObject = $this->createMock(DeliveryExecution::class);

        $this->ontology
            ->expects($this->exactly(2))
            ->method('getClass')
            ->with(DeliveryExecutionInterface::CLASS_URI)
            ->willReturn($executionClass);
        $this->ontology
            ->expects($this->once())
            ->method('getProperty')
            ->with(DeliveryExecutionInterface::PROPERTY_DELIVERY)
            ->willReturn($propertyClass);

        $executionClass
            ->expects($this->once())
            ->method('getResource')
            ->with('https://example.com/execution/1')
            ->willReturn($executionResource);

        $executionResource
            ->expects($this->once())
            ->method('getUniquePropertyValue')
            ->with($propertyClass)
            ->willReturn($deliveryResource);

        $executionClass
            ->expects($this->once())
            ->method('searchInstances')
            ->with(
                [
                    DeliveryExecutionInterface::PROPERTY_SUBJECT => 'https://example.com/user/1',
                    DeliveryExecutionInterface::PROPERTY_STATUS => DeliveryExecutionInterface::STATE_ACTIVE,
                ],
                ['like' => false]
            )
            ->willReturn([
                $otherExecutionResource
            ]);

        $otherDeliveryResource
            ->expects($this->atLeastOnce())
            ->method('getUri')
            ->willReturn('https://example.com/delivery/2');

        $otherExecutionResource
            ->expects($this->atLeastOnce())
            ->method('getUri')
            ->willReturn('https://example.com/execution/2');

        $runningState
            ->expects($this->once())
            ->method('getUri')
            ->willReturn(DeliveryExecutionInterface::STATE_ACTIVE);

        $otherExecutionDomainObject
            ->expects($this->atLeastOnce())
            ->method('getDelivery')
            ->willReturn($otherDeliveryResource);
        $otherExecutionDomainObject
            ->expects($this->atLeastOnce())
            ->method('getIdentifier')
            ->willReturn('https://example.com/execution/2');
        $otherExecutionDomainObject
            ->expects($this->atLeastOnce())
            ->method('getState')
            ->willReturn($runningState);

        $this->deliveryExecutionService
            ->expects($this->atLeastOnce())
            ->method('getDeliveryExecution')
            ->willReturnMap([
                ['https://example.com/execution/1', $executionDomainObject],
                ['https://example.com/execution/2', $otherExecutionDomainObject],
            ]);

        $deliveryResource
            ->expects($this->once())
            ->method('getUri')
            ->willReturn('https://example.com/delivery/1');

        $execution = $this->createMock(DeliveryExecution::class);
        $execution
            ->expects($this->atLeastOnce())
            ->method('getIdentifier')
            ->willReturn('https://example.com/execution/1');
        $execution
            ->expects($this->atLeastOnce())
            ->method('getUserIdentifier')
            ->willReturn('https://example.com/user/1');

        $qtiTestDeliveryContainer = $this->createMock(QtiTestDeliveryContainer::class);
        $qtiTestDeliveryContainer
            ->expects($this->once())
            ->method('getPrivateDirId')
            ->with($execution)
            ->willReturn('privateDirId');
        $qtiTestDeliveryContainer
            ->expects($this->once())
            ->method('getPublicDirId')
            ->with($execution)
            ->willReturn('publicDirId');
        $qtiTestDeliveryContainer
            ->expects($this->once())
            ->method('getSourceTest')
            ->with($execution)
            ->willReturn('http://example.com/sourceTest/1');

        $this->runtimeService
            ->expects($this->once())
            ->method('getDeliveryContainer')
            ->with('https://example.com/delivery/2')
            ->willReturn($qtiTestDeliveryContainer);

        $context = $this->createMock(QtiRunnerServiceContext::class);

        $this->qtiRunnerService
            ->expects($this->once())
            ->method('getServiceContext')
            ->with(
                'http://example.com/sourceTest/1',
                'privateDirId|publicDirId',
                'https://example.com/execution/2'
            )->willReturn($context);

        // Expectations
        //
        $this->currentSession
            ->expects($this->once())
            ->method('setAttribute')
            ->with(
                'pauseReason-https://example.com/execution/2',
                'PAUSE_REASON_CONCURRENT_TEST'
            )->willReturn(null);

        $this->qtiRunnerService
            ->expects($this->once())
            ->method('endTimer')
            ->with($context);
        $this->qtiRunnerService
            ->expects($this->once())
            ->method('pause')
            ->with($context);

        $this->subject->pauseConcurrentSessions($execution);
    }
}
