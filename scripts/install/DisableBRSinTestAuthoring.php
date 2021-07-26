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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\scripts\install;

use common_exception_Error as Error;
use oat\oatbox\extension\InstallAction;
use common_ext_ExtensionsManager as ExtensionsManager;
use common_ext_ExtensionException as ExtensionException;
use oat\oatbox\service\exception\InvalidServiceManagerException;

/**
 * Class DisableBRSinTestAuthoring
 *
 * @package oat\taoQtiTest\scripts\install
 */
class DisableBRSinTestAuthoring extends InstallAction
{
    /**
     * @param array $params
     *
     * @throws Error
     * @throws InvalidServiceManagerException
     * @throws ExtensionException
     */
    public function __invoke($params): void
    {
        /** @var ExtensionsManager $extensionManager */
        $extensionManager = $this->getServiceManager()->get(ExtensionsManager::SERVICE_ID);
        $extension = $extensionManager->getExtensionById('tao');

        $config = $extension->getConfig('client_lib_config_registry');
        $config['taoQtiTest/controller/creator/views/item'] = [
            'BRS' => false,
        ];

        $extension->setConfig('client_lib_config_registry', $config);
    }
}
