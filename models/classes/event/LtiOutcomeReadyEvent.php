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
 */


namespace oat\taoQtiTest\models\event;


use oat\oatbox\event\Event;

class LtiOutcomeReadyEvent implements Event
{
    private $var;
    private $deliveryExecutionIdentifier;
    private $testUri;

    /**
     * LtiOutcomeReadyEvent constructor.
     * @param $var
     * @param $deliveryExecutionIdentifier
     * @param $testUri
     */
    public function __construct($var, $deliveryExecutionIdentifier, $testUri)
    {
        $this->var = $var;
        $this->deliveryExecutionIdentifier = $deliveryExecutionIdentifier;
        $this->testUri = $testUri;
    }


    /**
     * Return a unique name for this event
     *
     * @return string
     */
    public function getName()
    {
        return __CLASS__;
    }

    /**
     * @return mixed
     */
    public function getVar()
    {
        return $this->var;
    }

    /**
     * @return mixed
     */
    public function getTestUri()
    {
        return $this->testUri;
    }

    /**
     * @return mixed
     */
    public function getDeliveryExecutionIdentifier()
    {
        return $this->deliveryExecutionIdentifier;
    }

}