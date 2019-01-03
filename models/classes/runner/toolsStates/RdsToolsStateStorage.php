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

use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\DBAL\Query\QueryBuilder;

class RdsToolsStateStorage extends ToolsStateStorage
{
    /**
     * Constants for the database creation and data access
     *
     */
    const TABLE_NAME = 'runner_tool_states';
    const COLUMN_DELIVERY_EXECUTION_ID = 'delivery_execution_id';
    const COLUMN_TOOL_NAME = 'tool_name';
    const COLUMN_TOOL_STATE = 'tool_state';

    /**
     * @return \common_persistence_SqlPersistence
     * @throws \oat\oatbox\service\exception\InvalidServiceManagerException
     */
    protected function getPersistence()
    {
        $persistenceId = $this->getOption(self::OPTION_PERSISTENCE) ?: 'default';
        return $this->getServiceLocator()->get(\common_persistence_Manager::SERVICE_ID)->getPersistenceById($persistenceId);
    }

    /**
     * @return QueryBuilder
     * @throws \oat\oatbox\service\exception\InvalidServiceManagerException
     */
    private function getQueryBuilder()
    {
        /**@var \common_persistence_sql_pdo_mysql_Driver $driver */
        return $this->getPersistence()->getPlatForm()->getQueryBuilder();
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
        $qb = $this->getQueryBuilder()
            ->update(self::TABLE_NAME)
            ->set(self::COLUMN_TOOL_STATE, ':state')
            ->where(self::COLUMN_DELIVERY_EXECUTION_ID .' = :delivery_execution_id')
            ->andWhere(self::COLUMN_TOOL_NAME .' = :tool_name')
            ->setParameter('state', $state)
            ->setParameter('delivery_execution_id', $deliveryExecutionId)
            ->setParameter('tool_name', $toolName);

        return $qb->execute() !== 0;
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
                        self::COLUMN_DELIVERY_EXECUTION_ID => $deliveryExecutionId,
                        self::COLUMN_TOOL_NAME => $toolName,
                        self::COLUMN_TOOL_STATE => $state,
                    ]);
                } catch (\PDOException $exception) {
                    // when PDO implementation of RDS is used as a persistence
                    // unfortunately the exception is very broad so it can cover more than intended cases
                } catch (UniqueConstraintViolationException $exception) {
                    // when DBAL implementation of RDS is used as a persistence
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
            ->where(self::COLUMN_DELIVERY_EXECUTION_ID . ' = :delivery_execution_id')
            ->setParameter('delivery_execution_id', $deliveryExecutionId);

        $returnValue = [];

        foreach ($qb->execute()->fetchAll() as $variable) {
            $returnValue[$variable[self::COLUMN_TOOL_NAME]] = $variable[self::COLUMN_TOOL_STATE];
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
        $this->getQueryBuilder()
            ->delete(self::TABLE_NAME)
            ->where(self::COLUMN_DELIVERY_EXECUTION_ID . ' = :delivery_execution_id')
            ->setParameter('delivery_execution_id', $deliveryExecutionId)
            ->execute();

        return true;
    }
}
