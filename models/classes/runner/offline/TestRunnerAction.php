<?php

namespace oat\taoQtiTest\models\runner\offline;

use oat\taoQtiTest\models\runner\QtiRunnerClosedException;
use oat\taoQtiTest\models\runner\QtiRunnerEmptyResponsesException;
use oat\taoQtiTest\models\runner\QtiRunnerMessageService;
use oat\taoQtiTest\models\runner\QtiRunnerPausedException;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;
use taoQtiTest_helpers_TestRunnerUtils as TestRunnerUtils;

abstract class TestRunnerAction implements ServiceLocatorAwareInterface
{
    use ServiceLocatorAwareTrait;

    protected $serviceContext;

    protected $name;
    protected $timestamp;
    protected $parameters;

    abstract public function process();

    public function __construct($name, $timestamp, array $parameters = [])
    {
        $this->name = $name;
        $this->timestamp = $timestamp;
        $this->parameters = $parameters;
    }

    /**
     * @return mixed
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @return mixed
     */
    public function getTimestamp()
    {
        return $this->timestamp;
    }

    /**
     * @return mixed
     */
    public function getParameters()
    {
        return $this->parameters;
    }

    /**
     * @param $key
     * @return bool
     */
    public function getParameter($key)
    {
        return $this->hasParameter($key) ? $this->parameters[$key] : false;
    }

    /**
     * @param $key
     * @return bool
     */
    public function hasParameter($key)
    {
        return isset($this->parameters[$key]);
    }

    public function getRequiredFields()
    {
        return ['testDefinition', 'testCompilation', 'testServiceCallId'];
    }

    public function validate()
    {
        $requiredFields = array_unique($this->getRequiredFields());
        $isValid = ($requiredFields == array_unique(array_intersect($requiredFields, array_keys($this->getParameters()))));
        if (!$isValid) {
            throw new \common_exception_InconsistentData('Some parameters are missing. Required parameters are : ' . implode(', ', $requiredFields));
        }
    }

    protected function getServiceContext($check = true)
    {
        if (!$this->serviceContext) {

            $testExecution = $this->getParameter('testServiceCallId');
            $testDefinition  = $this->getParameter('testDefinition');
            $testCompilation = $this->getParameter('testCompilation');

            $this->serviceContext = $this->getRunnerService()->getServiceContext(
                $testDefinition, $testCompilation, $testExecution, $check
            );
        }

        return $this->serviceContext;
    }

    protected function endItemTimer()
    {
        if($this->hasParameter('itemDuration')){
            $serviceContext    = $this->getServiceContext(false);
            $itemDuration      = $this->getParameter('itemDuration');
            $consumedExtraTime = $this->getParameter('consumedExtraTime');
            return $this->getRunnerService()->endTimer($serviceContext, $itemDuration, $consumedExtraTime);
        }
        return false;
    }

    /**
     * Save the actual item state.
     * Requires params itemIdentifier and itemState
     * @return boolean true if saved
     * @throws \common_Exception
     */
    protected function saveItemState()
    {
        if($this->hasParameter('itemIdentifier') && $this->hasParameter('itemState')) {
            $serviceContext = $this->getServiceContext(false);
            $itemIdentifier = $this->getParameter('itemIdentifier');

            $stateId =  $serviceContext->getTestExecutionUri() . $itemIdentifier;
            //to read JSON encoded params
            //$params = $this->getRequest()->getRawParameters();
            //$itemResponse = isset($params['itemState']) ? json_decode($this->getParameter('itemState'), true) : new \stdClass();
            $state = $this->hasParameter('itemState') ? json_decode($this->getParameter('itemState'), true) : new \stdClass();

            return $this->getRunnerService()->setItemState($serviceContext, $stateId, $state);
        }
        return false;
    }

    /**
     * Initialize and verify the current service context
     * useful when the context was opened but not checked.
     * @return boolean true if initialized
     * @throws \common_Exception
     */
    protected function initServiceContext()
    {
        $serviceContext = $this->getServiceContext(false);
        $this->getRunnerService()->check($serviceContext);
        return $serviceContext->init();
    }

    /**
     * Save the item responses
     * Requires params itemDuration and optionaly consumedExtraTime
     * @param boolean $emptyAllowed if we allow empty responses
     * @return boolean true if saved
     * @throws \common_Exception
     * @throws QtiRunnerEmptyResponsesException if responses are empty, emptyAllowed is false and no allowSkipping
     */
    protected function saveItemResponses($emptyAllowed = true)
    {
        if($this->hasParameter('itemDefinition') && $this->hasParameter('itemResponse')){

            $itemDefinition = $this->getParameter('itemDefinition');
            $serviceContext = $this->getServiceContext(false);

            $itemResponse = $this->hasParameter('itemResponse') ? json_decode($this->getParameter('itemResponse'), true) : null;
            //to read JSON encoded params
            //$params = $this->getRequest()->getRawParameters();
            //$itemResponse = isset($params['itemResponse']) ? $params['itemResponse'] : null;

            if(!is_null($itemResponse) && ! empty($itemDefinition)) {

                $responses = $this->getRunnerService()->parsesItemResponse($serviceContext, $itemDefinition, $itemResponse);

                //still verify allowSkipping & empty responses
                if( !$emptyAllowed &&
                    $this->getRunnerService()->getTestConfig()->getConfigValue('enableAllowSkipping') &&
                    !TestRunnerUtils::doesAllowSkipping($serviceContext->getTestSession())){

                    if($this->getRunnerService()->emptyResponse($serviceContext, $responses)){
                        throw new QtiRunnerEmptyResponsesException();
                    }
                }

                return $this->getRunnerService()->storeItemResponse($serviceContext, $itemDefinition, $responses);
            }
        }
        return false;
    }

    /**
     * @return QtiRunnerService
     */
    protected function getRunnerService()
    {
        return $this->getServiceLocator()->get(QtiRunnerService::SERVICE_ID);
    }

    /**
     * Gets an error response object
     *
     * @param Exception [$e] Optional exception from which extract the error context
     * @return array
     */
    protected function getErrorResponse($e = null) {
        $response = [
            'success' => false,
            'type' => 'error',
        ];

        if ($e) {
            if ($e instanceof \Exception) {
                $response['type'] = 'exception';
                $response['code'] = $e->getCode();
            }

            if ($e instanceof \common_exception_UserReadableException) {
                $response['message'] = $e->getUserMessage();
            } else {
                $response['message'] = __('An error occurred!');
            }

            switch (true) {
                case $e instanceof QtiRunnerClosedException:
                case $e instanceof QtiRunnerPausedException:
                    if ($this->serviceContext) {
                        $messageService = $this->getServiceLocator()->get(QtiRunnerMessageService::SERVICE_ID);
                        $response['message'] = $messageService->getStateMessage($this->getServiceContext()->getTestSession());
                    }
                    $response['type'] = 'TestState';
                    break;

                case $e instanceof \tao_models_classes_FileNotFoundException:
                    $response['type'] = 'FileNotFound';
                    $response['message'] = __('File not found');
                    break;

                case $e instanceof \common_exception_Unauthorized:
                    $response['code'] = 403;
                    break;
            }
        }

        return $response;
    }
}