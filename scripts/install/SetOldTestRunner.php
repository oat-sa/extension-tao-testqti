<?php
namespace oat\taoQtiTest\scripts\install;

/**
 * Class SetOldTestRunner
 * 
 * Setup the old Test Runner
 * 
 * @package oat\taoQtiTest\scripts\install
 */
class SetOldTestRunner extends \common_ext_action_InstallAction
{
    public function __invoke($params)
    {
        $deliveryExt = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoDelivery');
        $deliveryServerConfig = $deliveryExt->getConfig('deliveryServer');
        $deliveryServerConfig->setOption('deliveryContainer', 'oat\\taoDelivery\\helper\\container\\DeliveryServiceContainer');
        $deliveryExt->setConfig('deliveryServer', $deliveryServerConfig);

        $itemQtiExt = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiItem');
        $compilerClassConfig = 'oat\\taoQtiItem\\model\\QtiItemCompiler';
        $itemQtiExt->setConfig('compilerClass', $compilerClassConfig);

        $testQtiExt = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
        $testRunnerConfig = $testQtiExt->getConfig('testRunner');
        $testRunnerConfig['test-session'] = '\\taoQtiTest_helpers_TestSession';
        $testQtiExt->setConfig('testRunner', $testRunnerConfig);

        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, 'Old test runner activated');
    }
}
