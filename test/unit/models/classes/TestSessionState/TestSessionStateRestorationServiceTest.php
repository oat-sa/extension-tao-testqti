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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);


use League\Flysystem\FileNotFoundException;
use oat\oatbox\extension\AbstractAction;
use oat\tao\model\state\StateMigration;
use oat\tao\model\taskQueue\QueueDispatcher;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoQtiTest\models\classes\tasks\QtiStateOffload\StateBackupRemovalTask;
use oat\taoQtiTest\models\QtiTestUtils;
use oat\taoQtiTest\models\TestSessionService;
use oat\taoQtiTest\models\TestSessionState\Exception\RestorationImpossibleException;
use oat\taoQtiTest\models\TestSessionState\TestSessionStateRestorationService;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use qtism\data\AssessmentSection;
use qtism\data\AssessmentSectionCollection;
use qtism\data\AssessmentTest;
use qtism\data\SectionPart;
use qtism\data\SectionPartCollection;
use qtism\data\TestPart;
use qtism\data\TestPartCollection;
use Ramsey\Uuid\Uuid;

class TestSessionStateRestorationServiceTest extends TestCase
{
    /** @var TestSessionService|MockObject */
    private $testSessionServiceMock;
    /** @var QtiTestUtils|MockObject */
    private $qtiTestUtilsMock;
    /** @var StateMigration|MockObject */
    private $stateMigrationMock;
    /** @var MockObject|LoggerInterface */
    private $loggerMock;
    /** @var MockObject|QueueDispatcher */
    private $queueDispatcherMock;
    /** @var TestSessionStateRestorationService */
    private $subject;

    protected function setUp(): void
    {
        parent::setUp();

        $this->testSessionServiceMock = $this->createMock(TestSessionService::class);
        $this->qtiTestUtilsMock = $this->createMock(QtiTestUtils::class);
        $this->stateMigrationMock = $this->createMock(StateMigration::class);
        $this->loggerMock = $this->createMock(LoggerInterface::class);
        $this->queueDispatcherMock = $this->createMock(QueueDispatcher::class);
        $this->subject = new TestSessionStateRestorationService(
            $this->testSessionServiceMock,
            $this->qtiTestUtilsMock,
            $this->stateMigrationMock,
            $this->loggerMock,
            $this->queueDispatcherMock
        );
    }

    public function testImpossibleTestSessionStateRestoration(): void
    {
        $deliveryExecution = $this->createMock(DeliveryExecution::class);
        $deliveryExecution->expects(self::once())->method('getIdentifier')
            ->willReturn(Uuid::uuid4()->toString());
        $deliveryExecution->expects(self::once())->method('getUserIdentifier')
            ->willReturn(Uuid::uuid4()->toString());
        $this->stateMigrationMock->expects(self::once())->method('restore')
            ->willThrowException(new FileNotFoundException(''));

        $this->expectException(RestorationImpossibleException::class);
        $this->subject->restore($deliveryExecution);
    }

    /**
     * @dataProvider getAssessmentTests
     */
    public function testSuccessRestoration($questionCount, $testPartCount, $assessmentTest): void
    {
        $piecesOfDataToRestore = $questionCount + 3;

        $deliveryExecution = $this->createMock(DeliveryExecution::class);
        $deliveryExecution->expects(self::exactly(1 + $testPartCount))->method('getIdentifier')
            ->willReturn(Uuid::uuid4()->toString());
        $deliveryExecution->expects(self::exactly(1 + $testPartCount))->method('getUserIdentifier')
            ->willReturn(Uuid::uuid4()->toString());


        $this->testSessionServiceMock->expects(self::once())->method('getRuntimeInputParameters')
            ->willReturn(['QtiTestCompilation' => 'test|compilation']);
        $this->qtiTestUtilsMock->expects(self::once())->method('getTestDefinition')
            ->with('test|compilation')
            ->willReturn($assessmentTest);


        $this->stateMigrationMock->expects(self::exactly($piecesOfDataToRestore))->method('restore');
        $this->queueDispatcherMock->expects(self::exactly($piecesOfDataToRestore))->method('createTask')
            ->willReturnCallback(
                function (AbstractAction $action): void {
                    $this->assertInstanceOf(StateBackupRemovalTask::class, $action);
                }
            );

        $this->subject->restore($deliveryExecution);
    }

    public function getAssessmentTests()
    {
        $sectionPart = new SectionPartCollection(
            [
                new SectionPart('q1.'),
                new SectionPart('q2.'),
            ]
        );

        $assessmentSection1 = new AssessmentSection('a1.', '', false);
        $assessmentSection2 = new AssessmentSection('a2.', '', false);
        $assessmentSection1->setSectionParts($sectionPart);
        $assessmentSection2->setSectionParts($sectionPart);

        return [
            [2, 1, new AssessmentTest('a1.', '', new TestPartCollection([new TestPart('a1.', new AssessmentSectionCollection([$assessmentSection1]))]))],
            [4, 2, new AssessmentTest('a1.', '', new TestPartCollection([new TestPart('a1.', new AssessmentSectionCollection([$assessmentSection1, $assessmentSection2]))]))],
            [4, 2, new AssessmentTest('a1.', '', new TestPartCollection([new TestPart('a1.', new AssessmentSectionCollection([$assessmentSection1])), new TestPart('a2.', new AssessmentSectionCollection([$assessmentSection2]))]))],
            [6, 3, new AssessmentTest('a1.', '', new TestPartCollection([new TestPart('a1.', new AssessmentSectionCollection([$assessmentSection1, $assessmentSection2])), new TestPart('a2.', new AssessmentSectionCollection([$assessmentSection1]))]))],
        ];
    }
}
