<?php

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiTest\models\runner\OfflineQtiRunnerService;

class taoQtiTest_actions_OfflineRunner extends taoQtiTest_actions_Runner
{
    public function init()
    {
        try {
            $response = $this->getInitResponse();

            $response['items'] = $this->getOfflineRunnerService()->getItems($this->getRunnerService()->initServiceContext($this->getServiceContext()));

            $this->returnJson($response);
        } catch (\Exception $e) {
            $this->returnJson(
                $this->getErrorResponse($e),
                $this->getErrorCode($e)
            );
        }
    }

    /**
     * @return ConfigurableService|OfflineQtiRunnerService
     */
    private function getOfflineRunnerService()
    {
        return $this->getServiceLocator()->get(OfflineQtiRunnerService::SERVICE_ID);
    }
}