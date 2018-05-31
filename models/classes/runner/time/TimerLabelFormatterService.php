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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 *
 */

namespace oat\taoQtiTest\models\runner\time;

use oat\oatbox\service\ConfigurableService;

class TimerLabelFormatterService extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/TimerLabelFormatter';

    const OPTION_DEFAULT_TIMER_LABEL = 'defaultTimerLabel';

    /**
     * @param string $potentialLabel
     * @return string
     */
    public function format($potentialLabel = '')
    {
        $token = (string) $this->getOption(static::OPTION_DEFAULT_TIMER_LABEL);
        if (empty($token)){
            return $potentialLabel;
        }

        switch ($token) {
            case 'timer_name_translation_token':
                return __('Time Remaining');
            default:
                return $potentialLabel;
        }
    }
}