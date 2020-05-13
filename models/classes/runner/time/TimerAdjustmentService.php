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
use oat\taoTests\models\runner\time\InvalidStorageException;
use qtism\common\datatypes\QtiDuration;
use qtism\data\QtiIdentifiable;

class TimerAdjustmentService extends ConfigurableService implements TimerAdjustmentServiceInterface
{
    protected CONST INCREASE = 'increase';
    protected CONST DECREASE = 'decrease';

    /** @var TestSession */
    private $testSession;

    /**
     * {@inheritDoc}
     * @throws InvalidStorageException
     */
    public function increase(
        TestSession $testSession,
        int $seconds,
        QtiIdentifiable $source = null
    ): bool {
        $this->testSession = $testSession;

        return $this->register(self::INCREASE, $seconds, $source);
    }

    /**
     * {@inheritDoc}
     * @throws InvalidStorageException
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

        return $this->register(self::DECREASE, $seconds, $source);
    }

    /**
     * {@inheritDoc}
     */
    public function getAdjustedMaxTime(QtiIdentifiable $source, QtiTimer $timer): ?QtiDuration
    {
        $timeLimits = $source->getTimeLimits();
        if (!$timeLimits || ($maxTime = $timeLimits->getMaxTime()) === null) {
            return null;
        }

        $maximumTime = clone $maxTime;
        if ($timer !== null) {
            $adjustmentSeconds = $timer->getAdjustmentMap()->get($source->getIdentifier());
            if ($adjustmentSeconds > 0) {
                $maximumTime->add(new QtiDuration('PT' . $adjustmentSeconds . 'S'));
            } else {
                $maximumTime->sub(new QtiDuration('PT' . abs($adjustmentSeconds) . 'S'));
            }
        }
        return $maximumTime;
    }

    /**
     * @throws InvalidStorageException
     */
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

        if ($action === self::INCREASE) {
            $this->getTimer()->getAdjustmentMap()->increase($element->getIdentifier(), $seconds);
        } elseif ($action === self::DECREASE) {
            $this->getTimer()->getAdjustmentMap()->decrease($element->getIdentifier(), $seconds);
        }
    }

    private function getTimer(): QtiTimer
    {
        return $this->testSession->getTimer();
    }
}
