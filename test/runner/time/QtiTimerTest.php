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

namespace oat\taoQtiTest\test\runner\time;

use oat\taoQtiTest\models\runner\time\QtiTimer;
use oat\taoQtiTest\models\runner\time\QtiTimeLine;
use oat\taoQtiTest\models\runner\time\QtiTimeStorage;
use oat\taoTests\models\runner\time\TimePoint;
use oat\tao\test\TaoPhpUnitTestRunner;
use Prophecy\Prophet;
use ReflectionClass;

/**
 * Test the {@link \oat\taoQtiTest\models\runner\time\QtiTimer}
 *
 * @author Aleh Hutnikau, <hutnikau@1pt.com>
 */
class QtiTimerTest extends TaoPhpUnitTestRunner
{
    /**
     * @throws \common_ext_ExtensionException
     */
    public function setUp()
    {
        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
    }

    /**
     * Test the TimeLine instantiation
     */
    public function testConstructor()
    {
        $testSession = $this->getTestSessionMock();
        $timer = new QtiTimer($testSession);
        $this->assertInstanceOf('oat\taoTests\models\runner\time\Timer', $timer);
        $timeLine = $this->getTimeLine($timer);
        $this->assertInstanceOf('oat\taoQtiTest\models\runner\time\QtiTimeLine', $timeLine);
        $this->assertEquals($testSession, $timer->getTestSession());

    }

    /**
     * Test the QtiTimer::start()
     */
    public function testStart()
    {
        $timer = new QtiTimer($this->getTestSessionMock());
        $timeLine = $this->getTimeLine($timer);
        $timePoints = $timeLine->getPoints();
        $this->assertTrue(empty($timePoints));
        $routeItem = $this->getRouteItemMock();


        $timer->start($routeItem, 1459335000.0000);
        $timePoints = $timeLine->getPoints();
        $this->assertEquals(1, count($timePoints));
        $this->assertEquals(TimePoint::TARGET_SERVER, $timePoints[0]->getTarget());
        $this->assertEquals(TimePoint::TYPE_START, $timePoints[0]->getType());


        $timer->start($routeItem, 1459335002.0000);
        $timePoints = $timeLine->getPoints();
        $this->assertEquals(3, count($timePoints));
        //end time of the first range should be authomatically creted
        $this->assertEquals(1459335001.9999, $timePoints[1]->getTimeStamp());
        $this->assertEquals(TimePoint::TARGET_SERVER, $timePoints[1]->getTarget());
        $this->assertEquals(TimePoint::TYPE_END, $timePoints[1]->getType());

        $this->assertEquals(1459335002, $timePoints[2]->getTimeStamp());
        $this->assertEquals(TimePoint::TARGET_SERVER, $timePoints[2]->getTarget());
        $this->assertEquals(TimePoint::TYPE_START, $timePoints[2]->getType());
    }

    /**
     * @dataProvider startInvalidDataExceptionProvider
     * @param $routeItem
     * @param $timestamp
     * @expectedException \oat\taoTests\models\runner\time\InvalidDataException
     */
    public function testStartInvalidDataException($routeItem, $timestamp)
    {
        $timer = new QtiTimer();
        $timer->start($routeItem, $timestamp);
    }

    /**
     * @expectedException \oat\taoTests\models\runner\time\InconsistentRangeException
     */
    public function testStartInconsistentRangeException()
    {
        $timer = new QtiTimer();
        $routeItem = $this->getRouteItemMock();
        $timer->start($routeItem, 1459335000.0000);
        $timer->start($routeItem, 1459334999.0000);
    }

    /**
     * Test the QtiTimer::end()
     */
    public function testEnd()
    {
        $timer = new QtiTimer($this->getTestSessionMock());
        $timeLine = $this->getTimeLine($timer);
        $timePoints = $timeLine->getPoints();
        $this->assertTrue(empty($timePoints));
        $routeItem = $this->getRouteItemMock();
        $timer->start($routeItem, 1459335000.0000);

        $timer->end($routeItem, 1459335010.0000);
        $timePoints = $timeLine->getPoints();

        $this->assertEquals(2, count($timePoints));
        $this->assertEquals(1459335010.0000, $timePoints[1]->getTimestamp());
        $this->assertEquals(TimePoint::TARGET_SERVER, $timePoints[1]->getTarget());
        $this->assertEquals(TimePoint::TYPE_END, $timePoints[1]->getType());
    }

    /**
     * @expectedException \oat\taoTests\models\runner\time\InconsistentRangeException
     */
    public function testEndInconsistentRangeException()
    {
        $timer = new QtiTimer();
        $routeItem = $this->getRouteItemMock();
        $timer->start($routeItem, 1459335000.0000);
        $timer->end($routeItem, 1459335010.0000);
        $timer->end($routeItem, 1459335011.0000);
    }

