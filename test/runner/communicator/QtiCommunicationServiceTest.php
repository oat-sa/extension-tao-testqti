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
        $service->attachChannel($channel);
        $service->attachChannel($channel2);

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
        $service->attachChannel($channel);
        $context = $this->getQtiRunnerServiceContext(AssessmentTestSessionState::SUSPENDED);

        $service->processInput($context, [['channel' => $channel->getName()]]); //no message
    }

    /**
     * Test CommunicationChannel::processOutput
     */
    public function testProcessOutput(/*QtiRunnerServiceContext $context*/)
    {
        /*$messages = [];

        $state = $context->getTestSession()->getState();

        if ($state == AssessmentTestSessionState::CLOSED) {
            $messages[] = $this->buildTestStateMessage('close', $state, __('This test has been terminated'));
        }

        if ($state == AssessmentTestSessionState::SUSPENDED) {
            $messages[] = $this->buildTestStateMessage('pause', $state, __('This test has been suspended'));
        }

        return $messages;*/
    }

    /**
     * Test CommunicationChannel::attachChannel
     */
    public function testAttachChannel()
    {
        $service = new QtiCommunicationService([]);
        $this->assertEquals(null, $service->getOption(QtiCommunicationService::OPTION_CHANNELS));

        $channel = new CommunicationChannel();
        $service->attachChannel($channel);

        $this->assertEquals([$channel->getName() => get_class($channel)], $service->getOption(QtiCommunicationService::OPTION_CHANNELS));

        $channel2 = new CommunicationChannel2();
        $service->attachChannel($channel2);

        $this->assertEquals(2, count($service->getOption(QtiCommunicationService::OPTION_CHANNELS)));
    }

    /**
     * @expectedException \common_exception_InconsistentData
     */
    public function testAttachChannelException()
    {
        $service = new QtiCommunicationService([]);
        $channel = new CommunicationChannel();
        $service->attachChannel($channel);
        $service->attachChannel($channel);
    }

    /**
     * Test CommunicationChannel::detachChannel
     */
    public function testDetachChannel()
    {
        $service = new QtiCommunicationService([]);
        $channel = new CommunicationChannel();
        $channel2 = new CommunicationChannel2();
        $service->attachChannel($channel);
        $service->attachChannel($channel2);

        $this->assertEquals(2, count($service->getOption(QtiCommunicationService::OPTION_CHANNELS)));

        $service->detachChannel($channel2);

        $this->assertEquals(1, count($service->getOption(QtiCommunicationService::OPTION_CHANNELS)));
        $this->assertEquals([$channel->getName() => get_class($channel)], $service->getOption(QtiCommunicationService::OPTION_CHANNELS));
    }

    /**
     * @expectedException \common_exception_InconsistentData
     */
    public function testDetachChannelException()
    {
        $service = new QtiCommunicationService([]);
        $channel = new CommunicationChannel();
        $channel2 = new CommunicationChannel2();
        $service->attachChannel($channel);
        $service->detachChannel($channel2);
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

    public function process(QtiRunnerServiceContext $context, array $input)
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

    public function process(QtiRunnerServiceContext $context, array $input)
    {
        return 'Channel 2 output';
    }
}