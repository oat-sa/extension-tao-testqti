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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiTest\models\event;

use oat\oatbox\event\Event;
use qtism\runtime\tests\AssessmentTestSession;

/**
 * Event Test session terminated and save for the last time
 *
 * @see \oat\taoQtiTest\models\runner\QtiRunnerService::persist()
 */
class AfterAssessmentTestSessionClosedEvent implements Event
{

    protected $session;

    protected $userId;

    /**
     * QtiMoveEvent constructor.
     * @param AssessmentTestSession $session
     * @param string $userId
     */
    public function __construct(AssessmentTestSession $session, $userId)
    {
        $this->session = $session;
        $this->userId = $userId;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return __CLASS__;
    }


    /**
     * @return AssessmentTestSession
     */
    public function getSession()
    {
        return $this->session;
    }

    /**
     * @return string
     */
    public function getUserId()
    {
        return $this->userId;
    }
}