    /**
     * @dataProvider endInvalidDataExceptionProvider
     * @param $routeItem
     * @param $timestamp
     * @expectedException \oat\taoTests\models\runner\time\InvalidDataException
     */
    public function testEndInvalidDataException($routeItem, $timestamp)
    {
        $timer = new QtiTimer();
        $timer->end($routeItem, $timestamp);
    }

    /**
     * Test the QtiTimer::adjust()
     */
    public function testAdjust()
    {
        $timer = new QtiTimer($this->getTestSessionMock());
        $timeLine = $this->getTimeLine($timer);
        $timePoints = $timeLine->getPoints();
        $this->assertTrue(empty($timePoints));
        $routeItem = $this->getRouteItemMock();
        $timer->start($routeItem, 1459335000.0000);
        $timer->end($routeItem, 1459335020.0000);
        $timePoints = $timeLine->getPoints();

        $this->assertEquals(2, count($timePoints));
        $this->assertEquals([], $timeLine->find(null, TimePoint::TARGET_CLIENT));

        $timer->adjust($routeItem, 10);
        $timePoints = $timeLine->getPoints();
        $clientTimePoints = $timeLine->find(null, TimePoint::TARGET_CLIENT);
        $this->assertEquals(4, count($timePoints));
        $this->assertEquals(2, count($clientTimePoints));
        $clientStartPoint = $clientTimePoints[0];
        $clientEndPoint = $clientTimePoints[1];

        $this->assertEquals(1459335000.0000 + (10/2), $clientStartPoint->getTimestamp());
        $this->assertEquals(TimePoint::TARGET_CLIENT, $clientStartPoint->getTarget());
        $this->assertEquals(TimePoint::TYPE_START, $clientStartPoint->getType());

        $this->assertEquals(1459335020.0000 - (10/2), $clientEndPoint->getTimestamp());
        $this->assertEquals(TimePoint::TARGET_CLIENT, $clientEndPoint->getTarget());
        $this->assertEquals(TimePoint::TYPE_END, $clientEndPoint->getType());
    }

    /**
     * @dataProvider adjustInvalidDataExceptionProvider
     * @param $routeItem
     * @param $timestamp
     * @expectedException \oat\taoTests\models\runner\time\InvalidDataException
     */
    public function testAdjustInvalidDataException($routeItem, $timestamp)
    {
        $timer = new QtiTimer();
        $timer->adjust($routeItem, $timestamp);
    }

    /**
     * @dataProvider adjustInconsistentRangeProvider
     * @param $timer
     * @param $routeItem
     * @param $duration
     * @expectedException \oat\taoTests\models\runner\time\InconsistentRangeException
     */
    public function testAdjustInconsistentRangeException($timer, $routeItem, $duration)
    {
        $timer->adjust($routeItem, $duration);
    }

    /**
     * Test the QtiTimer::compute()
     */
    public function testCompute()
    {
        $timer = new QtiTimer($this->getTestSessionMock());
        $routeItem = $this->getRouteItemMock();
        $timer->start($routeItem, 1459335000.0000);
        $timer->end($routeItem, 1459335020.0000);
        $timer->adjust($routeItem, 10);

        $this->assertEquals(20, $timer->compute([], TimePoint::TARGET_SERVER));
        $this->assertEquals(10, $timer->compute([], TimePoint::TARGET_CLIENT));
    }

    /**
     * @expectedException \oat\taoTests\models\runner\time\InconsistentCriteriaException
     */
    public function testComputeInconsistentCriteriaException()
    {
        $timer = new QtiTimer();
        $timer->compute([], TimePoint::TARGET_ALL);
    }

    /**
     * Test the QtiTimer::timeout()
     */
    public function testTimeout()
    {
        $timer = new QtiTimer($this->getTestSessionMock());
        $routeItem = $this->getRouteItemMock();
        $timer->start($routeItem, 1459335000.0000);
        $timer->end($routeItem, 1459335020.0000);
        $timer->adjust($routeItem, 10);

        $this->assertFalse($timer->timeout(21, [], TimePoint::TARGET_SERVER));
        $this->assertTrue($timer->timeout(19, [], TimePoint::TARGET_SERVER));
        $this->assertTrue($timer->timeout(20, [], TimePoint::TARGET_SERVER));
        $this->assertFalse($timer->timeout(11, [], TimePoint::TARGET_CLIENT));
        $this->assertTrue($timer->timeout(9, [], TimePoint::TARGET_CLIENT));
        $this->assertTrue($timer->timeout(10, [], TimePoint::TARGET_CLIENT));
    }

