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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */

namespace oat\taoQtiTest\models\runner\time;

use oat\taoTests\models\runner\time\ArraySerializable;
use oat\taoTests\models\runner\time\IncompleteRangeException;
use oat\taoTests\models\runner\time\InconsistentRangeException;
use oat\taoTests\models\runner\time\InvalidDataException;
use oat\taoTests\models\runner\time\MalformedRangeException;
use oat\taoTests\models\runner\time\TimeException;
use oat\taoTests\models\runner\time\TimeLine;
use oat\taoTests\models\runner\time\TimePoint;

/**
 * Class QtiTimeLine
 * @package oat\taoQtiTest\models\runner\time
 */
class QtiTimeLine implements TimeLine, ArraySerializable, \Serializable, \JsonSerializable
{
    /**
     * The list of TimePoint representing the TimeLine
     * @var array
     */
    protected $points = [];

    /**
     * QtiTimeLine constructor.
     * @param array $points
     */
    public function __construct($points = null)
    {
        if (isset($points)) {
            foreach ($points as $point) {
                $this->add($point);
            }
        }
    }

    /**
     * Exports the internal state to an array
     * @return array
     */
    public function toArray()
    {
        $data = [];
        foreach ($this->points as $point) {
            $data[] = $point->toArray();
        }
        return $data;
    }

    /**
     * Imports the internal state from an array
     * @param array $data
     */
    public function fromArray($data)
    {
        $this->points = [];
        if (is_array($data)) {
            foreach ($data as $dataPoint) {
                $point = new TimePoint();
                $point->fromArray($dataPoint);
                $this->points[] = $point;
            }
        }
    }

    /**
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     * @since 5.4.0
     */
    public function jsonSerialize()
    {
        return $this->toArray();
    }

    /**
     * String representation of object
     * @link http://php.net/manual/en/serializable.serialize.php
     * @return string the string representation of the object or null
     * @since 5.1.0
     */
    public function serialize()
    {
        return serialize($this->points);
    }

    /**
     * Constructs the object
     * @link http://php.net/manual/en/serializable.unserialize.php
     * @param string $serialized <p>
     * The string representation of the object.
     * </p>
     * @return void
     * @since 5.1.0
     * @throws InvalidDataException
     */
    public function unserialize($serialized)
    {
        $this->points = unserialize($serialized);
        if (!is_array($this->points)) {
            throw new InvalidDataException('The provided serialized data are invalid!');
        }
    }

    /**
     * Gets the list of TimePoint present in the TimeLine
     * @return array
     */
    public function getPoints()
    {
        return $this->points;
    }


    /**
     * Adds another TimePoint inside the TimeLine
     * @param TimePoint $point
     * @return TimeLine
     */
    public function add(TimePoint $point)
    {
        $this->points[] = $point;
        return $this;
    }

    /**
     * Removes all TimePoint corresponding to the provided criteria
     * @param string|array $tag A tag or a list of tags to filter
     * @param int $target The type of target TimePoint to filter
     * @param int $type The tyoe of TimePoint to filter
     * @return int Returns the number of removed TimePoints
     */
    public function remove($tag, $target = TimePoint::TARGET_ALL, $type = TimePoint::TYPE_ALL)
    {
        $tags = is_array($tag) ? $tag : [$tag];
        $removed = 0;
        foreach ($this->points as $idx => $point) {
            if ($point->match($tags, $target, $type)) {
                unset($this->points[$idx]);
                $removed++;
            }
        }
        return $removed;
    }

    /**
     * Clears the TimeLine from all its TimePoint
     * @return TimeLine
     */
    public function clear()
    {
        $this->points = [];
        return $this;
    }

    /**
     * Gets a filtered TimeLine, containing the TimePoint corresponding to the provided criteria
     * @param string|array $tag A tag or a list of tags to filter
     * @param int $target The type of target TimePoint to filter
     * @param int $type The type of TimePoint to filter
     * @return TimeLine Returns a subset corresponding to the found TimePoints
     */
    public function filter($tag = null, $target = TimePoint::TARGET_ALL, $type = TimePoint::TYPE_ALL)
    {
        // the tag criteria can be omitted
        $tags = null;
        if (isset($tag)) {
            $tags = is_array($tag) ? $tag : [$tag];
        }
        
        // create a another instance of the same class
        $subset = new static();
        
        // fill the new instance with filtered TimePoint
        foreach ($this->points as $idx => $point) {
            if ($point->match($tags, $target, $type)) {
                $subset->add($point);
            }
        }

        return $subset;
    }

    /**
     * Finds all TimePoint corresponding to the provided criteria
     * @param string|array $tag A tag or a list of tags to filter
     * @param int $target The type of target TimePoint to filter
     * @param int $type The type of TimePoint to filter
     * @return array Returns a list of the found TimePoints
     */
    public function find($tag = null, $target = TimePoint::TARGET_ALL, $type = TimePoint::TYPE_ALL)
    {
        // the tag criteria can be omitted
        $tags = null;
        if (isset($tag)) {
            $tags = is_array($tag) ? $tag : [$tag];
        }
        
        // gather filterer TimePoint
        $points = [];
        foreach ($this->points as $point) {
            if ($point->match($tags, $target, $type)) {
                $points [] = $point;
            }
        }
        return $points;
    }

