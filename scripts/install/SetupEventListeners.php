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
 */

namespace oat\taoQtiTest\scripts\install;

use oat\oatbox\extension\InstallAction;
use oat\taoDelivery\models\classes\execution\event\DeliveryExecutionState;
use oat\taoQtiTest\models\event\QtiTestStateChangeEvent;
use oat\taoQtiTest\models\QtiTestListenerService;

/**
 * Register a listener for state changes
 */
class SetupEventListeners extends InstallAction
{
    /**
     * @param $params
     */
    public function __invoke($params)
    {
        $this->registerEvent(DeliveryExecutionState::class, [QtiTestListenerService::SERVICE_ID, 'executionStateChanged']);
        $this->registerEvent(QtiTestStateChangeEvent::class, [QtiTestListenerService::SERVICE_ID, 'sessionStateChanged']);
    }
}
