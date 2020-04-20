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

namespace oat\taoQtiTest\test\unit\models\classes\runner\time;

use oat\generis\test\TestCase;
use oat\taoQtiTest\models\runner\time\AdjustmentMap;

class AdjustmentMapTest extends TestCase
{
    /**
     * @dataProvider putParameterValidationDataProvider
     * @param $sourceId
     * @param $action
     * @param $seconds
     */
    public function testPut_WhenParametersAreNotValid_ThenMapIsNotUpdated($sourceId, $action, $seconds)
    {
        $this->expectException(\InvalidArgumentException::class);
        $map = new AdjustmentMap();
        $map->put($sourceId, $action, $seconds);
    }

    public function testPut_WhenValueIsRegisteredForNewSource_ThenEntryIsCorrectlyInitialized()
    {
        $map = new AdjustmentMap();
        $map->put('testSourceId', AdjustmentMap::ACTION_INCREASE, 10);
        $this->assertEquals(10, $map->toArray()['testSourceId'][AdjustmentMap::ACTION_INCREASE]);
        $this->assertEquals(0, $map->toArray()['testSourceId'][AdjustmentMap::ACTION_DECREASE]);
    }

    public function testPut_WhenValueExistsInTheMap_ThenSubsequentValuesAreAdded()
    {
        $map = new AdjustmentMap();
        $map->put('testSourceId', AdjustmentMap::ACTION_INCREASE, 10);
        $map->put('testSourceId', AdjustmentMap::ACTION_INCREASE, 15);
        $this->assertEquals(25, $map->toArray()['testSourceId'][AdjustmentMap::ACTION_INCREASE]);
    }

    public function testGet_WhenThereIsNoValuePresent_ThenZeroIsReturned()
    {
        $map = new AdjustmentMap();
        $this->assertEquals(0, $map->get('newSourceId'));
    }

    public function testGet_WhenRequested_ThenReturnValueIsCalculatedFromIncreasesAndDecreases()
    {
        $map = new AdjustmentMap();
        $map->put('testSourceId', AdjustmentMap::ACTION_INCREASE, 10);
        $this->assertEquals(10, $map->get('testSourceId'));
        $map->put('testSourceId', AdjustmentMap::ACTION_DECREASE, 5);
        $this->assertEquals(5, $map->get('testSourceId'));
        $map->put('testSourceId', AdjustmentMap::ACTION_DECREASE, 10);
        $this->assertEquals(-5, $map->get('testSourceId'));
    }

    public function testRemove_WhenRequested_ThenRemovesEntriesForProvidedSource()
    {
        $map = new AdjustmentMap();
        $map->put('testSourceId1', AdjustmentMap::ACTION_INCREASE, 10);
        $map->put('testSourceId2', AdjustmentMap::ACTION_INCREASE, 20);
        $map->remove('testSourceId1');
        $this->assertArrayNotHasKey('testSourceId1', $map->toArray());
        $this->assertArrayHasKey('testSourceId2', $map->toArray());
    }

    public function testToArray_WhenSerializedToAndFromArray_ThenValuesAreStillTheSame()
    {
        $map = new AdjustmentMap();
        $map->put('testSourceId1', AdjustmentMap::ACTION_INCREASE, 10);
        $map->put('testSourceId2', AdjustmentMap::ACTION_INCREASE, 20);
        $data = $map->toArray();
        $secondMap = new AdjustmentMap();
        $secondMap->fromArray($data);
        $this->assertEquals($map->toArray(), $secondMap->toArray());
    }

    public function testFromArray_WhenSerializedToAndFromArray_ThenValuesAreStillTheSame()
    {
        $map = new AdjustmentMap();
        $map->put('testSourceId1', AdjustmentMap::ACTION_INCREASE, 10);
        $map->put('testSourceId2', AdjustmentMap::ACTION_INCREASE, 20);
        $data = $map->toArray();
        $secondMap = new AdjustmentMap();
        $secondMap->fromArray($data);
        $this->assertEquals($secondMap->toArray(), $map->toArray());
    }

    public function testJsonSerialize_WhenEntriesAreEncodedToAndDecodedFromJson_ThenValuesAreTheSame()
    {
        $map = new AdjustmentMap();
        $map->put('testSourceId1', AdjustmentMap::ACTION_INCREASE, 10);
        $map->put('testSourceId2', AdjustmentMap::ACTION_INCREASE, 20);
        $encoded = json_encode($map);
        $data = $map->toArray();
        $this->assertEquals($data, json_decode($encoded, true));
    }

    public function putParameterValidationDataProvider()
    {
        return [
            ['', '', 0],
            ['testSourceId', '', 0],
            ['testSourceId', AdjustmentMap::ACTION_INCREASE, 0],
        ];
    }
}
