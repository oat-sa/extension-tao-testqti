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

namespace oat\taoQtiTest\test\runner\communicator;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiTest\models\runner\communicator\CommunicationChannel as CommunicationChannelInterface;
use oat\taoQtiTest\models\runner\communicator\QtiCommunicationService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use Prophecy\Prophet;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\tests\AssessmentTestSessionState;

/**
 * Class QtiCommunicationServiceTest
 *
 * @package oat\taoQtiTest\models\runner\communicator
 * @author Aleh Hutnikau, <hutnikau@1pt.com>
 */
class QtiCommunicationServiceTest extends TaoPhpUnitTestRunner
{

    /**
     * Test CommunicationChannel::processInput
     */
    public function testProcessInput()
    {
        $service = new QtiCommunicationService([]);
        $channel = new CommunicationChannel();
        $channel2 = new CommunicationChannel2();
        $channel3 = new CommunicationChannel2();
        $service->attachChannel($channel, QtiCommunicationService::CHANNEL_TYPE_INPUT);
        $service->attachChannel($channel2, QtiCommunicationService::CHANNEL_TYPE_INPUT);
        $service->attachChannel($channel3, QtiCommunicationService::CHANNEL_TYPE_OUTPUT); //should not be called

        $context = $this->getQtiRunnerServiceContext(AssessmentTestSessionState::SUSPENDED);

        $responses = $service->processInput($context, [['channel' => $channel->getName(), 'message' => []]]);
        $this->assertEquals(['Channel 1 output'], $responses);

        $responses = $service->processInput($context, [['channel' => 'wrongChannel', 'message' => []]]);
        $this->assertEquals([null], $responses); //fallback

        $responses = $service->processInput($context, [
            ['channel' => $channel->getName(), 'message' => []],
            ['channel' => $channel2->getName(), 'message' => []],
        ]);
        $this->assertEquals(['Channel 1 output', 'Channel 2 output'], $responses);
    }

    /**
     * @expectedException \common_exception_InconsistentData
     */
    public function testProcessInputException()
    {
        $service = new QtiCommunicationService([]);
        $channel = new CommunicationChannel();
        $service->attachChannel($channel, QtiCommunicationService::CHANNEL_TYPE_OUTPUT);
        $context = $this->getQtiRunnerServiceContext(AssessmentTestSessionState::SUSPENDED);

        $service->processInput($context, [['channel' => $channel->getName()]]); //no message
    }

    /**
     * @expectedException \common_exception_InconsistentData
     */
    public function testProcessInputException2()
    {
        $service = new QtiCommunicationService([]);
        $channel = new CommunicationChannel();
        $service->attachChannel($channel, QtiCommunicationService::CHANNEL_TYPE_OUTPUT);
        $context = $this->getQtiRunnerServiceContext(AssessmentTestSessionState::SUSPENDED);

        $service->processInput($context, [['message' => 'foo']]); //no channel
    }

    /**
     * Test CommunicationChannel::processOutput
     */
    public function testProcessOutput()
    {
        $service = new QtiCommunicationService([]);
        $channel = new CommunicationChannel();
        $channel2 = new CommunicationChannel2();
        $channel3 = new CommunicationChannel2();
        $service->attachChannel($channel, QtiCommunicationService::CHANNEL_TYPE_OUTPUT);
        $service->attachChannel($channel2, QtiCommunicationService::CHANNEL_TYPE_OUTPUT);
        $service->attachChannel($channel3, QtiCommunicationService::CHANNEL_TYPE_INPUT); //should not be called

        $context = $this->getQtiRunnerServiceContext(AssessmentTestSessionState::SUSPENDED);

        $responses = $service->processOutput($context);
        $this->assertEquals(
            [
                [
                    'channel' => 'TestChannel',
                    'message' => 'Channel 1 output'
                ],
                [
                    'channel' => 'TestChannel2',
                    'message' => 'Channel 2 output'
                ],
            ],
            $responses
        );
    }

    /**
     * Test CommunicationChannel::attachChannel
     */
    public function testAttachChannel()
    {
        $service = new QtiCommunicationService([]);
        $this->assertEquals(null, $service->getOption(QtiCommunicationService::OPTION_CHANNELS));

        $channel = new CommunicationChannel();
        $service->attachChannel($channel, QtiCommunicationService::CHANNEL_TYPE_OUTPUT);

        $this->assertEquals(
            [QtiCommunicationService::CHANNEL_TYPE_OUTPUT => [$channel->getName() => get_class($channel)]],
            $service->getOption(QtiCommunicationService::OPTION_CHANNELS)
        );

        $channel2 = new CommunicationChannel2();
        $service->attachChannel($channel2, QtiCommunicationService::CHANNEL_TYPE_INPUT);

        $this->assertEquals(
            [
                QtiCommunicationService::CHANNEL_TYPE_OUTPUT => [$channel->getName() => get_class($channel)],
                QtiCommunicationService::CHANNEL_TYPE_INPUT => [$channel2->getName() => get_class($channel2)]
            ],
            $service->getOption(QtiCommunicationService::OPTION_CHANNELS)
        );
    }

