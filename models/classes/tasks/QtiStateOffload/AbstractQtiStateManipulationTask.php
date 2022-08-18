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

namespace oat\taoQtiTest\models\classes\tasks\QtiStateOffload;

use InvalidArgumentException;
use oat\oatbox\extension\AbstractAction;
use common_report_Report as Report;
use oat\oatbox\service\exception\InvalidServiceManagerException;
use oat\tao\model\state\StateMigration;
use oat\tao\model\taskQueue\Task\TaskAwareInterface;
use oat\tao\model\taskQueue\Task\TaskAwareTrait;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\NotFoundExceptionInterface;

abstract class AbstractQtiStateManipulationTask extends AbstractAction implements TaskAwareInterface
{
    use TaskAwareTrait;

    public const PARAM_USER_ID_KEY = 'userId';
    public const PARAM_CALL_ID_KEY = 'callId';
    public const PARAM_STATE_LABEL_KEY = 'stateLabel';

    public function __invoke($params): Report
    {
        [$userId, $callId, $stateLabel] = $this->validateParameters($params);

        return $this->manipulateState($userId, $callId, $stateLabel);
    }

    abstract protected function manipulateState(string $userId, string $callId, string $stateLabel): Report;

    /**
     * @param $params
     * @return array [$userId, $callId, $stateLabel]
     */
    private function validateParameters($params): array
    {
        if (!isset(
            $params[self::PARAM_USER_ID_KEY],
            $params[self::PARAM_CALL_ID_KEY],
            $params[self::PARAM_STATE_LABEL_KEY]
        )) {
            throw new InvalidArgumentException('[%s] Invalid parameter set was provided', self::class);
        }

        return [
            $params[self::PARAM_USER_ID_KEY],
            $params[self::PARAM_CALL_ID_KEY],
            $params[self::PARAM_STATE_LABEL_KEY]
        ];
    }


    /**
     * @throws ContainerExceptionInterface
     * @throws NotFoundExceptionInterface
     * @throws InvalidServiceManagerException
     */
    protected function getStateMigrationService(): StateMigration
    {
        return $this->getServiceLocator()->get(StateMigration::SERVICE_ID);
    }
}
