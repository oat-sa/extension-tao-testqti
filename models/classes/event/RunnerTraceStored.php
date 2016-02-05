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
* Copyright (c) 2015 (original work) Open Assessment Technologies SA;
*
*
*/

namespace oat\taoQtiTest\models\event;

use oat\oatbox\event\Event;
use oat\taoDelivery\model\execution\DeliveryExecution;
/**
* Event should be triggered after changing delivery execution state.
*
*/
class RunnerTraceStored implements Event
{
    /**
     * @var DeliveryExecution delivery execution instance
     */
    private $deliveryExecution;
    /**
     * @var string state name
     */
    private $state;


    /**
     * DeliveryExecutionState constructor.
     * @param DeliveryExecution $deliveryExecution
     * @param string $state
     */
    public function __construct(DeliveryExecution $deliveryExecution, $state)
    {
        $this->deliveryExecution = $deliveryExecution;
        $this->state = $state;
    }

    /**
     * @return DeliveryExecution
     */
    public function getDeliveryExecution()
    {
        return $this->deliveryExecution;
    }

    /**
     * @return string
     */
    public function getState()
    {
        return $this->state;
    }


    /**
     * @return string
     */
    public function getName()
    {
        return __CLASS__;
    }

}