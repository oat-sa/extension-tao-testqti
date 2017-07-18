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
 */

namespace oat\taoQtiTest\scripts\install;

use oat\oatbox\extension\InstallAction;
use oat\taoQtiTest\models\runner\offline\action\Move;
use oat\taoQtiTest\models\runner\offline\action\Skip;
use oat\taoQtiTest\models\runner\offline\action\StoreTraceData;
use oat\taoQtiTest\models\runner\offline\action\Timeout;
use oat\taoQtiTest\models\runner\offline\OfflineService;

/**
 * Class SetOfflineRunner
 *
 * To install offlineRunner:
 * - php index.php '\oat\taoQtiTest\scripts\install\SetOfflineRunner'
 *
 * @package oat\taoQtiTest\scripts\install
 */
class SetOfflineRunner extends InstallAction
{
    /**
     * Register 4 actions as available for offline test runner
     *
     * @param $params
     * @return \common_report_Report
     */
    public function __invoke($params)
    {
        if ($this->getServiceLocator()->has(OfflineService::SERVICE_ID)) {
            /** @var OfflineService $service */
            $service = $this->getServiceLocator()->get(OfflineService::SERVICE_ID);
            $actions = $service->getAvailableActions();
        } else {
            $service = new OfflineService();
            $actions = [];
        }

        $newActions = [
            'move' => Move::class,
            'skip' => Skip::class,
            'storeTraceData' => StoreTraceData::class,
            'timeout' => Timeout::class
        ];

        $service->setAvailableActions(array_merge($actions, $newActions));
        $this->getServiceManager()->register(OfflineService::SERVICE_ID, $service);

        return \common_report_Report::createSuccess(__('Offline runner successfully configured.'));
    }

}