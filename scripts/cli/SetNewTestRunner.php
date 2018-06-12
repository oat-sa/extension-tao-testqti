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
namespace oat\taoQtiTest\scripts\cli;

use oat\oatbox\extension\AbstractAction;
use oat\taoQtiTest\models\TestModelService;
use oat\taoQtiTest\models\compilation\CompilationService;
/**
 * Class SetNewTestRunner
 *
 * Setup the new Test Runner
 *
 * @package oat\taoQtiTest\scripts\install
 */
class SetNewTestRunner extends AbstractAction
{
    public function __invoke($params)
    {
        $testModelService = $this->getServiceManager()->get(TestModelService::SERVICE_ID);
        $compiler = $testModelService->getOption(TestModelService::SUBSERVICE_COMPILATION);
        $compiler->setOption(CompilationService::OPTION_CLIENT_TESTRUNNER, true);
        $testModelService->setOption(TestModelService::SUBSERVICE_COMPILATION, $compiler);
        $this->getServiceManager()->register(TestModelService::SERVICE_ID, $testModelService);

        $testQtiExt = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
        $testRunnerConfig = $testQtiExt->getConfig('testRunner');
        $testRunnerConfig['test-session'] = 'oat\\taoQtiTest\\models\\runner\\session\\TestSession';
        $testQtiExt->setConfig('testRunner', $testRunnerConfig);

        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, 'New test runner activated');
    }
}
