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

use oat\taoQtiItem\model\ItemModel;
use oat\taoDelivery\model\execution\DeliveryServerService;
use oat\oatbox\extension\AbstractAction;
use oat\taoQtiTest\models\TestModelService;
use oat\taoQtiTest\models\compilation\CompilationService;
use common_report_Report as Report;
/**
 * Class TestRunnerVersion
 *
 * Displays the version of the Test Runner
 *
 * @package oat\taoQtiTest\scripts\install
 */
class TestRunnerVersion extends AbstractAction
{
    /**
     * Checks the version of the Test Runner
     * @param $params
     * @return Report
     */
    public function __invoke($params)
    {
        $checks = [
            $this->checkDeliveryServer(),
            $this->checkCompiler(),
            $this->checkTestSession(),
        ];
        $error = $this->hasError($checks);
        $mixed = $this->isMixed($checks);
        $new = $this->isNew($checks);

        $report = $this->generateReport($error, $mixed, $new);
        foreach ($checks as $check) {
            $report->add(new Report(Report::TYPE_INFO, $check['message']));
        }
        return $report;
    }

    /**
     * Builds a result set
     * @param string $message
     * @param bool $newRunner
     * @param bool $correct
     * @return array
     */
    private function resultData($message, $newRunner, $correct)
    {
        return [
            'message' => $message,
            'new' => $newRunner,
            'correct' => !!$correct
        ];
    }

    /**
     * Checks if a class complies to the wanted one
     * @param string $configClass
     * @param string $checkClass
     * @return bool
     */
    private function isClass($configClass, $checkClass)
    {
        return $configClass == $checkClass || is_subclass_of($configClass, $checkClass);
    }

    /**
     * Checks the version of the DeliveryServer Test Runner container
     * @return array
     * @throws \common_ext_ExtensionException
     */
    private function checkDeliveryServer()
    {
        $service = $this->getServiceLocator()->get(DeliveryServerService::SERVICE_ID);
        if ($service->hasOption('deliveryContainer')) {
            $deliveryContainerClass = $service->getOption('deliveryContainer');
            $result = $this->checkLegacyContainerConfig($deliveryContainerClass);
        } else {
            $result = $this->resultData('No container set for legacy deliveries', null, true);
        }

        return $result;
    }

    /**
     * Check which container is used for deliveries without container
     * @param string $deliveryContainerClass
     * @return array
     */
    private function checkLegacyContainerConfig($deliveryContainerClass)
    {
        $oldRunnerClass = 'oat\\taoDelivery\\helper\\container\\DeliveryServiceContainer';
        $newRunnerClass = 'oat\\taoDelivery\\helper\\container\\DeliveryClientContainer';
        if ($this->isClass($deliveryContainerClass, $newRunnerClass)) {
            $result = $this->resultData('Default Container: New TestRunner', true, true);
        } elseif ($this->isClass($deliveryContainerClass, $oldRunnerClass)) {
            $result = $this->resultData('Default Container: Old TestRunner', false, true);
        } else {
            $result = $this->resultData('Default Container: Unknown version / bad config (' . $deliveryContainerClass . ')', false, false);
        }
        return $result;
    }

    /**
     * Checks the version of the Item Compiler
     * @return array
     * @throws \common_ext_ExtensionException
     */
    private function checkCompiler()
    {
        $testModelService = $this->getServiceManager()->get(TestModelService::SERVICE_ID);
        $compiler = $testModelService->getOption(TestModelService::SUBSERVICE_COMPILATION);
        if ($compiler->hasOption(CompilationService::OPTION_CLIENT_TESTRUNNER)) {
            $newRunner = $compiler->getOption(CompilationService::OPTION_CLIENT_TESTRUNNER);
            $descString = $newRunner ? 'Compiler Class: New TestRunner' : 'Compiler Class: Old TestRunner';
            $result = $this->resultData($descString, $newRunner, true);
        } else {
            $result = $this->checkItemCompiler();
        }
        return $result;
    }

    /**
     * Return result data based on the fallback to the itemcompiler
     * @return array
     */
    private function checkItemCompiler()
    {
        /** @var ItemModel $itemModelService */
        $itemModelService = $this->getServiceManager()->get(ItemModel::SERVICE_ID);
        $compilerClass = $itemModelService->getOption(ItemModel::COMPILER);

        $oldRunnerClass = 'oat\\taoQtiItem\\model\\QtiItemCompiler';
        $newRunnerClass = 'oat\\taoQtiItem\\model\\QtiJsonItemCompiler';

        if ($this->isClass($compilerClass, $newRunnerClass)) {
            $result = $this->resultData('No Runner set, fallback item compiler class: New TestRunner', true, true);
        } elseif ($this->isClass($compilerClass, $oldRunnerClass)) {
            $result = $this->resultData('No Runner set, fallback item compiler class: Old TestRunner', false, true);
        } else {
            $result = $this->resultData('No Runner set, fallback item compiler class: Unknown version / bad config (' . $compilerClass . ')', false, false);
        }
        return $result;
    }

    /**
     * Checks the version of the Test Runner Session
     * @return array
     * @throws \common_ext_ExtensionException
     */
    private function checkTestSession()
    {
        $ext = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
        $config = $ext->getConfig('testRunner');
        $testSessionClass = isset($config['test-session']) ? $config['test-session'] : '';

        $oldRunnerClass = '\\taoQtiTest_helpers_TestSession';
        $newRunnerClass = 'oat\\taoQtiTest\\models\\runner\\session\\TestSession';

        if ($this->isClass($testSessionClass, $newRunnerClass)) {
            $result = $this->resultData('Test Session: New TestRunner', true, true);
        } elseif ($this->isClass($testSessionClass, $oldRunnerClass)) {
            $result = $this->resultData('Test Session: Old TestRunner', false, true);
        } else {
            $result = $this->resultData('Test Session: Unknown version / bad config (' . $testSessionClass . ')', false, false);
        }

        return $result;
    }

    private function haserror($checks) {
        $error = false;
        foreach ($checks as $check) {
            if (!$check['correct']) {
                $error = true;
            }
        }
        return $error;
    }

    /**
     * Do we have mixed settings
     * @param array $checks
     * @return boolean
     */
    private function isMixed($checks) {
        $someOld = false;
        $someNew = false;
        foreach ($checks as $check) {
            if ($check['new'] === true) {
                $someNew = true;
            } elseif ($check['new'] === false) {
                $someOld = true;
            }
        }
        return !($someNew xor $someOld);
    }

    private function isNew($checks) {
        $isNew = false;
        foreach ($checks as $check) {
            if (!is_null($check['new'])) {
                $isNew = $check['new'];
            }
        }
        return $isNew;
    }

    /**
     * Prepare the final report on the test compiler/runner settings
     * @param boolean $error
     * @param boolean $mixedSettings
     * @param boolean $newTestDriver
     * @return \common_report_Report
     */
    protected function generateReport($error, $mixedSettings, $newTestDriver)
    {
        if ($error || $mixedSettings) {
            $report = new Report(Report::TYPE_ERROR, "WARNING!\nThe Test Runner does not seem to be well configured!");
            if ($mixedSettings) {
                $report->add(new Report(Report::TYPE_ERROR, "There is a mix of different versions!"));
            }
        } else {
            $message = $newTestDriver ? "The New Test Runner is activated" : "The Old Test Runner is activated";
            $report = new Report(Report::TYPE_SUCCESS, $message);
        }
        return $report;
    }
}
