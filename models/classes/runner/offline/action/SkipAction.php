<?php

namespace oat\taoQtiTest\models\runner\offline\action;

use oat\taoQtiTest\models\runner\offline\TestRunnerAction;

class SkipAction extends TestRunnerAction
{
    public function getRequiredFields()
    {
        return array_merge(parent::getRequiredFields(), ['scope']);
    }

    public function process()
    {
        $this->validate();

        $ref       = ($this->getParameter('ref') === false) ? null : $this->getParameter('ref');
        $itemDuration = null;
        $consumedExtraTime = null;

        $scope = $this->getParameter('scope');
        $start = ($this->getParameter('start') !== false);

        try {
            $serviceContext = $this->getServiceContext();
            $this->getRunnerService()->endTimer($serviceContext, $itemDuration, $consumedExtraTime);

            $result = $this->getRunnerService()->skip($serviceContext, $scope, $ref);

            $response = [
                'success' => $result,
            ];

            if ($result) {
                $response['testContext'] = $this->getRunnerService()->getTestContext($serviceContext);
            }

            $this->getRunnerService()->persist($serviceContext);

            if ($start == true) {
                // start the timer only when move starts the item session
                // and after context build to avoid timing error
                $this->getRunnerService()->startTimer($serviceContext);
            }
        } catch (\common_Exception $e) {
            $response = $this->getErrorResponse($e);
        }

        return $response;
    }
}