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
namespace oat\taoQtiTest\models;

interface RunnerService
{
    /**
     * Gets the test session for a particular delivery execution
     * @param $testDefinition
     * @param $testCompilation
     * @param $testExecution
     * @return mixed
     */
    public function getTestSession($testDefinition, $testCompilation, $testExecution);

    /**
     * Initializes the delivery execution session
     * @param $testSession
     * @return mixed
     */
    public function init($testSession);

    /**
     * Gets the test definition data
     * @param $testSession
     * @return mixed
     */
    public function getTestData($testSession);

    /**
     * Gets the test context object
     * @param $testSession
     * @return mixed
     */
    public function getTestContext($testSession);

    /**
     * Gets definition data of a particular item
     * @param $testSession
     * @param $itemRef
     * @return mixed
     */
    public function getItemData($testSession, $itemRef);

    /**
     * Gets the state of a particular item
     * @param $testSession
     * @param $itemRef
     * @return mixed
     */
    public function getItemState($testSession, $itemRef);

    /**
     * Sets the state of a particular item
     * @param $testSession
     * @param $itemRef
     * @param $state
     * @return mixed
     */
    public function setItemState($testSession, $itemRef, $state);

    /**
     * Stores the response of a particular item
     * @param $testSession
     * @param $itemRef
     * @param $response
     * @return mixed
     */
    public function storeItemResponse($testSession, $itemRef, $response);

    /**
     * Moves the current position to the provided scoped reference.
     * @param $testSession
     * @param $scope
     * @param $ref
     * @return mixed
     */
    public function move($testSession, $scope, $ref);

    /**
     * Skips the current position to the provided scoped reference
     * @param $testSession
     * @param $scope
     * @param $ref
     * @return mixed
     */
    public function skip($testSession, $scope, $ref);

    /**
     * Finishes the test
     * @param $testSession
     * @return mixed
     */
    public function finish($testSession);

    /**
     * Sets the test to paused state
     * @param $testSession
     * @return mixed
     */
    public function pause($testSession);

    /**
     * Resumes the test from paused state
     * @param $testSession
     * @return mixed
     */
    public function resume($testSession);
}
