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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA ;
 */
declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes\runner\time;

use InvalidArgumentException;
use oat\generis\test\TestCase;
use oat\taoQtiTest\models\runner\time\AdjustmentMap;

class AdjustmentMapTest extends TestCase
{
    private const DUMMY_ADJUSTMENT_TYPE = 'DUMMY_TYPE';

    private $subject;

    protected function setUp(): void
    {
        parent::setUp();
        $this->subject = new AdjustmentMap();
    }

    /**
     * @dataProvider increaseParameterValidationDataProvider
     * @param $sourceId
     * @param $action
     * @param $seconds
     */
    public function testIncrease_WhenParametersAreNotValid_ThenMapIsNotUpdated($sourceId, $seconds): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->subject->increase($sourceId, self::DUMMY_ADJUSTMENT_TYPE, $seconds);
    }

    public function testIncrease_WhenValueIsRegisteredForNewSource_ThenEntryIsCorrectlyInitialized(): void
    {
        $this->subject->increase('testSourceId', self::DUMMY_ADJUSTMENT_TYPE, 10);
        $this->assertEquals(
            10,
            $this->subject->toArray()['testSourceId'][self::DUMMY_ADJUSTMENT_TYPE][AdjustmentMap::ACTION_INCREASE]
        );
        $this->assertEquals(
            0,
            $this->subject->toArray()['testSourceId'][self::DUMMY_ADJUSTMENT_TYPE][AdjustmentMap::ACTION_DECREASE]
        );
    }

    public function testIncrease_WhenValueExistsInTheMap_ThenSubsequentValuesAreAdded(): void
    {
        $this->subject->increase('testSourceId', self::DUMMY_ADJUSTMENT_TYPE, 10);
        $this->subject->increase('testSourceId', self::DUMMY_ADJUSTMENT_TYPE, 15);
        $this->assertEquals(
            25,
            $this->subject->toArray()['testSourceId'][self::DUMMY_ADJUSTMENT_TYPE][AdjustmentMap::ACTION_INCREASE]
        );
    }

    public function testGet_WhenThereIsNoValuePresent_ThenZeroIsReturned(): void
    {
        $this->assertEquals(0, $this->subject->get('newSourceId'));
    }

    public function testGet_WhenRequested_ThenReturnValueIsCalculatedFromIncreasesAndDecreases(): void
    {
        $this->subject->increase('testSourceId', self::DUMMY_ADJUSTMENT_TYPE, 10);
        $this->assertEquals(10, $this->subject->get('testSourceId'));
        $this->subject->decrease('testSourceId', self::DUMMY_ADJUSTMENT_TYPE, 5);
        $this->assertEquals(5, $this->subject->get('testSourceId'));
        $this->subject->decrease('testSourceId', self::DUMMY_ADJUSTMENT_TYPE, 10);
        $this->assertEquals(-5, $this->subject->get('testSourceId'));
    }

    public function testRemove_WhenRequested_ThenRemovesEntriesForProvidedSource(): void
    {
        $this->subject->increase('testSourceId1', self::DUMMY_ADJUSTMENT_TYPE, 10);
        $this->subject->increase('testSourceId2', self::DUMMY_ADJUSTMENT_TYPE, 20);
        $this->subject->remove('testSourceId1');
        $this->assertArrayNotHasKey('testSourceId1', $this->subject->toArray());
        $this->assertArrayHasKey('testSourceId2', $this->subject->toArray());
    }

    public function testToArray_WhenSerializedToAndFromArray_ThenValuesAreStillTheSame(): void
    {
        $this->subject->increase('testSourceId1', self::DUMMY_ADJUSTMENT_TYPE, 10);
        $this->subject->increase('testSourceId2', self::DUMMY_ADJUSTMENT_TYPE, 20);
        $data = $this->subject->toArray();
        $secondMap = new AdjustmentMap();
        $secondMap->fromArray($data);
        $this->assertEquals($this->subject->toArray(), $secondMap->toArray());
    }

    public function testFromArray_WhenSerializedToAndFromArray_ThenValuesAreStillTheSame(): void
    {
        $this->subject->increase('testSourceId1', self::DUMMY_ADJUSTMENT_TYPE, 10);
        $this->subject->increase('testSourceId2', self::DUMMY_ADJUSTMENT_TYPE, 20);
        $data = $this->subject->toArray();
        $secondMap = new AdjustmentMap();
        $secondMap->fromArray($data);
        $this->assertEquals($secondMap->toArray(), $this->subject->toArray());
    }

    public function testJsonSerialize_WhenEntriesAreEncodedToAndDecodedFromJson_ThenValuesAreTheSame(): void
    {
        $this->subject->increase('testSourceId1', self::DUMMY_ADJUSTMENT_TYPE, 10);
        $this->subject->increase('testSourceId2', self::DUMMY_ADJUSTMENT_TYPE, 20);
        $encoded = json_encode($this->subject);
        $data = $this->subject->toArray();
        $this->assertEquals($data, json_decode($encoded, true));
    }

    public function increaseParameterValidationDataProvider(): array
    {
        return [
            ['', 0],
            ['testSourceId', 0],
        ];
    }
}
