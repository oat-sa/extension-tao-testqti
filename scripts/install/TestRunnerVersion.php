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
use oat\taoQtiItem\model\ItemModel;

/**
 * Class TestRunnerVersion
 *
 * Displays the version of the Test Runner
 *
 * @package oat\taoQtiTest\scripts\install
 */
class TestRunnerVersion extends \common_ext_action_InstallAction
{
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
            'new' => !!$newRunner,
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
        $ext = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoDelivery');
        $config = $ext->getConfig('deliveryServer');

        $deliveryContainerClass = $config->getOption('deliveryContainer');
        $oldRunnerClass = 'oat\\taoDelivery\\helper\\container\\DeliveryServiceContainer';
        $newRunnerClass = 'oat\\taoDelivery\\helper\\container\\DeliveryClientContainer';

        if ($this->isClass($deliveryContainerClass, $newRunnerClass)) {
            $result = $this->resultData('DeliveryServer: New TestRunner', true, true);
        } else if ($this->isClass($deliveryContainerClass, $oldRunnerClass)) {
            $result = $this->resultData('DeliveryServer: Old TestRunner', false, true);
        } else {
            $result = $this->resultData('DeliveryServer: Unknown version / bad config (' . $deliveryContainerClass . ')', false, false);
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

        /** @var ItemModel $itemModelService */
        $itemModelService = $this->getServiceManager()->get(ItemModel::SERVICE_ID);
        $compilerClass = $itemModelService->getOption(ItemModel::COMPILER);

        $oldRunnerClass = 'oat\\taoQtiItem\\model\\QtiItemCompiler';
        $newRunnerClass = 'oat\\taoQtiItem\\model\\QtiJsonItemCompiler';

        if ($this->isClass($compilerClass, $newRunnerClass)) {
            $result = $this->resultData('Compiler Class: New TestRunner', true, true);
        } else if ($this->isClass($compilerClass, $oldRunnerClass)) {
            $result = $this->resultData('Compiler Class: Old TestRunner', false, true);
        } else {
            $result = $this->resultData('Compiler Class: Unknown version / bad config (' . $compilerClass . ')', false, false);
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

        if (isset($config['test-session'])) {
            $testSessionClass = $config['test-session'];
        } else {
            $testSessionClass = '';
        }

        $oldRunnerClass = '\\taoQtiTest_helpers_TestSession';
        $newRunnerClass = 'oat\\taoQtiTest\\models\\runner\\session\\TestSession';

        if ($this->isClass($testSessionClass, $newRunnerClass)) {
            $result = $this->resultData('Test Session: New TestRunner', true, true);
        } else if ($this->isClass($testSessionClass, $oldRunnerClass)) {
            $result = $this->resultData('Test Session: Old TestRunner', false, true);
        } else {
            $result = $this->resultData('Test Session: Unknown version / bad config (' . $testSessionClass . ')', false, false);
        }

        return $result;
    }

    /**
     * Checks the version of the Test Runner
     * @param $params
     * @return \common_report_Report
     */
    public function __invoke($params)
    {
        $checks = [
            $this->checkDeliveryServer(),
            $this->checkCompiler(),
            $this->checkTestSession(),
        ];

        $messages = [];
        $newRunner = true;
        $correct = true;
        $someOld = false;
        $someNew = false;
        foreach ($checks as $check) {
            $messages[] = $check['message'];
            $newRunner = $newRunner && $check['new'];
            $correct = $correct && $check['correct'];
            if ($check['new']) {
                $someNew = true;
            } else {
                $someOld = true;
            }
        }

        $message = implode("\n", $messages) . "\n";
        $correct = $correct && ($someNew xor $someOld);

        if (!$correct) {
            $message .= "\nWARNING!\nThe Test Runner does not seem to be well configured!";
            if ($someNew && $someOld) {
                $message .= "\n\nThere is a mix of different versions!";
            }
        } else if ($newRunner) {
            $message .= "\nThe New Test Runner is activated";
        } else {
            $message .= "\nThe Old Test Runner is activated";
        }



        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, $message . "\n");
    }
}
