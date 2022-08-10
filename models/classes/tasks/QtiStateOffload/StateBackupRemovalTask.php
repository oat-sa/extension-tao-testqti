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
use common_report_Report as Report;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\NotFoundExceptionInterface;

class StateBackupRemovalTask extends AbstractQtiStateManipulationTask
{
    /**
     * @param string $userId
     * @param string $callId
     * @param string $stateLabel
     * @return Report
     * @throws ContainerExceptionInterface
     * @throws NotFoundExceptionInterface
     */
    protected function manipulateState(string $userId, string $callId, string $stateLabel): Report
    {
        try {
            $this->getStateMigrationService()->removeBackup($userId, $callId);

            $this->getLogger()->info(
                sprintf('%s state backup has been deleted', $stateLabel),
                [
                    'userId' => $userId,
                    'callId' => $callId,
                    'stateType' => $stateLabel
                ]
            );
            return Report::createSuccess(
                sprintf(
                    '[%s] - %s state backup was successfully removed for user %s',
                    $callId,
                    $stateLabel,
                    $userId
                )
            );
        } catch (Exception $exception) {
            $this->getLogger()->warning(
                sprintf('Failed to delete backup %s state', $stateLabel),
                [
                    'userId' => $userId,
                    'callId' => $callId,
                    'stateType' => $stateLabel
                ]
            );
            return Report::createFailure(
                sprintf(
                    '[%s] - %s state backup removing failed for user %s',
                    $callId,
                    $stateLabel,
                    $userId
                )
            );
        }
    }
}
