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
 */

namespace oat\taoQtiTest\models\runner;

use oat\oatbox\service\ServiceManager;

trait RunnerToolStates
{
    /**
     * @param string $name
     * @return string
     */
    abstract public function hasRequestParameter($name);

    /**
     * @param string $name
     * @return string mixed
     */
    abstract public function getRequestParameter($name);

    /**
     * @param string $name
     * @return string
     */
    abstract public function getRawRequestParameter($name);

    /**
     * @return ServiceManager
     */
    abstract public function getServiceLocator();

    /**
     * @return RunnerService
     */
    abstract public function getRunnerService();

    /**
     * @return RunnerServiceContext
     */
    abstract public function getServiceContext();

    /**
     * Save the tool state if some are found in the current request
     *
     * @throws \oat\oatbox\service\exception\InvalidServiceManagerException
     * @throws \common_Exception
     *
     * @return boolean true if some state was found and saved
     */
    protected function saveToolStates()
    {
        $toolStateParameter = 'toolStates';
        if ($this->hasRequestParameter($toolStateParameter)) {
            // since the parameter content is a JSON string
            // we need to load it using the raw mode
            $param = $this->getRawRequestParameter($toolStateParameter);
            if ($param) {
                $toolStates = json_decode($param, true);

                if (count($toolStates) > 0) {
                    array_walk($toolStates, function (&$toolState) {
                        $toolState = json_encode($toolState);
                    });
                    $this->getRunnerService()->setToolsStates(
                        $this->getServiceContext(),
                        $toolStates
                    );
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Get the current tools states
     *
     * @throws \oat\oatbox\service\exception\InvalidServiceManagerException
     * @throws \common_Exception
     * @throws \common_ext_ExtensionException
     *
     * @return array the tools states
     */
    protected function getToolStates()
    {
        $toolStates = $this->getRunnerService()->getToolsStates($this->getServiceContext());
        array_walk($toolStates, function (&$toolState) {
            $toolState = json_decode($toolState);
        });
        return $toolStates;
    }
}
