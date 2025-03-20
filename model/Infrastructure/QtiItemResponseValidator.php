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
        if ($responses->containsNullOnly()) {
            return;
        }

        if ($this->getResponseValidation($testSession)) {
            $testSession->getCurrentAssessmentItemSession()
                ->checkResponseValidityConstraints($responses);
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
}
