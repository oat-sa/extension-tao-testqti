<?php

namespace oat\taoQtiTest\test\unit\models\classes\runner\map;

use oat\generis\test\TestCase;
use oat\taoQtiTest\models\runner\map\TestMapBranchRuleExtender;

class TestMapBranchRuleExtenderTest extends TestCase
{
    /** @var TestMapBranchRuleExtender */
    private $testMapBranchRuleExtender;

    public function setUp(): void
    {
        $this->testMapBranchRuleExtender = new TestMapBranchRuleExtender();
    }

    public function testGetTestMapWithBranchRules()
    {
        $this->assertEquals([
            'parts' => [
                'P01' => [
                    'branchRule' => 'test',
                    'sections' => [
                        'S01' => [
                            'branchRule' => 'test',
                            'items' => [
                                'I01' => [
                                    'branchRule' => 'test',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ], $this->testMapBranchRuleExtender->getTestMapWithBranchRules(
            $this->getTestMapMock(),
            $this->getTestDefinitionMock()
        ));
    }

    private function getTestMapMock()
    {
        return [
            'parts' => [
                'P01' => [
                    'sections' => [
                        'S01' => [
                            'items' => [
                                'I01' => [],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    private function getTestDefinitionMock()
    {
        return [
            'testPart' => [
                0 => [
                    '@attributes' => [ 'identifier' => 'P01' ],
                    'branchRule' => 'test',
                    'assessmentSection' => [
                        0 => [
                            '@attributes' => [ 'identifier' => 'S01' ],
                            'branchRule' => 'test',
                            'assessmentItemRef' => [
                                0 => [
                                    '@attributes' => [ 'identifier' => 'I01' ],
                                    'branchRule' => 'test',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }
}
