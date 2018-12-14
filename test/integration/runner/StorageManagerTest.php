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
use oat\taoQtiTest\models\runner\StorageManager;
use Prophecy\Argument;
use Prophecy\Prophet;

/**
 * Class StorageManagerTest
 * @package oat\taoQtiTest\test\integration\runner
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
class StorageManagerTest extends GenerisPhpUnitTestRunner
{
    /**
     * @throws \common_ext_ExtensionException
     */
    public function setUp()
    {
        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
    }

    /**
     * Tests the storage component of StorageManager
     */
    public function testStorage()
    {
        $prophet = new Prophet();
        $mockStorageService = $prophet->prophesize(StateStorage::class)->reveal();
        $mockStorage = $prophet->prophesize(StateStorage::class)->reveal();

        $storageManager = new StorageManager([]);
        $storageManager->setServiceLocator($this->getServiceLocatorMock([
            StateStorage::SERVICE_ID => $mockStorageService
        ]));

        $this->assertInstanceOf(StateStorage::class, $storageManager->getStorage());
        $this->assertEquals($mockStorageService, $storageManager->getStorage());

        $storageManager->setStorage($mockStorage);

        $this->assertEquals($mockStorage, $storageManager->getStorage());
    }

    /**
     * Test the StorageManager::get() method
     */
    public function testGet()
    {
        $cachedData = 'this is a test';
        $userId = 'user123';
        $callId = '456';
        $buffer = [
            $userId => [
                $callId => $cachedData
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
        $mockStorage = $prophecy->reveal();

        $storageManager = new StorageManager([]);
        $storageManager->setServiceLocator($this->getServiceLocatorMock([
            StateStorage::SERVICE_ID => $mockStorage
        ]));

        $this->assertEquals($cachedData, $storageManager->get($userId, $callId));
        $this->assertEquals(null, $storageManager->get('foo', $callId));
        $this->assertEquals(null, $storageManager->get($userId, 'foo'));
        $this->assertEquals(null, $storageManager->get('foo', 'foo'));
    }

    /**
     * Test the StorageManager::set() method
     */
    public function testSet()
    {
        $data1 = 'this is a test';
        $data2 = 'this is another test';
        $userId = 'user123';
        $callId = '456';

        $prophet = new Prophet();
        $prophecy = $prophet->prophesize(StateStorage::class);
        $prophecy->get(Argument::type('string'), Argument::type('string'))->willReturn(null);
        $prophecy->set(Argument::type('string'), Argument::type('string'), Argument::type('string'))->willThrow(new \Exception('Set() should not be called!'));
        $mockStorage = $prophecy->reveal();

        $storageManager = new StorageManager([]);
        $storageManager->setServiceLocator($this->getServiceLocatorMock([
            StateStorage::SERVICE_ID => $mockStorage
        ]));

        $this->assertEquals(null, $storageManager->get($userId, $callId));

        $this->assertEquals(true, $storageManager->set($userId, $callId, $data1));
        $this->assertEquals($data1, $storageManager->get($userId, $callId));

        $this->assertEquals(true, $storageManager->set($userId, $callId, $data2));
        $this->assertEquals($data2, $storageManager->get($userId, $callId));
    }

    /**
     * Test the StorageManager::has() method
     */
    public function testHas()
    {
        $data1 = 'this is a test';
        $data2 = 'this is another test';
        $userId = 'user123';
        $callId = '456';
        $buffer = [
            $userId => [
                $callId => $data1
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
        $prophecy->has(Argument::type('string'), Argument::type('string'))->will(function ($args) use (&$buffer) {
            return isset($buffer[$args[0]]) && isset($buffer[$args[0]][$args[1]]);
        });
        $prophecy->set(Argument::type('string'), Argument::type('string'), Argument::type('string'))->willThrow(new \Exception('Set() should not be called!'));
        $mockStorage = $prophecy->reveal();

        $storageManager = new StorageManager([]);
        $storageManager->setServiceLocator($this->getServiceLocatorMock([
            StateStorage::SERVICE_ID => $mockStorage
        ]));

        $this->assertEquals(true, $storageManager->has($userId, $callId));
        $this->assertEquals($data1, $storageManager->get($userId, $callId));

        $this->assertEquals(false, $storageManager->has('foo', 'bar'));
        $this->assertEquals(null, $storageManager->get('foo', 'bar'));

        $this->assertEquals(true, $storageManager->set('foo', 'bar', $data2));
        $this->assertEquals(true, $storageManager->has('foo', 'bar'));
        $this->assertEquals($data2, $storageManager->get('foo', 'bar'));
    }

    /**
     * Test the StorageManager::del() method
     */
    public function testDel()
    {
        $data1 = 'this is a test';
        $data2 = 'this is another test';
        $userId = 'user123';
        $callId = '456';
        $buffer = [
            $userId => [
                $callId => $data1
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
        $prophecy->has(Argument::type('string'), Argument::type('string'))->will(function ($args) use (&$buffer) {
            return isset($buffer[$args[0]]) && isset($buffer[$args[0]][$args[1]]);
        });
        $prophecy->set(Argument::type('string'), Argument::type('string'), Argument::type('string'))->willThrow(new \Exception('Set() should not be called!'));
        $prophecy->del(Argument::type('string'), Argument::type('string'))->willThrow(new \Exception('Del() should not be called!'));

        $mockStorage = $prophecy->reveal();

        $storageManager = new StorageManager([]);
        $storageManager->setServiceLocator($this->getServiceLocatorMock([
            StateStorage::SERVICE_ID => $mockStorage
        ]));

        $this->assertEquals(true, $storageManager->has($userId, $callId));
        $this->assertEquals($data1, $storageManager->get($userId, $callId));

        $this->assertEquals(true, $storageManager->del($userId, $callId));
        $this->assertEquals(false, $storageManager->has($userId, $callId));
        $this->assertEquals(null, $storageManager->get($userId, $callId));

        $this->assertEquals(null, $storageManager->get('foo', 'bar'));
        $this->assertEquals(true, $storageManager->set('foo', 'bar', $data2));
        $this->assertEquals(true, $storageManager->has('foo', 'bar'));
        $this->assertEquals($data2, $storageManager->get('foo', 'bar'));

        $this->assertEquals(true, $storageManager->del('foo', 'bar'));
        $this->assertEquals(false, $storageManager->has('foo', 'bar'));
        $this->assertEquals(null, $storageManager->get('foo', 'bar'));
    }

    /**
     * Test the StorageManager::persist() method
     */
    public function testPersist()
    {
        $data1 = 'this is a test';
        $data2 = 'this is another test';
        $userId = 'user123';
        $callId = '456';
        $buffer = [
            $userId => [
                $callId => $data1
            ]
        ];

        $expectedBuffer0 = $buffer;

        $expectedBuffer1 = [
            $userId => [
                $callId => $data2
            ],
            'foo' => [
                'bar' => 'foo bar'
            ]
        ];

        $expectedBuffer2 = [
            $userId => [
                $callId => $data2
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
        
        $this->assertEquals(true, $storageManager->has($userId, $callId));
        $this->assertEquals($data1, $storageManager->get($userId, $callId));

        $this->assertEquals(true, $storageManager->set($userId, $callId, $data2));
        $this->assertEquals($data2, $storageManager->get($userId, $callId));

        $this->assertEquals(false, $storageManager->has('foo', 'bar'));
        $this->assertEquals(null, $storageManager->get('foo', 'bar'));
        $this->assertEquals(true, $storageManager->set('foo', 'bar', 'foo bar'));
        $this->assertEquals(true, $storageManager->has('foo', 'bar'));
        $this->assertEquals('foo bar', $storageManager->get('foo', 'bar'));

        $this->assertEquals($expectedBuffer0, $buffer);

        $this->assertEquals(true, $storageManager->persist());

        $this->assertEquals($expectedBuffer1, $buffer);

        $this->assertEquals(true, $storageManager->del('foo', 'bar'));
        $this->assertEquals(false, $storageManager->has('foo', 'bar'));
        $this->assertEquals(null, $storageManager->get('foo', 'bar'));

        $this->assertEquals($expectedBuffer1, $buffer);

        $this->assertEquals(true, $storageManager->persist());

        $this->assertEquals($expectedBuffer2, $buffer);
    }

    /**
     * Test the StorageManager::persist(userId, callId) method
     */
    public function testPersistEntry()
    {
        $data1 = 'this is a test';
        $data2 = 'this is another test';
        $userId = 'user123';
        $callId = '456';
        $buffer = [
            $userId => [
                $callId => $data1
            ]
        ];

        $expectedBuffer0 = $buffer;

        $expectedBuffer1 = [
            $userId => [
                $callId => $data1
            ],
            'foo' => [
                'bar' => 'foo bar'
            ]
        ];
        
        $expectedBuffer2 = [
            $userId => [
                $callId => $data2
            ],
            'foo' => [
                'bar' => 'foo bar'
            ]
        ];

        $expectedBuffer3 = [
            $userId => [
                $callId => $data2
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

        $this->assertEquals(true, $storageManager->has($userId, $callId));
        $this->assertEquals($data1, $storageManager->get($userId, $callId));

        $this->assertEquals(true, $storageManager->set($userId, $callId, $data2));
        $this->assertEquals($data2, $storageManager->get($userId, $callId));

        $this->assertEquals(false, $storageManager->has('foo', 'bar'));
        $this->assertEquals(null, $storageManager->get('foo', 'bar'));
        $this->assertEquals(true, $storageManager->set('foo', 'bar', 'foo bar'));
        $this->assertEquals(true, $storageManager->has('foo', 'bar'));
        $this->assertEquals('foo bar', $storageManager->get('foo', 'bar'));

        $this->assertEquals($expectedBuffer0, $buffer);

        $this->assertEquals(true, $storageManager->persist('foo', 'bar'));

        $this->assertEquals($expectedBuffer1, $buffer);

        $this->assertEquals(true, $storageManager->del('foo', 'bar'));
        $this->assertEquals(false, $storageManager->has('foo', 'bar'));
        $this->assertEquals(null, $storageManager->get('foo', 'bar'));

        $this->assertEquals($expectedBuffer1, $buffer);

        $this->assertEquals(true, $storageManager->persist($userId, $callId));

        $this->assertEquals($expectedBuffer2, $buffer);
        
        $this->assertEquals(true, $storageManager->persist());

        $this->assertEquals($expectedBuffer3, $buffer);
    }
}
