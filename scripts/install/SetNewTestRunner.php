<?php
namespace oat\taoQtiTest\scripts\install;

/**
 * Class SetNewTestRunner
 * 
 * Setup the new Test Runner
 * 
 * @package oat\taoQtiTest\scripts\install
 */
class SetNewTestRunner extends \common_ext_action_InstallAction
{
    public function __invoke($params)
    {
        $deliveryExt = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoDelivery');
        $deliveryServerConfig = $deliveryExt->getConfig('deliveryServer');
        $deliveryServerConfig->setOption('deliveryContainer', 'oat\\taoDelivery\\helper\\container\\DeliveryClientContainer');
        $deliveryExt->setConfig('deliveryServer', $deliveryServerConfig);

        $itemQtiExt = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem');
        $compilerClassConfig = 'oat\\taoQtiItem\\model\\QtiJsonItemCompiler';
        $itemQtiExt->setConfig('compilerClass', $compilerClassConfig);

        $testQtiExt = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
        $testRunnerConfig = $testQtiExt->getConfig('testRunner');
        $testRunnerConfig['test-session'] = 'oat\\taoQtiTest\\models\\runner\\session\\TestSession';
        $testQtiExt->setConfig('testRunner', $testRunnerConfig);

        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, 'New test runner activated');
    }
}
