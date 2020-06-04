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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA ;
 */
declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes\runner\time;

use oat\generis\test\MockObject;
use oat\taoQtiTest\models\runner\session\TestSession;
use oat\taoQtiTest\models\runner\StorageManager;
use oat\taoQtiTest\models\runner\time\QtiTimeConstraint;
use oat\taoQtiTest\models\runner\time\QtiTimer;
use oat\taoQtiTest\models\runner\time\TimerAdjustmentService;
use oat\generis\test\TestCase;
use oat\taoTests\models\runner\time\TimerAdjustmentMapInterface;
use qtism\common\datatypes\Duration;
use qtism\data\AssessmentItemRef;
use qtism\data\AssessmentTest;
use qtism\data\QtiIdentifiable;
use qtism\data\SectionPart;
use qtism\data\TestPart;
use qtism\data\TimeLimits;

class TimerAdjustmentServiceTest extends TestCase
{
    /**
     * @var TimerAdjustmentService
     */
    private $subject;

    /**
     * @var TimerAdjustmentMapInterface|MockObject;
     */
    private $adjustmentMapMock;

    /**
     * @var QtiTimer|MockObject
     */
    private $timerMock;

    /**
     * @var TestSession|MockObject
     */
    private $testSessionMock;

    protected function setUp(): void
    {
        parent::setUp();
        $this->adjustmentMapMock = $this->createMock(TimerAdjustmentMapInterface::class);
        $this->timerMock = $this->mockQtiTimer($this->adjustmentMapMock);
        $this->testSessionMock = $this->mockTestSession($this->timerMock);

        $serviceLocatorMock = $this->getServiceLocatorMock([
            StorageManager::SERVICE_ID => $this->createMock(StorageManager::class),
        ]);
        $this->subject = new TimerAdjustmentService();
        $this->subject->setServiceLocator($serviceLocatorMock);
    }

    public function testIncrease_AppliesIncreaseToGivenSource(): void
    {
        $increaseValue = 10;
        $increaseType = 'DUMMY_TYPE';
        $sourceId = 'DUMMY_SOURCE_ID';
        $source = $this->mockTimedComponent(SectionPart::class, $sourceId, true);

        $this->adjustmentMapMock->expects(self::once())
            ->method('increase')
            ->with($sourceId, $increaseType, $increaseValue);

        $result = $this->subject->increase(
            $this->testSessionMock,
            $increaseValue,
            $increaseType,
            $source
        );
        self::assertTrue($result, 'Method must return correct response in case of success.');
    }

    public function testDecrease_AppliesIncreaseToGivenSource_WithCorrectMaximumDecreaseValue(): void
    {
        $increaseValue = 150;
        $increaseType = 'DUMMY_TYPE';
        $sourceId = 'DUMMY_SOURCE_ID';
        $source = $this->mockTimedComponent(SectionPart::class, $sourceId, true);

        $constraintRemainingTime = 100;
        $timeConstraintsMock = $this->mockTimeConstraint($sourceId, $constraintRemainingTime);
        $this->testSessionMock->method('getTimeConstraints')
            ->willReturn([$timeConstraintsMock]);

        $this->adjustmentMapMock->expects(self::once())
            ->method('decrease')
            ->with($sourceId, $increaseType, $constraintRemainingTime);

        $result = $this->subject->decrease(
            $this->testSessionMock,
            $increaseValue,
            $increaseType,
            $source
        );
        self::assertTrue($result, 'Method must return correct response in case of successful time decrease.');
    }

    public function testIncrease_SourceDoesntHaveMaxTimeLimit(): void
    {
        $increaseValue = 5;
        $increaseType = 'DUMMY_TYPE';
        $sourceId = 'DUMMY_SOURCE_ID';
        $source = $this->mockTimedComponent(SectionPart::class, $sourceId, false);

        $this->adjustmentMapMock->expects(self::never())
            ->method('increase');

        $result = $this->subject->increase(
            $this->testSessionMock,
            $increaseValue,
            $increaseType,
            $source
        );

        self::isNull($result, 'Method must return correct response if source doesn\'t have max time limit.');
    }

