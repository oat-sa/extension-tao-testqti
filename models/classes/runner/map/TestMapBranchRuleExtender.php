<?php

namespace oat\taoQtiTest\models\runner\map;

use taoQtiTest_models_classes_QtiTestService;

class TestMapBranchRuleExtender
{
    const KEY_ATTRIBUTES = '@attributes';
    const KEY_BRANCH_RULE = 'branchRule';
    const KEY_IDENTIFIER = 'identifier';
    const BRANCH_RULE_MAP = [
        [RunnerMap::MAP_ATTRIBUTE_PARTS, taoQtiTest_models_classes_QtiTestService::XML_TEST_PART],
        [RunnerMap::MAP_ATTRIBUTE_SECTIONS, taoQtiTest_models_classes_QtiTestService::XML_ASSESSMENT_SECTION],
        [RunnerMap::MAP_ATTRIBUTE_ITEMS, taoQtiTest_models_classes_QtiTestService::XML_ASSESSMENT_ITEM_REF],
    ];

    /** @var array */
    private $testMap;

    /** @var array */
    private $testDefinition;

    public function __construct(array $testMap, array $testDefinition)
    {
        $this->testMap = $testMap;
        $this->testDefinition = $testDefinition;
    }

    /**
     * TODO
     * @return array
     */
    public function getTestMapWithBranchRules()
    {
        return $this->addBranchRuleToTestMapRecursively($this->testMap, $this->testDefinition, self::BRANCH_RULE_MAP);
    }

    /**
     * TODO
     * @param $testMap
     * @param $testDefinition
     * @param $map
     * @return array
     */
    private function addBranchRuleToTestMapRecursively($testMap, $testDefinition, $map)
    {
        list ($testMapIdentifier, $testDefinitionIdentifier) = array_shift($map);

        foreach ($testMap[$testMapIdentifier] as $id => $testMapSubObject) {
            foreach ($testDefinition[$testDefinitionIdentifier] as $tid => $testDefinitionSubObject) {
                if ($testDefinitionSubObject[self::KEY_ATTRIBUTES][self::KEY_IDENTIFIER] === $id) {
                    if (count($map) > 0) {
                        $testMap[$testMapIdentifier][$id] = $this->addBranchRuleToTestMapRecursively(
                            $testMap[$testMapIdentifier][$id],
                            $testDefinition[$testDefinitionIdentifier][$tid],
                            $map
                        );
                    }

                    $testMap[$testMapIdentifier][$id][self::KEY_BRANCH_RULE] =
                        array_key_exists(self::KEY_BRANCH_RULE, $testDefinitionSubObject)
                            ? $testDefinitionSubObject[self::KEY_BRANCH_RULE]
                            : [];

                }
            }
        }

        return $testMap;
    }
}