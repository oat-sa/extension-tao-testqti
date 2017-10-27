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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 *
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */

namespace oat\taoQtiTest\models\runner;

use oat\oatbox\service\ConfigurableService;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\tests\AssessmentTestSessionState;

/**
 * Class QtiRunnerMessageService
 * 
 * Defines a service that will provide messages for the test runner
 * 
 * @package oat\taoQtiTest\models
 */
class QtiRunnerMessageService extends ConfigurableService implements RunnerMessageService
{
    const SERVICE_ID = 'taoQtiTest/QtiRunnerMessageService';

    const PAUSED_STATE_MESSAGE = 'The assessment has been suspended. To resume your assessment, please relaunch it.';
    const TERMINATED_STATE_MESSAGE = 'The assessment has been terminated. You cannot interact with it anymore.';
    const INITIAL_STATE_MESSAGE = 'The assessment has been created but is not already running.';
    const RUNNING_STATE_MESSAGE = 'The assessment is still running.';

    /**
     * Gets a message related to the state of the assessment test session
     * @param mixed $testSession
     * @return string
     * @throws \common_exception_InvalidArgumentType
     */
    public function getStateMessage($testSession)
    {
        if ($testSession instanceof AssessmentTestSession) {
            switch ($testSession->getState()) {
                case AssessmentTestSessionState::SUSPENDED:
                    return $this->getPausedStateMessage($testSession);
                    
                case AssessmentTestSessionState::CLOSED:
                    return $this->getTerminatedStateMessage($testSession);
                    
                case AssessmentTestSessionState::INITIAL:
                    return $this->getInitialStateMessage($testSession);
                    
                default:
                    return $this->getRunningStateMessages($testSession);
            }             
        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerMessageService',
                'getStateMessage',
                0,
                'qtism\runtime\tests\AssessmentTestSession',
                $testSession
            );
        }
    }

    /**
     * Gets a message about the paused status of the assessment
     * @param AssessmentTestSession $testSession
     * @return string
     */
    protected function getPausedStateMessage(AssessmentTestSession $testSession)
    {
        return static::PAUSED_STATE_MESSAGE;
    }

    /**
     * Gets a message about the terminated status of the assessment
     * @param AssessmentTestSession $testSession
     * @return string
     */
    protected function getTerminatedStateMessage(AssessmentTestSession $testSession)
    {
        return static::TERMINATED_STATE_MESSAGE;
    }

    /**
     * Gets a message about the initial status of the assessment
     * @param AssessmentTestSession $testSession
     * @return string
     */
    protected function getInitialStateMessage(AssessmentTestSession $testSession)
    {
        return static::INITIAL_STATE_MESSAGE;
    }

    /**
     * Gets a message about the running status of the assessment
     * @param AssessmentTestSession $testSession
     * @return string
     */
    protected function getRunningStateMessages(AssessmentTestSession $testSession)
    {
        return static::RUNNING_STATE_MESSAGE;
    }
}
