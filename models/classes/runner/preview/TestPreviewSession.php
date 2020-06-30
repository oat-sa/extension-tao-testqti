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

namespace oat\taoQtiTest\models\runner\preview;

use oat\taoQtiTest\models\runner\session\TestSession;
use qtism\data\AssessmentTest;
use qtism\data\SubmissionMode;
use qtism\runtime\tests\AssessmentItemSessionStore;
use qtism\runtime\tests\AssessmentTestSessionState;
use qtism\runtime\tests\DurationStore;
use qtism\runtime\tests\Route;

class TestPreviewSession extends TestSession
{
    public function __construct(TestPreviewSessionManager $manager, AssessmentTest $assessmentTest)
    {
        $this->setSessionManager($manager);
        $this->setDurationStore(new DurationStore());
        $this->setAssessmentItemSessionStore(new AssessmentItemSessionStore());
        $this->setAssessmentTest($assessmentTest);
        $this->setSessionId($assessmentTest->getIdentifier());
    }

    public function getState()
    {
        return AssessmentTestSessionState::INTERACTING;
    }

    /**
     * @return TestPreviewSessionManager
     */
    public function getSessionManager()
    {
        return parent::getSessionManager();
    }

    protected function triggerStateChanged($sessionMemento)
    {
    }

    protected function triggerEventChange($sessionMemento)
    {
    }

    public function getCurrentSubmissionMode()
    {
        return SubmissionMode::SIMULTANEOUS;
    }

    /**
     * @return Route
     */
    public function getRoute()
    {
        return $this->getSessionManager()->createRoute($this->getAssessmentTest());
    }
}
