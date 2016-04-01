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

use oat\taoTests\model\runner\time\TimeLine;
use oat\taoTests\model\runner\time\TimePoint;
use oat\taoQtiTest\model\runner\time\QtiTimeLine;
use oat\tao\test\TaoPhpUnitTestRunner;


/**
 * Test the {@link QtiTimeLine}
 *
 * @author Bertrand Chevrier, <taosupport@tudor.lu>
 */
class QtiTimeLineTest extends TaoPhpUnitTestRunner
{

    public function setUp()
    {
        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
    }

    /**
     * Test the timeline instantiation
     */
    public function testConstructor()
    {
        $timeline = new QtiTimeLine();
        $this->assertInstanceOf('oat\taoTests\models\runner\time\TimeLine', $timeline);
    }

    /**
     * Test adding one point to the Timline
     */
    public function testAddPoint()
    {
        $timeline = new QtiTimeLine();
        $this->assertEquals(count($timeline->getPoints()), 0, 'The timeline is empty added');

        $point    = new TimePoint(['test-A', 'item-A'], 1459519570.2422, TimePoint::TYPE_START, TimePoint::TARGET_SERVER);
        $result = $timeline->add($point);

        $this->assertInstanceOf('oat\taoTests\models\runner\time\TimeLine', $result);
        $this->assertSame($result, $timeline);

        $this->assertEquals(count($timeline->getPoints()), 1, 'A point has been added');
    }

    /**
     * Test adding one point to the Timline
     *
     * @dataProvider removePointsProvider
     */
    public function testRemovePoint($flags, $type, $target, $expected)
    {
        $timeline = new QtiTimeLine();
        $points   = [
            new TimePoint(['test-a', 'item-a'], 1459519570.2422, TimePoint::TYPE_START, TimePoint::TARGET_SERVER),
            new TimePoint(['test-a', 'item-a'], 1459519590.2422, TimePoint::TYPE_END, TimePoint::TARGET_SERVER),
            new TimePoint(['test-a', 'item-a'], 1459519572.2422, TimePoint::TYPE_START, TimePoint::TARGET_CLIENT),
            new TimePoint(['test-a', 'item-a'], 1459519891.2422, TimePoint::TYPE_END, TimePoint::TARGET_CLIENT),
            new TimePoint(['test-a', 'item-b'], 1459519870.2422, TimePoint::TYPE_START, TimePoint::TARGET_SERVER),
            new TimePoint(['test-a', 'item-b'], 1459519890.2422, TimePoint::TYPE_END, TimePoint::TARGET_SERVER),
            new TimePoint(['test-a', 'item-b'], 1459519872.2422, TimePoint::TYPE_START, TimePoint::TARGET_CLIENT),
            new TimePoint(['test-a', 'item-b'], 1459519891.2422, TimePoint::TYPE_END, TimePoint::TARGET_CLIENT)
        ];
        foreach($points as $point){
            $timeline->add($point);
        }

        $this->assertEqual(count($timeline->getPoints()), count($points), 'The points are in the timeline');

        $result = $timeline->remove($flags, $type, $target);
        $this->assertEqual($result, $expected, "The query removed the expected number of points");
        $this->assertEqual(count($timeline->getPoints()), count($points) - $expected, 'The points are removed from the timeline');
    }

    public function removePointsProvider()
    {
        return [
            ['test-a', TimePoint::TYPE_ALL, TimePoint::TARGET_ALL, 4],
            ['item-a', TimePoint::TYPE_ALL, TimePoint::TARGET_ALL, 4],
            ['item-a', TimePoint::TYPE_START, TimePoint::TARGET_ALL, 2],
            ['item-a', TimePoint::TYPE_ALL, QtiTimePoint::TARGET_CLIENT, 0, 2],
            [['item-a', 'item-b'], TimePoint::TYPE_ALL, TimePoint::TARGET_ALL, 8],
            [['test-a', 'item-b'], TimePoint::TYPE_START, TimePoint::TARGET_SERVER, 1],
            ['item-c', TimePoint::TYPE_ALL, TimePoint::TARGET_ALL, 0],
        ];
    }
}
