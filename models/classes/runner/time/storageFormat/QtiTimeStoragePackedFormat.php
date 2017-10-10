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
 * {
 *      "index": {
 *          "tag1": [0, 1, 2, 6, ...],
 *          "tag2": [0, 2, 4, ...],
 *          ...
 *          "tagN": [100, 101, 110, 111, ...],
 *      },
 *      "points: [
 *          [target, type, timestamp],
 *          [target, type, timestamp],
 *          ...
 *          [target, type, timestamp]
 *      ]
 * }
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
     * Packs a TimeLine in order to reduce the storage footprint
     * @param TimeLine $timeLine
     * @return array
     */
    protected function packTimeLine(&$timeLine)
    {
        $data = [
            self::STORAGE_KEY_TIMELINE_INDEX => [],
            self::STORAGE_KEY_TIMELINE_TAGS => [],
            self::STORAGE_KEY_TIMELINE_POINTS => [],
        ];

        // Will split tags from the list of TimePoint, and put them into a dedicated index.
        // The other TimePoint info are put in a simple array with predictable order, this way: [target, type, timestamp].
        $index = 0;
        foreach ($timeLine->getPoints() as &$point) {
            /** @var TimePoint $point */
            $data[self::STORAGE_KEY_TIMELINE_POINTS][$index] = [$point->getTarget(), $point->getType(), $point->getTimestamp()];

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
            // rebuild the TimeLine from the list of stored TimePoint
            $tags = $data[self::STORAGE_KEY_TIMELINE_TAGS];
            foreach ($data[self::STORAGE_KEY_TIMELINE_POINTS] as &$dataPoint) {
                $point = new TimePoint($tags, $dataPoint[2], $dataPoint[1], $dataPoint[0]);
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
    public function encode(&$data)
    {
        if (is_array($data)) {
            $data[self::STORAGE_KEY_FORMAT] = $this->getFormat();
            $data[self::STORAGE_KEY_VERSION] = $this->getVersion();

            foreach ($data as $key => &$value) {
                if ($value instanceof TimeLine) {
                    $data[$key] = $this->packTimeLine($value);
                }
            }
        }

        return parent::encode($data);
    }

    /**
     * Decode a string encoded with the managed format.
     * @param string $data
     * @return mixed
     */
    public function decode(&$data)
    {
        $decodedData = parent::decode($data);

        if (is_array($decodedData) && isset($decodedData[self::STORAGE_KEY_FORMAT])) {
            if ($decodedData[self::STORAGE_KEY_FORMAT] != $this->getFormat()) {
                \common_Logger::w(sprintf('QtiTimeStorage: wrong decoder applied! (Expected: %s, Applied: %s)', $decodedData[self::STORAGE_KEY_FORMAT], $this->getFormat()));
            }

            foreach ($decodedData as $key => &$value) {
                if (is_array($value)) {
                    $decodedData[$key] = $this->unpackTimeLine($value);
                }
            }
        }

        return $decodedData;
    }
}
