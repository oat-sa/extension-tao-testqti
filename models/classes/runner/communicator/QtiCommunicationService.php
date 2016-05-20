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
use qtism\runtime\tests\AssessmentTestSessionState;

/**
 * Class QtiCommunicationService
 *
 * Implements a bidirectional communication between client and server using polling
 *
 * @package oat\taoQtiTest\models\runner\communicator
 */
class QtiCommunicationService extends ConfigurableService implements CommunicationService
{
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
        if (!is_array($input)) {
            throw new \common_exception_InconsistentData('The bidirectional communication service only accept a list of messages as input!');
        }

        $responses = [];

        foreach($input as $data) {
            if (!is_array($data) || !isset($data['channel']) || !isset($data['message'])) {
                throw new \common_exception_InconsistentData('Wrong message chunk received by the bidirectional communication service: either channel or message content is missing!');
            }

            if ($this->hasChannel($data['channel'])) {
                // known channel, forward...
                $responses[] = $this->processChannel($context, $data['channel']);
            } else {
                // unknown channel, fallback!
                $responses[] = $this->fallback($context, $data['channel'], $data['message']);
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

        $state = $context->getTestSession()->getState();

        if ($state == AssessmentTestSessionState::CLOSED) {
            $messages[] = $this->buildTestStateMessage('close', $state, __('This test has been terminated'));
        }

        if ($state == AssessmentTestSessionState::SUSPENDED) {
            $messages[] = $this->buildTestStateMessage('pause', $state, __('This test has been suspended'));
        }

        return $messages;
    }

    /**
     * @param CommunicationChannel $channel
     * @throws \common_exception_InconsistentData
     */
    public function attachChannel(CommunicationChannel $channel)
    {
        if ($this->hasChannel($channel->getName())) {
            throw new \common_exception_InconsistentData('Channel ' . $channel . ' already registered in ' . __CLASS__);
        }

        $channels = $this->getOption(self::OPTION_CHANNELS);

        $channels[$channel->getName()] = get_class($channel);
        $this->setOption(self::OPTION_LISTENERS, $channels);
    }

    /**
     * @param CommunicationChannel $channel
     * @throws \common_exception_InconsistentData
     */
    public function detachChannel(CommunicationChannel $channel)
    {
        if (!$this->hasChannel($channel->getName())) {
            throw new \common_exception_InconsistentData('Channel ' . $channel . 'is not registered in ' . __CLASS__);
        }

        $channels = $this->getOption(self::OPTION_CHANNELS);
        unset($channels[$channel->getName()]);
        $this->setOption(self::OPTION_CHANNELS, $channels);
    }

    /**
     * Check whether channel exists
     * @param string $channelName
     * @return bool
     */
    protected function hasChannel($channelName)
    {
        $channels = $this->getOption(self::OPTION_CHANNELS);
        return isset($channels[$channelName]);
    }

    /**
     * @param QtiRunnerServiceContext $context
     * @param $channelName
     * @throws \common_exception_InconsistentData
     * @return mixed channel response
     */
    protected function processChannel(QtiRunnerServiceContext $context, $channelName)
    {
        if (!$this->hasChannel($channelName)) {
            throw new \common_exception_InconsistentData('Channel ' . $channelName . 'is not registered in ' . __CLASS__);
        }

        $channels = $this->getOption(self::OPTION_CHANNELS);
        $channel = new $channels($channelName);
        return $channel->process($context, $channel);
    }

    /**
     * Fallback for unknown channels
     * @param QtiRunnerServiceContext $context
     * @param string $channel
     * @param mixed $message
     * @return mixed
     */
    protected function fallback(QtiRunnerServiceContext $context, $channel, $message)
    {
        // do nothing by default, need to be overwritten
        return null;
    }

    /**
     * Builds a message chunk
     * @param string $channel
     * @param mixed $message
     * @return array
     */
    protected function buildMessage($channel, $message)
    {
        return [
            'channel' => $channel,
            'message' => $message
        ];
    }

    /**
     * Builds a TestState message
     * @param string $type
     * @param int $state
     * @param string $label
     * @return array
     */
    protected function buildTestStateMessage($type, $state, $label)
    {
        return $this->buildMessage('teststate', [
            'type' => $type,
            'code' => $state,
            'message' => $label,
        ]);
    }
}