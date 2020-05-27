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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiTest\test\unit;

use oat\generis\test\MockObject;
use oat\generis\test\TestCase;
use oat\oatbox\mutex\LockService;
use oat\taoQtiTest\models\TestSessionService;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoDelivery\model\RuntimeService;
use oat\taoDelivery\model\execution\DeliveryServerService;
use oat\taoResultServer\models\classes\ResultStorageWrapper;
use common_ext_ExtensionsManager;
use common_ext_Extension;
use qtism\data\storage\php\PhpDocument;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\tests\AssessmentTestSessionState;
use Symfony\Component\Lock\Factory;
use Symfony\Component\Lock\LockInterface;
use tao_models_classes_service_StateStorage;
use oat\taoQtiTest\models\files\QtiFlysystemFileManager;
use tao_models_classes_service_FileStorage;
use oat\taoQtiTest\models\QtiTestUtils;
use oat\oatbox\service\ServiceManager;

/**
 * Class TestSessionServiceTest
 * @package oat\taoQtiTest\test\unit
 */
class TestSessionServiceTest extends TestCase
{

    public function testGetTestSessionLoadsNewSession()
    {
        $service = $this->getService();
        $deliveryExecutionMock = $this->getDeliveryExecutionMock('id', 'userId', 'deliveryId');
        $session = $service->getTestSession($deliveryExecutionMock, true);
        $sessionStorage = $service->getTestSessionStorage($deliveryExecutionMock);

        $this->assertInstanceOf(AssessmentTestSession::class, $session);
        $this->assertEquals('id', $session->getSessionId());
        $this->assertEquals(AssessmentTestSessionState::CLOSED, $session->getState());
        $this->assertTrue($session->isReadOnly());

        $sessionNotReadOnly = $service->getTestSession($deliveryExecutionMock, false);
        $this->assertFalse($sessionNotReadOnly->isReadOnly());

        // Check if session and session storage are returned from cache.
        $sessionStorage2 = $service->getTestSessionStorage($deliveryExecutionMock);
        self::assertSame($session, $sessionNotReadOnly, 'Service must return the same session object.');
        self::assertSame($sessionStorage, $sessionStorage2, 'Service must return the same session storage object.');
    }

