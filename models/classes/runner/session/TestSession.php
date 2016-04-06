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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA
 *
 */

namespace oat\taoQtiTest\models\runner\session;

use oat\taoQtiTest\models\runner\time\QtiTimer;
use oat\taoQtiTest\models\runner\time\QtiTimeStorage;
use oat\taoTests\models\runner\time\TimePoint;
use qtism\common\datatypes\Duration;
use qtism\runtime\tests\AssessmentItemSession;
use taoQtiTest_helpers_TestSession;

/**
 * TestSession override
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
class TestSession extends taoQtiTest_helpers_TestSession
{
    /**
     * The Timer bound to the test session
     * @var QtiTimer
     */
    protected $timer;

    /**
     * Gets the Timer bound to the test session
     * @return QtiTimer
     * @throws \oat\taoTests\models\runner\time\InvalidDataException
     * @throws \oat\taoTests\models\runner\time\InvalidStorageException
     */
    public function getTimer()
    {
        if (!$this->timer) {
            $this->timer = new QtiTimer();
            $this->timer->setStorage(new QtiTimeStorage($this->getSessionId()));
            $this->timer->load();
        }
        return $this->timer;
    }

    /**
     * Starts the timer for the current item in the TestSession
     * @throws \oat\taoTests\models\runner\time\InvalidDataException
     */
    public function startItemTimer()
    {
        $this->getTimer()->start($this->getCurrentRouteItem(), microtime(true))->save();
    }

    /**
     * Ends the timer for the current item in the TestSession
     * @throws \oat\taoTests\models\runner\time\InvalidDataException
     */
    public function endItemTimer()
    {
        $this->getTimer()->end($this->getCurrentRouteItem(), microtime(true))->save();
    }

    /**
     * Adjusts the timer for the current item in the TestSession
     * @param float $duration
     * @throws \oat\taoTests\models\runner\time\InconsistentRangeException
     * @throws \oat\taoTests\models\runner\time\InvalidDataException
     */
    public function adjustItemTimer($duration)
    {
        $this->getTimer()->adjust($this->getCurrentRouteItem(), floatval($duration))->save();
    }

    /**
     * Gets the total duration for the current item in the TestSession
     * @param int $target
     * @return float
     * @throws \oat\taoTests\models\runner\time\InconsistentCriteriaException
     */
    public function computeItemTime($target = TimePoint::TARGET_SERVER)
    {
        $currentItem = $this->getCurrentAssessmentItemRef();
        return $this->getTimer()->compute($currentItem->getIdentifier(), $target);
    }

    /**
     * Gets the total duration for the current section in the TestSession
     * @param int $target
     * @return float
     * @throws \oat\taoTests\models\runner\time\InconsistentCriteriaException
     */
    public function computeSectionTime($target = TimePoint::TARGET_SERVER)
    {
        $routeItem = $this->getCurrentRouteItem();
        $sections = $routeItem->getAssessmentSections();
        return $this->getTimer()->compute(key(current($sections)), $target);
    }

    /**
     * Gets the total duration for the current test part in the TestSession
     * @param int $target
     * @return float
     * @throws \oat\taoTests\models\runner\time\InconsistentCriteriaException
     */
    public function computeTestPartTime($target = TimePoint::TARGET_SERVER)
    {
        $routeItem = $this->getCurrentRouteItem();
        $testPart = $routeItem->getTestPart();
        return $this->getTimer()->compute($testPart->getIdentifier(), $target);
    }

    /**
     * Gets the total duration for the whole assessment test
     * @param int $target
     * @return float
     * @throws \oat\taoTests\models\runner\time\InconsistentCriteriaException
     */
    public function computeTestTime($target = TimePoint::TARGET_SERVER)
    {
        $routeItem = $this->getCurrentRouteItem();
        $test = $routeItem->getAssessmentTest();
        return $this->getTimer()->compute($test->getIdentifier(), $target);
    }

    /**
     * Hack the check time limits
     */
    public function checkTimeLimits($includeMinTime = false, $includeAssessmentItem = false, $acceptableLatency = true)
    {
        \common_Logger::i('Check time limit hacked');
        return true;
    }

    /**
     * AssessmentTestSession implementations must override this method in order
     * to submit item results from a given $assessmentItemSession to the appropriate
     * data source.
     *
     * This method is triggered each time response processing takes place.
     *
     * @param AssessmentItemSession $itemSession The lastly updated AssessmentItemSession.
     * @param integer $occurrence The occurrence number of the item bound to $assessmentItemSession.
     * @throws AssessmentTestSessionException With error code RESULT_SUBMISSION_ERROR if an error occurs while transmitting results.
     */
    public function submitItemResults(AssessmentItemSession $itemSession, $occurrence = 0)
    {
        $itemRef = $itemSession->getAssessmentItem();
        $identifier = $itemRef->getIdentifier();
        $itemDuration = round($this->getTimer()->compute($identifier, TimePoint::TARGET_SERVER), 6);
        $duration = new Duration('PT' . $itemDuration . 'S');

        $itemDurationVar = $itemSession->getVariable('duration');
        $sessionDuration = $itemDurationVar->getValue();
        \common_Logger::i("Force duration of item '${identifier}' to ${duration} instead of ${sessionDuration}");
        $itemSession->getVariable('duration')->setValue($duration);

        parent::submitItemResults($itemSession, $occurrence);
    }
}
