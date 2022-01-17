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

use oat\oatbox\extension\AbstractAction;
use oat\oatbox\service\ServiceManager;
use oat\tao\model\taskQueue\Task\QueueAssociableInterface;
use oat\tao\model\taskQueue\TaskAggregation\TaskAggregationService;
use oat\taoOutcomeRds\model\FlushableRdsResultStorage;
use oat\taoQtiTest\models\classes\tasks\ResultTransmission\Exception\ResultTransmissionTaskValidationException;
use qtism\common\datatypes\QtiFile;
use taoQtiCommon_helpers_Utils;

abstract class AbstractResultTransmissionTask extends AbstractAction implements QueueAssociableInterface
{
    public const QUEUE_NAME = 'queue';
    public const MAX_AGGREGATION_TASK_COUNT = 20;

    public const EXECUTION_ID_PARAMETER_KEY = 'deliveryExecutionId';
    public const VARIABLES_PARAMETER_KEY = 'variables';
    public const TRANSMISSION_ID_PARAMETER_KEY = 'transmissionId';
    public const ITEM_URI_PARAMETER_KEY = 'itemUri';
    public const TEST_URI_PARAMETER_KEY = 'testUri';

    protected const REQUIRED_PARAMS = [];

    /** @var TaskAggregationService */
    protected $taskAggregationService;
    /** @var FlushableRdsResultStorage */
    protected $flushableResultStorage;

    public function __construct()
    {
        $this->taskAggregationService = $this->getTaskAggregationService();
        $this->flushableResultStorage = $this->getFlushableResultStorage();

    }

    abstract public function __invoke($params);

    public function getQueueName(array $params = []): string
    {
        return static::QUEUE_NAME;
    }

    /**
     * @throws ResultTransmissionTaskValidationException
     */
    protected function validateParams(array $params): void
    {
        $validationErrors = [];
        foreach (static::REQUIRED_PARAMS as $param_key) {
            if (!isset($params[$param_key])) {
                $validationErrors[] = $param_key;
            }
        }
        if (count($validationErrors) > 0) {
            throw new ResultTransmissionTaskValidationException(sprintf(
                'Absent required parameters: %s',
                implode(', ', $validationErrors)
            ));
        }
    }

    /**
     * @return array<string, array> - filtered by validation task params by taskId
     */
    protected function getValidateAggregatedTaskParams(): array
    {
        $aggregatedTaskParams = $this->taskAggregationService->extractTaskParamsForAggregation(
            static::QUEUE_NAME,
            static::MAX_AGGREGATION_TASK_COUNT
        );
        foreach ($aggregatedTaskParams as $taskId => $taskParam) {
            try {
                $this->validateParams($taskParam);
            } catch (ResultTransmissionTaskValidationException $e) {
                $this->getLogger()->error($e->getMessage(), ['exception' => $e]);
                $this->taskAggregationService->ackFailure(self::QUEUE_NAME, $taskId, $e->getMessage());
                unset($aggregatedTaskParams[$taskId]);
            }
        }
        return $aggregatedTaskParams;
    }

    protected function unpackVariables(array $variables): array
    {
        return array_map(static function ($record) {
            if (($data = @unserialize($record)) !== false) {
                return $data;
            }
            return $record;
        }, $variables);
    }

    /**
     * Transform a QTI Datatype value to a value compliant
     * with result server.
     *
     * @param mixed $value
     * @return string
     */
    protected static function transformValue($value)
    {
        if (is_object($value)) {
            if ($value instanceof QtiFile) {
                return taoQtiCommon_helpers_Utils::qtiFileToString($value);
            }

            return $value->__toString();
        }

        return $value;
    }

    private function getTaskAggregationService(): TaskAggregationService
    {
        return ServiceManager::getServiceManager()->getContainer()->get(TaskAggregationService::class);
    }

    private function getFlushableResultStorage(): FlushableRdsResultStorage
    {
        $flushableResultItemStorage = new FlushableRdsResultStorage();
        $flushableResultItemStorage->setServiceManager(ServiceManager::getServiceManager());
        return $flushableResultItemStorage;
    }
}
