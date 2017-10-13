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

namespace oat\taoQtiTest\models\runner\time\storageFormat;

use oat\taoQtiTest\models\runner\time\QtiTimeLine;
use oat\taoTests\models\runner\time\TimeLine;
use oat\taoTests\models\runner\time\TimePoint;

/**
 * Class QtiTimeStoragePackedFormat
 *
 * Encode/decode QtiTimer using JSON format.
 * Apply a compression on the QtiTimeLine entries to reduce the weight of the encoded data.
 *
 * Applied format:
 *
 * ```
 * {
 *      // For each tags set an index that points to each linked timestamps.
 *      // Each index value is the offset of the timestamp in the "points" array.
 *      "index": {
 *          "tag1": [0, 1, 2, 6, ...],
 *          "tag2": [0, 2, 4, ...],
 *          ...
 *          "tagN": [100, 101, 110, 111, ...],
 *      },
 * 
 *      // A list of tags that applies for all timestamps.
 *      "tags": [
 *          "global-tag-1",
 *          "global-tag-2",
 *          ...
 *          "global-tag-N",
 *      ],
 * 
 *      // A flat list of timestamps, their tags are moved into the index map.
 *      // Each timestamp is reduced by a reference value to minimize the final size.
 *      "points": [
 *          [target, type, timestamp - todayTimestamp],
 *          [target, type, timestamp - todayTimestamp],
 *          ...
 *          [target, type, timestamp - todayTimestamp]
 *      ],
 * 
 *      // The arbitrary reference value that has been used to reduce the timestamps.
 *      // Usually it is the timestamp of today morning at 00:00. 
 *      // (could be improved to be based on the assessment start time)
 *      "epoch": todayTimestamp
 * }
 * ```
 *
 * @package oat\taoQtiTest\models\runner\time\storageFormat
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
class QtiTimeStoragePackedFormat extends QtiTimeStorageJsonFormat
{
    /**
     * A storage key added to the sored data set to keep format type
     */
    const STORAGE_KEY_FORMAT = 'format';

    /**
     * A storage key added to the sored data set to keep version info
     */
    const STORAGE_KEY_VERSION = 'version';

    /**
     * The storage key for the TimeLine index in the packed format
     */
    const STORAGE_KEY_TIMELINE_INDEX = 'index';

    /**
     * The storage key for the TimeLine tags in the packed format
     */
    const STORAGE_KEY_TIMELINE_TAGS = 'tags';

    /**
     * The storage key for the TimeLine points in the packed format
     */
    const STORAGE_KEY_TIMELINE_POINTS = 'points';

    /**
     * The storage key for the timestamp reference in the packed format
     */
    const STORAGE_KEY_TIMELINE_EPOCH = 'epoch';

    /**
     * The type of format managed by this class
     */
    const STORAGE_FORMAT = 'pack';

    /**
     * The version of the format. Could be useful in case of changes to take care of legacy.
     */
    const STORAGE_VERSION = 1;

    /**
     * The type of format applied by this class
     * @return string
     */
    public function getFormat()
    {
        return static::STORAGE_FORMAT;
    }

    /**
     * The version of the packing format applied
     * @return int
     */
    public function getVersion()
    {
        return static::STORAGE_VERSION;
    }

    /**
     * The reference value used to compress the timestamps
     * @return int
     */
    public function getEpoch()
    {
        // align the reference value with the timestamp of today morning.
        $today = time();
        return $today - $today % 86400;
    }

    /**
     * Packs a TimeLine in order to reduce the storage footprint
     * @param TimeLine $timeLine
     * @return array
     */
    protected function packTimeLine(&$timeLine)
    {
        $epoch = $this->getEpoch();
        $data = [
            self::STORAGE_KEY_TIMELINE_INDEX => [],
            self::STORAGE_KEY_TIMELINE_TAGS => [],
            self::STORAGE_KEY_TIMELINE_POINTS => [],
            self::STORAGE_KEY_TIMELINE_EPOCH => $epoch,
        ];

        // Will split tags from the list of TimePoint, and put them into a dedicated index.
        // The other TimePoint info are put in a simple array with predictable order, this way: [target, type, timestamp].
        // To save more space a reference value is removed from each timestamp.
        $index = 0;
        foreach ($timeLine->getPoints() as &$point) {
            /** @var TimePoint $point */
            $data[self::STORAGE_KEY_TIMELINE_POINTS][$index] = [$point->getTarget(), $point->getType(), round($point->getTimestamp() - $epoch, 6)];

            foreach ($point->getTags() as &$tag) {
                $data[self::STORAGE_KEY_TIMELINE_INDEX][$tag][] = $index;
            }

            $index++;
        }

        // try to reduce the size of the index by simplifying those that target all TimePoint
        if ($index) {
            foreach ($data[self::STORAGE_KEY_TIMELINE_INDEX] as $tag => &$list) {
                if (count($list) == $index) {
                    unset($data[self::STORAGE_KEY_TIMELINE_INDEX][$tag]);
                    $data[self::STORAGE_KEY_TIMELINE_TAGS][] = $tag;
                }
            }
        } else {
            $data = [];
        }

        return $data;
    }

    /**
     * Unpack a dataset to a workable TimeLine
     * @param array $data
     * @return TimeLine
     */
    protected function unpackTimeLine(&$data)
    {
        $timeLine = new QtiTimeLine();

        // the stored data can be packed or not
        if (isset($data[self::STORAGE_KEY_TIMELINE_POINTS])) {
            // get the reference value used to compress the timestamps
            $epoch = 0;
            if (isset($data[self::STORAGE_KEY_TIMELINE_EPOCH])) {
                $epoch = $data[self::STORAGE_KEY_TIMELINE_EPOCH];
            }

            // rebuild the TimeLine from the list of stored TimePoint
            $tags = $data[self::STORAGE_KEY_TIMELINE_TAGS];
            foreach ($data[self::STORAGE_KEY_TIMELINE_POINTS] as &$dataPoint) {
                $point = new TimePoint($tags, $dataPoint[2] + $epoch, $dataPoint[1], $dataPoint[0]);
                $timeLine->add($point);
            }

            // reassign the tags from the stored index
            $points = $timeLine->getPoints();
            foreach ($data[self::STORAGE_KEY_TIMELINE_INDEX] as $tag => &$list) {
                foreach ($list as $index) {
                    $points[$index]->addTag($tag);
                }
            }
        } else {
            $timeLine->fromArray($data);
        }

        return $timeLine;
    }

    /**
     * Encode a dataset with the managed format.
     * @param mixed $data
     * @return string
     */
    public function encode($data)
    {
        if (is_array($data)) {
            $encodedData = [
                self::STORAGE_KEY_FORMAT => $this->getFormat(),
                self::STORAGE_KEY_VERSION => $this->getVersion(),
            ];

            foreach ($data as $key => &$value) {
                if ($value instanceof TimeLine) {
                    $encodedData[$key] = $this->packTimeLine($value);
                } else {
                    $encodedData[$key] = &$value;
                }
            }

            return json_encode($encodedData);
        }

        return json_encode($data);
    }

    /**
     * Decode a string encoded with the managed format.
     * @param string $data
     * @return mixed
     */
    public function decode($data)
    {
        $decodedData = json_decode($data, true);

        // fallback for old storage that uses PHP serialize format
        if (is_null($decodedData) && $data) {
            $decodedData = unserialize($data);
        }

        if (is_array($decodedData)) {
            if (isset($decodedData[self::STORAGE_KEY_FORMAT])) {
                if ($decodedData[self::STORAGE_KEY_FORMAT] != $this->getFormat()) {
                    \common_Logger::w(sprintf('QtiTimeStorage: wrong decoder applied! (Expected: %s, Applied: %s)', $decodedData[self::STORAGE_KEY_FORMAT], $this->getFormat()));
                }

                foreach ($decodedData as $key => &$value) {
                    if (is_array($value)) {
                        $decodedData[$key] = $this->unpackTimeLine($value);
                    }
                }

                unset($decodedData[self::STORAGE_KEY_FORMAT]);
                unset($decodedData[self::STORAGE_KEY_VERSION]);
            } else {
                foreach ($decodedData as $key => &$value) {
                    if (is_array($value)) {
                        $timeLine = new QtiTimeLine();
                        $timeLine->fromArray($value);
                        $decodedData[$key] = $timeLine;
                    }
                }
            }
        }

        return $decodedData;
    }
}
