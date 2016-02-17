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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */
namespace oat\taoQtiTest\models;

use oat\oatbox\service\ConfigurableService;
use qtism\runtime\tests\AssessmentTestSession;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoDeliveryRdf\model\DeliveryAssemblyService;
use qtism\runtime\storage\binary\BinaryAssessmentTestSeeker;
use qtism\runtime\storage\binary\AbstractQtiBinaryStorage;

/**
 * The SessionStateService
 *
 * Service used for pausing and resuming the delivery execution.
 * All timers in paused session will be paused.
 *
 * Usage example:
 * <pre>
 * //Pause session:
 * $sessionStateService = ServiceManager::getServiceManager()->get('taoQtiTest/SessionStateService');
 * $sessionStateService->pauseSession($session);
 *
 * //resume session:
 * $sessionStateService = ServiceManager::getServiceManager()->get('taoQtiTest/SessionStateService');
 * $sessionStateService->resumeSession($session);
 * </pre>
 * @author Aleh Hutnikau <hutnikau@1pt.com>
 */
class SessionStateService extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/SessionStateService';
    
    const OPTION_STATE_FORMAT = 'stateFormat';
    
    /**
     * @var \taoDelivery_models_classes_execution_ServiceProxy
     */
    private $deliveryExecutionService;

    /**
     * @var AssessmentTestSession[]
     */
    private $sessions = [];

    /**
     * @var AbstractQtiBinaryStorage[]
     */
    private $qtiStorage = [];

    public function __construct(array $options = array())
    {
        $this->deliveryExecutionService = \taoDelivery_models_classes_execution_ServiceProxy::singleton();
        parent::__construct($options);
    }

    /**
     * Pause delivery execution.
     * @param AssessmentTestSession $session
     * @return boolean success
     */
    public function pauseSession(AssessmentTestSession $session) {
        $session->updateDuration();
        return $this->getDeliveryExecution($session)->setState(DeliveryExecution::STATE_PAUSED);
    }

    /**
     * Resume delivery execution
     * @param AssessmentTestSession $session
     */
    public function resumeSession(AssessmentTestSession $session) {
        $deliveryExecutionState = $this->getSessionState($session);
        if ($deliveryExecutionState === DeliveryExecution::STATE_PAUSED) {
            $this->updateTimeReference($session);
            $this->getDeliveryExecution($session)->setState(DeliveryExecution::STATE_ACTIVE);
        }
    }

    /**
     * Get delivery execution state
     * @param AssessmentTestSession $session
     * @return string
     */
    public function getSessionState(AssessmentTestSession $session) {
        $deliveryExecution = $this->getDeliveryExecution($session);
        return $deliveryExecution->getState()->getUri();
    }

    /**
     * Set time reference of current assessment item session to <i>now</i> instead of time of last update.
     * This ensures that time when delivery execution was paused will not be taken in account.
     * Make sure that method invoked right after retrieving assessment test session
     * and before the first AssessmentTestSession::updateDuration method call
     * @param AssessmentTestSession $session
     * @param \DateTime|null $time Time to be specified. Current time by default. Make sure that $time has UTC timezone.
     */
    public function updateTimeReference(AssessmentTestSession $session, \DateTime $time = null) {
        if ($time === null) {
            $time = new \DateTime('now', new \DateTimeZone('UTC'));
        }

        $itemSession = $session->getCurrentAssessmentItemSession();

        if ($itemSession) {
            $itemSession->setTimeReference($time);
            $session->updateDuration();
        }
    }

    /**
     * @param AssessmentTestSession $session
     * @return \taoDelivery_models_classes_execution_DeliveryExecution
     */
    private function getDeliveryExecution(AssessmentTestSession $session) {
        return $this->deliveryExecutionService->getDeliveryExecution($session->getSessionId());
    }

    /**
     * Returns appropriate JS service implementation for testRunner
     *
     * @param boolean $resetTimerAfterResume
     *
     * @return string
     */
    public function getClientImplementation($resetTimerAfterResume = false){
        if ($resetTimerAfterResume) {
            return 'taoQtiTest/testRunner/resumingStrategy/keepAfterResume';
        }
        return 'taoQtiTest/testRunner/resumingStrategy/resetAfterResume';
    }
    
    /**
     * Return a human readable description of the test session
     *  
     * @return string
     */
    public function getSessionDescription(\taoQtiTest_helpers_TestSession $session)
    {
        if ($session->isRunning()) {
            $format = $this->hasOption(self::OPTION_STATE_FORMAT)
                ? $this->getOption(self::OPTION_STATE_FORMAT)
                : __('%s - item %p/%c');
            $map = array(
                '%s' => $session->getCurrentAssessmentSection()->getTitle(),
                '%p' => $session->getRoute()->getPosition(),
                '%c' => $session->getRouteCount()
            );
            return strtr($format, $map);
        } else {
            return __('finished');
        }
    }

    /**
     * @param DeliveryExecution $deliveryExecution
     * @return mixed
     * @throws \common_exception_MissingParameter
     * @throws \core_kernel_persistence_Exception
     * @throws \qtism\runtime\storage\common\StorageException
     */
    public function getSessionByDeliveryExecution(DeliveryExecution $deliveryExecution)
    {
        if (!isset($this->sessions[$deliveryExecution->getIdentifier()])) {
            $resultServer = \taoResultServer_models_classes_ResultServerStateFull::singleton();

            $compiledDelivery = $deliveryExecution->getDelivery();
            $runtime = DeliveryAssemblyService::singleton()->getRuntime($compiledDelivery);
            $inputParameters = \tao_models_classes_service_ServiceCallHelper::getInputValues($runtime, array());

            $testDefinition = \taoQtiTest_helpers_Utils::getTestDefinition($inputParameters['QtiTestCompilation']);
            $testResource = new \core_kernel_classes_Resource($inputParameters['QtiTestDefinition']);

            $sessionManager = new \taoQtiTest_helpers_SessionManager($resultServer, $testResource);

            $qtiStorage = new \taoQtiTest_helpers_TestSessionStorage(
                $sessionManager,
                new BinaryAssessmentTestSeeker($testDefinition), $deliveryExecution->getUserIdentifier()
            );
            $this->qtiStorage[$deliveryExecution->getIdentifier()] = $qtiStorage;

            $sessionId = $deliveryExecution->getIdentifier();

            if ($qtiStorage->exists($sessionId)) {
                $session = $qtiStorage->retrieve($testDefinition, $sessionId);

                $resultServerUri = $compiledDelivery->getOnePropertyValue(new \core_kernel_classes_Property(TAO_DELIVERY_RESULTSERVER_PROP));
                $resultServerObject = new \taoResultServer_models_classes_ResultServer($resultServerUri, array());
                $resultServer->setValue('resultServerUri', $resultServerUri->getUri());
                $resultServer->setValue('resultServerObject', array($resultServerUri->getUri() => $resultServerObject));
                $resultServer->setValue('resultServer_deliveryResultIdentifier', $deliveryExecution->getIdentifier());
            } else {
                $session = null;
            }

            $this->sessions[$deliveryExecution->getIdentifier()] = $session;
        }

        return $this->sessions[$deliveryExecution->getIdentifier()];
    }

    /**
     * @param DeliveryExecution $deliveryExecution
     * @throws \common_exception_Error
     * @return AbstractQtiBinaryStorage
     */
    public function getQtiStorageByDeliveryExecution(DeliveryExecution $deliveryExecution)
    {
        if (!isset($this->qtiStorage[$deliveryExecution->getIdentifier()])) {
            $resultServer = \taoResultServer_models_classes_ResultServerStateFull::singleton();

            $compiledDelivery = $deliveryExecution->getDelivery();
            $runtime = DeliveryAssemblyService::singleton()->getRuntime($compiledDelivery);
            $inputParameters = \tao_models_classes_service_ServiceCallHelper::getInputValues($runtime, array());

            $testDefinition = \taoQtiTest_helpers_Utils::getTestDefinition($inputParameters['QtiTestCompilation']);
            $testResource = new \core_kernel_classes_Resource($inputParameters['QtiTestDefinition']);

            $sessionManager = new \taoQtiTest_helpers_SessionManager($resultServer, $testResource);

            $qtiStorage = new \taoQtiTest_helpers_TestSessionStorage(
                $sessionManager,
                new BinaryAssessmentTestSeeker($testDefinition), $deliveryExecution->getUserIdentifier()
            );
            $this->qtiStorages[$deliveryExecution->getIdentifier()] = $qtiStorage;
        }

        return $this->qtiStorage[$deliveryExecution->getIdentifier()];
    }
}
