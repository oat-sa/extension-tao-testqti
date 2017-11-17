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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiTest\models;

use oat\oatbox\service\ConfigurableService;
use oat\taoDelivery\model\AssignmentService;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoDeliveryRdf\model\DeliveryContainerService;
use oat\taoQtiTest\models\runner\session\TestSession;
use oat\taoQtiTest\models\runner\session\UserUriAware;
use qtism\runtime\storage\binary\BinaryAssessmentTestSeeker;
use qtism\runtime\tests\AssessmentTestSession;
use oat\taoResultServer\models\classes\ResultServerService;

/**
 * Interface TestSessionService
 * @package oat\taoProctoring\model
 * @author Aleh Hutnikau <hutnikau@1pt.com>
 */
class TestSessionService extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/TestSessionService';

    /** 
     * Cache to store session instances
     * @var array 
     */
    protected static $cache = [];

    /**
     * Loads a test session into the memory cache
     * @param DeliveryExecution $deliveryExecution
     */
    protected function loadSession(DeliveryExecution $deliveryExecution)
    {
        $resultServer = \taoResultServer_models_classes_ResultServerStateFull::singleton();

        $compiledDelivery = $deliveryExecution->getDelivery();
        $inputParameters = $this->getRuntimeInputParameters($deliveryExecution);

        $testDefinition = \taoQtiTest_helpers_Utils::getTestDefinition($inputParameters['QtiTestCompilation']);
        $testResource = new \core_kernel_classes_Resource($inputParameters['QtiTestDefinition']);

        $sessionManager = new \taoQtiTest_helpers_SessionManager($resultServer, $testResource);

        $userId = $deliveryExecution->getUserIdentifier();

        $config = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->getConfig('testRunner');
        $storageClassName = $config['test-session-storage'];
        $qtiStorage = new $storageClassName(
            $sessionManager,
            new BinaryAssessmentTestSeeker($testDefinition), $userId
        );

        $sessionId = $deliveryExecution->getIdentifier();

        if ($qtiStorage->exists($sessionId)) {
            $session = $qtiStorage->retrieve($testDefinition, $sessionId);
            if ($session instanceof UserUriAware) {
                $session->setUserUri($userId);
            }

            $resultServerObject = new \taoResultServer_models_classes_ResultServer(ResultServerService::SERVICE_ID);
            $resultServer->setValue('resultServerUri', ResultServerService::SERVICE_ID);
            $resultServer->setValue('resultServerObject', [ResultServerService::SERVICE_ID => $resultServerObject]);
            $resultServer->setValue('resultServer_deliveryResultIdentifier', $sessionId);
        } else {
            $session = null;
        }

        /** @var \tao_models_classes_service_FileStorage $fileStorage */
        $fileStorage = $this->getServiceManager()->get(\tao_models_classes_service_FileStorage::SERVICE_ID);
        $directoryIds = explode('|', $inputParameters['QtiTestCompilation']);
        $directories = array(
            'private' => $fileStorage->getDirectoryById($directoryIds[0]),
            'public' => $fileStorage->getDirectoryById($directoryIds[1])
        );

        self::$cache[$sessionId] = [
            'session' => $session,
            'storage' => $qtiStorage,
            'compilation' => $directories
        ];
    }

    /**
     * Checks if a session has been loaded
     * @param $sessionId
     * @return bool
     */
    protected function hasTestSession($sessionId)
    {
        return (isset(self::$cache[$sessionId]) && isset(self::$cache[$sessionId]['session']));
    }

    /**
     * Gets the test session for a particular deliveryExecution
     *
     * @param DeliveryExecution $deliveryExecution
     * @return \qtism\runtime\tests\AssessmentTestSession
     * @throws \common_exception_Error
     * @throws \common_exception_MissingParameter
     */
    public function getTestSession(DeliveryExecution $deliveryExecution)
    {
        $sessionId = $deliveryExecution->getIdentifier();
        if (!$this->hasTestSession($sessionId)) {
            $this->loadSession($deliveryExecution);
        }

        return self::$cache[$sessionId]['session'];
    }
    
    /**
     * Register a test session
     *
     * @param TestSession $session
     * @param \taoQtiTest_helpers_TestSessionStorage $storage
     * @param array $compilationDirectories
     */
    public function registerTestSession(AssessmentTestSession $session, \taoQtiTest_helpers_TestSessionStorage $storage, array $compilationDirectories)
    {
        $sessionId = $session->getSessionId();
        self::$cache[$sessionId] = [
            'session' => $session,
            'storage' => $storage,
            'compilation' => $compilationDirectories
        ];
    }
    
    /**
     * Get a test session data by identifier.
     * 
     * Get a session by $sessionId. In case it was previously registered using the TestSessionService::registerTestSession method,
     * an array with the following keys will be returned:
     * 
     * * 'session': A qtism AssessmentTestSession object.
     * * 'storage': A taoQtiTest_helpers_TestSessionStorage.
     * * 'context': A RunnerServiceContext object (if not provided at TestSessionService::registerTestSession call time, it contains null).
     * 
     * In case of no such session is found for $sessionId, false is returned.
     * 
     * @param string $sessionId
     * @return false|array
     */
    public function getTestSessionDataById($sessionId)
    {
        return $this->hasTestSession($sessionId) ? self::$cache[$sessionId] : false;
    }

    /**
     * Gets the test session storage for a particular deliveryExecution
     *
     * @param DeliveryExecution $deliveryExecution
     * @return \taoQtiTest_helpers_TestSessionStorage
     * @throws \common_exception_Error
     * @throws \common_exception_MissingParameter
     */
    public function getTestSessionStorage(DeliveryExecution $deliveryExecution)
    {
        $sessionId = $deliveryExecution->getIdentifier();
        if (!$this->hasTestSession($sessionId)) {
            $this->loadSession($deliveryExecution);
        }

        return self::$cache[$sessionId]['storage'];
    }

    /**
     *
     * @param DeliveryExecution $deliveryExecution
     * @return array
     * Example:
     * <pre>
     * array(
     *   'QtiTestCompilation' => 'http://sample/first.rdf#i14369768868163155-|http://sample/first.rdf#i1436976886612156+',
     *   'QtiTestDefinition' => 'http://sample/first.rdf#i14369752345581135'
     * )
     * </pre>
     */
    public function getRuntimeInputParameters(DeliveryExecution $deliveryExecution)
    {
        $compiledDelivery = $deliveryExecution->getDelivery();
        $runtime = $this->getServiceLocator()->get(AssignmentService::SERVICE_ID)->getRuntime($compiledDelivery->getUri());
        $inputParameters = \tao_models_classes_service_ServiceCallHelper::getInputValues($runtime, array());

        return $inputParameters;
    }

    /**
     * @param AssessmentTestSession $session
     */
    public function persist(AssessmentTestSession $session)
    {
        $sessionId = $session->getSessionId();
        if ($this->hasTestSession($sessionId)) {
            $storage = self::$cache[$sessionId]['storage'];
            $storage->persist($session);
        }
    }
}
