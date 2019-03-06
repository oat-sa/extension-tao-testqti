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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiTest\scripts\tools;

use common_report_Report as Report;
use oat\oatbox\extension\AbstractAction;
use oat\taoQtiTest\models\runner\toolsStates\KvToolsStateStorage;
use oat\taoQtiTest\models\runner\toolsStates\NoStorage;
use oat\taoQtiTest\models\runner\toolsStates\RdsToolsStateStorage;
use oat\taoQtiTest\models\runner\toolsStates\ToolsStateStorage;

/**
 * Register given implementation of 'ToolsStateStorage' and prepares the storage, if needed
 *
 * Class InstallRdsToolsStateStorage
 * @package oat\taoQtiTest\scripts\install
 */
class SetStateStorageForTools extends AbstractAction
{
    /**
     * @param array $params
     * @return Report
     * @throws \common_Exception
     * @throws \oat\oatbox\service\exception\InvalidServiceManagerException
     */
    public function __invoke($params)
    {
        if (count($params) === 0) {
            return new Report(Report::TYPE_ERROR, 'Storage type is not provided');
        }

        $storageType = $params[0];

        switch ($storageType) {
            case 'rds':
                $persistenceId = array_key_exists(1, $params) ? $params[1] : 'default';
                $persistence = $this->getPersistence($persistenceId);
                if (!$persistence) {
                    return new Report(Report::TYPE_ERROR, 'Given persistence does not exist');
                }
                $this->getServiceManager()->register(
                    ToolsStateStorage::SERVICE_ID,
                    new RdsToolsStateStorage([ToolsStateStorage::OPTION_PERSISTENCE => $persistenceId])
                );
                break;
            case 'key-value':
                if (!array_key_exists(1, $params)) {
                    return new Report(Report::TYPE_ERROR, 'Persistence is not provided');
                }
                $persistenceId = $params[1];
                $persistence = $this->getPersistence($persistenceId);
                if (!$persistence) {
                    return new Report(Report::TYPE_ERROR, 'Given persistence does not exist');
                }
                if (!$persistence instanceof \common_persistence_AdvKeyValuePersistence) {
                    throw new \common_exception_Error('Given persistence should be of key-value type');
                }
                $this->getServiceManager()->register(
                    ToolsStateStorage::SERVICE_ID,
                    new KvToolsStateStorage([ToolsStateStorage::OPTION_PERSISTENCE => $persistenceId])
                );
                break;
            case 'no-storage':
                $this->getServiceManager()->register(ToolsStateStorage::SERVICE_ID, new NoStorage([]));
                break;
            default:
                return new Report(Report::TYPE_ERROR, 'Allowed storage types are: rds, key-value, no-storage');
        }

        return new Report(Report::TYPE_SUCCESS, 'Tool states service registered');
    }

    /**
     * @param string $persistenceId
     * @return \common_persistence_Persistence|null
     */
    private function getPersistence($persistenceId)
    {
        try {
            /** @var \common_persistence_Manager $persistenceManager */
            $persistenceManager = $this->getServiceLocator()->get(\common_persistence_Manager::SERVICE_KEY);
            $persistence = $persistenceManager->getPersistenceById($persistenceId);
            return $persistence;
        } catch (\common_Exception $e) {
            return null;
        }
    }
}
