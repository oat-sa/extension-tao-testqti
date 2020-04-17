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

declare(strict_types=1);

namespace oat\taoQtiTest\models\runner\time;

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiTest\models\runner\session\TestSession;
use oat\taoQtiTest\models\runner\StorageManager;
use qtism\data\QtiIdentifiable;

class TimerAdjustmentService extends ConfigurableService implements TimerAdjustmentServiceInterface
{
    /** @var TestSession */
    private $testSession;

    /**
     * @inheritDoc
     */
    public function increase(
        TestSession $testSession,
        int $seconds,
        QtiIdentifiable $source = null
    ): bool {
        $this->testSession = $testSession;

        return $this->register(AdjustmentMap::ACTION_INCREASE, $seconds, $source);
    }

    /**
     * @inheritDoc
     */
    public function decrease(
        TestSession $testSession,
        int $seconds,
        QtiIdentifiable $source = null
    ): bool {
        $this->testSession = $testSession;

        $seconds = $this->findMaximumPossibleDecrease($seconds);
        if ($seconds === 0) {
            return false;
        }

        return $this->register(AdjustmentMap::ACTION_DECREASE, $seconds, $source);
    }

    private function register(string $action, int $seconds, QtiIdentifiable $source = null): bool
    {
        if ($source) {
            $this->putAdjustmentToTheMap($source, $action, $seconds);
        } else {
            $this->putAdjustmentToTheMap($this->testSession->getCurrentAssessmentItemRef(), $action, $seconds);
            $this->putAdjustmentToTheMap($this->testSession->getCurrentAssessmentSection(), $action, $seconds);
            $this->putAdjustmentToTheMap($this->testSession->getCurrentTestPart(), $action, $seconds);
            $this->putAdjustmentToTheMap($this->testSession->getAssessmentTest(), $action, $seconds);
        }
        $this->getTimer()->save();
        $this->getServiceLocator()->get(StorageManager::SERVICE_ID)->persist();

        return true;
    }

    private function findMaximumPossibleDecrease(int $requestedSeconds): int
    {
        $minRemaining = PHP_INT_MAX;
        foreach ($this->testSession->getTimeConstraints() as $tc) {
            $maximumRemainingTime = $tc->getMaximumRemainingTime();
            if ($maximumRemainingTime === false) {
                continue;
            }
            $currentAdjustment = $this->getTimer()->getAdjustmentMap()->get($tc->getSource()->getIdentifier());
            $maximumRemainingTime = $maximumRemainingTime->getSeconds(true) + $currentAdjustment;
            $minRemaining = min($minRemaining, $maximumRemainingTime);
        }

        if ($minRemaining < $requestedSeconds) {
            return $minRemaining;
        }

        return $requestedSeconds;
    }

    private function putAdjustmentToTheMap(QtiIdentifiable $element, string $action, int $seconds)
    {
        if ($element === null || !$element->getTimeLimits() || !$element->getTimeLimits()->hasMaxTime()) {
            return;
        }

        $this->getTimer()->getAdjustmentMap()->put($element->getIdentifier(), $action, $seconds);
    }

    private function getTimer(): QtiTimer
    {
        return $this->testSession->getTimer();
    }
}
