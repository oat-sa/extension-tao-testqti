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
 * @author Alexander Zagovorychev <zagovorichev@1pt.com>
 */

namespace oat\taoQtiTest\models;


use oat\oatbox\service\ConfigurableService;
use oat\taoQtiTest\models\runner\session\TestSession;

class SectionPauseService extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/SectionPauseService';

    /**
     * Checked the given session could be paused at some point
     * (in other words : is section pause enabled)
     * @param $session
     * @return bool
     */
    public function couldBePaused(TestSession $session = null)
    {
        return false;
    }

    /**
     * Checked that section can be paused
     * @param $session
     * @return bool
     */
    public function isPausable(TestSession $session = null)
    {
        return false;
    }

    /**
     * Check if we can move backward : when leaving a pausable section,
     * we can't move backward.
     *
     * @param TestSession $session
     * @return bool
     */
    public function canMoveBackward(TestSession $session = null)
    {
        return true;
    }
}
