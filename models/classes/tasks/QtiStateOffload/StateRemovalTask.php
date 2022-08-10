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
use common_report_Report as Report;
use oat\oatbox\service\exception\InvalidServiceManagerException;
use oat\tao\model\state\StateMigration;
use oat\tao\model\taskQueue\Task\TaskAwareInterface;
use oat\tao\model\taskQueue\Task\TaskAwareTrait;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\NotFoundExceptionInterface;

class StateRemovalTask extends AbstractQtiStateManipulationTask
{
    protected function manipulateState(string $userId, string $callId, string $stateLabel): Report
    {
        $loggerContext = [
            'userId' => $userId,
            'callId' => $callId,
            'stateType' => $stateLabel
        ];

        try {
            $this->getStateMigrationService()->removeState($userId, $callId);

            $this->getLogger()->info(
                sprintf('%s state has been deleted', $stateLabel),
                $loggerContext
            );
            return Report::createSuccess(
                sprintf(
                    '[%s] - %s state was successfully removed for user %s',
                    $callId,
                    $stateLabel,
                    $userId
                )
            );
        } catch (Exception $exception) {
            $this->getLogger()->warning(
                sprintf('Failed to delete %s state', $stateLabel),
                $loggerContext
            );
            return Report::createFailure(
                sprintf(
                    '[%s] - %s state removing failed for user %s',
                    $callId,
                    $stateLabel,
                    $userId
                )
            );
        }
    }
}
