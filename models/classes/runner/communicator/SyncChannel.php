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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */

namespace oat\taoQtiTest\models\runner\communicator;

use oat\oatbox\service\ServiceManagerAwareInterface;
use oat\oatbox\service\ServiceManagerAwareTrait;
use oat\taoQtiTest\models\runner\synchronisation\SynchronisationService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;

class SyncChannel implements CommunicationChannel, ServiceManagerAwareInterface
{
    use ServiceManagerAwareTrait;

    const CHANNEL_NAME = 'sync';

    /**
     * Get name of channel
     *
     * @return string
     */
    public function getName()
    {
        return self::CHANNEL_NAME;
    }

    /**
     * Forward the data processing to the SynchronisationService
     *
     * @param QtiRunnerServiceContext $context
     * @param array $data
     * @return string
     */
    public function process(QtiRunnerServiceContext $context, array $data = [])
    {
        return $this->getServiceManager()->get(SynchronisationService::SERVICE_ID)->process($data, $context);
    }

}