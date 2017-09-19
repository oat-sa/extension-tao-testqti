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

use oat\taoQtiTest\models\runner\map\QtiRunnerMap;
use taoQtiTest_helpers_TestRunnerUtils as TestRunnerUtils;

trait RunnerParamParserTrait
{
    /**
     * @var QtiRunnerServiceContext
     */
    protected $serviceContext;

    /**
     * Check if the parameter associated to $name exists
     *
     * @param $name
     * @return mixed
     */
    abstract public function hasRequestParameter($name);

    /**
     * Get the parameter associated to $name
     *
     * @param $name
     * @return mixed
     */
    abstract public function getRequestParameter($name);

    /**
     * Get the Service Locator
     *
     * @return mixed
     */
    abstract public function getServiceLocator();

    /**
     * Initialize and verify the current service context
     * useful when the context was opened but not checked.
     *
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
     * @return QtiRunnerService
     */
    protected function getRunnerService()
    {
        return $this->getServiceLocator()->get(QtiRunnerService::SERVICE_ID);
    }

    /**
     * Get the Service Context
     * WARNING, there is not CSRF token check
     *
     * @param bool $check
     * @return QtiRunnerServiceContext
     */
    protected function getServiceContext($check = true)
    {
        if (!$this->serviceContext) {

            $testExecution = $this->getRequestParameter('serviceCallId');
            $testDefinition  = $this->getRequestParameter('testDefinition');
            $testCompilation = $this->getRequestParameter('testCompilation');

            $this->serviceContext = $this->getRunnerService()->getServiceContext(
                $testDefinition, $testCompilation, $testExecution, $check
            );
        }

        return $this->serviceContext;
    }

    /**
     * @param QtiRunnerServiceContext $serviceContext
     */
    public function setServiceContext($serviceContext)
    {
        $this->serviceContext = $serviceContext;
    }


    /**
     * End the item timer to QtiTimeLine

     * @param null $timestamp The start of action, optional
     * @return bool
     */
    protected function endItemTimer($timestamp = null)
    {
        if($this->getRequestParameter('itemDuration')){
            $serviceContext    = $this->getServiceContext(false);
            $itemDuration      = $this->getRequestParameter('itemDuration');
            $consumedExtraTime = $this->getRequestParameter('consumedExtraTime');
            return $this->getRunnerService()->endTimer($serviceContext, $itemDuration, $consumedExtraTime, $timestamp);
        }
        return false;
    }

    /**
     * Save the actual item state.
     * Requires params itemDefinition and itemState
     *
     * @return boolean true if saved
     * @throws \common_Exception
     */
    protected function saveItemState()
    {
        if ($this->getRequestParameter('itemDefinition') && $this->getRequestParameter('itemState')) {
            $serviceContext = $this->getServiceContext(false);
            $itemIdentifier = $this->getRequestParameter('itemDefinition');
            $stateId =  $serviceContext->getTestExecutionUri() . $itemIdentifier;
            $state = $this->getRequestParameter('itemState') ? json_decode($this->getRequestParameter('itemState'), true) : new \stdClass();

            return $this->getRunnerService()->setItemState($serviceContext, $stateId, $state);
        }

        return false;
    }

    /**
     * Save the item responses
     * Requires params itemDuration and optionaly consumedExtraTime
     *
     * @param boolean $emptyAllowed if we allow empty responses
     * @return boolean true if saved
     * @throws \common_Exception
     * @throws QtiRunnerEmptyResponsesException if responses are empty, emptyAllowed is false and no allowSkipping
     */
    protected function saveItemResponses($emptyAllowed = true)
    {
        if($this->getRequestParameter('itemDefinition') && $this->getRequestParameter('itemResponse')){

            $itemDefinition = $this->getRequestParameter('itemDefinition');
            $serviceContext = $this->getServiceContext(false);
            $itemResponse = $this->getRequestParameter('itemResponse') ? json_decode($this->getRequestParameter('itemResponse'), true) : null;

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
     * Gets the item reference for the current itemRef
     *
     * @param string $itemIdentifier the item id
     * @return string the state id
     */
    protected function getItemRef($itemIdentifier)
    {
        $serviceContext = $this->getServiceContext(false);
        /** @var QtiRunnerMap $mapService */
        $mapService = $this->getServiceLocator()->get(QtiRunnerMap::SERVICE_ID);
        return $mapService->getItemHref($serviceContext, $itemIdentifier);
    }
}