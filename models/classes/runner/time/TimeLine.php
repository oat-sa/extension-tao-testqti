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

/**
 * Interface TimeLine
 * @package oat\taoQtiTest\models\runner\time
 */
interface TimeLine extends \Serializable
{
    /**
     * Adds another TimePoint inside the TimeLine
     * @param TimePoint $point
     * @return TimeLine
     */
    public function add(TimePoint $point);

    /**
     * Removes all TimePoint corresponding to the provided criteria
     * @param string|array $tag A tag or a list of tags to filter
     * @param int $target The type of target TimePoint to filter
     * @param int $type The tyoe of TimePoint to filter
     * @return int Returns the number of removed TimePoints
     */
    public function remove($tag, $target = TimePoint::TARGET_ALL, $type = TimePoint::TYPE_ALL);

    /**
     * Clears the TimeLine from all its TimePoint
     * @return TimeLine
     */
    public function clear();

    /**
     * Finds all TimePoint corresponding to the provided criteria
     * @param string|array $tag A tag or a list of tags to filter
     * @param int $target The type of target TimePoint to filter
     * @param int $type The tyoe of TimePoint to filter
     * @return TimeLine Returns a subset corresponding to the found TimePoints
     */
    public function find($tag, $target = TimePoint::TARGET_ALL, $type = TimePoint::TYPE_ALL);

    /**
     * Computes the total duration represented by the filtered TimePoints
     * @param string|array $tag A tag or a list of tags to filter
     * @param int $target The type of target TimePoint to filter
     * @return float Returns the total computed duration
     */
    public function compute($tag = null, $target = TimePoint::TARGET_ALL);
}