    /**
     * Test the QtiTimer::setStorage()
     */
    public function testSetStorage()
    {
        $storage = new QtiTimeStorage('fake_session_id');
        $timer = new QtiTimer();
        $this->assertEquals(null, $timer->getStorage());
        $timer->setStorage($storage);
        $this->assertEquals($storage, $timer->getStorage());
    }

    /**
     * Test the QtiTimer::getStorage()
     */
    public function testGetStorage()
    {
        $storage = new QtiTimeStorage('fake_session_id');
        $timer = new QtiTimer();
        $this->assertEquals(null, $timer->getStorage());
        $timer->setStorage($storage);
        $this->assertEquals($storage, $timer->getStorage());
    }

    /**
     * Test the QtiTimer::save()
     */
    public function testSave()
    {
        $timer = new QtiTimer($this->getTestSessionMock());
        $routeItem = $this->getRouteItemMock();
        $timer->start($routeItem, 1459335000.0000);
        $timer->end($routeItem, 1459335020.0000);
        $storage = new QtiTimeStorage('fake_session_id');
        $timer->setStorage($storage);
        $result = $timer->save();
        $this->assertEquals($timer, $result);

        $loadedTimer = $timer->load();
        $this->assertEquals($loadedTimer, $result);

        $timeLine = $this->getTimeLine($loadedTimer);
        $timePoints = $timeLine->getPoints();

        $this->assertEquals(2, count($timePoints));
        $this->assertEquals(1459335000.0000, $timePoints[0]->getTimestamp());
        $this->assertEquals(TimePoint::TARGET_SERVER, $timePoints[0]->getTarget());
        $this->assertEquals(TimePoint::TYPE_START, $timePoints[0]->getType());
        $this->assertEquals(1459335020.0000, $timePoints[1]->getTimestamp());
        $this->assertEquals(TimePoint::TARGET_SERVER, $timePoints[1]->getTarget());
        $this->assertEquals(TimePoint::TYPE_END, $timePoints[1]->getType());
    }

    /**
     * @expectedException \oat\taoTests\models\runner\time\InvalidStorageException
     */
    public function testSaveInvalidStorageException()
    {
        $timer = new QtiTimer();
        $timer->save();
    }

    /**
     * Test the QtiTimer::load()
     */
    public function testLoad()
    {
        $timer = new QtiTimer($this->getTestSessionMock());
        $routeItem = $this->getRouteItemMock();
        $timer->start($routeItem, 1459335000.0000);
        $timer->end($routeItem, 1459335020.0000);
        $storage = new QtiTimeStorage('fake_session_id');
        $timer->setStorage($storage);
        $timer->save();

        $newTimer = new QtiTimer();
        $newStorage = new QtiTimeStorage('fake_session_id');
        $timeLine = $this->getTimeLine($newTimer);
        $this->assertEquals([], $timeLine->getPoints());

        $newTimer->setStorage($newStorage);
        $newTimer = $newTimer->load();
        $timeLine = $this->getTimeLine($newTimer);

        $timePoints = $timeLine->getPoints();
        $this->assertEquals(2, count($timePoints));
        $this->assertEquals(1459335000.0000, $timePoints[0]->getTimestamp());
        $this->assertEquals(TimePoint::TARGET_SERVER, $timePoints[0]->getTarget());
        $this->assertEquals(TimePoint::TYPE_START, $timePoints[0]->getType());
        $this->assertEquals(1459335020.0000, $timePoints[1]->getTimestamp());
        $this->assertEquals(TimePoint::TARGET_SERVER, $timePoints[1]->getTarget());
        $this->assertEquals(TimePoint::TYPE_END, $timePoints[1]->getType());
    }

    /**
     * @expectedException \oat\taoTests\models\runner\time\InvalidStorageException
     */
    public function testLoadInvalidStorageException()
    {
        $timer = new QtiTimer();
        $timer->load();
    }

    /**
     * @expectedException \oat\taoTests\models\runner\time\InvalidDataException
     */
    public function testLoadInvalidDataException()
    {
        $timer = new QtiTimer();
        $storage = new QtiTimeStorage('fake_session_id');
        $timer->setStorage($storage);
        $this->setTimeLine($timer, new \stdClass());
        $timer->save();
        $timer->load();
    }



    //DATA PROVIDERS
    /**
     * @return array
     */
    public function startInvalidDataExceptionProvider()
    {
        $routeItem = $this->getRouteItemMock();
        return [
            [
                'routeItem',
                1459335002.0000,
            ],
            [
                $routeItem,
                'wrong timestamp',
            ],
        ];
    }

