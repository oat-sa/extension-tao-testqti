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

namespace oat\taoQtiTest\test\runner\communicator;

use oat\oatbox\service\ServiceManager;
use oat\taoQtiTest\models\runner\communicator\SyncChannel;
use oat\taoQtiTest\models\runner\offline\OfflineService;
use Prophecy\Prophet;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\tests\AssessmentTestSessionState;

class SyncChannelTest extends \PHPUnit_Framework_TestCase
{
    public function setUp()
    {
        $extensionManager = ServiceManager::getServiceManager()->get(\common_ext_ExtensionsManager::SERVICE_ID);
        $extensionManager->getExtensionById('taoQtiTest');
        $extensionManager->getExtensionById('taoDelivery');
    }

    /**
     * @dataProvider providerTestProcess
     *
     * @param $data
     * @param $exception
     */
    public function testProcess($data, $exception)
    {
        $context = $this->getQtiRunnerServiceContext(AssessmentTestSessionState::SUSPENDED);
        $service = new OfflineService();
        ServiceManager::getServiceManager()->propagate($service);

        if (is_a($exception, \Exception::class, true)) {
            $this->setExpectedException($exception);
        }

        print_r($service->process($data));
    }

    public function providerTestProcess()
    {
        $testDefinition = 'http://tao.dev/tao_instance.rdf#i1497624097689534';
        $testCompilation = 'http://tao.dev/tao_instance.rdf#i14992630687797217-|http://tao.dev/tao_instance.rdf#i14992630682221218+';
        $testServiceCallId = 'http://tao.dev/tao_instance.rdf#i14993297328677242';

        $action = [
            "action" => "move",
            "timestamp" => 123456789,
            "parameters" => [

                /* CONTEXT SERVICE */
                'testDefinition' => $testDefinition,
                'testCompilation' => $testCompilation,
                'testServiceCallId' => $testServiceCallId,

                /* MOVE ACTION */
                "direction" => "next",
                "scope" => "item",
                "start" => true,
                //"ref" => "",

                /* TIMER */
                //"itemDuration" => 3.2758199999999977,
                //"consumedExtraTime" => 0,

                /* STATE */
                //"itemIdentifier" => "item-2",
                //"itemState" => "{\"RESPONSE\":{\"response\":{\"base\":{\"integer\":0}}}}",

                /* ITEM RESPONSE */
                //"itemDefinition" => "",
                //"itemResponse" => "{\"RESPONSE\":{\"base\":{\"integer\":0}}}",

            ]
        ];

        $action['direction'] = 'next';
        $actionNext = $action;

        $action['direction'] = 'previous';
        $actionBack = $action;

        $actions = [
            [
                "action" => "move",
                "timestamp" => 123456789,
                "parameters" => [

                    'testDefinition' => $testDefinition,
                    'testCompilation' => $testCompilation,
                    'testServiceCallId' => $testServiceCallId,
                    "direction" => "next",
                    "scope" => "item",
                    "start" => true,
                    //"ref" => "",

                    //"itemDefinition" => "",
                    //"itemDuration" => 3.2758199999999977,
                    //"itemState" => "{\"RESPONSE\":{\"response\":{\"base\":{\"integer\":0}}}}",
                    //"itemResponse" => "{\"RESPONSE\":{\"base\":{\"integer\":0}}}",

                    //"itemIdentifier" => "item-2",
                    //"consumedExtraTime" => 0,
                ]
            ],
            [
                "action" => "skip",
                "timestamp" => 1234567895,
                "parameters" => [
                    'testDefinition' => $testDefinition,
                    'testCompilation' => $testCompilation,
                    'testServiceCallId' => $testServiceCallId,


                    //"itemDefinition" => "",
                    //"itemIdentifier" => "item-3",
                    //"consumedExtraTime" => 0
                    //"direction" => "skip",
                    "scope" => "item",
                ]
            ], [
                "action" => "move",
                "timestamp" => 123456799,
                "parameters" => [
                    'testDefinition' => $testDefinition,
                    'testCompilation' => $testCompilation,
                    'testServiceCallId' => $testServiceCallId,
                   // "itemDefinition" => "",
                   // "itemIdentifier" => "item-3",
                   // "itemResponse" => "{\"RESPONSE\":{\"base\":{\"integer\":0}}}",
                   // "itemState" => "{\"RESPONSE\":{\"response\":{\"base\":{\"integer\":0}}}}",
                    "direction" => "previous",
                    "scope" => "item",
                   // "consumedExtraTime" => 0,
                   // "itemDuration" => 3.2758199999999977,
                    "start" => true
                ]
            ],
        ];

        //$chainMoveAction = array($actionNext, $actionBack, $actionNext, $actionBack, $actionNext, $actionBack);
        $chainMoveAction = $actions;
        $chainMoveAction = [$actionNext];

        return [
            [
                // Empty data
                [], \common_exception_InconsistentData::class,
            ],
            [
                // Chain of action
                $chainMoveAction, null
            ]
        ];
    }

    protected function getTestDefinition()
    {

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