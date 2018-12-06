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

namespace oat\taoQtiTest\test\unit\models\classes\runner\toolsStates;

use oat\taoQtiTest\models\runner\toolsStates\RdsToolsStateStorage;
use oat\taoQtiTest\scripts\install\InstallRdsToolsStateStorage;
use Prophecy\Argument;

class KvToolsStateStorageTest extends ToolsStateStorageTestCase
{
    private $storage;

    /**
     * @return RdsToolsStateStorage
     */
    protected function getStorage()
    {
        return $this->storage;
    }

    public function setUp()
    {
        $this->markTestSkipped('Unfortunetely we don\'t have mock for common_persistence_AdvKeyValuePersistence yet. So the KV tool state storage cannot be tested.');

        // @todo put a mock storage in this->storage
    }
}