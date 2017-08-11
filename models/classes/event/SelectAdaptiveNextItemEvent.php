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
use qtism\runtime\tests\AssessmentTestSession;

/**
 * Class SelectAdaptiveNextItemEvent
 * @package oat\taoQtiTest\models\event
 * @author Aleh Hutnikau <hutnikau@1pt.com>
 */
class SelectAdaptiveNextItemEvent implements Event
{
    /** @var string Current item id */
    protected $currentItemId;

    /** @var array Item ids of the next items. */
    protected $catItemIds;

    /** @var AssessmentTestSession */
    protected $testSession;

    /**
     * SelectAdaptiveNextItemEvent constructor.
     * @param string AssessmentTestSession $testSession
     * @param string $currentItemId
     * @param array|null $catItemIds
     */
    public function __construct(AssessmentTestSession $testSession, $currentItemId, array $catItemIds = null)
    {
        $this->currentItemId = $currentItemId;
        $this->catItemIds = $catItemIds;
        $this->testSession = $testSession;
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
    public function getTestSession()
    {
        return $this->testSession;
    }

    /**
     * Returns current item identifier.
     * @return string
     */
    public function getCurrentItemId()
    {
        return $this->currentItemId;
    }

    /**
     * Returns next item identifier.
     * @return string|null
     */
    public function getNextItem()
    {
        return $this->catItemIds === null ? null : $this->catItemIds[0];
    }

    /**
     * Returns the item ids of the next items.
     * @return array|null
     */
    public function getCatItemIds()
    {
        return $this->catItemIds;
    }
}