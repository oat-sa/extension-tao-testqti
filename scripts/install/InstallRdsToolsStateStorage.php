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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiTest\scripts\install;

use common_report_Report as Report;
use oat\oatbox\extension\AbstractAction;
use oat\taoQtiTest\models\runner\toolsStates\RdsToolsStateStorage;
use oat\taoQtiTest\models\runner\toolsStates\ToolsStateStorage;

/**
 * Deploys the tool states schema
 *
 * Class InstallRdsToolsStateStorage
 * @package oat\taoQtiTest\scripts\install
 */
class InstallRdsToolsStateStorage extends AbstractAction
{
    /**
     * @param array $params
     * @return Report
     * @throws \common_Exception
     * @throws \oat\oatbox\service\exception\InvalidServiceManagerException
     */
    public function __invoke($params)
    {
        $persistenceId = count($params) > 0 ? reset($params) : 'default';
        /** @var \common_persistence_Persistence $persistence */
        $persistence = $this->getServiceLocator()->get(\common_persistence_Manager::SERVICE_KEY)->getPersistenceById($persistenceId);

        /** @var \common_persistence_sql_dbal_SchemaManager $schemaManager */
        $schemaManager = $persistence->getDriver()->getSchemaManager();
        $schema = $schemaManager->createSchema();
        $fromSchema = clone $schema;

        $revisionTable = $schema->createTable(RdsToolsStateStorage::TABLE_NAME);
        $revisionTable->addOption('engine', 'MyISAM');

        $revisionTable->addColumn(RdsToolsStateStorage::COLUMN_DELIVERY_EXECUTION_ID, 'string', array('notnull' => true, 'length' => 255));
        $revisionTable->addColumn(RdsToolsStateStorage::COLUMN_TOOL_NAME, 'string', array('notnull' => true, 'length' => 60));

        $longtextThreshold = 16777215 + 1;
        $revisionTable->addColumn(RdsToolsStateStorage::COLUMN_TOOL_STATE, 'string', array('notnull' => false, 'length' => $longtextThreshold));

        $revisionTable->addUniqueIndex(
            [RdsToolsStateStorage::COLUMN_DELIVERY_EXECUTION_ID, RdsToolsStateStorage::COLUMN_TOOL_NAME],
            'IDX_' . RdsToolsStateStorage::TABLE_NAME . '_' . 'execution_and_tool_name');

        $queries = $persistence->getPlatform()->getMigrateSchemaSql($fromSchema, $schema);
        foreach ($queries as $query) {
            $persistence->exec($query);
        }

        $this->getServiceManager()->register(
            ToolsStateStorage::SERVICE_ID,
            new RdsToolsStateStorage([])
        );

        return new Report(Report::TYPE_SUCCESS, 'Tool states service registered');
    }
}
