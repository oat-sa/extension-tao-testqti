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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\model\Infrastructure;

use oat\tao\model\featureFlag\FeatureFlagChecker;
use oat\taoQtiTest\model\Domain\Model\ItemResponse;
use oat\taoQtiTest\model\Infrastructure\QtiItemResponseRepository;
use oat\taoQtiTest\model\Infrastructure\QtiItemResponseValidator;
use oat\taoQtiTest\models\classes\runner\QtiRunnerInvalidResponsesException;
use oat\taoQtiTest\models\runner\QtiRunnerEmptyResponsesException;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use PHPUnit\Framework\TestCase;
use qtism\data\ExtendedAssessmentItemRef;
use qtism\runtime\common\State;
use qtism\runtime\tests\AssessmentItemSession;
use qtism\runtime\tests\AssessmentItemSessionException;
use qtism\runtime\tests\AssessmentTestSession;

class QtiItemResponseRepositoryTest extends TestCase
{
    private QtiItemResponseRepository $subject;

    public function setUp(): void
    {
        $this->runnerServiceMock = $this->createMock(QtiRunnerService::class);
        $this->featureFlagCheckerMock = $this->createMock(FeatureFlagChecker::class);
        $this->itemResponseValidatorMock = $this->createMock(QtiItemResponseValidator::class);

        $this->subject = new QtiItemResponseRepository(
            $this->runnerServiceMock,
            $this->featureFlagCheckerMock,
            $this->itemResponseValidatorMock
        );
    }

    /**
     * @dataProvider saveDataProvider
     */
    public function testSave(
        array  $state,
        array  $response,
        float  $duration,
        float  $timestamp,
        string $itemHref,
        string $responseIdentifier,
        int    $storeItemResponseCount,
        bool   $shouldThrowException
    ): void
    {
        $itemResponse = new ItemResponse('itemIdentifier',
            $state,
            $response,
            $duration,
            $timestamp
        );

        $runnerServiceContextMock = $this->createMock(QtiRunnerServiceContext::class);
        $extendedAssessmentItemRefMock = $this->createMock(ExtendedAssessmentItemRef::class);
        $assessmentItemSession = $this->createMock(AssessmentItemSession::class);
        $assessmentTestSession = $this->createMock(AssessmentTestSession::class);
        $stateMock = $this->createMock(State::class);

        $extendedAssessmentItemRefMock->expects($this->once())
            ->method('getIdentifier')
            ->willReturn($responseIdentifier);

        $this->runnerServiceMock->expects($this->once())
            ->method('isTerminated')
            ->with($runnerServiceContextMock)
            ->willReturn(false);

        $this->runnerServiceMock->expects($this->once())
            ->method('endTimer');

        $this->runnerServiceMock->expects($this->once())
            ->method('getItemHref')
            ->willReturn($itemHref);

        $this->runnerServiceMock->expects($this->once())
            ->method('setItemState');

        $runnerServiceContextMock
            ->method('getCurrentAssessmentItemRef')
            ->willReturn($extendedAssessmentItemRefMock);

        $this->runnerServiceMock->expects($this->once())
            ->method('setItemState')
            ->with($runnerServiceContextMock, $responseIdentifier, $state);

        $this->runnerServiceMock->expects($this->once())
            ->method('parsesItemResponse')
            ->willReturn($stateMock);

        $this->featureFlagCheckerMock->expects($this->once())
            ->method('isEnabled')
            ->willReturn(true);

        $runnerServiceContextMock
            ->method('getTestSession')
            ->willReturn($assessmentTestSession);

        $this->itemResponseValidatorMock->expects($this->once())
            ->method('validate');

        $this->runnerServiceMock->expects($this->exactly($storeItemResponseCount))
            ->method('storeItemResponse');

        if ($shouldThrowException) {
            $this->itemResponseValidatorMock->expects($this->once())
                ->method('validate')
                ->with($assessmentTestSession, $stateMock)
                ->willThrowException(new AssessmentItemSessionException('invalid', $assessmentItemSession, AssessmentItemSessionException::DURATION_OVERFLOW));
            $this->expectException(QtiRunnerInvalidResponsesException::class);
        }

        $this->subject->save($itemResponse, $runnerServiceContextMock);
    }

    public function saveDataProvider()
    {
        return [
            'happyPath with feature flag enabled' => [
                'state' => ['state'],
                'response' => ['response'],
                'duration' => 1.0,
                'timestamp' => 2.0,
                'itemHref' => 'itemHref',
                'responseIdentifier' => 'itemIdentifier',
                'storeItemResponseCount' => 1,
                'shouldThrowException' => false
            ],
            'validation throw an error, flag enabled' => [
                'state' => ['state'],
                'response' => ['response'],
                'duration' => 1.0,
                'timestamp' => 2.0,
                'itemHref' => 'itemHref',
                'responseIdentifier' => 'itemIdentifier',
                'storeItemResponseCount' => 0,
                'shouldThrowException' => true
            ]
        ];
    }

}