    /**
     * @return array
     */
    public function endInvalidDataExceptionProvider()
    {
        $routeItem = $this->getRouteItemMock();
        return [
            [
                'routeItem',
                1459335002.0000,
            ],
            [
                $routeItem,
                'wrong timestamp',
            ],
        ];
    }

    /**
     * @return array
     */
    public function adjustInvalidDataExceptionProvider()
    {
        $routeItem = $this->getRouteItemMock();
        return [
            [
                'routeItem',
                1459335002.0000,
            ],
            [
                $routeItem,
                'wrong timestamp',
            ],
        ];
    }

    /**
     * @return array
     */
    public function adjustInconsistentRangeProvider()
    {
        $emptyTimer = new QtiTimer();
        $timer = new QtiTimer();
        $routeItem = $this->getRouteItemMock();
        $timer->start($routeItem, 1459335000.0000);
        $timer->end($routeItem, 1459335010.0000);

        $routeItem = $this->getRouteItemMock();
        return [
            [
                $emptyTimer, //timer with empty time line
                $routeItem,
                1,
            ],
            [
                $timer, //timer with only one time point in time line
                $routeItem,
                11,
            ],
        ];
    }



    //MOCKS
    /**
     * Get AssessmentItemRef instance mock.
     * @return object
     */
    private function getItemRefMock()
    {
        static $itemRef = null;

        if (!$itemRef) {
            $prophet = new Prophet();

            //assessment item reference
            $assessmentItemRefProphecy = $prophet->prophesize('qtism\data\AssessmentItemRef');
            $assessmentItemRefProphecy->getIdentifier()->willReturn('item_fake_id');
            $assessmentItemRefProphecy->getHref()->willReturn('item_fake_href');
            $itemRef = $assessmentItemRefProphecy->reveal();
        }

        return $itemRef;
    }

    /**
     * Get RouteItem instance mock.
     * @return object
     */
    private function getRouteItemMock()
    {
        $prophet = new Prophet();

        //assessment test
        $testProphecy = $prophet->prophesize('qtism\data\AssessmentTest');
        $testProphecy->getIdentifier()->willReturn('test_fake_id');
        $test = $testProphecy->reveal();

        //assessment test part
        $testPartProphecy = $prophet->prophesize('qtism\data\TestPart');
        $testPartProphecy->getIdentifier()->willReturn('test_part_fake_id');
        $testPart = $testPartProphecy->reveal();

        //assessment section
        $assessmentSections = [['section_fake_id' => 'fake_section']];

        $routeItem = $prophet->prophesize('qtism\runtime\tests\RouteItem');
        $routeItem->getAssessmentTest()->willReturn($test);
        $routeItem->getTestPart()->willReturn($testPart);
        $routeItem->getAssessmentSections()->willReturn($assessmentSections);
        $routeItem->getAssessmentItemRef()->willReturn($this->getItemRefMock());
        $routeItem->getOccurence()->willReturn(1);

        return $routeItem->reveal();
    }

    /**
     * Get TestSession instance mock.
     * @return object
     */
    private function getTestSessionMock()
    {
        $prophet = new Prophet();

        //numAttempts variable
        $numAttempts = $prophet->prophesize('qtism\runtime\common\Variable');
        $numAttempts->getValue()->willReturn(1);

        //assessmentItemSession
        $itemSession = ['numAttempts' => $numAttempts];

        //assessmentItemSessionStore
        $itemSessionStore = $prophet->prophesize('qtism\runtime\tests\AssessmentItemSessionStore');
        $itemSessionStore->getAssessmentItemSession($this->getItemRefMock(), 1)->willReturn($itemSession);

        //assessment test
        $testSession = $prophet->prophesize('oat\taoQtiTest\models\runner\session\TestSession');
        $testSession->getAssessmentItemSessionStore()->willReturn($itemSessionStore);
        $testSession->isRunning()->willReturn(true);
        return $testSession->reveal();
    }

    /**
     * @param QtiTimer $timer
     * @return QtiTimeLine
     */
    private function getTimeLine(QtiTimer $timer)
    {
        $reflectionClass = new ReflectionClass('oat\taoQtiTest\models\runner\time\QtiTimer');
        $reflectionProperty = $reflectionClass->getProperty('timeLine');
        $reflectionProperty->setAccessible(true);
        return $reflectionProperty->getValue($timer);
    }

    /**
     * @param QtiTimer $timer
     * @param mixed $timeLine
     * @return QtiTimeLine
     */
    private function setTimeLine(QtiTimer $timer, $timeLine)
    {
        $reflectionClass = new ReflectionClass('oat\taoQtiTest\models\runner\time\QtiTimer');
        $reflectionProperty = $reflectionClass->getProperty('timeLine');
        $reflectionProperty->setAccessible(true);
        $reflectionProperty->setValue($timer, $timeLine);
    }

}