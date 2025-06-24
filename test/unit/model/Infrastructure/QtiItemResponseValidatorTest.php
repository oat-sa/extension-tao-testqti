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

use oat\taoQtiTest\model\Infrastructure\QtiItemResponseValidator;
use oat\taoQtiTest\models\runner\QtiRunnerEmptyResponsesException;
use PHPUnit\Framework\TestCase;
use qtism\data\ItemSessionControl;
use qtism\runtime\common\State;
use qtism\runtime\tests\AssessmentItemSession;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\tests\Route;
use qtism\runtime\tests\RouteItem;
use qtism\runtime\tests\RouteItemSessionControl;
use qtism\data\AssessmentItem;
use qtism\data\state\OutcomeDeclarationCollection;
use qtism\data\state\ResponseValidityConstraintCollection;

use function PHPUnit\Framework\once;

class QtiItemResponseValidatorTest extends TestCase
{
    private QtiItemResponseValidator $subject;
    private Route $routeMock;
    private RouteItem $routeItem;
    private RouteItemSessionControl $routeItemSessionControl;
    private ItemSessionControl $itemSessionControl;

    public function setUp(): void
    {
        $this->subject = new QtiItemResponseValidator();
        $this->routeMock = $this->createMock(Route::class);
        $this->routeItem = $this->createMock(RouteItem::class);
        $this->routeItemSessionControl = $this->createMock(RouteItemSessionControl::class);
        $this->itemSessionControl = $this->createMock(ItemSessionControl::class);

        $this->routeMock
            ->method('current')
            ->willReturn($this->routeItem);

        $this->routeItem
            ->method('getItemSessionControl')
            ->willReturn($this->routeItemSessionControl);

        $this->routeItemSessionControl
            ->method('getItemSessionControl')
            ->willReturn($this->itemSessionControl);
    }

    /**
     * @throws \common_exception_Error
     * @throws \oat\taoQtiTest\models\runner\QtiRunnerEmptyResponsesException
     * @throws \qtism\runtime\tests\AssessmentItemSessionException
     */
    public function testValidateAllowedToSkip()
    {
        $assessmentTestSession = $this->createMock(AssessmentTestSession::class);
        $responses = $this->createMock(State::class);
        $assessmentItemSession = $this->createMock(AssessmentItemSession::class);
        $getAssessmentItem = $this->createMock(AssessmentItem::class);
        $outcomeDeclarationCollection = $this->createMock(OutcomeDeclarationCollection::class);
        $responseDeclarationCollection = $this->createMock(ResponseValidityConstraintCollection::class);

        $responseDeclarationCollection
            ->method('count')
            ->willReturn(1);

        $outcomeDeclarationCollection
            ->method('count')
            ->willReturn(1);

        $getAssessmentItem
            ->expects($this->once())
            ->method('getOutcomeDeclarations')
            ->willReturn($outcomeDeclarationCollection);

        $getAssessmentItem
            ->expects($this->once())
            ->method('getResponseDeclarations')
            ->willReturn($responseDeclarationCollection);

        $assessmentTestSession
            ->method('getRoute')
            ->willReturn($this->routeMock);

        $this->itemSessionControl
            ->method('doesAllowSkipping')
            ->willReturn(true);

        $responses
            ->method('containsNullOnly')
            ->willReturn(true);

        $this->itemSessionControl
            ->method('mustValidateResponses')
            ->willReturn(false);

        $assessmentTestSession
            ->expects($this->once())
            ->method('getCurrentAssessmentItemSession')
            ->willReturn($assessmentItemSession);

        $assessmentItemSession->expects($this->once())
            ->method('getAssessmentItem')
            ->willReturn($getAssessmentItem);

        $this->subject->validate($assessmentTestSession, $responses);

        $this->assertTrue(true, 'Validation passed without throwing any exceptions');
    }