    /**
     * @expectedException \common_exception_InconsistentData
     */
    public function testAttachChannelException()
    {
        $service = new QtiCommunicationService([]);
        $channel = new CommunicationChannel();
        $service->attachChannel($channel, QtiCommunicationService::CHANNEL_TYPE_OUTPUT);
        $service->attachChannel($channel, QtiCommunicationService::CHANNEL_TYPE_OUTPUT);
    }

    /**
     * Test CommunicationChannel::detachChannel
     */
    public function testDetachChannel()
    {
        $service = new QtiCommunicationService([]);
        $channel = new CommunicationChannel();
        $channel2 = new CommunicationChannel2();
        $service->attachChannel($channel, QtiCommunicationService::CHANNEL_TYPE_OUTPUT);
        $service->attachChannel($channel, QtiCommunicationService::CHANNEL_TYPE_INPUT);
        $service->attachChannel($channel2, QtiCommunicationService::CHANNEL_TYPE_INPUT);
        $service->attachChannel($channel2, QtiCommunicationService::CHANNEL_TYPE_OUTPUT);

        $this->assertEquals(2, count($service->getOption(QtiCommunicationService::OPTION_CHANNELS)[QtiCommunicationService::CHANNEL_TYPE_OUTPUT]));
        $this->assertEquals(2, count($service->getOption(QtiCommunicationService::OPTION_CHANNELS)[QtiCommunicationService::CHANNEL_TYPE_INPUT]));

        $service->detachChannel($channel2, QtiCommunicationService::CHANNEL_TYPE_OUTPUT);

        $this->assertEquals(1, count($service->getOption(QtiCommunicationService::OPTION_CHANNELS)[QtiCommunicationService::CHANNEL_TYPE_OUTPUT]));
        $this->assertEquals(2, count($service->getOption(QtiCommunicationService::OPTION_CHANNELS)[QtiCommunicationService::CHANNEL_TYPE_INPUT]));

        $service->detachChannel($channel2, QtiCommunicationService::CHANNEL_TYPE_INPUT);

        $this->assertEquals(1, count($service->getOption(QtiCommunicationService::OPTION_CHANNELS)[QtiCommunicationService::CHANNEL_TYPE_OUTPUT]));
        $this->assertEquals(1, count($service->getOption(QtiCommunicationService::OPTION_CHANNELS)[QtiCommunicationService::CHANNEL_TYPE_INPUT]));

        $this->assertEquals(
            [
                QtiCommunicationService::CHANNEL_TYPE_OUTPUT => [$channel->getName() => get_class($channel)],
                QtiCommunicationService::CHANNEL_TYPE_INPUT => [$channel->getName() => get_class($channel)]
            ],
            $service->getOption(QtiCommunicationService::OPTION_CHANNELS)
        );
    }

    /**
     * @expectedException \common_exception_InconsistentData
     */
    public function testDetachChannelException()
    {
        $service = new QtiCommunicationService([]);
        $channel = new CommunicationChannel();
        $channel2 = new CommunicationChannel2();
        $service->attachChannel($channel, QtiCommunicationService::CHANNEL_TYPE_OUTPUT);
        $service->detachChannel($channel2, QtiCommunicationService::CHANNEL_TYPE_OUTPUT);
    }

    /**
     * @param $sessionState
     * @return AssessmentTestSession Assessment test session mock
     */
    private function getQtiRunnerServiceContext($sessionState)
    {
        $prophet = new Prophet();

        $sessionProphecy = $prophet->prophesize('qtism\runtime\tests\AssessmentTestSession');
        $sessionProphecy->getState()->willReturn($sessionState);

        $contextProphecy = $prophet->prophesize('oat\taoQtiTest\models\runner\QtiRunnerServiceContext');
        $contextProphecy->getTestSession()->willReturn($sessionProphecy->reveal());

        return $contextProphecy->reveal();
    }
}

class CommunicationChannel implements CommunicationChannelInterface
{
    public function getName()
    {
        return 'TestChannel';
    }

    public function process(QtiRunnerServiceContext $context, array $input = [])
    {
        return 'Channel 1 output';
    }
}

class CommunicationChannel2 implements CommunicationChannelInterface
{
    public function getName()
    {
        return 'TestChannel2';
    }

    public function process(QtiRunnerServiceContext $context, array $input = [])
    {
        return 'Channel 2 output';
    }
}