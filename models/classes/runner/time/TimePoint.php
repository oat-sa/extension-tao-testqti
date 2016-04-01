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
 * Interface TimePoint
 * @package oat\taoQtiTest\models\runner\time
 */
interface TimePoint extends \Serializable
{
    /**
     * Type of TimePoint: start of range
     */
    const TYPE_START = 1;

    /**
     * Type of TimePoint: end of range
     */
    const TYPE_END = 2;

    /**
     * Represents all types of TimePoint
     */
    const TYPE_ALL = 3;

    /**
     * Type of TimePoint target: client side
     */
    const TARGET_CLIENT = 1;

    /**
     * Type of TimePoint target: server side
     */
    const TARGET_SERVER = 2;

    /**
     * Represents all types of TimePoint targets
     */
    const TARGET_ALL = 3;

    /**
     * Sets the timestamp of the TimePoint
     * @param float $timestamp
     * @return TimePoint
     */
    public function setTimestamp($timestamp);

    /**
     * Gets the timestamp of the TimePoint
     * @return float
     */
    public function getTimestamp();

    /**
     * Sets the type of TimePoint
     * @param int $type Must be a value from TYPE_START or TYPE_END constants.
     * @return TimePoint
     */
    public function setType($type);

    /**
     * Gets the type of TimePoint
     * @return int
     */
    public function getType();

    /**
     * Sets the target type of the TimePoint
     * @param int $target Must be a value from TARGET_CLIENT or TARGET_SERVER constants.
     * @return TimePoint
     */
    public function setTarget($target);

    /**
     * Gets the target type of the TimePoint
     * @return int
     */
    public function getTarget();

    /**
     * Adds another tag to the TimePoint
     * @param string $tag
     * @return TimePoint
     */
    public function addTag($tag);

    /**
     * Remove a tag from the TimePoint
     * @param string $tag
     * @return TimePoint
     */
    public function removeTag($tag);

    /**
     * Gets a tag from the TimePoint. By default, it will return the first tag.
     * @param int $index
     * @return string
     */
    public function getTag($index = 0);

    /**
     * Gets all tags from te TimePoint
     * @return array
     */
    public function getTags();

}