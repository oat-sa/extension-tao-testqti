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

use oat\generis\test\TestCase;
use oat\taoQtiTest\models\runner\toolsStates\ToolsStateStorage;

/**
 * This is an abstract class that can test through any storage type
 *
 * This is actually an integration test case!
 * But in terms of TAO we consider all as unit test if it doesn't require the system to be installed
 *
 * Class ToolsStateStorageTestCase
 * @package oat\taoQtiTest\test\unit\models\classes\runner\toolsStates
 */
abstract class ToolsStateStorageTestCase extends TestCase
{
    /**
     * @return ToolsStateStorage
     */
    abstract protected function getStorage();

    /**
     * Creates new values in the storage and checks they exist
     */
    public function testCreate()
    {
        $storage = $this->getStorage();
        $this->assertInstanceOf(ToolsStateStorage::class, $storage);

        $states = [
            'highlighter' => 'highlighter-state',
            'magnifier' => 'magnifier-state',
        ];

        $storage->storeStates('deliveryExecutionToCreate', $states);

        $retrievedStates = $storage->getStates('deliveryExecutionToCreate');

        $this->assertEquals($states, $retrievedStates);
    }

    /**
     * Checks update changes values persisted in the storage
     */
    public function testUpdate()
    {
        $storage = $this->getStorage();

        // create
        $statesForCreate = [
            'highlighter' => 'highlighter-state',
            'magnifier' => 'magnifier-state',
        ];
        $storage->storeStates('deliveryExecutionToUpdate', $statesForCreate);

        // update
        $statesForUpdate = [
            'highlighter' => 'highlighter-state2',
            'magnifier' => 'magnifier-state2',
        ];
        $storage->storeStates('deliveryExecutionToUpdate', $statesForUpdate);

        $retrievedStates = $storage->getStates('deliveryExecutionToUpdate');

        $this->assertEquals($statesForUpdate, $retrievedStates);
    }

    /**
     * Checks update adds new values and keeps old ones
     */
    public function testUpdateDoesNotEraseNotPassedFields()
    {
        $storage = $this->getStorage();

        // create
        $statesForCreate = [
            'highlighter' => 'highlighter-state',
            'magnifier' => 'magnifier-state',
        ];
        $storage->storeStates('deliveryExecutionToUpdatePartially', $statesForCreate);

        // update
        $statesForUpdate = [
            'calculator' => 'calculator-state',
        ];
        $storage->storeStates('deliveryExecutionToUpdatePartially', $statesForUpdate);

        $retrievedStates = $storage->getStates('deliveryExecutionToUpdatePartially');

        $this->assertEquals(array_merge($statesForCreate, $statesForUpdate), $retrievedStates);
    }

    /**
     * Checks there aren't records in the storage after removal
     */
    public function testRemoval()
    {
        $storage = $this->getStorage();

        $states = [
            'highlighter' => 'highlighter-state',
            'magnifier' => 'magnifier-state',
        ];

        $storage->storeStates('deliveryExecutionToRemove', $states);

        $removalResult = $storage->deleteStates('deliveryExecutionToRemove');
        $this->assertTrue($removalResult);

        $retrievedStates = $storage->getStates('deliveryExecutionId');

        $this->assertEquals([], $retrievedStates);
    }
}