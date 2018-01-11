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

namespace oat\taoQtiTest\models\container;

use oat\taoDelivery\model\container\delivery\AbstractContainer;
use oat\taoDelivery\helper\container\DeliveryClientContainer as ClientExecution;
use oat\taoDelivery\model\execution\DeliveryExecution;
use oat\taoDelivery\model\DeliveryContainerService;

class QtiTestDeliveryContainer extends AbstractContainer
{
    private $source;
    private $private;
    private $public;

    public function setRuntimeParams($params)
    {
        parent::setRuntimeParams($params);
        $this->source = $params['source'];
        $this->private = $params['private'];
        $this->public = $params['public'];
    }

    public function getSourceTest(DeliveryExecution $execution)
    {
        return $this->source;
    }

    public function getPublicDirId(DeliveryExecution $execution)
    {
        return $this->public;
    }

    public function getPrivateDirId(DeliveryExecution $execution)
    {
        return $this->private;
    }

    public function getExecutionContainer(DeliveryExecution $execution)
    {
        $container = new ClientExecution($execution);
        $containerService = $this->getServiceLocator()->get(DeliveryContainerService::SERVICE_ID);
        // set the test parameters
        $container->setData('testDefinition', $this->getSourceTest($execution));
        $container->setData('testCompilation', $this->getPrivateDirId($execution).'|'.$this->getPublicDirId($execution));
        $container->setData('providers', $containerService->getProviders($execution));
        $container->setData('plugins', $containerService->getPlugins($execution));
        $container->setData('bootstrap', $containerService->getBootstrap($execution));
        $container->setData('serviceCallId', $execution->getIdentifier());
        $container->setData('deliveryExecution', $execution->getIdentifier());
        $container->setData('deliveryServerConfig', []);

        return $container;
    }
}
