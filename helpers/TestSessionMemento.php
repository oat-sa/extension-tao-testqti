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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiTest\helpers;

use qtism\runtime\tests\AssessmentTestSessionState;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\data\AssessmentSection;
use qtism\data\AssessmentItemRef;

/**
 * Class represents test session state at a certain point in time.
 *
 * Class TestSessionMemento
 * @package oat\taoQtiTest\helpers
 */
class TestSessionMemento
{
    /**
     * @var AssessmentTestSession
     */
    private $session;

    /**
     * @var AssessmentTestSessionState
     */
    private $state;

    /**
     * @var AssessmentItemRef
     */
    private $item;

    /**
     * @var AssessmentSection
     */
    private $section;

    /**
     * TestSessionMemento constructor.
     * @param AssessmentTestSession $session
     */
    public function __construct(AssessmentTestSession $session)
    {
        $this->session = $session;
        $this->update();
    }

    /**
     * Update memento
     */
    public function update()
    {
        $session = $this->session;
        $this->state = $session->getState();
        $route = $session->getRoute();
        if ($route->valid()) {
            $this->item = $session->getCurrentAssessmentItemRef();
            $this->section = $session->getCurrentAssessmentSection();
        } else {
            $this->item = false;
            $this->section = false;
        }
    }

    /**
     * @return int|AssessmentTestSessionState
     */
    public function getState()
    {
        return $this->state;
    }

    /**
     * @return false|AssessmentItemRef
     */
    public function getItem()
    {
        return $this->item;
    }

    /**
     * @return false|AssessmentSection
     */
    public function getSection()
    {
        return $this->section;
    }

    /**
     * @return AssessmentTestSession
     */
    public function getSession()
    {
        return $this->session;
    }
}