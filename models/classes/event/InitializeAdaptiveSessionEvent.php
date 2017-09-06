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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiTest\models\event;

use oat\oatbox\event\Event;
use oat\libCat\CatSession;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\data\AssessmentSection;

/**
 * Class InitializeAdaptiveSessionEvent
 * 
 * This Event is thrown when an adaptive session is initialized.
 */
class InitializeAdaptiveSessionEvent implements Event
{
    /** @var AssessmentTestSession */
    protected $testSession;
    
    protected $catSession;
    
    protected $assessmentSection;

    /**
     * Create a new InitializeAdaptiveSessionEvent object.
     * 
     * @param \qtism\runtime\tests\AssessmentTestSession $testSession
     * @param \oat\libCat\CatSession $catSession
     * @param \qtism\data\AssessmentSection $assessmentSection The original QTI section the $catSession belongs to.
     */
    public function __construct(AssessmentTestSession $testSession, AssessmentSection $assessmentSection, CatSession $catSession)
    {
        $this->testSession = $testSession;
        $this->catSession = $catSession;
        $this->assessmentSection = $assessmentSection;
    }

    /**
     * Get the name of the Event.
     * 
     * @return string
     */
    public function getName()
    {
        return __CLASS__;
    }

    /**
     * Get the AssessmementTestSession bound to this Event.
     * 
     * @return AssessmentTestSession
     */
    public function getTestSession()
    {
        return $this->testSession;
    }
    
    public function getCatSession()
    {
        return $this->catSession;
    }
    
    public function getAssessmentSection()
    {
        return $this->assessmentSection;
    }
}
