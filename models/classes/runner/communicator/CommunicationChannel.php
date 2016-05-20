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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */

namespace oat\taoQtiTest\models\runner\communicator;

use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;

/**
 * Interface CommunicationChannel
 *
 * Describes the API of channel to process
 *
 * @package oat\taoQtiTest\models\runner\communicator
 */
interface CommunicationChannel
{
    /**
     * Get name of channel
     * @return string
     */
    public function getName();

    /**
     * Processes the input message
     * @param QtiRunnerServiceContext $context - Needs the current runner context
     * @param array $input - Accept a list of input, each one is represented by a channel's name that is a string and a message that can be any type
     * @return array - Returns a list of responses in the same order as the input list
     * @throws \common_Exception
     */
    public function process(QtiRunnerServiceContext $context, array $input);
}