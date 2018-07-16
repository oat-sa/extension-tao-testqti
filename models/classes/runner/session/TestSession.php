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
 * Copyright (c) 2016-2017 (original work) Open Assessment Technologies SA
 *
 */

namespace oat\taoQtiTest\models\runner\session;

use oat\oatbox\service\ServiceManager;
use oat\taoQtiTest\models\runner\config\QtiRunnerConfig;
use oat\taoQtiTest\models\runner\time\QtiTimeConstraint;
use oat\taoQtiTest\models\runner\time\QtiTimer;
use oat\taoQtiTest\models\runner\time\QtiTimerFactory;
use oat\taoQtiTest\models\cat\CatService;
use oat\taoTests\models\runner\time\TimePoint;
use qtism\common\datatypes\Duration;
use qtism\common\datatypes\QtiDuration;
use qtism\runtime\tests\AssessmentItemSession;
use qtism\runtime\tests\AssessmentTestPlace;
use qtism\runtime\tests\AssessmentTestSessionException;
use qtism\runtime\tests\RouteItem;
use qtism\runtime\tests\TimeConstraint;
use qtism\runtime\tests\TimeConstraintCollection;
use taoQtiTest_helpers_TestSession;
use oat\oatbox\log\LoggerAwareTrait;

/**
 * TestSession override
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
class TestSession extends taoQtiTest_helpers_TestSession implements UserUriAware
{
    use LoggerAwareTrait;

    /**
     * The Timer bound to the test session
     * @var QtiTimer
     */
    protected $timer;

    /**
     * The target from which compute the durations
     * @var int
     */
    protected $timerTarget;

    /**
     * A temporary cache for computed durations
     * @var array
     */
    protected $durationCache = [];

    /**
     * The URI (Uniform Resource Identifier) of the user the Test Session belongs to.
     *
     * @var string
     */
    private $userUri;

    /**
     * Get the URI (Uniform Resource Identifier) of the user the Test Session belongs to.
     *
     * @return string
     */
    public function getUserUri()
    {
        if (is_null($this->userUri)) {
            return \common_session_SessionManager::getSession()->getUserUri();
        }
        return $this->userUri;
    }

    /**
     * Set the URI (Uniform Resource Identifier) of the user the Test Session belongs to.
     *
     * @param string $userUri
     */
    public function setUserUri($userUri)
    {
        $this->userUri = $userUri;
    }

    /**
     * Gets the Timer bound to the test session
     * @return QtiTimer
     */
    public function getTimer()
    {
        if (!$this->timer) {
            $qtiTimerFactory = $this->getServiceLocator()->get(QtiTimerFactory::SERVICE_ID);
            $this->timer = $qtiTimerFactory->getTimer($this->getSessionId(), $this->getUserUri());
        }
        return $this->timer;
    }

    /**
     * Gets the target from which compute the durations
     * @return int
     */
    public function getTimerTarget()
    {
        if (is_null($this->timerTarget)) {
            $testConfig = $this->getServiceLocator()->get(QtiRunnerConfig::SERVICE_ID);
            $config = $testConfig->getConfigValue('timer');
            switch (strtolower($config['target'])) {
                case 'client':
                    $target = TimePoint::TARGET_CLIENT;
                    break;

                case 'server':
                default:
                    $target = TimePoint::TARGET_SERVER;
            }

            $this->setTimerTarget($target);
        }
        return $this->timerTarget;
    }

    /**
     * Set the target from which compute the durations
     * @param int $timerTarget
     */
    public function setTimerTarget($timerTarget)
    {
        $this->timerTarget = intval($timerTarget);
    }

    /**
     * Gets the tags describing a particular item with an assessment test
     * @param RouteItem $routeItem
     * @return array
     */
    public function getItemTags(RouteItem $routeItem)
    {
        $test = $routeItem->getAssessmentTest();
        $testPart = $routeItem->getTestPart();
        $sections = $routeItem->getAssessmentSections();
        $sections->rewind();
        $sectionId = key(current($sections));
        $itemRef = $routeItem->getAssessmentItemRef();
        $itemId = $itemRef->getIdentifier();
        $occurrence = $routeItem->getOccurence();

        $tags = [
            $itemId,
            $itemId . '#' . $occurrence,
            $sectionId,
            $testPart->getIdentifier(),
            $test->getIdentifier(),
        ];

        if ($this->isRunning() === true) {
            $tags[] = $this->getItemAttemptTag($routeItem);
        }

        return $tags;
    }

    /**
     * Gets the item tags for its last occurrence
     * @param RouteItem $routeItem
     * @return string
     */
    public function getItemAttemptTag(RouteItem $routeItem)
    {
        $itemRef = $routeItem->getAssessmentItemRef();
        $itemId = $itemRef->getIdentifier();
        $occurrence = $routeItem->getOccurence();
        $itemSession = $this->getAssessmentItemSessionStore()->getAssessmentItemSession($itemRef, $occurrence);
        return $itemId . '#' . $occurrence . '-' . $itemSession['numAttempts']->getValue();
    }

    /**
     * Initializes the timer for the current item in the TestSession
     *
     * @param $timestamp
     * @throws \oat\taoTests\models\runner\time\InvalidDataException
     */
    public function initItemTimer($timestamp = null)
    {
        if (is_null($timestamp)) {
            $timestamp = microtime(true);
        }

        // try to close existing time range if any, in order to be sure the test will start or restart a new range.
        // if the range is already closed, a message will be added to the log
        $tags = $this->getItemTags($this->getCurrentRouteItem());
        $this->getTimer()->end($tags, $timestamp)->save();
    }

    /**
     * Starts the timer for the current item in the TestSession
     *
     * @param $timestamp
     */
    public function startItemTimer($timestamp = null)
    {
        if (is_null($timestamp)) {
            $timestamp = microtime(true);
        }
        $tags = $this->getItemTags($this->getCurrentRouteItem());
        $this->getTimer()->start($tags, $timestamp)->save();
    }

    /**
     * Ends the timer for the current item in the TestSession.
     * Sets the client duration for the current item in the TestSession.
     *
     * @param float $duration The client duration, or null to force server duration to be used as client duration
     * @param $timestamp
     */
    public function endItemTimer($duration = null, $timestamp = null)
    {
        if (is_null($timestamp)) {
            $timestamp = microtime(true);
        }
        $timer = $this->getTimer();
        $tags = $this->getItemTags($this->getCurrentRouteItem());

        $timer->end($tags, $timestamp);

        if (is_numeric($duration) || is_null($duration)) {
            if (!is_null($duration)) {
                $duration = floatval($duration);
            }
            try {
                $timer->adjust($tags, $duration);
            } catch (\oat\taoTests\models\runner\time\TimeException $e) {
                $this->logAlert($e->getMessage().'; Test session identifier: '.$this->getSessionId());
            }
        }
        $constraints = $this->getTimeConstraints();

        $maxTime = 0;
        /** @var TimeConstraint $constraint */
        foreach ($constraints as $constraint) {
            if ($constraint->getSource()->getTimeLimits() && $constraint->getSource()->getTimeLimits()->getMaxTime()) {
                $maxTime = $constraint->getSource()->getTimeLimits()->getMaxTime()->getSeconds(true);
            }
        }
        $this->getTimer()->getConsumedExtraTime($tags, $maxTime);
        $timer->save();
    }

    /**
     * Gets the timer duration for a particular identifier
     * @param string|array $identifier
     * @param int $target
     * @return Duration
     * @throws \oat\taoTests\models\runner\time\InconsistentCriteriaException
     */
    public function getTimerDuration($identifier, $target = 0)
    {
        if (!$target) {
            $target = $this->getTimerTarget();
        }

        $durationKey = $target . '-';
        if (is_array($identifier)) {
            sort($identifier);
            $durationKey .= implode('-', $identifier);
        } else {
            $durationKey .= $identifier;
        }

        if (!isset($this->durationCache[$durationKey])) {
            $duration = round($this->getTimer()->compute($identifier, $target), 6);
            $this->durationCache[$durationKey] = new QtiDuration('PT' . $duration . 'S');
        }

        return $this->durationCache[$durationKey];
    }

    /**
     * Gets the total duration for the current item in the TestSession
     * @param int $target
     * @return Duration
     * @throws \oat\taoTests\models\runner\time\InconsistentCriteriaException
     */
    public function computeItemTime($target = 0)
    {
        $currentItem = $this->getCurrentAssessmentItemRef();
        return $this->getTimerDuration($currentItem->getIdentifier(), $target);
    }

    /**
     * Gets the total duration for the current section in the TestSession
     * @param int $target
     * @return Duration
     * @throws \oat\taoTests\models\runner\time\InconsistentCriteriaException
     */
    public function computeSectionTime($target = 0)
    {
        $routeItem = $this->getCurrentRouteItem();
        $sections = $routeItem->getAssessmentSections();
        $sections->rewind();
        return $this->getTimerDuration(key(current($sections)), $target);
    }

    /**
     * Gets the total duration for the current test part in the TestSession
     * @param int $target
     * @return Duration
     * @throws \oat\taoTests\models\runner\time\InconsistentCriteriaException
     */
    public function computeTestPartTime($target = 0)
    {
        $routeItem = $this->getCurrentRouteItem();
        $testPart = $routeItem->getTestPart();
        return $this->getTimerDuration($testPart->getIdentifier(), $target);
    }

    /**
     * Gets the total duration for the whole assessment test
     * @param int $target
     * @return Duration
     * @throws \oat\taoTests\models\runner\time\InconsistentCriteriaException
     */
    public function computeTestTime($target = 0)
    {
        $routeItem = $this->getCurrentRouteItem();
        $test = $routeItem->getAssessmentTest();
        return $this->getTimerDuration($test->getIdentifier(), $target);
    }

    /**
     * Update the durations involved in the AssessmentTestSession to mirror the durations at the current time.
     * This method can be useful for stateless systems that make use of QtiSm.
     */
    public function updateDuration()
    {
        // not needed anymore
        \common_Logger::t('Call to disabled updateDuration()');
    }

    /**
     * Gets a TimeConstraint from a particular source
     * @param $source
     * @param $navigationMode
     * @param $considerMinTime
     * @param $applyExtraTime
     * @return TimeConstraint
     * @throws \oat\taoTests\models\runner\time\InconsistentCriteriaException
     */
    protected function getTimeConstraint($source, $navigationMode, $considerMinTime, $applyExtraTime = true)
    {
        $constraint = new QtiTimeConstraint(
            $source,
            $this->getTimerDuration($source->getIdentifier()),
            $navigationMode,
            $considerMinTime,
            $applyExtraTime,
            $this->getTimerTarget()
        );
        $constraint->setTimer($this->getTimer());
        return $constraint;
    }

    /**
     * Builds the time constraints running for the current testPart or/and current assessmentSection
     * or/and assessmentItem. Takes care of the extra time if needed.
     *
     * @param integer $places A composition of values (use | operator) from the AssessmentTestPlace enumeration. If the null value is given, all places will be taken into account.
     * @param boolean $applyExtraTime Allow to take care of extra time
     * @return TimeConstraintCollection A collection of TimeConstraint objects.
     * @qtism-test-duration-update
     */
    protected function buildTimeConstraints($places = null, $applyExtraTime = true)
    {
        if ($places === null) {
            // Get the constraints from all places in the Assessment Test.
            $places = (AssessmentTestPlace::ASSESSMENT_TEST | AssessmentTestPlace::TEST_PART | AssessmentTestPlace::ASSESSMENT_SECTION | AssessmentTestPlace::ASSESSMENT_ITEM);
        }

        $constraints = new TimeConstraintCollection();
        $navigationMode = $this->getCurrentNavigationMode();
        $routeItem = $this->getCurrentRouteItem();
        $considerMinTime = $this->mustConsiderMinTime();

        if ($places & AssessmentTestPlace::ASSESSMENT_TEST) {
            $constraints[] = $this->getTimeConstraint($routeItem->getAssessmentTest(), $navigationMode, $considerMinTime, $applyExtraTime);
        }

        if ($places & AssessmentTestPlace::TEST_PART) {
            $constraints[] = $this->getTimeConstraint($this->getCurrentTestPart(), $navigationMode, $considerMinTime, $applyExtraTime);
        }

        if ($places & AssessmentTestPlace::ASSESSMENT_SECTION) {
            $constraints[] = $this->getTimeConstraint($this->getCurrentAssessmentSection(), $navigationMode, $considerMinTime, $applyExtraTime);
        }

        if ($places & AssessmentTestPlace::ASSESSMENT_ITEM) {
            $constraints[] = $this->getTimeConstraint($routeItem->getAssessmentItemRef(), $navigationMode, $considerMinTime, $applyExtraTime);
        }

        return $constraints;
    }

    /**
     * Get the time constraints running for the current testPart or/and current assessmentSection
     * or/and assessmentItem. The extra time is taken into account.
     *
     * @param integer $places A composition of values (use | operator) from the AssessmentTestPlace enumeration. If the null value is given, all places will be taken into account.
     * @return TimeConstraintCollection A collection of TimeConstraint objects.
     * @qtism-test-duration-update
     */
    public function getTimeConstraints($places = null)
    {
        return $this->buildTimeConstraints($places, true);
    }
    
    /**
     * Get the regular time constraints running for the current testPart or/and current assessmentSection
     * or/and assessmentItem, without taking care of the extra time.
     *
     * @param integer $places A composition of values (use | operator) from the AssessmentTestPlace enumeration. If the null value is given, all places will be taken into account.
     * @return TimeConstraintCollection A collection of TimeConstraint objects.
     * @qtism-test-duration-update
     */
    public function getRegularTimeConstraints($places = null)
    {
        return $this->buildTimeConstraints($places, false);
    }

    /**
     * Whether or not the current Assessment Item to be presented to the candidate is timed-out. By timed-out
     * we mean:
     *
     * * current Assessment Test level time limits are not respected OR,
     * * current Test Part level time limits are not respected OR,
     * * current Assessment Section level time limits are not respected OR,
     * * current Assessment Item level time limits are not respected.
     *
     * @return boolean
     */
    public function isTimeout()
    {
        try {
            $this->checkTimeLimits(false, true, false);
        } catch (AssessmentTestSessionException $e) {
            return true;
        }

        return false;
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
        
        // Ensure that specific results from adaptive placeholders are not recorded.
        $catService = ServiceManager::getServiceManager()->get(CatService::SERVICE_ID);
        if (!$catService->isAdaptivePlaceholder($itemRef)) {
            $identifier = $itemRef->getIdentifier();
            $duration = $this->getTimerDuration($identifier);

            $itemDurationVar = $itemSession->getVariable('duration');
            $sessionDuration = $itemDurationVar->getValue();
            \common_Logger::t("Force duration of item '${identifier}' to ${duration} instead of ${sessionDuration}");
            $itemSession->getVariable('duration')->setValue($duration);

            parent::submitItemResults($itemSession, $occurrence);
        }
    }

    /**
     * QTISM endTestSession method overriding.
     *
     * It consists of including an additional processing when the test ends,
     * in order to send the LtiOutcome
     *
     * @see http://www.imsglobal.org/lis/ Outcome Management Service
     * @throws \taoQtiTest_helpers_TestSessionException If the session is already ended or if an error occurs whil transmitting/processing the result.
     */
    public function endTestSession()
    {
        // try to close existing time range if any, in order to be sure the test will be closed with a consistent timer.
        // if the range is already closed, a message will be added to the log
        if ($this->isRunning() === true) {
            $route = $this->getRoute();
            if ($route->valid()) {
                $routeItem = $this->getCurrentRouteItem();
            }
            if (isset($routeItem)) {
                $this->endItemTimer();
            }
        }

        parent::endTestSession();
    }
}
