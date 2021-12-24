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
use oat\taoDelivery\model\execution\DeliveryServerService;
use oat\taoQtiTest\models\classes\tasks\ResultTransmission\Exception\ResultTransmissionTaskValidationException;
use taoQtiCommon_helpers_ResultTransmitter;

abstract class AbstractResultTransmissionTask extends AbstractAction
{
    public const EXECUTION_ID_PARAMETER_KEY = 'deliveryExecutionId';
    public const VARIABLES_PARAMETER_KEY = 'variables';
    public const TRANSMISSION_ID_PARAMETER_KEY = 'transmissionId';
    public const ITEM_URI_PARAMETER_KEY = 'itemUri';
    public const TEST_URI_PARAMETER_KEY = 'testUri';

    protected const REQUIRED_PARAMS = [];

    abstract public function __invoke($params);

    /**
     * @throws ResultTransmissionTaskValidationException
     */
    protected function validateParams(array $params): void
    {
        $validationErrors = [];
        foreach (self::REQUIRED_PARAMS as $param_key) {
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

    protected function buildTransmitter(string $deliveryExecutionId): taoQtiCommon_helpers_ResultTransmitter
    {
        /** @var DeliveryServerService $deliveryServerService */
        $deliveryServerService = $this->getServiceManager()->get(DeliveryServerService::SERVICE_ID);
        $resultStore = $deliveryServerService->getResultStoreWrapper($deliveryExecutionId);

        return new taoQtiCommon_helpers_ResultTransmitter($resultStore);
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
}
