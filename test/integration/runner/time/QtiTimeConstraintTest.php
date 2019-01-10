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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 *
 */

namespace oat\taoQtiTest\test\integration\runner\time;

use oat\generis\test\GenerisPhpUnitTestRunner;
use oat\taoQtiTest\models\runner\time\QtiTimeConstraint;
use qtism\data\SectionPart;
use qtism\data\TimeLimits;
use qtism\common\datatypes\QtiDuration;
use oat\oatbox\service\ServiceManager;
use oat\taoQtiTest\models\runner\time\TimerLabelFormatterService;

/**
 * Test the class oat\taoQtiTest\models\runner\time\QtiTimeConstraint
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
class QtiTimeConstraintTest extends GenerisPhpUnitTestRunner
{
    /** @var TimerLabelFormatterService */
    private $labelFormatter = null;

    /**
     * @throws \common_ext_ExtensionException
     */
    public function setUp()
    {
        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
        $this->labelFormatter = ServiceManager::getServiceManager()->get(TimerLabelFormatterService::SERVICE_ID);
    }

    /**
     * Provides cases for the encoding of time constraints
     * @return array[] the cases
     */
    public function providesEncodingCases()
    {
        return [
            [   //min, max duration, with time spent
                new  QtiDuration('PT300S'),
                new  QtiDuration('PT500S'),
                new  QtiDuration('PT30S'),
                'assessmentItemRef',
                'item-1',
                false,
                [
                    'label'               => 'item-1',
                    'source'              => 'item-1',
                    'qtiClassName'        => 'assessmentItemRef',
                    'allowLateSubmission' => false,
                    'extraTime'           => [],
                    'minTime'             => 300,
                    'minTimeRemaining'    => 270,
                    'maxTime'             => 500,
                    'maxTimeRemaining'    => 470
                ]
            ],
            [ //max duration only, counting in minutes
                null,
                new  QtiDuration('PT10M'),
                new  QtiDuration('PT5M'),
                'assessmentSection',
                'section-2',
                false,
                [
                    'label'               => 'section-2',
                    'source'              => 'section-2',
                    'qtiClassName'        => 'assessmentSection',
                    'allowLateSubmission' => false,
                    'extraTime'           => [],
                    'minTime'             => false,
                    'minTimeRemaining'    => false,
                    'maxTime'             => 600,
                    'maxTimeRemaining'    => 300
                ]
            ],
            [   //no duration at all
                null,
                null,
                new  QtiDuration('PT0S'),
                'assessmentSection',
                'section-2',
                false,
                false
            ],
            [   //min, max duration, with no time spent
                new  QtiDuration('PT1H'),
                new  QtiDuration('PT2H'),
                new  QtiDuration('PT0H'),
                'assessmentTest',
                'test-1',
                true,
                [
                    'label'               => 'test-1',
                    'source'              => 'test-1',
                    'qtiClassName'        => 'assessmentTest',
                    'allowLateSubmission' => true,
                    'extraTime'           => [],
                    'minTime'             => 3600,
                    'minTimeRemaining'    => 3600,
                    'maxTime'             => 7200,
                    'maxTimeRemaining'    => 7200
                ]

            ]
        ];
    }

    /**
     * Test serialization of a constraint built 
     * with different parameters
     *
     * @dataProvider providesEncodingCases
     */
    public function testEncode($min, $max, $spent, $type, $id, $lateSubmission, $expected)
    {
        if (isset($expected['label'])) {
            $expected['label'] = $this->labelFormatter->format($expected['label']);
        }

        //TimeLimits is a pojo, no need to stub
        $timeLimits = null;
        if($min != null || $max != null){
            $timeLimits = new TimeLimits($min, $max, $lateSubmission);
        }

        //stub the source to make it return the timelimits and the case values
        $source = $this->prophesize(SectionPart::class);
        $source->getTimeLimits()->willReturn($timeLimits);
        $source->getIdentifier()->willReturn($id);
        $source->getQtiClassName()->willReturn($type);

        $timeConstraint = new QtiTimeConstraint($source->reveal(), $spent);

        $encoded = json_encode($timeConstraint);
        $this->assertJson($encoded);

        $decoded = json_decode($encoded, JSON_OBJECT_AS_ARRAY);
        $this->assertEquals($expected, $decoded);
    }

}

