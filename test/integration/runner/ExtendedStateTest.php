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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 *
 */


namespace oat\taoQtiTest\test\integration\runner;

use oat\generis\test\GenerisPhpUnitTestRunner;
use oat\tao\model\state\StateStorage;
use oat\taoQtiTest\models\runner\ExtendedState;
use oat\taoQtiTest\models\runner\StorageManager;
use Prophecy\Argument;
use Prophecy\Prophet;

/**
 * Class ExtendedStateTest
 * @package oat\taoQtiTest\test\integration\runner
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
class ExtendedStateTest extends GenerisPhpUnitTestRunner
{
    /**
     * @throws \common_ext_ExtensionException
     */
    public function setUp()
    {
        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
    }

    /**
     * Tests the constructor of ExtendedState
     */
    public function testContructor()
    {
        $testSessionId = 'http://tao.ce/foo#12345';
        $userId = 'http://tao.ce/bar#4567';
        $extendedState = new ExtendedState($testSessionId, $userId);
        $this->assertEquals($testSessionId, $extendedState->getTestSessionId());
        $this->assertEquals($userId, $extendedState->getUserId());
    }

    /**
     * Tests the setters of ExtendedState
     */
    public function testSetters()
    {
        $testSessionId = 'http://tao.ce/foo#12345';
        $userId = 'http://tao.ce/bar#4567';
        $extendedState = new ExtendedState();
        $this->assertEquals(null, $extendedState->getTestSessionId());
        $this->assertEquals(null, $extendedState->getUserId());

        $extendedState->setTestSessionId($testSessionId);
        $extendedState->setUserId($userId);

        $this->assertEquals($testSessionId, $extendedState->getTestSessionId());
        $this->assertEquals($userId, $extendedState->getUserId());
    }

    /**
     * Tests the storage setters of ExtendedState
     */
    public function testStorageSetters()
    {
        $prophet = new Prophet();
        $mockStorageService = $prophet->prophesize(StateStorage::class)->reveal();
        $mockStorage = $prophet->prophesize(StateStorage::class)->reveal();

        $extendedState = new ExtendedState();
        $extendedState->setServiceLocator($this->getServiceLocatorMock([
            StorageManager::SERVICE_ID => $mockStorageService
        ]));

        $this->assertInstanceOf(StateStorage::class, $extendedState->getStorage());
        $this->assertEquals($mockStorageService, $extendedState->getStorage());

        $extendedState->setStorage($mockStorage);

        $this->assertEquals($mockStorage, $extendedState->getStorage());
    }

    /**
     * Tests the storage key builder from ExtendedState
     */
    public function testStorageKey()
    {
        $testSessionId = 'http://tao.ce/foo#12345';
        $extendedState = new ExtendedState($testSessionId);
        $this->assertEquals(ExtendedState::STORAGE_PREFIX . $testSessionId, $extendedState->getStorageKey());
    }

    /**
     * Tests the item flags setters from ExtendedState
     */
    public function testItemFlag()
    {
        $extendedState = new ExtendedState();

        $itemRef = 'http://tao.ce/foo#12345';
        $this->assertEquals(false, $extendedState->getItemFlag($itemRef));
        $this->assertEquals($extendedState, $extendedState->setItemFlag($itemRef, true));
        $this->assertEquals(true, $extendedState->getItemFlag($itemRef));
        $this->assertEquals($extendedState, $extendedState->setItemFlag($itemRef, false));
        $this->assertEquals(false, $extendedState->getItemFlag($itemRef));
    }

    /**
     * Tests the store id setters from ExtendedState
     */
    public function testStoreId()
    {
        $extendedState = new ExtendedState();

        $storeId = 'fooBar';
        $this->assertEquals(false, $extendedState->getStoreId());
        $this->assertEquals($extendedState, $extendedState->setStoreId($storeId));
        $this->assertEquals($storeId, $extendedState->getStoreId());
    }

    /**
     * Tests the items table setters from ExtendedState
     */
    public function testItemHrefIndex()
    {
        $extendedState = new ExtendedState();

        $index = [
            'foo' => 'bar'
        ];
        $this->assertEquals([], $extendedState->getItemHrefIndex());
        $this->assertEquals($extendedState, $extendedState->setItemHrefIndex($index));
        $this->assertEquals($index, $extendedState->getItemHrefIndex());
    }

    /**
     * Tests the events setters from ExtendedState
     */
    public function testEvents()
    {
        $extendedState = new ExtendedState();

        $this->assertEquals([], $extendedState->getEvents());

        $eventName = 'foo';
        $eventData = ['foo' => 'bar'];
        $eventId = $extendedState->addEvent($eventName, $eventData);

        $this->assertInternalType('string', $eventId);

        $events = $extendedState->getEvents();
        $this->assertEquals(1, count($events));
        $this->assertTrue(isset($events[$eventId]));

        $this->assertFalse($extendedState->removeEvents(['bar']));
        $this->assertEquals($events, $extendedState->getEvents());

        $this->assertTrue($extendedState->removeEvents([$eventId]));
        $this->assertEquals([], $extendedState->getEvents());

        $eventId = $extendedState->addEvent($eventName, $eventData);
        $events = $extendedState->getEvents();
        $this->assertEquals(1, count($events));
        $this->assertTrue(isset($events[$eventId]));

        $this->assertEquals($extendedState, $extendedState->clearEvents());
        $this->assertEquals([], $extendedState->getEvents());
    }

    /**
     * Tests the CAT setters from ExtendedState
     */
    public function testCat()
    {
        $extendedState = new ExtendedState();

        $assessmentSectionId = 'sectionFoo';
        $key = 'foo';
        $value = 'bar';

        $this->assertEquals(null, $extendedState->getCatValue($assessmentSectionId, $key));
        $this->assertEquals($extendedState, $extendedState->setCatValue($assessmentSectionId, $key, $value));
        $this->assertEquals($value, $extendedState->getCatValue($assessmentSectionId, $key));
        $this->assertEquals($extendedState, $extendedState->removeCatValue($assessmentSectionId, $key));
        $this->assertEquals(null, $extendedState->getCatValue($assessmentSectionId, $key));
    }

    /**
     * Tests the storage of ExtendedState
     */
    public function testStorage()
    {
        $assessmentSectionId = 'sectionFoo';
        $key = 'foo';
        $value = 'bar';
        $itemId = 'foo';
        $itemHref = 'http://tao.ce/fooItem#12345';
        $testSessionId = 'http://tao.ce/foo#12345';
        $userId = 'http://tao.ce/bar#4567';
        $storeId = 'fooBar';
        $JSON = [
            ExtendedState::VAR_REVIEW => [
                $itemId => true
            ],
            ExtendedState::VAR_HREF_INDEX => [
                $itemId => $itemHref
            ]
        ];
        $JSON2 = [
            ExtendedState::VAR_REVIEW => [
                $itemId => false
            ],
            ExtendedState::VAR_HREF_INDEX => [
                $itemId => $itemHref
            ],
            ExtendedState::VAR_CAT => [
                $assessmentSectionId => [
                    $key => $value
                ]
            ],
            ExtendedState::VAR_STORE_ID => $storeId
        ];        
        $storedJSON = json_encode($JSON);
        $storedJSON2 = json_encode($JSON2);
        $storageKey = ExtendedState::getStorageKeyFromTestSessionId($testSessionId);
        $buffer = [
            $userId => [
                $storageKey => $storedJSON
            ]
        ];

        $prophet = new Prophet();
        $prophecy = $prophet->prophesize(StateStorage::class);
        $prophecy->get(Argument::type('string'), Argument::type('string'))->will(function ($args) use (&$buffer) {
            if (isset($buffer[$args[0]]) && isset($buffer[$args[0]][$args[1]])) {
                return $buffer[$args[0]][$args[1]];
            }
            return null;
        });
        $prophecy->set(Argument::type('string'), Argument::type('string'), Argument::type('string'))->will(function ($args) use (&$buffer) {
            $buffer[$args[0]][$args[1]] = $args[2];
            return true;
        });
        $prophecy->has(Argument::type('string'), Argument::type('string'))->will(function ($args) use (&$buffer) {
            return isset($buffer[$args[0]]) && isset($buffer[$args[0]][$args[1]]);
        });
        $prophecy->del(Argument::type('string'), Argument::type('string'))->will(function ($args) use (&$buffer) {
            if (isset($buffer[$args[0]])) {
                if (isset($buffer[$args[0]][$args[1]])) {
                    unset($buffer[$args[0]][$args[1]]);
                }
                if (empty($buffer[$args[0]])) {
                    unset($buffer[$args[0]]);
                }
            }
            return true;
        });

        $mockStorage = $prophecy->reveal();

        $storageManager = new StorageManager([]);
        $storageManager->setServiceLocator($this->getServiceLocatorMock([
            StateStorage::SERVICE_ID => $mockStorage
        ]));

        
        $extendedState = new ExtendedState($testSessionId, $userId);
        $extendedState->setServiceLocator($this->getServiceLocatorMock([
            StorageManager::SERVICE_ID => $storageManager
        ]));

        $this->assertTrue($extendedState->load());
        
        $this->assertTrue($extendedState->getItemFlag($itemId));
        $this->assertFalse($extendedState->getItemFlag('bar'));
        $this->assertFalse($extendedState->getStoreId());
        $this->assertEquals(null, $extendedState->getCatValue($assessmentSectionId, $key));
        $this->assertEquals($JSON[ExtendedState::VAR_HREF_INDEX], $extendedState->getItemHrefIndex());

        $extendedState->setCatValue($assessmentSectionId, $key, $value);
        $extendedState->setItemFlag($itemId, false);
        $extendedState->setStoreId($storeId);

        $this->assertTrue($extendedState->save());
        $this->assertEquals($buffer[$userId][$storageKey], $storedJSON);
        $storageManager->persist();
        $this->assertEquals($buffer[$userId][$storageKey], $storedJSON2);
    }
}
