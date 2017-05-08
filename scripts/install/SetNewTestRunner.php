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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiTest\scripts\install;
use oat\oatbox\extension\InstallAction;
use oat\taoQtiItem\model\ItemModel;

/**
 * Class SetNewTestRunner
 * 
 * Setup the new Test Runner
 * 
 * @package oat\taoQtiTest\scripts\install
 */
class SetNewTestRunner extends InstallAction
{
    public function __invoke($params)
    {
        $deliveryExt = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoDelivery');
        $deliveryServerConfig = $deliveryExt->getConfig('deliveryServer');
        $deliveryServerConfig->setOption('deliveryContainer', 'oat\\taoDelivery\\helper\\container\\DeliveryClientContainer');
        $deliveryExt->setConfig('deliveryServer', $deliveryServerConfig);

        $compilerClassConfig = 'oat\\taoQtiItem\\model\\QtiJsonItemCompiler';

        /** @var ItemModel $itemModelService */
        $itemModelService = $this->getServiceManager()->get(ItemModel::SERVICE_ID);
        $itemModelService->setOption(ItemModel::COMPILER, $compilerClassConfig);
        $this->getServiceManager()->register(ItemModel::SERVICE_ID, $itemModelService);

        $testQtiExt = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
        $testRunnerConfig = $testQtiExt->getConfig('testRunner');
        $testRunnerConfig['test-session'] = 'oat\\taoQtiTest\\models\\runner\\session\\TestSession';
        $testQtiExt->setConfig('testRunner', $testRunnerConfig);

        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, 'New test runner activated');
    }
}
