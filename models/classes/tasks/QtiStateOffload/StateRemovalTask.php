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

use Exception;
use InvalidArgumentException;
use oat\oatbox\extension\AbstractAction;
use oat\oatbox\service\exception\InvalidServiceManagerException;
use oat\tao\model\state\StateMigration;
use oat\tao\model\taskQueue\Task\TaskAwareInterface;
use oat\tao\model\taskQueue\Task\TaskAwareTrait;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\NotFoundExceptionInterface;

class StateRemovalTask extends AbstractAction implements TaskAwareInterface
{
    use TaskAwareTrait;

    public const PARAM_USER_ID_KEY = 'userId';
    public const PARAM_CALL_ID_KEY = 'callId';
    public const PARAM_STATE_LABEL_KEY = 'stateLabel';

    /**
     * @throws NotFoundExceptionInterface
     * @throws ContainerExceptionInterface
     * @throws InvalidServiceManagerException
     */
    public function __invoke($params)
    {
        if (!isset(
            $params[self::PARAM_USER_ID_KEY],
            $params[self::PARAM_CALL_ID_KEY],
            $params[self::PARAM_STATE_LABEL_KEY]
        )) {
            throw new InvalidArgumentException('Invalid parameter set was provided');
        }

        $userId = $params[self::PARAM_USER_ID_KEY];
        $callId = $params[self::PARAM_CALL_ID_KEY];
        $stateType = $params[self::PARAM_STATE_LABEL_KEY];

        try {
            $this->getStateMigrationService()->removeState($userId, $callId);

            $this->getLogger()->info(
                sprintf('%s state has been deleted', $stateType),
                [
                    'userId' => $userId,
                    'callId' => $callId,
                    'stateType' => $stateType
                ]
            );
        } catch (Exception $exception) {
            $this->getLogger()->warning(
                sprintf('Failed to delete %s state', $stateType),
                [
                    'userId' => $userId,
                    'callId' => $callId,
                    'stateType' => $stateType
                ]
            );
        }
    }

    /**
     * @throws ContainerExceptionInterface
     * @throws NotFoundExceptionInterface
     * @throws InvalidServiceManagerException
     */
    private function getStateMigrationService(): StateMigration
    {
        return $this->getServiceLocator()->get(StateMigration::SERVICE_ID);
    }
}
