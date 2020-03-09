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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiTest\scripts\tools;

use common_report_Report as Report;
use oat\oatbox\extension\AbstractAction;
use oat\taoQtiTest\models\TestSessionService;
use oat\taoDelivery\model\execution\ServiceProxy;

/**
 * @package oat\taoQtiTest\scripts\tools
 */
class CloseTestSession extends AbstractAction
{
    /**
     * @param $params
     * @return Report
     * @throws \oat\oatbox\service\exception\InvalidServiceManagerException
     * @throws \qtism\runtime\storage\common\StorageException
     * @throws \qtism\runtime\tests\AssessmentTestSessionException
     */
    public function __invoke($params)
    {
        if (count($params) === 0) {
            return new Report(Report::TYPE_ERROR, 'Test session id required');
        }

        $id = $params[0];
        $de = $this->getServiceManager()->get(ServiceProxy::SERVICE_ID)->getDeliveryExecution($id);
        /** @var \qtism\runtime\tests\AssessmentTestSession $session */
        $session = $this->getServiceManager()->get(TestSessionService::SERVICE_ID)->getTestSession($de);
        $initialState = $session->getState();
        /** @var \taoQtiTest_helpers_TestSessionStorage $testSessionStorage */
        $testSessionStorage = $this->getServiceManager()->get(TestSessionService::SERVICE_ID)->getTestSessionStorage($de);
        $session->endTestSession();
        $testSessionStorage->persist($session);
        $state = $session->getState();
        return new Report(Report::TYPE_SUCCESS, 'Session ' . $id . ': state changed from ' . $initialState . ' to ' . $state);
    }

}