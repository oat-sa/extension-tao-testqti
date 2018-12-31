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

namespace oat\taoQtiTest\test\integration\runner\communicator;

use oat\generis\test\GenerisPhpUnitTestRunner;
use oat\taoQtiTest\models\runner\communicator\CommunicationChannel as CommunicationChannelInterface;
use oat\taoQtiTest\models\runner\communicator\QtiCommunicationService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\tests\AssessmentTestSessionState;

/**
 * Class QtiCommunicationServiceTest
 *
 * @package oat\taoQtiTest\models\runner\communicator
 * @author Aleh Hutnikau, <hutnikau@1pt.com>
 */
class QtiCommunicationServiceTest extends GenerisPhpUnitTestRunner
{

    /**
     * Test CommunicationChannel::processInput
     */
    public function testProcessInput()
    {
        $service = new QtiCommunicationService([]);
        $service->setServiceLocator($this->getServiceLocatorMock());
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
     * @param $input
     * @param $expectedException
     * @throws \common_exception_InconsistentData
     *
     * @dataProvider dataProviderTestProcessInputThrowsException
     */
    public function testProcessInputThrowsException($input, $expectedException)
    {
        $this->expectException($expectedException);

        $service = new QtiCommunicationService([]);
        $service->setServiceLocator($this->getServiceLocatorMock());
        $channel = new CommunicationChannel();
        $service->attachChannel($channel, QtiCommunicationService::CHANNEL_TYPE_OUTPUT);
        $context = $this->getQtiRunnerServiceContext(AssessmentTestSessionState::SUSPENDED);

        $service->processInput($context, [$input]);
    }

    /**
     * Test CommunicationChannel::processOutput
     */
    public function testProcessOutput()
    {
        $service = new QtiCommunicationService([]);
        $service->setServiceLocator($this->getServiceLocatorMock());
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
        $service->setServiceLocator($this->getServiceLocatorMock());
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
        $service->setServiceLocator($this->getServiceLocatorMock());
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
        $service->setServiceLocator($this->getServiceLocatorMock());
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
        $service->setServiceLocator($this->getServiceLocatorMock());
        $channel = new CommunicationChannel();
        $channel2 = new CommunicationChannel2();
        $service->attachChannel($channel, QtiCommunicationService::CHANNEL_TYPE_OUTPUT);
        $service->detachChannel($channel2, QtiCommunicationService::CHANNEL_TYPE_OUTPUT);
    }

    /**
     * @param $sessionState
     * @return QtiRunnerServiceContext|\PHPUnit_Framework_MockObject_MockObject test session mock
     */
    private function getQtiRunnerServiceContext($sessionState)
    {
        $sessionMock = $this->createMock(AssessmentTestSession::class);
        $sessionMock->expects($this->any())
            ->method('getState')
            ->willReturn($sessionState);

        $contextMock = $this->createMock(QtiRunnerServiceContext::class);
        $contextMock->expects($this->any())
            ->method('getTestSession')
            ->willReturn($sessionMock);

        return $contextMock;
    }

    /**
     * Data provider for testProcessInputThrowsException
     *
     * @return array
     */
    public function dataProviderTestProcessInputThrowsException() {
        return [
            'Without message' => [
                'input' => ['channel' => 'TestChannel'],
                'expectedException' => \common_exception_InconsistentData::class
            ],
            'Without channel' => [
                'input' => ['message' => 'foo'],
                'expectedException' => \common_exception_InconsistentData::class
            ]
        ];
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
