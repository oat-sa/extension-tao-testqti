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

namespace oat\taoQtiTest\model\Infrastructure;

use common_exception_Error;
use oat\taoQtiTest\models\runner\QtiRunnerEmptyResponsesException;
use oat\taoQtiTest\models\runner\RunnerServiceContext;
use qtism\runtime\common\State;
use qtism\runtime\tests\AssessmentItemSessionException;

class QtiItemResponseValidator
{
    /**
     * @throws AssessmentItemSessionException
     * @throws common_exception_Error
     * @throws QtiRunnerEmptyResponsesException
     */
    public function validate(RunnerServiceContext $serviceContext, State $responses): void
    {
        if ($this->getAllowSkip($serviceContext) && $responses->containsNullOnly()) {
            return;
        }

        if (!$this->getAllowSkip($serviceContext) && $responses->containsNullOnly()) {
            throw new QtiRunnerEmptyResponsesException();
        }

        if ($this->getResponseValidation($serviceContext)) {
            $serviceContext->getTestSession()->getCurrentAssessmentItemSession()->checkResponseValidityConstraints($responses);
        }

    }

    private function getResponseValidation(RunnerServiceContext $serviceContext): bool
    {
        return $serviceContext->getTestSession()
            ->getRoute()
            ->current()
            ->getItemSessionControl()
            ->getItemSessionControl()
            ->mustValidateResponses();
    }

    private function getAllowSkip(RunnerServiceContext $serviceContext): bool
    {
        return $serviceContext->getTestSession()
            ->getRoute()
            ->current()
            ->getItemSessionControl()
            ->getItemSessionControl()
            ->doesAllowSkipping();
    }
}
