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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiTest\test\unit\models\classes\runner\toolsStates;

use oat\oatbox\service\ServiceManager;
use oat\taoQtiTest\models\runner\toolsStates\RdsToolsStateStorage;
use oat\taoQtiTest\scripts\install\InstallRdsToolsStateStorage;
use Prophecy\Argument;

class RdsToolsStateStorageTest extends ToolsStateStorageTestCase
{
    /**
     * @var RdsToolsStateStorage
     */
    private $storage;

    /**
     * @return RdsToolsStateStorage
     */
    protected function getStorage()
    {
        return $this->storage;
    }

    /**
     * Deploys the storage and prepares it for testing
     *
     * @throws \common_Exception
     * @throws \oat\oatbox\service\exception\InvalidServiceManagerException
     */
    public function setUp()
    {
        $databaseMock = $this->getSqlMock('tools_states');
        $persistence = $databaseMock->getPersistenceById('tools_states');

        $persistanceManagerProphecy = $this->prophesize(\common_persistence_Manager::class);
        $persistanceManagerProphecy->getPersistenceById(Argument::any())->willReturn($persistence);
        $serviceManagerMock = $this->getServiceLocatorMock([
            \common_persistence_Manager::SERVICE_ID => $persistanceManagerProphecy,
        ]);

        $fakeManager = $this->getMockBuilder(ServiceManager::class)->setMethods(['register'])->disableOriginalConstructor()->getMock();
        /** @var InstallRdsToolsStateStorage $installRdsToolsStateStorage */
        $installRdsToolsStateStorage = $this->getMockBuilder(InstallRdsToolsStateStorage::class)->setMethods(['getServiceManager'])->getMock();
        $installRdsToolsStateStorage->expects($this->any())
            ->method('getServiceManager')
            ->willReturn(
                $fakeManager
            );

        $installRdsToolsStateStorage->setServiceLocator($serviceManagerMock);
        $installRdsToolsStateStorage([]);

        $this->storage = new RdsToolsStateStorage();
        $this->storage->setOption(RdsToolsStateStorage::OPTION_PERSISTENCE, $persistence);
        $this->storage->setServiceLocator($serviceManagerMock);
    }
}