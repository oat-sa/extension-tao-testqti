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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 */

/**
 * taoQtiTest_actions_TestCommand represents an executable commands. 
 *
 * @author Aleh Hutnikau <hutnikau@1pt.com>
 * @package taoQtiTest
 */
class taoQtiTest_scripts_TestCommand extends \tao_scripts_Runner
{
    private $allowedActions = array(
        'endExpiredTests'
    );
    
    /**
     * Main script implementation.
     *
     * @access public
     * @author Aleh Hutnikau <hutnikau@1pt.com>
     * @return void
     */
    public function run()
    {
        $actionName = $this->parameters['action'];
        if (method_exists($this, $actionName) && in_array($actionName, $this->allowedActions)) {
            return $this->$actionName();
        }
    }
    
    /**
     * Finish test attempts where the maximum time limit has been reached.
     * To output will be sent list of id's of finished delivery executions.
     */
    private function endExpiredTests()
    {
        $testCommand = new taoQtiTest_actions_TestCommand();
        ob_start();
        $testCommand->endExpiredTests();
        $response = json_decode(ob_get_clean());
        
        if (is_array($response)) {
            echo count($response). " tests has been finished:" . PHP_EOL;
            foreach ($response as $deliveryId) {
                echo $deliveryId . PHP_EOL;
            }
        } else {
            echo $response;
        }
    }
}