    public function testIncrease_WithoutSourceIdAppliesToAllSources(): void
    {
        $increaseValue = 15;
        $increaseType = 'DUMMY_TYPE';

        // Mock tests session to return timed components.
        $itemRef = $this->mockTimedComponent(AssessmentItemRef::class, 'DUMMY_SOURCE_ID', true);
        $assessmentSection = $this->mockTimedComponent(SectionPart::class, 'DUMMY_SECTION_ID', true);
        $assessmentPart = $this->mockTimedComponent(TestPart::class, 'DUMMY_PART_ID', true);
        $assessmentTest = $this->mockTimedComponent(AssessmentTest::class, 'DUMMY_TEST_ID', true);
        $this->testSessionMock->method('getCurrentAssessmentItemRef')
            ->willReturn($itemRef);
        $this->testSessionMock->method('getCurrentAssessmentSection')
            ->willReturn($assessmentSection);
        $this->testSessionMock->method('getCurrentTestPart')
            ->willReturn($assessmentPart);
        $this->testSessionMock->method('getAssessmentTest')
            ->willReturn($assessmentTest);

        // Assert that time adjustment is stored for each component.
        $this->adjustmentMapMock->expects(self::exactly(4))
            ->method('increase')
            ->withConsecutive(
                ['DUMMY_SOURCE_ID', $increaseType, $increaseValue],
                ['DUMMY_SECTION_ID', $increaseType, $increaseValue],
                ['DUMMY_PART_ID', $increaseType, $increaseValue],
                ['DUMMY_TEST_ID', $increaseType, $increaseValue]
            );

        $result = $this->subject->increase(
            $this->testSessionMock,
            $increaseValue,
            $increaseType
        );

        self::assertTrue(
            $result,
            'Method must return correct response in case of success when source is not provided.'
        );
    }

    /**
     * @param string $class
     * @param string $identifier
     * @param bool $hasMaxLimit
     * @return QtiIdentifiable|MockObject
     */
    private function mockTimedComponent(string $class, string $identifier, bool $hasMaxLimit): QtiIdentifiable
    {
        $timeLimitsMock = $this->createMock(TimeLimits::class);
        $timeLimitsMock->method('hasMaxTime')
            ->willReturn($hasMaxLimit);

        $timedComponentMock = $this->createMock($class);
        $timedComponentMock->method('getTimeLimits')
            ->willReturn($timeLimitsMock);
        $timedComponentMock->method('getIdentifier')
            ->willReturn($identifier);

        return $timedComponentMock;
    }

    /**
     * @return QtiTimer|MockObject
     */
    private function mockQtiTimer(TimerAdjustmentMapInterface $adjustmentMap): QtiTimer
    {
        $qtiTimerMock = $this->createMock(QtiTimer::class);
        $qtiTimerMock->method('getAdjustmentMap')
            ->willReturn($adjustmentMap);

        return $qtiTimerMock;
    }

    /**
     * @return TestSession|MockObject
     */
    private function mockTestSession(QtiTimer $qtiTimer): TestSession
    {
        $testSessionMock = $this->createMock(TestSession::class);
        $testSessionMock->method('getTimer')
            ->willReturn($qtiTimer);

        return $testSessionMock;
    }

    /**
     * @param string $sourceId
     * @param int $maximumRemainingTime
     * @return QtiTimeConstraint|MockObject
     */
    private function mockTimeConstraint(string $sourceId, int $maximumRemainingTime): QtiTimeConstraint
    {
        $durationMock = $this->createMock(Duration::class);
        $durationMock->method('getSeconds')
            ->willReturn($maximumRemainingTime);

        $sourceMock = $this->mockTimedComponent(SectionPart::class, $sourceId, true);

        $qtiTimeConstraintMock = $this->createMock(QtiTimeConstraint::class);
        $qtiTimeConstraintMock->method('getMaximumRemainingTime')
            ->willReturn($durationMock);
        $qtiTimeConstraintMock->method('getSource')
            ->willReturn($sourceMock);

        return $qtiTimeConstraintMock;
    }
}

