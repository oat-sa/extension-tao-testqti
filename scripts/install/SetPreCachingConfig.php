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
 * Copyright (c) 2017-2019 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */

namespace oat\taoQtiTest\scripts\install;

use oat\taoTests\models\runner\providers\ProviderRegistry;
use oat\taoTests\models\runner\providers\TestProvider;

/**
 * Set Precaching Configuration Installation Action
 *
 * This action prepares the test runner configuration to use
 * a caching proxy in order to cache the next N items in item flow
 * of a given assessment test session.
 */
class SetPreCachingConfig extends \common_ext_action_InstallAction
{
    /**
     * @param $params
     * @return \common_report_Report
     */
    public function __invoke($params)
    {
        //set the allow flag to true
        $qtiTest = $this->getServiceManager()->get(\common_ext_ExtensionsManager::SERVICE_ID)->getExtensionById('taoQtiTest');
        $config = $qtiTest->getConfig('testRunner');
        $config = array_merge($config, [
            'allow-browse-next-item' => true
        ]);
        $qtiTest->setConfig('testRunner', $config);

        if (!$this->registerPrecachingProxy()) {
            return new \common_report_Report(
                \common_report_Report::TYPE_ERROR,
                "Unable to register the proxy."
            );
        }

        return new \common_report_Report(
            \common_report_Report::TYPE_SUCCESS,
            "Precaching configuration set."
        );
    }

    private function registerPrecachingProxy()
    {
        $providerRegistry = $this->getProviderRegistry();
        $providerRegistry->removeByCategory('proxy');
        $providerRegistry->register(TestProvider::fromArray([
            'id'       => 'preCachingProxy',
            'module'   => 'taoQtiTest/runner/proxy/cache/proxy',
            'bundle'   => 'taoQtiTest/loader/taoQtiTestRunner.min',
            'category' => 'proxy'
        ]));
        return $providerRegistry->isRegistered('taoQtiTest/runner/proxy/cache/proxy');
    }

    /**
     * @return ProviderRegistry|AbstractRegistry
     */
    private function getProviderRegistry()
    {
        return ProviderRegistry::getRegistry();
    }
}
