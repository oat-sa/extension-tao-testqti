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

namespace oat\taoQtiTest\model\Infrastructure;

use oat\taoQtiTest\models\runner\QtiRunnerEmptyResponsesException;
use qtism\runtime\common\State;
use qtism\runtime\tests\AssessmentItemSessionException;
use qtism\runtime\tests\AssessmentTestSession;

class QtiItemResponseValidator
{
    /**
     * @param AssessmentTestSession $testSession
     * @param State $responses
     * @throws AssessmentItemSessionException
     */
    public function validate(AssessmentTestSession $testSession, State $responses): void
    {
        $itemSession       = $testSession->getCurrentAssessmentItemSession();
        $item              = $itemSession->getAssessmentItem();
        $outcomeDecls      = $item->getOutcomeDeclarations();
        $responseDecls     = $item->getResponseDeclarations();
        $itemConstraints   = $item->getResponseValidityConstraints();

        $allowSkip         = $this->getAllowSkip($testSession);
        $nullOnly          = $responses->containsNullOnly();
        $validateRequired  = $this->getResponseValidation($testSession);

        $hasConstraints    = $itemConstraints->count() > 0;
        $hasResponses      = $responseDecls->count() > 0;

        [$hasScoreOutcome, $hasMaxScoreOutcome] = $this->detectScoringOutcomes($outcomeDecls);

        // Outcome presence logic:
        // - If SCORE exists - scored item
        // - Else if MAXSCORE exists and responseDeclaration exists - possibly externally or manually scored
        // - Else - informational item
        $hasOutcomes       = $hasScoreOutcome || ($hasMaxScoreOutcome && $hasResponses);
        $noDeclOrConst     = !$hasConstraints && !$hasOutcomes && !$hasResponses;

        // 1) Skip allowed & nothing answered & no forced validation
        if ($allowSkip && $nullOnly && ! $validateRequired) {
            return;
        }

        // 2) Skip allowed & nothing answered & validation *on* & no declarations/constraints
        if (!$allowSkip && $nullOnly && !$validateRequired && !$noDeclOrConst) {
            throw new QtiRunnerEmptyResponsesException();
        }

        // 3) Skip *not* allowed & nothing answered & validation *on* & no declarations/constraints
        if (!$allowSkip && $nullOnly && $validateRequired && $noDeclOrConst) {
            return;
        }

        // 4) Skip *not* allowed & nothing answered & validation *on* => error
        if (!$allowSkip && $nullOnly && $validateRequired) {
            throw new QtiRunnerEmptyResponsesException();
        }

        // 5) If skip allowed, nothing answered, validation *on* and item has constraints/outcomes/responses
        if ($allowSkip && $nullOnly && $validateRequired && $hasConstraints) {
            throw new QtiRunnerEmptyResponsesException();
        }

        // 6) If validation is on, always run the constraint check
        if ($validateRequired) {
            $itemSession->checkResponseValidityConstraints($responses);
            return;
        }

        if (!$validateRequired && $allowSkip && $hasConstraints && $hasOutcomes && $hasResponses) {
            return;
        }

        // 7) Force-enable validation when off but item *does* have constraints/outcomes/responses
        if (!$validateRequired && $hasConstraints && $hasOutcomes && $hasResponses) {
            $itemSession
            ->getItemSessionControl()
            ->setValidateResponses(true);

            $itemSession->checkResponseValidityConstraints($responses);
        }
    }

    private function getResponseValidation(AssessmentTestSession $testSession): bool
    {
        return $testSession->getRoute()
            ->current()
            ->getItemSessionControl()
            ->getItemSessionControl()
            ->mustValidateResponses();
    }

    private function getAllowSkip(AssessmentTestSession $testSession): bool
    {
        return $testSession->getRoute()
            ->current()
            ->getItemSessionControl()
            ->getItemSessionControl()
            ->doesAllowSkipping();
    }

    /**
     * Detect whether SCORE or MAXSCORE outcomes are declared.
     *
     * @param mixed $outcomeDecls Iterable collection of outcome declarations
     * @return array{0: bool, 1: bool} [hasScore, hasMaxScore]
     */
    private function detectScoringOutcomes(iterable $outcomeDecls): array
    {
        $hasScore = false;
        $hasMaxScore = false;

        if (is_iterable($outcomeDecls)) {
            foreach ($outcomeDecls as $outcomeDecl) {
                if (is_object($outcomeDecl) && method_exists($outcomeDecl, 'getIdentifier')) {
                    $identifier = strtoupper((string) $outcomeDecl->getIdentifier());
                    if ($identifier === 'SCORE') {
                        $hasScore = true;
                    } elseif ($identifier === 'MAXSCORE') {
                        $hasMaxScore = true;
                    }
                }
            }
        }

        return [$hasScore, $hasMaxScore];
    }
}