    /**
     * @return TestSessionService
     * @throws \common_exception_Error
     */
    private function getService()
    {
        $service = new TestSessionService();

        $runtimeServiceMock = $this->getMockBuilder(RuntimeService::class)
            ->getMock();

        $serviceCallMock = $this->getMockBuilder(\tao_models_classes_service_ServiceCall::class)
            ->disableOriginalConstructor()
            ->getMock();
        $serviceCallMock->method('getInParameters')->willReturn([
            new \tao_models_classes_service_ConstantParameter(
                new \core_kernel_classes_Resource('http://www.tao.lu/Ontologies/TAOTest.rdf#FormalParamQtiTestCompilation'),
                'http://tao.local/tao.rdf#i5e283280659c811408c92e7adfa5708a14-|http://tao.local/tao.rdf#i5e283280660c611408413648d4f380e160+'
            ),
            new \tao_models_classes_service_ConstantParameter(
                new \core_kernel_classes_Resource('http://www.tao.lu/Ontologies/TAOTest.rdf#FormalParamQtiTestDefinition'),
                'http://tao.local/tao.rdf#i5e28322a9c33611408e8f67f51196156cd'
            ),
        ]);

        $resultStoreWrapperMock = $this->getMockBuilder(ResultStorageWrapper::class)
            ->disableOriginalConstructor()
            ->getMock();

        $deliveryServerServiceMock = $this->getMockBuilder(DeliveryServerService::class)
            ->getMock();
        $deliveryServerServiceMock->method('getResultStoreWrapper')
            ->willReturn($resultStoreWrapperMock);

        $runtimeServiceMock->method('getRuntime')->willReturn($serviceCallMock);

        $qtiTestExtensionMock = $this->getMockBuilder(common_ext_Extension::class)
            ->disableOriginalConstructor()
            ->getMock();
        $qtiTestExtensionMock->method('getConfig')->will($this->returnValueMap([
            ['testRunner', ['test-session-storage' => '\\taoQtiTest_helpers_TestSessionStorage']],
            ['qtiAcceptableLatency', 'PT5S'],
        ]));
        $extensionsManagerMock = $this->getMockBuilder(common_ext_ExtensionsManager::class)->getMock();
        $extensionsManagerMock->method('getExtensionById')->will($this->returnValueMap([
            ['taoQtiTest', $qtiTestExtensionMock]
        ]));

        $stateStorageMock = $this->getMockBuilder(tao_models_classes_service_StateStorage::class)
            ->getMock();

        $stateStorageMock->method('has')->will($this->returnValueMap([
            ['userId', 'id', true]
        ]));
        $binary = require 'samples/testsessionbinary.php';
        $stateStorageMock->method('get')->will($this->returnValueMap([
            ['userId', 'id', $binary]
        ]));

        $lock = $this->getMockBuilder(LockInterface::class)->disableOriginalConstructor()->getMock();
        $lock->method('acquire')->willReturn(true);
        $lock->method('release')->willReturn(true);

        $lockFactory = $this->getMockBuilder(Factory::class)->disableOriginalConstructor()->getMock();
        $lockFactory->method('createLock')->willReturn($lock);

        $lockService = $this->getMockBuilder(LockService::class)->disableOriginalConstructor()->getMock();
        $lockService->method('getLockFactory')->willReturn($lockFactory);

        $qtiFlysystemFileManagerService = $this->getMockBuilder(QtiFlysystemFileManager::class)->getMock();

        $fileStorageService = $this->getMockBuilder(tao_models_classes_service_FileStorage::class)->getMock();
        $fileStorageService->method('getDirectoryById')->will($this->returnValueMap([
            ['http://tao.local/tao.rdf#i5e283280659c811408c92e7adfa5708a14-', 'dir_foo'],
            ['http://tao.local/tao.rdf#i5e283280660c611408413648d4f380e160+', 'dir_bar'],
        ]));

        $doc = new PhpDocument();
        $doc->load(__DIR__.'/samples/php-data.php');

        $testDefinition = $doc->getDocumentComponent();
        $qtiTestUtilsService = $this->getMockBuilder(QtiTestUtils::class)->getMock();
        $qtiTestUtilsService->method('getTestDefinition')
            ->willReturn($testDefinition);

        $serviceLocator = $this->getServiceLocatorMock([
            RuntimeService::SERVICE_ID => $runtimeServiceMock,
            DeliveryServerService::SERVICE_ID => $deliveryServerServiceMock,
            common_ext_ExtensionsManager::SERVICE_ID => $extensionsManagerMock,
            tao_models_classes_service_StateStorage::SERVICE_ID => $stateStorageMock,
            LockService::SERVICE_ID => $lockService,
            QtiFlysystemFileManager::SERVICE_ID => $qtiFlysystemFileManagerService,
            tao_models_classes_service_FileStorage::SERVICE_ID => $fileStorageService,
            QtiTestUtils::SERVICE_ID => $qtiTestUtilsService
        ]);

        $cacheMock = $this->getMockBuilder(\common_cache_Cache::class)->getMock();
        $cacheMock->method('get')->willReturnMap([
            ['tao_service_param_http%3A%2F%2Fwww.tao.lu%2FOntologies%2FTAOTest.rdf%23FormalParamQtiTestCompilation', 'QtiTestCompilation'],
            ['tao_service_param_http%3A%2F%2Fwww.tao.lu%2FOntologies%2FTAOTest.rdf%23FormalParamQtiTestDefinition', 'QtiTestDefinition'],
        ]);

        $config = new \common_persistence_KeyValuePersistence([], new \common_persistence_InMemoryKvDriver());
        $config->set(\common_cache_NoCache::SERVICE_ID, $cacheMock);
        $config->set(\common_ext_ExtensionsManager::SERVICE_ID, $extensionsManagerMock);
        ServiceManager::setServiceManager(new ServiceManager($config));

        $service->setServiceLocator($serviceLocator);
        return $service;
    }

    /**
     * @param $id
     * @param $userId
     * @param $deliveryId
     * @return DeliveryExecution
     */
    private function getDeliveryExecutionMock($id, $userId, $deliveryId)
    {
        /** @var DeliveryExecution|MockObject $mock */
        $mock = $this->getMockBuilder(DeliveryExecution::class)->disableOriginalConstructor()
            ->getMock();
        $mock->method('getIdentifier')->willReturn($id);
        $mock->method('getUserIdentifier')->willReturn($userId);
        $mock->expects($this->once())
            ->method('getDelivery')->willReturn(new \core_kernel_classes_Resource($deliveryId));

        return $mock;
    }
}
