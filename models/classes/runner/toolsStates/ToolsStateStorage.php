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

use oat\oatbox\service\ConfigurableService;

abstract class ToolsStateStorage extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/ToolsStateStorage';

    const OPTION_PERSISTENCE = 'persistence';

    /**
     * @return \common_persistence_Persistence
     */
    protected function getPersistence()
    {
        $persistenceId = $this->hasOption(self::OPTION_PERSISTENCE) ?
            $this->getOption(self::OPTION_PERSISTENCE) : 'default';
        return $this->getServiceLocator()->get(\common_persistence_Manager::SERVICE_ID)->getPersistenceById($persistenceId);
    }

    abstract public function storeStates($deliveryExecutionId, $states);

    /**
     * @param $deliveryExecutionId
     * @return array
     */
    abstract public function getStates($deliveryExecutionId);

    /**
     * @param $deoliveryExecutionId
     * @return bool whether deleted successfully
     */
    abstract public function deleteStates($deoliveryExecutionId);
}
