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

namespace oat\taoQtiTest\models\runner\communicator;

use oat\tao\model\security\xsrf\TokenService;
use oat\taoQtiTest\models\runner\QtiRunnerClosedException;
use oat\taoQtiTest\models\runner\QtiRunnerMessageService;
use oat\taoQtiTest\models\runner\QtiRunnerPausedException;
use oat\taoQtiTest\models\runner\QtiRunnerService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;

class SyncChannel implements CommunicationChannel, ServiceLocatorAwareInterface
{
    use ServiceLocatorAwareTrait;

    const CHANNEL_NAME = 'sync';

    protected $serviceContext;
    protected $data;
    /** @var  QtiRunnerService */
    protected $runnerService;

    /**
     * Get name of channel
     * @return string
     */
    public function getName()
    {
        return self::CHANNEL_NAME;
    }

    /**
     * @param QtiRunnerServiceContext $context
     * @param array $data
     * @return array|bool
     */
    public function process(QtiRunnerServiceContext $context, array $data = [])
    {
        \common_Logger::i(__METHOD__);
        \common_Logger::i(print_r($data, true));


        foreach ($data as $action) {
            if ($action['action'] == 'move') {

                $this->data = $data;
                $this->runnerService = $this->getServiceLocator()->get(QtiRunnerService::SERVICE_ID);

                $ref       = $this->data['ref'];
                $direction = $this->data['direction'];
                $scope     = $this->data['scope'];
                $start     = isset($data['start']);

                try {
                    $serviceContext = $this->getServiceContext();

                    /**
                     * @todo Calculate $microtime
                     */
                    $microtime=false;

                    $serviceContext->getTestSession()->initItemTimer($microtime);
                    $result = $this->runnerService->move($serviceContext, $direction, $scope, $ref);

                    $response = [
                        'success' => $result,
                    ];

                    if ($result) {
                        $response['testContext'] = $this->runnerService->getTestContext($serviceContext);
                    }

                    \common_Logger::d('Test session state : ' . $serviceContext->getTestSession()->getState());

                    $this->runnerService->move($serviceContext, $direction, $scope, $ref);
                    $this->runnerService->persist($serviceContext);
                    $this->runnerService->startTimer($serviceContext);

                    if($start == true){

                        // start the timer only when move starts the item session
                        // and after context build to avoid timing error
                        $this->runnerService->startTimer($serviceContext);
                    }

                } catch (\common_Exception $e) {
                    $response = $this->getErrorResponse($e);
                }

                $this->returnJson($response);
            }
        }
    }

    /**
     * @param $data
     * @param int [$httpStatus]
     * @param bool [$token]
     */
    protected function returnJson($data)
    {
       return json_encode($data);
    }

    protected function getServiceContext($check = true, $checkToken = true)
    {
        if (!$this->serviceContext) {
            $testDefinition = $this->data['testDefinition'];
            $testCompilation = $this->data['testCompilation'];

            if ($checkToken) {

                $config = $this->runnerService->getTestConfig()->getConfigValue('security');
                if(isset($config['csrfToken']) && $config['csrfToken'] == true){

                    $csrfToken = $this->data['X-Auth-Token'];
                    if($this->getTokenService()->checkToken($csrfToken)){
                        $this->getTokenService()->revokeToken($csrfToken);
                    } else {
                        \common_Logger::e("XSRF attempt! The token $csrfToken is no longer valid! " .
                            "or the previous request failed silently without creating a token");
                        throw new \common_exception_Unauthorized();
                    }
                }
            }

            $testExecution = $this->getSessionId();

            $this->serviceContext = $this->runnerService->getServiceContext($testDefinition, $testCompilation, $testExecution, $check);
        }

        return $this->serviceContext;
    }

    /**
     * Gets the identifier of the test session
     * @return string
     */
    protected function getSessionId()
    {
        if ($this->data['testServiceCallId']) {
            return $this->data['testServiceCallId'];
        } else {
            return $this->data['serviceCallId'];
        }
    }

    /**
     * Gets an error response object
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
                        $response['message'] = $messageService->getStateMessage($this->serviceContext->getTestSession());
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
