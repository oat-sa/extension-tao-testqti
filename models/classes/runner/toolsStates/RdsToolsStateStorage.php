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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiTest\models\runner\toolsStates;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\DBALException;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\DBAL\Query\QueryBuilder;
use oat\taoResultServer\models\classes\ResultDeliveryExecutionDelete;
use \core_kernel_classes_Resource;
use oat\oatbox\service\ConfigurableService;

class RdsToolsStateStorage extends ToolsStateStorage
{
    /**
     * Constants for the database creation and data access
     *
     */
    const TABLE_NAME = "runner_tool_states";
    const DELIVERY_EXECUTION_ID_COLUMN = 'delivery_execution_id';
    const TOOL_NAME_COLUMN = 'tool_name';
    const TOOL_STATE_COLUMN = 'tool_state';

    /**
     * @return \common_persistence_SqlPersistence
     * @throws \oat\oatbox\service\exception\InvalidServiceManagerException
     */
    protected function getPersistence()
    {
        $persistenceId = $this->hasOption(self::OPTION_PERSISTENCE) ?
            $this->getOption(self::OPTION_PERSISTENCE) : 'default';
        return $this->getServiceLocator()->get(\common_persistence_Manager::SERVICE_ID)->getPersistenceById($persistenceId);
    }

    /**
     * @return QueryBuilder
     * @throws \oat\oatbox\service\exception\InvalidServiceManagerException
     */
    private function getQueryBuilder()
    {
        /**@var \common_persistence_sql_pdo_mysql_Driver $driver */
        return $this->getPersistence()->getPlatform()->getQueryBuilder();
    }

    /**
     * Updates one state
     *
     * @param string $deliveryExecutionId
     * @param string $toolName
     * @param string $state
     * @return bool whether the value has actually changed in the storage
     * @throws \oat\oatbox\service\exception\InvalidServiceManagerException
     */
    private function updateState($deliveryExecutionId, $toolName, $state)
    {
        $sql = "UPDATE " . self::TABLE_NAME . " SET " . self::TOOL_STATE_COLUMN . " =:state
        WHERE " . self::DELIVERY_EXECUTION_ID_COLUMN . ' =:delivery_execution_id AND  ' . self::TOOL_NAME_COLUMN . ' =:tool_name';

        $rowsUpdated = $this->getPersistence()->exec($sql, [
            'state' => $state,
            'delivery_execution_id' => $deliveryExecutionId,
            'tool_name' => $toolName,
        ]);

        return $rowsUpdated !== 0;
    }

    /**
     * Updates those states which are already persisted in the storage and inserts new ones
     *
     * @param string $deliveryExecutionId
     * @param array $states
     * @throws \oat\oatbox\service\exception\InvalidServiceManagerException
     */
    public function storeStates($deliveryExecutionId, $states)
    {
        foreach ($states as $toolName => $state) {
            $hasRowActuallyChanged = $this->updateState($deliveryExecutionId, $toolName, $state);
            if (!$hasRowActuallyChanged) {
                try {
                    $this->getPersistence()->insert(self::TABLE_NAME, [
                        self::DELIVERY_EXECUTION_ID_COLUMN => $deliveryExecutionId,
                        self::TOOL_NAME_COLUMN => $toolName,
                        self::TOOL_STATE_COLUMN => $state,
                    ]);
                } catch (\PDOException $exception) {
                } catch (UniqueConstraintViolationException $exception) {
                }
            }
        };
    }

    /**
     * @param $deliveryExecutionId
     * @return array
     * @throws \oat\oatbox\service\exception\InvalidServiceManagerException
     */
    public function getStates($deliveryExecutionId)
    {
        $qb = $this->getQueryBuilder()
            ->select('*')
            ->from(self::TABLE_NAME)
            ->where(self::DELIVERY_EXECUTION_ID_COLUMN . ' = :delivery_execution_id')
            ->setParameter('delivery_execution_id', $deliveryExecutionId);

        $returnValue = [];

        foreach ($qb->execute()->fetchAll() as $variable) {
            $returnValue[$variable[self::TOOL_NAME_COLUMN]] = $variable[self::TOOL_STATE_COLUMN];
        }

        return $returnValue;
    }

    /**
     * @param string $deliveryExecutionId
     * @return bool whether deleted successfully
     * @throws \oat\oatbox\service\exception\InvalidServiceManagerException
     */
    public function deleteStates($deliveryExecutionId)
    {
        $sql = 'DELETE FROM ' . self::TABLE_NAME . '
            WHERE ' . self::DELIVERY_EXECUTION_ID_COLUMN . ' = ?';

        if ($this->getPersistence()->exec($sql, [$deliveryExecutionId]) === false) {
            return false;
        }
        return true;
    }
}
