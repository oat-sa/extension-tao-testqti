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
use oat\taoQtiTest\models\runner\session\UserUriAware;
use qtism\runtime\storage\binary\BinaryAssessmentTestSeeker;
use qtism\runtime\tests\AssessmentTestSession;

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
        $qtiStorage = new \taoQtiTest_helpers_TestSessionStorage(
            $sessionManager,
            new BinaryAssessmentTestSeeker($testDefinition), $userId
        );

        $sessionId = $deliveryExecution->getIdentifier();

        if ($qtiStorage->exists($sessionId)) {
            $session = $qtiStorage->retrieve($testDefinition, $sessionId);
            if ($session instanceof UserUriAware) {
                $session->setUserUri($userId);
            }

            $resultServerUri = $compiledDelivery->getOnePropertyValue(new \core_kernel_classes_Property(TAO_DELIVERY_RESULTSERVER_PROP));
            $resultServerObject = new \taoResultServer_models_classes_ResultServer($resultServerUri, array());
            $resultServer->setValue('resultServerUri', $resultServerUri->getUri());
            $resultServer->setValue('resultServerObject', array($resultServerUri->getUri() => $resultServerObject));
            $resultServer->setValue('resultServer_deliveryResultIdentifier', $sessionId);
        } else {
            $session = null;
        }

        self::$cache[$sessionId] = [
            'session' => $session,
            'storage' => $qtiStorage
        ];
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
        if (!isset(self::$cache[$sessionId]['session'])) {
            $this->loadSession($deliveryExecution);
        }

        return self::$cache[$sessionId]['session'];
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
        if (!isset(self::$cache[$sessionId]['session'])) {
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
        if (isset(self::$cache[$sessionId])) {
            $storage = self::$cache[$sessionId]['storage'];
            $storage->persist($session);
        }
    }
}
