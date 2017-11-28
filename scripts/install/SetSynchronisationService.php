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
use oat\taoQtiTest\models\runner\synchronisation\action\ExitTest;
use oat\taoQtiTest\models\runner\synchronisation\action\Move;
use oat\taoQtiTest\models\runner\synchronisation\action\Pause;
use oat\taoQtiTest\models\runner\synchronisation\action\Skip;
use oat\taoQtiTest\models\runner\synchronisation\action\StoreTraceData;
use oat\taoQtiTest\models\runner\synchronisation\action\Timeout;
use oat\taoQtiTest\models\runner\synchronisation\action\NextItemData;
use oat\taoQtiTest\models\runner\synchronisation\SynchronisationService;

/**
 * Class SetSynchronisationService
 *
 * To install synchronisationService:
 * - php index.php '\oat\taoQtiTest\scripts\install\SetSynchronisationService'
 *
 * @package oat\taoQtiTest\scripts\install
 */
class SetSynchronisationService extends InstallAction
{
    /**
     * Register actions as available for SynchronisationService
     *
     * @param $params
     * @return \common_report_Report
     * @throws
     */
    public function __invoke($params)
    {
        if ($this->getServiceLocator()->has(SynchronisationService::SERVICE_ID)) {
            /** @var SynchronisationService $service */
            $service = $this->getServiceLocator()->get(SynchronisationService::SERVICE_ID);
            $actions = $service->getAvailableActions();
        } else {
            $service = new SynchronisationService();
            $actions = [];
        }

        $newActions = [
            'exitTest'        => ExitTest::class,
            'move'            => Move::class,
            'pause'           => Pause::class,
            'skip'            => Skip::class,
            'storeTraceData'  => StoreTraceData::class,
            'timeout'         => Timeout::class,
            'getNextItemData' => NextItemData::class
        ];

        $service->setAvailableActions(array_merge($actions, $newActions));
        $this->getServiceManager()->register(SynchronisationService::SERVICE_ID, $service);

        return \common_report_Report::createSuccess(__('SetSynchronisationService successfully configured.'));
    }

}
