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
 * Copyright (c) 2016-2018 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */

namespace oat\taoQtiTest\models\runner\time;

use oat\oatbox\service\ServiceManager;
use oat\taoTests\models\runner\time\TimePoint;
use qtism\common\datatypes\QtiDuration;
use qtism\data\NavigationMode;
use qtism\data\QtiComponent;
use qtism\runtime\tests\TimeConstraint;
use taoQtiTest_helpers_TestRunnerUtils as TestRunnerUtils;

/**
 * Class QtiTimeConstraint
 *
 * Represents a time constraint during an AssessmentTestSession.
 *
 * @package oat\taoQtiTest\models\runner\time
 */
class QtiTimeConstraint extends TimeConstraint implements \JsonSerializable
{
    /**
     * @var QtiTimer
     */
    protected $timer;

    /**
     * Allow to take care of extra time
     * @var boolean
     */
    protected $applyExtraTime;

    /**
     * @var integer
     */
    protected $timerTarget;

    /**
     * @return QtiTimer
     */
    public function getTimer()
    {
        return $this->timer;
    }

    /**
     * @param QtiTimer $timer
     * @return QtiTimeConstraint
     */
    public function setTimer($timer)
    {
        $this->timer = $timer;
        return $this;
    }

    /**
     * @return boolean
     */
    public function getApplyExtraTime()
    {
        return $this->applyExtraTime;
    }

    /**
     * @param boolean $applyExtraTime
     * @return QtiTimeConstraint
     */
    public function setApplyExtraTime($applyExtraTime)
    {
        $this->applyExtraTime = $applyExtraTime;
        return $this;
    }

    /**
     * @param integer $timerTarget
     * @return QtiTimeConstraint
     */
    public function setTimerTarget($timerTarget)
    {
        $this->timerTarget = $timerTarget;
        return $this;
    }

    /**
     * Create a new TimeConstraint object.
     *
     * @param QtiComponent $source The TestPart or SectionPart the constraint applies on.
     * @param QtiDuration $duration The already spent duration by the candidate on $source.
     * @param int|NavigationMode $navigationMode The current navigation mode.
     * @param boolean $considerMinTime Whether or not to consider minimum time limits.
     * @param boolean $applyExtraTime Allow to take care of extra time
     * @param integer $timerTarget client/server
     */
    public function __construct(
        QtiComponent $source,
        QtiDuration $duration,
        $navigationMode = NavigationMode::LINEAR,
        $considerMinTime = true,
        $applyExtraTime = false,
        $timerTarget = TimePoint::TARGET_SERVER
    ) {
        $this->setSource($source);
        $this->setDuration($duration);
        $this->setNavigationMode($navigationMode);
        $this->setApplyExtraTime($applyExtraTime);
        $this->setTimerTarget($timerTarget);
    }

    /**
     * Get the remaining duration from a source (min or max time, usually)
     * @param QtiDuration $duration the source duration
     * @return Duration|false A Duration object (or false of not available) that represents the remaining time
     */
    protected function getRemainingTimeFrom(QtiDuration $duration)
    {
        if(!is_null($duration)){
            $remaining = clone $duration;

            if ($this->getApplyExtraTime() && $this->timer) {
                // take care of the already consumed extra time under the current constraint
                // and append the full remaining extra time
                // the total must correspond to the already elapsed time plus the remaining time
                $remaining->add(new QtiDuration('PT' . $this->timer->getExtraTime($duration->getSeconds(true)) . 'S'));
            }
            $remaining->sub($this->getDuration());
            return ($remaining->isNegative() === true) ? new QtiDuration('PT0S') : $remaining;
        }
        return false;
    }

    /**
     * Get the time remaining to be spent by the candidate on the source of the time
     * constraint. Please note that this method will never return negative durations.
     *
     * @return Duration A Duration object or null if there is no maxTime constraint running for the source of the time constraint.
     */
    public function getMaximumRemainingTime()
    {
        if (($timeLimits = $this->getSource()->getTimeLimits()) !== null && ($maxTime = $timeLimits->getMaxTime()) !== null) {
            return $this->getRemainingTimeFrom($maxTime);
        }
        return false;
    }

    /**
     * Get the time remaining the candidate has to spend by the candidate on the source of the time
     * constraint. Please note that this method will never return negative durations.
     *
     * @return Duration A Duration object or null if there is no minTime constraint running for the source of the time constraint.
     */
    public function getMinimumRemainingTime()
    {
        if (($timeLimits = $this->getSource()->getTimeLimits()) !== null && ($minTime = $timeLimits->getMinTime()) !== null) {
            return $this->getRemainingTimeFrom($minTime);
        }
        return false;
    }

    /**
     * Converts a duration to milliseconds
     * @param QtiDuration|null $duration the duration to convert
     * @return int|false the duration in ms or false if none
     */
    private function durationToMs($duration)
    {
        if(!is_null($duration) && $duration instanceof QtiDuration){
            return TestRunnerUtils::getDurationWithMicroseconds($duration);
        }
        return false;
    }

    /**
     * Serialize the constraint the expected way by the TestContext and the TestMap
     * @return array
     */
    public function jsonSerialize()
    {
        $source = $this->getSource();
        $timeLimits = $source->getTimeLimits();
        if(!is_null($timeLimits)){
            $identifier = $source->getIdentifier();

            $maxTime = $timeLimits->getMaxTime();
            $minTime = $timeLimits->getMinTime();
            $maxTimeRemaining = $this->getMaximumRemainingTime();
            $minTimeRemaining = $this->getMinimumRemainingTime();
            if ($maxTimeRemaining !== false || $minTimeRemaining !== false) {

                $label = method_exists($source, 'getTitle') ? $source->getTitle() : $identifier;

                $extraTime = [];
                if (!is_null($this->getTimer()) && $source->getTimeLimits()->hasMaxTime()) {
                    $timer = $this->getTimer();
                    $maxTimeSeconds = $source->getTimeLimits()->getMaxTime()->getSeconds(true);
                    $extraTime = [
                        'total' => $timer->getExtraTime($maxTimeSeconds),
                        'consumed' => $timer->getConsumedExtraTime($identifier, $maxTimeSeconds, $this->timerTarget),
                        'remaining' => $timer->getRemainingExtraTime($identifier, $maxTimeSeconds, $this->timerTarget),
                    ];
                }

                /** @var TimerLabelFormatterService $labelFormatter */
                $labelFormatter = ServiceManager::getServiceManager()->get(TimerLabelFormatterService::SERVICE_ID);
                return [
                    'label'               => $labelFormatter->format($label),
                    'source'              => $identifier,
                    'qtiClassName'        => $source->getQtiClassName(),
                    'extraTime'           => $extraTime,
                    'allowLateSubmission' => $this->allowLateSubmission(),
                    'minTime'             => $this->durationToMs($minTime),
                    'minTimeRemaining'    => $this->durationToMs($minTimeRemaining),
                    'maxTime'             => $this->durationToMs($maxTime),
                    'maxTimeRemaining'    => $this->durationToMs($maxTimeRemaining),
                ];
            }
        }
        return null;
    }
}
