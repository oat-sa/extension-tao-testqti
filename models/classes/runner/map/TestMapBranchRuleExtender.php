<?php

namespace oat\taoQtiTest\models\runner\map;

use taoQtiTest_models_classes_QtiTestService;

class TestMapBranchRuleExtender
{
    const KEY_ATTRIBUTES = '@attributes';
    const KEY_BRANCH_RULE = 'branchRule';
    const KEY_IDENTIFIER = 'identifier';
    const BRANCH_RULE_MAP_PAIRS = [
        [RunnerMap::MAP_ATTRIBUTE_PARTS, taoQtiTest_models_classes_QtiTestService::XML_TEST_PART],
        [RunnerMap::MAP_ATTRIBUTE_SECTIONS, taoQtiTest_models_classes_QtiTestService::XML_ASSESSMENT_SECTION],
        [RunnerMap::MAP_ATTRIBUTE_ITEMS, taoQtiTest_models_classes_QtiTestService::XML_ASSESSMENT_ITEM_REF],
    ];

    /**
     * Returns the testMap, extended with the branch rules from the testDefinition
     *
     * @param array $testMap
     * @param array $testDefinition
     * @return array
     */
    public function getTestMapWithBranchRules(array $testMap, array $testDefinition)
    {
        return $this->addBranchRuleToTestMapRecursively($testMap, $testDefinition, self::BRANCH_RULE_MAP_PAIRS);
    }

    /**
     * Adds the branching rules from the given testDefinition into the testMap, going through recursively on the given mapping pairs.
     *
     * @param array $testMap
     * @param array $testDefinition
     * @param array $map
     * @return array
     */
    private function addBranchRuleToTestMapRecursively($testMap, $testDefinition, $map)
    {
        list ($testMapIdentifier, $testDefinitionIdentifier) = array_shift($map);

        foreach ($testMap[$testMapIdentifier] as $id => $testMapSubObject) {
            foreach ($testDefinition[$testDefinitionIdentifier] as $testDefinitionSubObject) {
                if ($testDefinitionSubObject[self::KEY_ATTRIBUTES][self::KEY_IDENTIFIER] === $id) {
                    if (count($map) > 0) {
                        $testMap[$testMapIdentifier][$id] = $this->addBranchRuleToTestMapRecursively(
                            $testMapSubObject,
                            $testDefinitionSubObject,
                            $map
                        );
                    }

                    $testMap = $this->addBranchRuleToTestMap($testMap, $testDefinitionSubObject, $testMapIdentifier, $id);
                }
            }
        }

        return $testMap;
    }

    /**
     * Adds the branch rule to the testMap if there is branching rule for the given testDefinitionSubObject.
     * If there is no branch rule, it adds an empty object instead.
     *
     * @param array $testMap
     * @param array $testDefinitionSubObject
     * @param string $testMapIdentifier
     * @param string $id
     * @return array
     */
    private function addBranchRuleToTestMap($testMap, $testDefinitionSubObject, $testMapIdentifier, $id)
    {
        $testMap[$testMapIdentifier][$id][self::KEY_BRANCH_RULE] =
            array_key_exists(self::KEY_BRANCH_RULE, $testDefinitionSubObject)
                ? $testDefinitionSubObject[self::KEY_BRANCH_RULE]
                : new \stdClass();

        return $testMap;
    }
}