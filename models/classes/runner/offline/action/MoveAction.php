<?php

namespace oat\taoQtiTest\models\runner\offline\action;

use oat\taoQtiTest\models\runner\offline\TestRunnerAction;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;

class MoveAction extends TestRunnerAction
{
    public function getRequiredFields()
    {
        return array_merge(parent::getRequiredFields(), ['direction', 'scope']);
    }

    public function process()
    {
        $this->validate();

        $ref       = ($this->getParameter('ref') === false) ? null : $this->getParameter('ref');
        $direction = $this->getParameter('direction');
        $scope     = $this->getParameter('scope');
        $start     = ($this->getParameter('start') !== false);


        try {

            /** @var QtiRunnerServiceContext $serviceContext */
            $serviceContext = $this->getServiceContext(false);

            if (!$this->getRunnerService()->isTerminated($serviceContext)) {
                $this->endItemTimer();
                $this->saveItemState();
            }
            $this->initServiceContext();

            $this->saveItemResponses(false);


            /**
             * @todo Calculate $microtime
             */
            $microtime=false;

            $serviceContext->getTestSession()->initItemTimer(/*$microtime*/);
            $result = $this->getRunnerService()->move($serviceContext, $direction, $scope, $ref);

            $response = [
                'success' => $result,
            ];

            if ($result) {
                $response['testContext'] = $this->getRunnerService()->getTestContext($serviceContext);
            }

            \common_Logger::d('Test session state : ' . $serviceContext->getTestSession()->getState());

            $this->getRunnerService()->persist($serviceContext);

            if ($start === true) {

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