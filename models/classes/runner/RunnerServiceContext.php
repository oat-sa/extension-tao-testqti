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

namespace oat\taoQtiTest\models\runner;

use oat\oatbox\service\ServiceManager;
use oat\taoQtiTest\models\runner\config\RunnerConfig;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;

/**
 * Class RunnerServiceContext
 *
 * Defines a container to store and to share runner service context
 *
 * @package oat\taoQtiTest\models
 */
class RunnerServiceContext implements ServiceLocatorAwareInterface
{
    use ServiceLocatorAwareTrait;

    /**
     * The test session
     * @var mixed
     */
    protected $testSession;

    /**
     * The test runner config
     * @var RunnerConfig
     */
    protected $testConfig;

    /**
     * Gets the test runner config
     * @return RunnerConfig
     */
    public function getTestConfig()
    {
        return $this->testConfig;
    }

    /**
     * Sets the test runner config
     * 
     * @param RunnerConfig $testConfig
     */
    public function setTestConfig(RunnerConfig $testConfig)
    {
        $this->testConfig = $testConfig;
    }
    

    /**
     * Gets the test session
     * @return mixed
     */
    public function getTestSession()
    {
        return $this->testSession;
    }

    /**
     * Sets the test session
     * @param mixed $testSession
     */
    public function setTestSession($testSession)
    {
        $this->testSession = $testSession;
    }

    /**
     * Sets the service manager
     * @param ServiceManager $serviceManager
     * @return RunnerServiceContext
     */
    public function setServiceManager(ServiceManager $serviceManager)
    {
        return $this->setServiceLocator($serviceManager);
    }

    /**
     * Gets the service manager
     * @return ServiceManager
     */
    public function getServiceManager()
    {
        return $this->getServiceLocator();
    }

    /**
     * Starts the context
     */
    public function init()
    {
        
    }
}
