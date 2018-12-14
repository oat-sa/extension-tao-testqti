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

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use Zend\ServiceManager\ServiceLocatorAwareInterface;

/**
 * Class QtiCommunicationService
 *
 * Implements a bidirectional communication between client and server using polling
 *
 * @package oat\taoQtiTest\models\runner\communicator
 */
class QtiCommunicationService extends ConfigurableService implements CommunicationService
{
    const SERVICE_ID = 'taoQtiTest/QtiCommunicationService';

    /**
     * @deprecated use SERVICE_ID
     */
    const CONFIG_ID = 'taoQtiTest/QtiCommunicationService';

    const OPTION_CHANNELS = 'channels';

    /**
     * Processes the input messages
     * @param QtiRunnerServiceContext $context - Needs the current runner context
     * @param array $input - Accept a list of input, each one is represented by a channel's name that is a string and a message that can be any type
     * @return array - Returns a list of responses in the same order as the input list
     * @throws \common_exception_InconsistentData
     */
    public function processInput(QtiRunnerServiceContext $context, array $input)
    {
        $responses = [];

        foreach ($input as $data) {
            if (!is_array($data) || !isset($data['channel']) || !isset($data['message'])) {
                throw new \common_exception_InconsistentData('Wrong message chunk received by the bidirectional communication service: either channel or message content is missing!');
            }

            if ($this->hasChannel($data['channel'], self::CHANNEL_TYPE_INPUT)) {
                $channel = $this->getChannel($data['channel'], self::CHANNEL_TYPE_INPUT);
                // known channel, forward...
                $responses[] = $this->processChannel($channel, $context,  $data['message']);
            } else {
                // unknown channel, fallback!
                $responses[] = $this->fallback($data['channel'], $context, $data['message']);
            }
        }

        return $responses;
    }

    /**
     * Builds the list of output messages
     * @param QtiRunnerServiceContext $context - Needs the current runner context
     * @return array - Returns a list of output, each one is represented by a channel's name that is a string and a message that can be any type
     */
    public function processOutput(QtiRunnerServiceContext $context)
    {
        $messages = [];
        $channels = $this->getOption(self::OPTION_CHANNELS);
        if (is_array($channels[self::CHANNEL_TYPE_OUTPUT])) {
            foreach ($channels[self::CHANNEL_TYPE_OUTPUT] as $outputChannelName => $outputChannelClass) {
                $channel = $this->getChannel($outputChannelName, self::CHANNEL_TYPE_OUTPUT);
                $message = $this->processChannel($channel, $context);
                if ($message !== null) {
                    $messages[] = [
                        'channel' => $channel->getName(),
                        'message' => $message,
                    ];
                }
            }
        }
        return $messages;
    }

    /**
     * @param CommunicationChannel $channel
     * @param integer $channelType
     * @throws \common_exception_InconsistentData
     */
    public function attachChannel(CommunicationChannel $channel, $channelType)
    {
        if ($this->hasChannel($channel->getName(), $channelType)) {
            throw new \common_exception_InconsistentData('Channel ' . $channel->getName() . ' already registered in ' . __CLASS__);
        }

        $channels = $this->getOption(self::OPTION_CHANNELS);

        $channels[$channelType][$channel->getName()] = get_class($channel);
        $this->setOption(self::OPTION_CHANNELS, $channels);
    }

    /**
     * @param CommunicationChannel $channel
     * @param integer $channelType
     * @throws \common_exception_InconsistentData
     */
    public function detachChannel(CommunicationChannel $channel, $channelType)
    {
        if (!$this->hasChannel($channel->getName(), $channelType)) {
            throw new \common_exception_InconsistentData('Channel ' . $channel->getName() . 'is not registered in ' . __CLASS__);
        }

        $channels = $this->getOption(self::OPTION_CHANNELS);
        unset($channels[$channelType][$channel->getName()]);
        $this->setOption(self::OPTION_CHANNELS, $channels);
    }

    /**
     * Check whether channel exists
     * @param string $channelName
     * @param integer $channelType
     * @return bool
     */
    protected function hasChannel($channelName, $channelType)
    {
        $channels = $this->getOption(self::OPTION_CHANNELS);
        return isset($channels[$channelType][$channelName]);
    }

    /**
     * @param string $channelName
     * @param integer $channelType
     * @return CommunicationChannel
     */
    protected function getChannel($channelName, $channelType)
    {
        $channels = $this->getOption(self::OPTION_CHANNELS);
        $channel = new $channels[$channelType][$channelName];
        $this->propagate($channel);

        return $channel;
    }

    /**
     * @param QtiRunnerServiceContext $context
     * @param CommunicationChannel $channel
     * @param array $data
     * @throws \common_exception_InconsistentData
     * @return mixed channel response
     */
    protected function processChannel(CommunicationChannel $channel, QtiRunnerServiceContext $context, array $data = [])
    {
        return $channel->process($context, $data);
    }

    /**
     * Fallback for unknown channels
     * @param QtiRunnerServiceContext $context
     * @param string $channel
     * @param mixed $message
     * @return mixed
     */
    protected function fallback($channel, QtiRunnerServiceContext $context,  $message)
    {
        // do nothing by default, need to be overwritten
        return null;
    }
}
