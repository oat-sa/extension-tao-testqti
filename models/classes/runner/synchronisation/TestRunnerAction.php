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

namespace oat\taoQtiTest\models\runner\synchronisation;

use oat\oatbox\event\EventManager;
use oat\taoQtiTest\models\cat\CatEngineNotFoundException;
use oat\taoQtiTest\models\event\ItemOfflineEvent;
use oat\taoQtiTest\models\runner\QtiRunnerClosedException;
use oat\taoQtiTest\models\runner\QtiRunnerMessageService;
use oat\taoQtiTest\models\runner\QtiRunnerPausedException;
use oat\taoQtiTest\models\runner\RunnerParamParserTrait;
use oat\taoQtiTest\models\runner\RunnerToolStates;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;

/**
 * Class TestRunnerAction
 *
 * @package oat\taoQtiTest\models\runner\synchronisation
 */
abstract class TestRunnerAction implements ServiceLocatorAwareInterface
{
    use ServiceLocatorAwareTrait;
    use RunnerParamParserTrait;
    use RunnerToolStates;

    const OFFLINE_VARIABLE = 'OFFLINE_ITEM';

    /** @var double The timestamp of current action */
    protected $time;

    /** @var integer The timestamp of action */
    protected $timestamp;

    /** @var string The name of action */
    protected $name;

    /** @var array Parameters of the current action */
    protected $parameters;

    /**
     * Main method to process the action
     *
     * @return mixed
     */
    abstract public function process();

    /**
     * Method to set a trace variable telling that the item was offline
     *
     * @return bool
     */
    protected function setOffline()
    {
        $serviceContext = $this->getServiceContext();
        $itemRef = ($this->hasRequestParameter('itemDefinition'))
            ? $this->getRequestParameter('itemDefinition')
            : null;

        if(!is_null($itemRef)){
            $event = new ItemOfflineEvent($serviceContext->getTestSession(), $itemRef);
            $this->getServiceLocator()->get(EventManager::SERVICE_ID)->trigger($event);
            return true;
        }

        return false;
    }

    /**
     * TestRunnerAction constructor.
     *
     * Construct the action with required $name and $timestamp
     * Parameters is optional
     *
     * @param $name
     * @param $timestamp
     * @param array $parameters
     */
    public function __construct($name, $timestamp, array $parameters = [])
    {
        $this->name = $name;
        $this->timestamp = $timestamp;
        $this->parameters = $parameters;
    }

    /**
     * Check if $name exists in parameters array
     *
     * @param $name
     * @return bool
     */
    public function hasRequestParameter($name)
    {
        return isset($this->parameters[$name]);
    }

    /**
     * Get action input parameters
     *
     * @return mixed
     */
    public function getRequestParameters()
    {
        return $this->parameters;
    }

    /**
     * Check get the $name from parameters array, false if does not exist
     *
     * @param $name
     * @return bool|mixed
     */
    public function getRequestParameter($name)
    {
        return $this->hasRequestParameter($name) ? $this->parameters[$name] : false;
    }

    /**
     * For RunnerToolStates
     *
     * @param $name
     * @return bool|mixed
     */
    public function getRawRequestParameter($name)
    {
        return $this->getRequestParameter($name);
    }

    /**
     * Get the timestamp of current action in seconds
     *
     * @return double $time
     */
    public function getTime()
    {
        return $this->time;
    }

    /**
     * Set the timestamp of current action in seconds
     *
     * @param double $time
     */
    public function setTime($time)
    {
        $this->time = $time;
    }

    /**
     * Get the name of current action
     *
     * @return mixed
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Get the timestamp of current action
     *
     * @return integer
     */
    public function getTimestamp()
    {
        return $this->timestamp;
    }

    /**
     * Provide the required fields for current action
     *
     * @return array
     */
    protected function getRequiredFields()
    {
        return ['testDefinition', 'testCompilation', 'serviceCallId'];
    }

    /**
     * Validate the class parameters against the getRequiredFields method
     *
     * @throws \common_exception_InconsistentData
     */
    public function validate()
    {
        $requiredFields = array_unique($this->getRequiredFields());
        $isValid = ($requiredFields == array_unique(array_intersect($requiredFields, array_keys($this->parameters))));
        if (!$isValid) {
            throw new \common_exception_InconsistentData('Some parameters are missing. Required parameters are : ' . implode(', ', $requiredFields));
        }
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
                        $response['message'] = __($messageService->getStateMessage($this->getServiceContext()->getTestSession()));
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
