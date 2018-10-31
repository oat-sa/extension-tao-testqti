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

class KvToolsStateStorage extends ToolsStateStorage
{
    const PREFIX_STATES = 'ToolsStateStorage:states';
    const ALLOW_PARTIAL_UPDATES = true;

    /**
     * @return \common_persistence_AdvKeyValuePersistence
     * @throws \common_exception_Error
     */
    protected function getPersistence()
    {
        $persistence = parent::getPersistence();
        if (!$persistence instanceof \common_persistence_AdvKeyValuePersistence) {
            throw new \common_exception_Error('Given persistence should be of key-value type');
        }
        return $persistence;
    }

    /**
     * @inheritdoc
     *
     * @throws \common_exception_Error
     */
    public function storeStates($deliveryExecutionId, $states)
    {
        // handle possible partial update
        if (self::ALLOW_PARTIAL_UPDATES) {
            $fetchedStates = $this->getStates($deliveryExecutionId);
            foreach ($fetchedStates as $toolName => $fetchedState) {
                if (!array_key_exists($toolName, $states)) {
                    $states[$toolName] = $fetchedState;
                }
            }
        }

        $this->getPersistence()->hmSet(self::PREFIX_STATES . $deliveryExecutionId, $states);
    }

    /**
     * @inheritdoc
     *
     * @throws \common_exception_Error
     */
    public function getStates($deliveryExecutionId)
    {
        return $this->getPersistence()->hGetAll(self::PREFIX_STATES . $deliveryExecutionId);
    }

    /**
     * @inheritdoc
     *
     * @throws \common_exception_Error
     */
    public function deleteStates($deoliveryExecutionId)
    {
        return $this->getPersistence()->del(self::PREFIX_STATES . $deoliveryExecutionId);
    }
}
