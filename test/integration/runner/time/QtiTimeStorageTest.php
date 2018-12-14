<?php
/*
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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiTest\test\integration\runner\time;

use oat\generis\test\GenerisPhpUnitTestRunner;
use oat\tao\model\state\StateStorage;
use oat\taoQtiTest\models\runner\time\QtiTimeLine;
use oat\taoQtiTest\models\runner\time\QtiTimeStorage;
use oat\taoQtiTest\models\runner\time\storageFormat\QtiTimeStorageJsonFormat;
use oat\taoTests\models\runner\time\TimePoint;
use oat\taoTests\models\runner\time\TimeStorage;
use Prophecy\Argument;
use Prophecy\Prophet;

/**
 * Test the {@link QtiTimeStorage.php}
 *
 * @author Aleh hutnikau, <hutnikau@1pt.com>
 */
class QtiTimeStorageTest extends GenerisPhpUnitTestRunner
{
    /**
     * @var string
     */
    protected $testSessionId = 'fake_session_id';
    
    /**
     * @var string
     */
    protected $userId = 'fake_user_id';

    /**
     * @throws \common_ext_ExtensionException
     */
    public function setUp()
    {
        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
    }

    /**
     * Test the QtiTimeStorage instantiation
     */
    public function testConstructor()
    {
        $storage = new QtiTimeStorage($this->testSessionId, $this->userId);
        $this->assertInstanceOf(TimeStorage::class, $storage);
        $this->assertEquals($this->testSessionId, $this->getSessionId($storage));
    }

    /**
     * Test the QtiTimeStorage::store()
     */
    public function testStore()
    {
        $storage = new QtiTimeStorage($this->testSessionId, $this->userId);
        $buffer = [];
        $this->mockStorage($storage, $buffer);

        $result = $storage->store($this->getTimeLine());
        $this->assertEquals($storage, $result);
        $this->assertEquals($this->getTimeLine(), $result->load());
    }

    /**
     * Test the QtiTimeStorage::load()
     */
    public function testLoad()
    {
        $storage = new QtiTimeStorage($this->testSessionId, $this->userId);
        $buffer = [];
        $this->mockStorage($storage, $buffer);

        $storage->store($this->getTimeLine());
        $this->assertEquals($this->getTimeLine(), $storage->load());
    }

    /**
     * Get test session id from QtiTimeStorage instance
     *
     * @param QtiTimeStorage $storage
     * @return string
     */
    protected function getSessionId(QtiTimeStorage $storage)
    {
        $reflectionClass = new \ReflectionClass(QtiTimeStorage::class);
        $reflectionProperty = $reflectionClass->getProperty('testSessionId');
        $reflectionProperty->setAccessible(true);
        return $reflectionProperty->getValue($storage);
    }

    /**
     * @param $storage
     * @param $buffer
     */
    private function mockStorage($storage, &$buffer)
    {
        $prophet = new Prophet();
        $prophecy = $prophet->prophesize(StateStorage::class);
        $prophecy->get(Argument::type('string'), Argument::type('string'))->will(function ($args) use (&$buffer) {
            return $buffer[$args[0]][$args[1]];
        });
        $prophecy->set(Argument::type('string'), Argument::type('string'), Argument::type('string'))->will(function ($args) use (&$buffer) {
            $buffer[$args[0]][$args[1]] = $args[2];
        });
        $storage->setStorageService($prophecy->reveal());
        $storage->setStorageFormat(new QtiTimeStorageJsonFormat());
    }

    /**
     * @return array
     */
    private function getTimeLine()
    {
        $tags1 = ['Test1', 'TestPart1', 'TestSection1', 'Item1', 'Item1#0', 'Item1#0-1'];
        $tags2 = ['Test1', 'TestPart1', 'TestSection1', 'Item2', 'Item2#0', 'Item2#0-1'];
        $tags3 = ['Test1', 'TestPart1', 'TestSection1', 'Item3', 'Item3#0', 'Item3#0-1'];
        return [
            'timeLine' => new QtiTimeLine([
                new TimePoint($tags1, 1507706410.8289, TimePoint::TYPE_START, TimePoint::TARGET_SERVER),
                new TimePoint($tags1, 1507706424.3663, TimePoint::TYPE_END, TimePoint::TARGET_SERVER),
                new TimePoint($tags1, 1507706412.2481, TimePoint::TYPE_START, TimePoint::TARGET_CLIENT),
                new TimePoint($tags1, 1507706422.947, TimePoint::TYPE_END, TimePoint::TARGET_CLIENT),

                new TimePoint($tags2, 1507706424.8342, TimePoint::TYPE_START, TimePoint::TARGET_SERVER),
                new TimePoint($tags2, 1507706525.0912, TimePoint::TYPE_END, TimePoint::TARGET_SERVER),
                new TimePoint($tags2, 1507706427.1259, TimePoint::TYPE_START, TimePoint::TARGET_CLIENT),
                new TimePoint($tags2, 1507706522.7994, TimePoint::TYPE_END, TimePoint::TARGET_CLIENT),

                new TimePoint($tags3, 1507706525.682, TimePoint::TYPE_START, TimePoint::TARGET_SERVER),
                new TimePoint($tags3, 1507706640.9469, TimePoint::TYPE_END, TimePoint::TARGET_SERVER),
                new TimePoint($tags3, 1507706526.4789, TimePoint::TYPE_START, TimePoint::TARGET_CLIENT),
                new TimePoint($tags3, 1507706640.1501, TimePoint::TYPE_END, TimePoint::TARGET_CLIENT),
            ]),
            'extraTime' => 0,
            'extendedTime' => 0,
            'extraTimeLine' => new QtiTimeLine(),
            'consumedExtraTime' => 0
        ];
    }
}