    /**
     * Computes the total duration represented by the filtered TimePoints
     * @param string|array $tag A tag or a list of tags to filter
     * @param int $target The type of target TimePoint to filter
     * @param int $lastTimestamp An optional timestamp that will be utilized to close the last open range, if any
     * @return float Returns the total computed duration
     * @throws TimeException
     */
    public function compute($tag = null, $target = TimePoint::TARGET_ALL, $lastTimestamp = 0)
    {
        // default value for the last timestamp
        if (!$lastTimestamp) {
            $lastTimestamp = microtime(true);
        }
        
        // either get all points or only a subset according to the provided criteria
        if (!$tag && $target == TimePoint::TARGET_ALL) {
            $points = $this->getPoints();
        } else {
            $points = $this->find($tag, $target, TimePoint::TYPE_ALL);
        }
        
        // we need a ordered list of points
        TimePoint::sort($points);
        
        // gather points by ranges, relying on the points references
        $ranges = [];
        foreach ($points as $point) {
            $ranges[$point->getRef()][] = $point;
        }

        // compute the total duration by summing all gathered ranges
        // this loop can throw exceptions 
        $duration = 0;
        foreach ($ranges as $range) {

            // the last range could be still open, or some range could be malformed due to connection issues...
            $range = $this->fixRange($range, $lastTimestamp);
            
            // compute the duration of the range, an exception may be thrown if the range is malformed
            // possible errors are (but should be avoided by the `fixRange()` method):
            // - unclosed range: should be autoclosed by fixRange
            // - unsorted points or nested/blended ranges: should be corrected by fixRange
            $duration += $this->computeRange($range);
        }
        
        return $duration;
    }

    /**
     * Compute the duration of a range of TimePoint
     * @param array $range
     * @return float
     * @throws IncompleteRangeException
     * @throws InconsistentRangeException
     * @throws MalformedRangeException
     */
    protected function computeRange($range)
    {
        // a range must be built from pairs of TimePoint
        if (count($range) % 2) {
            throw new IncompleteRangeException();
        }

        $duration = 0;
        $start = null;
        $end = null;
        foreach ($range as $point) {
            // grab the START TimePoint
            if ($this->isStartPoint($point)) {
                // we cannot have the START TimePoint twice
                if ($start) {
                    throw new MalformedRangeException('A time range must be defined by a START and a END TimePoint! Twice START found.');
                }
                $start = $point;
            }

            // grab the END TimePoint
            if ($this->isEndPoint($point)) {
                // we cannot have the END TimePoint twice
                if ($end) {
                    throw new MalformedRangeException('A time range must be defined by a START and a END TimePoint! Twice END found.');
                }
                $end = $point;
            }

            // when we have got START and END TimePoint, compute the duration
            if ($start && $end) {
                $duration += $this->getRangeDuration($start, $end);
                $start = null;
                $end = null;
            }
        }
        
        return $duration;
    }

    /**
     * Ensures the ranges are well formed. They should have been sorted before, otherwise the process won't work.
     * Tries to fix a range by adding missing points
     * @param array $range
     * @param float $lastTimestamp - An optional timestamp to apply on the last TimePoint if missing
     * @return array
     */
    protected function fixRange($range, $lastTimestamp = null)
    {
        $fixedRange = [];
        $last = null;
        $open = false;

        foreach ($range as $point) {
            if ($this->isStartPoint($point)) {              // start of range
                // the last range could be still open...
                if ($last && $open) {
                    $fixedRange[] = $this->cloneTimePoint($point, TimePoint::TYPE_END);
                }
                $open = true;
            } else if ($this->isEndPoint($point)) {         // end of range
                // this range could not be started...
                if (!$open) {
                    $fixedRange[] = $this->cloneTimePoint($last ? $last : $point, TimePoint::TYPE_START);
                }
                $open = false;
            }
            $fixedRange[] = $point;
            $last = $point;
        }

        // the last range could be still open...
        if ($last && $open) {
            $fixedRange[] = $this->cloneTimePoint($last, TimePoint::TYPE_END, $lastTimestamp);
        }
        
        return $fixedRange;
    }

    /**
     * Makes a copy of a TimePoint and forces a particular type
     * @param TimePoint $point - The point to duplicate
     * @param int $type - The type of the new point. It should be different!
     * @param float $timestamp - An optional timestamp to set on the new point. By default keep the source timestamp.
     * @return TimePoint
     */
    protected function cloneTimePoint(TimePoint $point, $type, $timestamp = null)
    {
        if (is_null($timestamp)) {
            $timestamp = $point->getTimestamp();
        }
        \common_Logger::d("Create missing TimePoint at " . $timestamp);
        return new TimePoint($point->getTags(), $timestamp, $type, $point->getTarget());
    }

    /**
     * Tells if this is a start TimePoint
     * @param TimePoint $point
     * @return bool
     */
    protected function isStartPoint(TimePoint $point)
    {
        return $point->match(null, TimePoint::TARGET_ALL, TimePoint::TYPE_START);
    }

    /**
     * Tells if this is a end TimePoint
     * @param TimePoint $point
     * @return bool
     */
    protected function isEndPoint(TimePoint $point)
    {
        return $point->match(null, TimePoint::TARGET_ALL, TimePoint::TYPE_END);
    }

    /**
     * Computes the duration between two TimePoint
     * @param TimePoint $start
     * @param TimePoint $end
     * @return float
     * @throws InconsistentRangeException
     */
    protected function getRangeDuration($start, $end)
    {
        // the two TimePoint must have the same target to be consistent
        if ($start->getTarget() != $end->getTarget()) {
            throw new InconsistentRangeException('A time range must be defined by two TimePoint with the same target');
        }

        // the two TimePoint must be correctly ordered
        $rangeDuration = $end->getTimestamp() - $start->getTimestamp();
        if ($rangeDuration < 0) {
            throw new InconsistentRangeException('A START TimePoint cannot take place after the END!');
        }

        return $rangeDuration;
    }
}
