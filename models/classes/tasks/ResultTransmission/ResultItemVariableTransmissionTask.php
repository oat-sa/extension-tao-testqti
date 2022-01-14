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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\classes\tasks\ResultTransmission;

use oat\oatbox\reporting\Report;
use oat\tao\model\taskQueue\Task\TaskAwareInterface;
use oat\tao\model\taskQueue\Task\TaskAwareTrait;
use oat\taoQtiTest\models\classes\tasks\ResultTransmission\Exception\ResultTransmissionTaskValidationException;
use oat\taoResultServer\models\Exceptions\DuplicateVariableException;
use qtism\common\enums\BaseType;
use qtism\common\enums\Cardinality;
use qtism\runtime\common\OutcomeVariable;
use qtism\runtime\common\ResponseVariable;
use taoResultServer_models_classes_OutcomeVariable as taoResultServer_models_classes_OutcomeVariableAlias;
use taoResultServer_models_classes_ResponseVariable;

class ResultItemVariableTransmissionTask extends AbstractResultTransmissionTask implements TaskAwareInterface
{
    use TaskAwareTrait;

    public const QUEUE_NAME = 'result_item_var_transmission';

    protected const REQUIRED_PARAMS = [
        self::EXECUTION_ID_PARAMETER_KEY,
        self::VARIABLES_PARAMETER_KEY,
        self::TRANSMISSION_ID_PARAMETER_KEY,
    ];

    public function __invoke($params): Report
    {
        try {
            $this->validateParams($params);
        } catch (ResultTransmissionTaskValidationException $e) {
            $this->getLogger()->error($e->getMessage(), ['exception' => $e]);
            return Report::createError($e->getMessage());
        }

        $aggregatedTaskParams = $this->getValidateAggregatedTaskParams();
        $parameterSets = array_merge([$params], $aggregatedTaskParams);

        foreach ($parameterSets as $parameterSet) {
            $variables = $this->prepareItemVariable($this->unpackVariables($parameterSet[self::VARIABLES_PARAMETER_KEY]));
            $this->flushableResultStorage->storeItemVariables(
                $parameterSet[self::EXECUTION_ID_PARAMETER_KEY],
                $parameterSet[self::TEST_URI_PARAMETER_KEY] ?? '',
                $parameterSet[self::ITEM_URI_PARAMETER_KEY] ?? '',
                $variables,
                $parameterSet[self::TRANSMISSION_ID_PARAMETER_KEY]
            );
        }

        try {
            $this->flushableResultStorage->flush();
            foreach (array_keys($aggregatedTaskParams) as $taskId) {
                $this->taskAggregationService->ackSuccess(self::QUEUE_NAME, $taskId);
            }
        } catch (DuplicateVariableException $e) {
            $this->getLogger()->warning($e->getMessage());
        } catch (\Exception $e) {
            foreach (array_keys($aggregatedTaskParams) as $taskId) {
                $this->taskAggregationService->ackFailure(self::QUEUE_NAME, $taskId, $e->getMessage());
            }
            $this->getLogger()->error($e->getMessage(), ['exception' => $e]);
            return Report::createError("Result items variable transmission problem, check logs for details");
        }

        $this->getLogger()->info(sprintf(
            'Results item variable successfully transmitted for deliver execution - %s',
            $params[self::EXECUTION_ID_PARAMETER_KEY]
        ));
        return Report::createSuccess("Result item transmission succeeded");
    }

    private function prepareItemVariable(array $variables): array
    {
        $itemVariableSet = [];

        foreach ($variables as $variable) {
            $identifier = $variable->getIdentifier();

            if ($variable instanceof OutcomeVariable) {
                $value = $variable->getValue();

                $resultVariable = new taoResultServer_models_classes_OutcomeVariableAlias();
                $resultVariable->setIdentifier($identifier);
                $resultVariable->setBaseType(BaseType::getNameByConstant($variable->getBaseType()));
                $resultVariable->setCardinality(Cardinality::getNameByConstant($variable->getCardinality()));
                $resultVariable->setValue(self::transformValue($value));

                $itemVariableSet[] = $resultVariable;
            } else if ($variable instanceof ResponseVariable) {
                // ResponseVariable.
                $value = $variable->getValue();

                $resultVariable = new taoResultServer_models_classes_ResponseVariable();
                $resultVariable->setIdentifier($identifier);
                $resultVariable->setBaseType(BaseType::getNameByConstant($variable->getBaseType()));
                $resultVariable->setCardinality(Cardinality::getNameByConstant($variable->getCardinality()));
                $resultVariable->setCandidateResponse(self::transformValue($value));

                // The fact that the response is correct must not be sent for built-in
                // response variables 'duration' and 'numAttempts'.
                if (!in_array($identifier, array('duration', 'numAttempts', 'comment'))) {
                    $resultVariable->setCorrectResponse($variable->isCorrect());
                }

                $itemVariableSet[] = $resultVariable;
            }
        }

        return $itemVariableSet;
    }
}
