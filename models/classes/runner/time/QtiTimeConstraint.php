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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */

namespace oat\taoQtiTest\models\runner\time;

use qtism\common\datatypes\QtiDuration;
use qtism\data\NavigationMode;
use qtism\data\QtiComponent;
use qtism\runtime\tests\TimeConstraint;

/**
 * Class QtiTimeConstraint
 *
 * Represents a time constraint during an AssessmentTestSession.
 *
 * @package oat\taoQtiTest\models\runner\time
 */
class QtiTimeConstraint extends TimeConstraint
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
     * Create a new TimeConstraint object.
     *
     * @param QtiComponent $source The TestPart or SectionPart the constraint applies on.
     * @param QtiDuration $duration The already spent duration by the candidate on $source.
     * @param int|NavigationMode $navigationMode The current navigation mode.
     * @param boolean $considerMinTime Whether or not to consider minimum time limits.
     * @param boolean $applyExtraTime Allow to take care of extra time
     */
    public function __construct(QtiComponent $source, QtiDuration $duration, $navigationMode = NavigationMode::LINEAR, $considerMinTime = true, $applyExtraTime = false)
    {
        $this->setSource($source);
        $this->setDuration($duration);
        $this->setNavigationMode($navigationMode);
        $this->setApplyExtraTime($applyExtraTime);
    }


    /**
     * Get the time remaining to be spent by the candidate on the source of the time
     * constraint. Please note that this method will never return negative durations.
     *
     * @return Duration|boolean A Duration object or false if there is no maxTime constraint running for the source of the time constraint.
     */
    public function getMaximumRemainingTime()
    {
        if (($timeLimits = $this->getSource()->getTimeLimits()) !== null && ($maxTime = $timeLimits->getMaxTime()) !== null) {
            $remaining = clone $maxTime;
            if ($this->getApplyExtraTime() && $this->timer) {
                // take care of the already consumed extra time under the current constraint
                // and append the full remaining extra time
                // the total must correspond to the already elapsed time plus the remaining time
                $currentExtraTime = $this->timer->getRemainingExtraTime() + $this->timer->getConsumedExtraTime($this->getSource()->getIdentifier());
                $extraTime = min($this->timer->getExtraTime($maxTime->getSeconds(true)), $currentExtraTime);
                $remaining->add(new QtiDuration('PT' . $extraTime . 'S'));
            }
            $remaining->sub($this->getDuration());
            
            return ($remaining->isNegative() === true) ? new QtiDuration('PT0S') : $remaining;
        } else {
            return false;
        }
    }
}