    public function testValidateNotAllowedToSkipWithEmptyResponses(): void
    {
        $assessmentTestSession = $this->createMock(AssessmentTestSession::class);
        $responses = $this->createMock(State::class);
        $assessmentItemSession = $this->createMock(AssessmentItemSession::class);

        $getAssessmentItem = $this->createMock(AssessmentItem::class);
        $outcomeDeclarationCollection = $this->createMock(OutcomeDeclarationCollection::class);
        $responseDeclarationCollection = $this->createMock(ResponseValidityConstraintCollection::class);

        $responseDeclarationCollection
            ->method('count')
            ->willReturn(1);

        $outcomeDeclarationCollection
            ->method('count')
            ->willReturn(1);

        $getAssessmentItem
            ->expects($this->once())
            ->method('getOutcomeDeclarations')
            ->willReturn($outcomeDeclarationCollection);

        $getAssessmentItem
            ->expects($this->once())
            ->method('getResponseDeclarations')
            ->willReturn($responseDeclarationCollection);

        $assessmentTestSession
            ->expects($this->once())
            ->method('getCurrentAssessmentItemSession')
            ->willReturn($assessmentItemSession);

        $assessmentTestSession
            ->method('getRoute')
            ->willReturn($this->routeMock);

        $this->itemSessionControl
            ->method('doesAllowSkipping')
            ->willReturn(false);

        $this->itemSessionControl
            ->method('mustValidateResponses')
            ->willReturn(true);

        $responses
            ->method('containsNullOnly')
            ->willReturn(true);

        $assessmentItemSession->expects($this->once())
            ->method('getAssessmentItem')
            ->willReturn($getAssessmentItem);

        $this->expectException(QtiRunnerEmptyResponsesException::class);

        $this->subject->validate($assessmentTestSession, $responses);
    }

    public function testValidateWithResponseValidation(): void
    {
        $assessmentTestSession = $this->createMock(AssessmentTestSession::class);
        $responses = $this->createMock(State::class);
        $assessmentItemSession = $this->createMock(AssessmentItemSession::class);
        $getAssessmentItem = $this->createMock(AssessmentItem::class);
        $outcomeDeclarationCollection = $this->createMock(OutcomeDeclarationCollection::class);
        $responseDeclarationCollection = $this->createMock(ResponseValidityConstraintCollection::class);

        $responseDeclarationCollection
            ->method('count')
            ->willReturn(1);

        $outcomeDeclarationCollection
            ->method('count')
            ->willReturn(1);

        $getAssessmentItem
            ->expects($this->once())
            ->method('getOutcomeDeclarations')
            ->willReturn($outcomeDeclarationCollection);

        $getAssessmentItem
            ->expects($this->once())
            ->method('getResponseDeclarations')
            ->willReturn($responseDeclarationCollection);

        $assessmentTestSession
            ->method('getRoute')
            ->willReturn($this->routeMock);

        $this->itemSessionControl
            ->method('mustValidateResponses')
            ->willReturn(true);

        $this->itemSessionControl
            ->method('doesAllowSkipping')
            ->willReturn(false);

        $responses
            ->method('containsNullOnly')
            ->willReturn(false);

        $assessmentTestSession
            ->method('getCurrentAssessmentItemSession')
            ->willReturn($assessmentItemSession);

        $assessmentItemSession
            ->expects($this->once())
            ->method('checkResponseValidityConstraints')
            ->with($responses);

        $assessmentItemSession->expects($this->once())
            ->method('getAssessmentItem')
            ->willReturn($getAssessmentItem);

        $this->subject->validate($assessmentTestSession, $responses);
    }

    public function testValidateWithoutResponseValidation(): void
    {
        $assessmentTestSession = $this->createMock(AssessmentTestSession::class);
        $responses = $this->createMock(State::class);
        $assessmentItemSession = $this->createMock(AssessmentItemSession::class);
        $assessmentItem = $this->createMock(AssessmentItem::class);
        $responseValidityConstraintCollection = new ResponseValidityConstraintCollection();
        $outcomeDeclarationCollection = $this->createMock(OutcomeDeclarationCollection::class);
        $responseDeclarationCollection = $this->createMock(ResponseValidityConstraintCollection::class);

        $responseDeclarationCollection
            ->method('count')
            ->willReturn(1);

        $outcomeDeclarationCollection
            ->method('count')
            ->willReturn(1);

        $assessmentItem
            ->expects($this->once())
            ->method('getOutcomeDeclarations')
            ->willReturn($outcomeDeclarationCollection);

        $assessmentItem
            ->expects($this->once())
            ->method('getResponseDeclarations')
            ->willReturn($responseDeclarationCollection);

        $assessmentTestSession
            ->method('getRoute')
            ->willReturn($this->routeMock);

        $this->itemSessionControl
            ->method('mustValidateResponses')
            ->willReturn(false);

        $this->itemSessionControl
            ->method('doesAllowSkipping')
            ->willReturn(false);

        $responses
            ->method('containsNullOnly')
            ->willReturn(false);

        $assessmentTestSession
            ->expects($this->once())
            ->method('getCurrentAssessmentItemSession')
            ->willReturn($assessmentItemSession);

        $assessmentItemSession
            ->expects($this->once())
            ->method('getAssessmentItem')
            ->willReturn($assessmentItem);

        $assessmentItem
            ->expects($this->once())
            ->method('getResponseValidityConstraints')
            ->willReturn($responseValidityConstraintCollection);

        $this->subject->validate($assessmentTestSession, $responses);
    }
}