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

use oat\oatbox\service\ConfigurableService;

/**
 * Class QtiRunnerService
 * 
 * QTI implementation service for the test runner
 * 
 * @package oat\taoQtiTest\models
 */
class QtiRunnerService extends ConfigurableService implements RunnerService
{
    const CONFIG_ID = 'taoQtiTest/runner';

    /**
     * Gets the test session for a particular delivery execution
     * @param $testDefinition
     * @param $testCompilation
     * @param $testExecution
     * @return mixed
     */
    public function getTestSession($testDefinition, $testCompilation, $testExecution)
    {
        // TODO: Implement getTestSession() method.
    }

    /**
     * Initializes the delivery execution session
     * @param $testSession
     * @return boolean
     */
    public function init($testSession)
    {
        // TODO: Implement init() method.
    }

    /**
     * Gets the test definition data
     * @param $testSession
     * @return array
     */
    public function getTestData($testSession)
    {
        // TODO: Implement getTestData() method.

        return [];
    }

    /**
     * Gets the test context object
     * @param $testSession
     * @return array
     */
    public function getTestContext($testSession)
    {
        // TODO: Implement getTestContext() method.

        return [];
    }

    /**
     * Gets definition data of a particular item
     * @param $testSession
     * @param $itemRef
     * @return array
     */
    public function getItemData($testSession, $itemRef)
    {
        // TODO: Implement getItemData() method.

        return [];
    }

    /**
     * Gets the state of a particular item
     * @param $testSession
     * @param $itemRef
     * @return array
     */
    public function getItemState($testSession, $itemRef)
    {
        // TODO: Implement getItemState() method.
        
        return [];
    }

    /**
     * Sets the state of a particular item
     * @param $testSession
     * @param $itemRef
     * @param $state
     * @return boolean
     */
    public function setItemState($testSession, $itemRef, $state)
    {
        // TODO: Implement setItemState() method.

        return true;
    }

    /**
     * Stores the response of a particular item
     * @param $testSession
     * @param $itemRef
     * @param $response
     * @return boolean
     */
    public function storeItemResponse($testSession, $itemRef, $response)
    {
        // TODO: Implement storeItemResponse() method.

        return true;
    }

    /**
     * Moves the current position to the provided scoped reference.
     * @param $testSession
     * @param $scope
     * @param $ref
     * @return boolean
     */
    public function move($testSession, $scope, $ref)
    {
        // TODO: Implement move() method.

        return true;
    }

    /**
     * Skips the current position to the provided scoped reference
     * @param $testSession
     * @param $scope
     * @param $ref
     * @return boolean
     */
    public function skip($testSession, $scope, $ref)
    {
        // TODO: Implement skip() method.

        return true;
    }

    /**
     * Finishes the test
     * @param $testSession
     * @return boolean
     */
    public function finish($testSession)
    {
        // TODO: Implement finish() method.

        return true;
    }

    /**
     * Sets the test to paused state
     * @param $testSession
     * @return boolean
     */
    public function pause($testSession)
    {
        // TODO: Implement pause() method.

        return true;
    }

    /**
     * Resumes the test from paused state
     * @param $testSession
     * @return boolean
     */
    public function resume($testSession)
    {
        // TODO: Implement resume() method.
        
        return true;
    }

}
