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
        $service = new OfflineService();
        ServiceManager::getServiceManager()->propagate($service);

        if (is_a($exception, \Exception::class, true)) {
            $this->setExpectedException($exception);
        }

        print_r($service->process($data));
    }

    public function providerTestProcess()
    {
        $testDefinition = 'http://www.taotesting.com/ontologies/tao.rdf#i1499419048770834';
        $testServiceCallId = 'http://www.taotesting.com/ontologies/tao.rdf#i14998770095883221';
        $testCompilation = 'http://www.taotesting.com/ontologies/tao.rdf#i14997769047031200-|http://www.taotesting.com/ontologies/tao.rdf#i14997769043634201+';

        $item2 = array(
            'itemState' => '{"RESPONSE":{"response":{"base":{"integer":0}}},"RESPONSE_3":{"response":{"base":{"integer":526000}}},"RESPONSE_1":{"response":{"list":{"identifier":["choice_1","choice_2","choice_3","choice_4"]}}}}',

            'itemResponse' => '{"RESPONSE":{"base":{"integer":0}},"RESPONSE_3":{"base":{"integer":526000}},"RESPONSE_1":{"list":{"identifier":["choice_1","choice_2","choice_3","choice_4"]}}}',
            'itemDefinition' => 'item-2',

            //'itemDuration' => '12.036030000000002',
            //'consumedExtraTime' => '0',
        );

        $item3 = array(
            'itemStdate' => '{"RESPONSE":{"response":{"list":{"identifier":["choice_1","choice_3","choice_2"]}}},"RESPONSE_1":{"response":{"list":{"pair":[]}}}}',

            'itemResponse' => '{"RESPONSE":{"list":{"identifier":["choice_1","choice_3","choice_2"]}},"RESPONSE_1":{"list":{"pair":[]}}}',
            'itemDefinition' => 'item-3',

            //'itemDuration' => '59.41480000000005'
            //'consumedExtraTim' => '0',
        );

        $item4 = array(
            'itemStdate' => '{"RESPONSE":{"response":{"list":{"pair":[["associablehotspot_2","associablehotspot_1"],["associablehotspot_3","associablehotspot_2"]]}}}}',

            'itemResponse' => '{"RESPONSE":{"list":{"pair":[["associablehotspot_2","associablehotspot_1"],["associablehotspot_3","associablehotspot_2"]]}}}',
            'itemDefinition' => 'item-9',

            //'itemDuration' => '16.084064999999946'
            //'consumedExtraTime' => '0',
        );

        $item5 = array(
            'itemStdate' => 'http://www.taotesting.com/ontologies/tao.rdf#i1499419054689561|http://www.taotesting.com/ontologies/tao.rdf#i14994315211214184+|http://www.taotesting.com/ontologies/tao.rdf#i14994315218706185-',

            'itemResponse' => '{"RESPONSE":{"list":{"directedPair":[["C","M"],["D","T"],["P","T"],["L","R"]]}}}',
            'itemDefinition' => 'item-10',

            //'consumedExtraTim' => '0',
            //'itemDuration' => '12.897464999999967',
        );

        $action = [
            "action" => "move",
            "timestamp" => 123456789,
            "parameters" => [

                /* CONTEXT SERVICE */
                'testDefinition' => $testDefinition,
                'testCompilation' => $testCompilation,
                'serviceCallId' => $testServiceCallId,

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

        $action['parameters']['direction'] = 'next';
        $actionNext = $action;

        $action['parameters']['direction'] = 'previous';
        $actionBack = $action;

        $action1 = $action2 = $action5 = $actionNext;
        $action3 = $action4 = $action6 = $actionBack;

        $action1['parameters'] = array_merge($action1['parameters'], $item2);
        $action2['parameters'] = array_merge($action2['parameters'], $item3);
        $action3['parameters'] = array_merge($action3['parameters'], $item4);
        $action4['parameters'] = array_merge($action4['parameters'], $item3);
        $action5['parameters'] = array_merge($action5['parameters'], $item2);
        $action6['parameters'] = array_merge($action6['parameters'], $item3);

        $chainMoveAction = [$action1,$action2, $action3, $action4, $action5, $action6];
        $chainMoveAction = [$action1];

        return [
            /*[
                // Empty data
                [], \common_exception_InconsistentData::class,
            ],*/
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