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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA ;
 */

namespace oat\taoQtiTest\models\runner\time;

use oat\oatbox\service\ConfigurableService;
use oat\taoDelivery\model\execution\DeliveryExecutionInterface;
use oat\taoQtiTest\models\runner\StorageManager;
use oat\taoQtiTest\models\TestSessionService;
use oat\taoTests\models\runner\time\TimerAdjustmentServiceInterface;
use qtism\data\QtiIdentifiable;

class TimerAdjustmentService extends ConfigurableService implements TimerAdjustmentServiceInterface
{
    /** @var QtiTimer $timer */
    private $timer;

    /**
     * @inheritDoc
     */
    public function increase($deliveryExecution, $seconds, $source = null)
    {
        $this->timer = $this->getTestSessionService()->getTestSession($deliveryExecution)->getTimer();

        return $this->register($deliveryExecution, AdjustmentMap::ACTION_INCREASE, $seconds);
    }

    /**
     * @inheritDoc
     */
    public function decrease($deliveryExecution, $seconds, $source = null)
    {
        $this->timer = $this->getTestSessionService()->getTestSession($deliveryExecution)->getTimer();

        $maxSeconds = $this->findMaximumPossibleDecrease($deliveryExecution);
        if ($maxSeconds < $seconds) {
            $seconds = $maxSeconds;
        }

        return $this->register($deliveryExecution, AdjustmentMap::ACTION_DECREASE, $seconds);
    }

    /**
     * @param DeliveryExecutionInterface $deliveryExecution
     * @param string $action
     * @param integer $seconds
     * @return bool
     */
    private function register($deliveryExecution, $action, $seconds)
    {
        $testSession = $this->getTestSessionService()->getTestSession($deliveryExecution);
        $this->putAdjustmentToTheMap($testSession->getCurrentAssessmentItemRef(), $action, $seconds);
        $this->putAdjustmentToTheMap($testSession->getCurrentAssessmentSection(), $action, $seconds);
        $this->putAdjustmentToTheMap($testSession->getCurrentTestPart(), $action, $seconds);
        $this->putAdjustmentToTheMap($testSession->getAssessmentTest(), $action, $seconds);
        $this->timer->save();

        $this->getServiceLocator()->get(StorageManager::SERVICE_ID)->persist();

        \common_Logger::i(var_export($this->timer->getAdjustmentMap()->toArray(), true));

        return true;
    }

    private function findMaximumPossibleDecrease(DeliveryExecutionInterface $deliveryExecution)
    {
        $testSession = $this->getTestSessionService()->getTestSession($deliveryExecution);
        if ($testSession == null) {
            return 0;
        }

        $minRemaining = PHP_INT_MAX;
        $timeConstraints = $testSession->getTimeConstraints();
        foreach ($timeConstraints as $tc) {
            $maximumRemainingTime = $tc->getMaximumRemainingTime();
            if ($maximumRemainingTime === false) {
                continue;
            }
            $currentTimeConstraintAdjustment = $this->timer->getAdjustmentMap()->get($tc->getSource()->getIdentifier());
            $maximumRemainingTime = $maximumRemainingTime->getSeconds(true) + $currentTimeConstraintAdjustment;
            $minRemaining = min($minRemaining, $maximumRemainingTime);
        }

        return $minRemaining;
    }

    private function putAdjustmentToTheMap(QtiIdentifiable $element, $action, $seconds)
    {
        if (empty($element) || !$element->getTimeLimits() || !$element->getTimeLimits()->hasMaxTime()) {
            return false;
        }

        $this->timer->getAdjustmentMap()->put($element->getIdentifier(), $action, $seconds);
    }

    /**
     * @return TestSessionService
     */
    private function getTestSessionService()
    {
        return $this->getServiceLocator()->get(TestSessionService::SERVICE_ID);
    }
}
