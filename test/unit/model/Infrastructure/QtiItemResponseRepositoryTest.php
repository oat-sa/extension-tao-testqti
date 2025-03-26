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
 * Copyright (c) 2024-2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\model\Infrastructure;

use oat\tao\model\featureFlag\FeatureFlagChecker;
use oat\taoQtiTest\model\Domain\Model\ItemResponse;
use oat\taoQtiTest\model\Infrastructure\QtiItemResponseRepository;
use oat\taoQtiTest\model\Infrastructure\QtiItemResponseValidator;
use oat\taoQtiTest\model\Infrastructure\Validation\ExtraQtiInteractionResponseValidator;
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
    private QtiRunnerService $runnerServiceMock;
    private FeatureFlagChecker $featureFlagCheckerMock;
    private QtiItemResponseValidator $itemResponseValidatorMock;
    private ExtraQtiInteractionResponseValidator $interactionResponseValidator;

    public function setUp(): void
    {
        $this->runnerServiceMock = $this->createMock(QtiRunnerService::class);
        $this->featureFlagCheckerMock = $this->createMock(FeatureFlagChecker::class);
        $this->itemResponseValidatorMock = $this->createMock(QtiItemResponseValidator::class);
        $this->interactionResponseValidator = $this->createMock(ExtraQtiInteractionResponseValidator::class);

        $this->subject = new QtiItemResponseRepository(
            $this->runnerServiceMock,
            $this->featureFlagCheckerMock,
            $this->itemResponseValidatorMock,
            $this->interactionResponseValidator
        );

        $this->runnerServiceMock->method('getItemData')->willReturn([]);
    }

    /**
     * @dataProvider saveDataProvider
     */
    public function testSave(
        array $state,
        array $response,
        float $duration,
        float $timestamp,
        string $itemHref,
        string $responseIdentifier,
        int $storeItemResponseCount,
        bool $qtiItemResponseValidatorShouldThrowException,
        bool $interactionResponseValidatorShouldThrowException,
        bool $blockEmptyResponse,
        bool $shouldThrowEmptyResponseException
    ): void {
        $itemResponse = new ItemResponse(
            'itemIdentifier',
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

        $subjectPartialMock = $this->getMockBuilder(QtiItemResponseRepository::class)
            ->setConstructorArgs([
                $this->runnerServiceMock,
                $this->featureFlagCheckerMock,
                $this->itemResponseValidatorMock,
                $this->interactionResponseValidator
            ])
            ->onlyMethods(['blockEmptyResponse'])
            ->getMock();

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

        if ($qtiItemResponseValidatorShouldThrowException) {
            $this->itemResponseValidatorMock->expects($this->once())
                ->method('validate')
                ->with($assessmentTestSession, $stateMock)
                ->willThrowException(
                    new AssessmentItemSessionException(
                        'invalid',
                        $assessmentItemSession,
                        AssessmentItemSessionException::DURATION_OVERFLOW
                    )
                );

            $subjectPartialMock->expects($this->never())
                ->method('blockEmptyResponse');

            $this->expectException(QtiRunnerInvalidResponsesException::class);
        } elseif ($interactionResponseValidatorShouldThrowException) {
            $this->itemResponseValidatorMock->expects($this->once())
                ->method('validate')
                ->with($assessmentTestSession, $stateMock);

            $this->interactionResponseValidator->expects($this->once())
                ->method('validate')
                ->with([], $stateMock)
                ->willThrowException(
                    new QtiRunnerInvalidResponsesException('mockedMessage')
                );

            $subjectPartialMock->expects($this->never())
                ->method('blockEmptyResponse');

            $this->expectException(QtiRunnerInvalidResponsesException::class);
            $this->expectExceptionMessage('mockedMessage');
        } else {
            $this->itemResponseValidatorMock->expects($this->once())
                ->method('validate')
                ->with($assessmentTestSession, $stateMock);

            $this->interactionResponseValidator->expects($this->once())
                ->method('validate')
                ->with([], $stateMock);

            $subjectPartialMock->expects($this->once())
                ->method('blockEmptyResponse')
                ->with($runnerServiceContextMock, $stateMock)
                ->willReturn($blockEmptyResponse);

            if ($shouldThrowEmptyResponseException) {
                $this->expectException(QtiRunnerEmptyResponsesException::class);
            }
        }

        if (
            !$qtiItemResponseValidatorShouldThrowException &&
            !$interactionResponseValidatorShouldThrowException &&
            !$shouldThrowEmptyResponseException
        ) {
            $this->runnerServiceMock->expects($this->exactly($storeItemResponseCount))
                ->method('storeItemResponse');
        } else {
            $this->runnerServiceMock->expects($this->never())
                ->method('storeItemResponse');
        }

        $subjectPartialMock->save($itemResponse, $runnerServiceContextMock);
    }

    public function saveDataProvider(): array
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
                'qtiItemResponseValidatorShouldThrowException' => false,
                'interactionResponseValidatorShouldThrowException' => false,
                'blockEmptyResponse' => false,
                'shouldThrowEmptyResponseException' => false
            ],
            'ItemResponseValidator throw an error, flag enabled' => [
                'state' => ['state'],
                'response' => ['response'],
                'duration' => 1.0,
                'timestamp' => 2.0,
                'itemHref' => 'itemHref',
                'responseIdentifier' => 'itemIdentifier',
                'storeItemResponseCount' => 0,
                'qtiItemResponseValidatorShouldThrowException' => true,
                'interactionResponseValidatorShouldThrowException' => false,
                'blockEmptyResponse' => false,
                'shouldThrowEmptyResponseException' => false
            ],
            'extraInteractionResponseValidator throw an error, flag enabled' => [
                'state' => ['state'],
                'response' => ['response'],
                'duration' => 1.0,
                'timestamp' => 2.0,
                'itemHref' => 'itemHref',
                'responseIdentifier' => 'itemIdentifier',
                'storeItemResponseCount' => 0,
                'qtiItemResponseValidatorShouldThrowException' => false,
                'interactionResponseValidatorShouldThrowException' => true,
                'blockEmptyResponse' => false,
                'shouldThrowEmptyResponseException' => false
            ],
            'empty response exception should be thrown' => [
                'state' => ['state'],
                'response' => ['response'],
                'duration' => 1.0,
                'timestamp' => 2.0,
                'itemHref' => 'itemHref',
                'responseIdentifier' => 'itemIdentifier',
                'storeItemResponseCount' => 0,
                'qtiItemResponseValidatorShouldThrowException' => false,
                'interactionResponseValidatorShouldThrowException' => false,
                'blockEmptyResponse' => true,
                'shouldThrowEmptyResponseException' => true
            ]
        ];
    }
}
