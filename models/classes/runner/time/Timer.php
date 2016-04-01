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
 * Interface Timer
 * @package oat\taoQtiTest\models\runner\time
 */
interface Timer
{
    /**
     * Adds a "server start" TimePoint at a particular timestamp for the provided ItemRef
     * @param string $itemRef
     * @param float $timestamp
     * @return Timer
     */
    public function start($itemRef, $timestamp);

    /**
     * Adds a "server end" TimePoint at a particular timestamp for the provided ItemRef
     * @param string $itemRef
     * @param float $timestamp
     * @return Timer
     */
    public function end($itemRef, $timestamp);

    /**
     * Adds "client start" and "client end" TimePoint based on the provided duration for a particular ItemRef
     * @param string $itemRef
     * @param float $duration
     * @return Timer
     */
    public function adjust($itemRef, $duration);

    /**
     * Computes the total duration represented by the filtered TimePoints
     * @param string|array $tag A tag or a list of tags to filter
     * @param int $target The type of target TimePoint to filter
     * @return float Returns the total computed duration
     */
    public function compute($tag, $target);

    /**
     * Checks if the duration of a TimeLine subset reached the timeout
     * @param float $timeLimit The time limit against which compare the duration
     * @param string|array $tag A tag or a list of tags to filter
     * @param int $target The type of target TimePoint to filter
     * @return bool Returns true if the timeout is reached
     */
    public function timeout($timeLimit, $tag, $target);

    /**
     * Sets the storage used to maintain the data
     * @param $storage
     * @return Timer
     */
    public function setStorage($storage);

    /**
     * Gets the storage used to maintain the data
     * @return mixed
     */
    public function getStorage();

    /**
     * Saves the data to the storage
     * @return Timer
     * @throws \Exception if any error occurs
     */
    public function save();

    /**
     * Loads the data from the storage
     * @return Timer
     * @throws \Exception if any error occurs
     */
    public function load();
}