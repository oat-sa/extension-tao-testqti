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

namespace oat\taoQtiTest\test\integration\runner\time;

use oat\generis\test\GenerisPhpUnitTestRunner;
use oat\taoQtiTest\models\runner\time\AdjustmentMap;
use oat\taoQtiTest\models\runner\time\QtiTimeLine;
use oat\taoQtiTest\models\runner\time\QtiTimeStorageFormat;
use oat\taoQtiTest\models\runner\time\storageFormat\QtiTimeStorageJsonFormat;
use oat\taoTests\models\runner\time\TimePoint;

/**
 * Class QtiTimeStorageJsonFormatTest
 * @package oat\taoQtiTest\test\integration\runner\time
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
class QtiTimeStorageJsonFormatTest extends GenerisPhpUnitTestRunner
{
    /**
     * @throws \common_ext_ExtensionException
     */
    public function setUp(): void
    {
        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
    }

    /**
     * Test the dataset encoding with QtiTimeStorageJsonFormat::encode
     */
    public function testEncode()
    {
        $format = new QtiTimeStorageJsonFormat();
        $this->assertInstanceOf(QtiTimeStorageFormat::class, $format);

        $input = $this->getTimeLine();
        $encoded = $format->encode($input);
        $this->assertJson($encoded);
        $this->assertEquals($this->getFullJson(), $encoded);
    }

    /**
     * Test the dataset decoding with QtiTimeStorageJsonFormat::decode
     */
    public function testDecodeJson()
    {
        $format = new QtiTimeStorageJsonFormat();
        $this->assertInstanceOf(QtiTimeStorageFormat::class, $format);

        $input = $this->getFullJson();
        $decoded = $format->decode($input);
        $this->assertEquals($this->getTimeLine(), $decoded);
    }

    /**
     * Test the dataset decoding with QtiTimeStorageJsonFormat::decode
     */
    public function testDecodeSerialize()
    {
        $format = new QtiTimeStorageJsonFormat();
        $this->assertInstanceOf(QtiTimeStorageFormat::class, $format);

        $input = serialize($this->getTimeLine());
        $decoded = $format->decode($input);
        $this->assertEquals($this->getTimeLine(), $decoded);
    }

    /**
     * Test the dataset encoding/decoding
     */
    public function testPassthrough()
    {
        $format = new QtiTimeStorageJsonFormat();
        $this->assertInstanceOf(QtiTimeStorageFormat::class, $format);

        $input = $this->getTimeLine();
        $expected = $this->getTimeLine();
        $encoded = $format->encode($input);
        $decoded = $format->decode($encoded);

        $this->assertEquals($expected, $decoded);
    }

    /**
     * @return array
     */
    private function getTimeLine()
    {
        $tags1 = ['Test1', 'TestPart1', 'TestSection1', 'Item1', 'Item1#0', 'Item1#0-1'];
        $tags2 = ['Test1', 'TestPart1', 'TestSection1', 'Item2', 'Item2#0', 'Item2#0-1'];
        $tags3 = ['Test1', 'TestPart1', 'TestSection1', 'Item3', 'Item3#0', 'Item3#0-1'];
        $timerAdjustmentMap = new AdjustmentMap();
        $timerAdjustmentMap->fromArray([
            'itemId-1' => ['increase' => 90, 'decrease' => 0],
            'sectionId-1' => ['increase' => 90, 'decrease' => 30],
            'partId-1' => ['increase' => 240, 'decrease' => 30],
            'testId-1' => ['increase' => 240, 'decrease' => 30],
        ]);
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
            'consumedExtraTime' => 0,
            'timerAdjustmentMap' => $timerAdjustmentMap,
        ];
    }

    /**
     * @return string
     */
    private function getFullJson()
    {
        $tags1 = ['Test1', 'TestPart1', 'TestSection1', 'Item1', 'Item1#0', 'Item1#0-1'];
        $tags2 = ['Test1', 'TestPart1', 'TestSection1', 'Item2', 'Item2#0', 'Item2#0-1'];
        $tags3 = ['Test1', 'TestPart1', 'TestSection1', 'Item3', 'Item3#0', 'Item3#0-1'];
        return json_encode([
            'timeLine' => [[
                'ts' => 1507706410.8289001,
                'type' => 1,
                'target' => 2,
                'tags' => $tags1
            ], [
                'ts' => 1507706424.3663001,
                'type' => 2,
                'target' => 2,
                'tags' => $tags1
            ], [
                'ts' => 1507706412.2481,
                'type' => 1,
                'target' => 1,
                'tags' => $tags1
            ], [
                'ts' => 1507706422.947,
                'type' => 2,
                'target' => 1,
                'tags' => $tags1
            ], [
                'ts' => 1507706424.8341999,
                'type' => 1,
                'target' => 2,
                'tags' => $tags2
            ], [
                'ts' => 1507706525.0912001,
                'type' => 2,
                'target' => 2,
                'tags' => $tags2
            ], [
                'ts' => 1507706427.1259,
                'type' => 1,
                'target' => 1,
                'tags' => $tags2
            ], [
                'ts' => 1507706522.7994001,
                'type' => 2,
                'target' => 1,
                'tags' => $tags2
            ], [
                'ts' => 1507706525.6819999,
                'type' => 1,
                'target' => 2,
                'tags' => $tags3
            ], [
                'ts' => 1507706640.9468999,
                'type' => 2,
                'target' => 2,
                'tags' => $tags3
            ], [
                'ts' => 1507706526.4789,
                'type' => 1,
                'target' => 1,
                'tags' => $tags3
            ], [
                'ts' => 1507706640.1501,
                'type' => 2,
                'target' => 1,
                'tags' => $tags3
            ]],
            'extraTime' => 0,
            'extendedTime' => 0,
            'consumedExtraTime' => 0,
            'timerAdjustmentMap' => [
                'itemId-1' => ['increase' => 90, 'decrease' => 0],
                'sectionId-1' => ['increase' => 90, 'decrease' => 30],
                'partId-1' => ['increase' => 240, 'decrease' => 30],
                'testId-1' => ['increase' => 240, 'decrease' => 30],
            ],
        ]);
    }
}
