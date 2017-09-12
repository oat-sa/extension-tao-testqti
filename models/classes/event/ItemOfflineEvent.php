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

use qtism\runtime\tests\AssessmentTestSession;

/**
 * Event exit from test (by pressing exit button by test taker).
 * Note that exit is not the same as finishing.
 *
 * @author Antoine Robin <antoine@taotesting.com>
 */
class ItemOfflineEvent extends AbstractTestEvent
{
    private $itemId;

    public function __construct(AssessmentTestSession $session, $itemId)
    {
        parent::__construct($session);

        $this->itemId = $itemId;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return __CLASS__;
    }

    public function getCurrentItemId()
    {
        return $this->itemId;
    }
}