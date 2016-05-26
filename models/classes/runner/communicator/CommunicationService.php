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
 * Interface CommunicationService
 *
 * Describes the API needed to manage bidirectional communication between client and server
 *
 * @package oat\taoQtiTest\models\runner\communicator
 */
interface CommunicationService
{
    /**
     * Channels to process input messages
     */
    const CHANNEL_TYPE_INPUT = 'input';

    /**
     * Channels to process output messages
     */
    const CHANNEL_TYPE_OUTPUT = 'output';

    /**
     * Processes the input messages
     * @param QtiRunnerServiceContext $context - Needs the current runner context
     * @param array $input - Accept a list of input, each one is represented by a channel's name that is a string and a message that can be any type
     * @return array - Returns a list of responses in the same order as the input list
     * @throws \common_Exception
     */
    public function processInput(QtiRunnerServiceContext $context, array $input);

    /**
     * Builds the list of output messages
     * @param QtiRunnerServiceContext $context - Needs the current runner context
     * @return array - Returns a list of output, each one is represented by a channel's name that is a string and a message that can be any type
     * @throws \common_Exception
     */
    public function processOutput(QtiRunnerServiceContext $context);

    /**
     * Register channel
     * @param CommunicationChannel $channel
     * @param integer $channelType
     */
    public function attachChannel(CommunicationChannel $channel, $channelType);

    /**
     * Register channel
     * @param CommunicationChannel $channel
     * @param integer $channelType
     */
    public function detachChannel(CommunicationChannel $channel, $channelType);
}