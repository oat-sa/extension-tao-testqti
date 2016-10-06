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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */
namespace oat\taoQtiTest\models;

use qtism\common\enums\BaseType;
use qtism\common\enums\Cardinality;
use qtism\common\collections\IdentifierCollection;
use qtism\data\AssessmentTest;
use qtism\data\state\OutcomeDeclaration;
use qtism\data\state\DefaultValue;
use qtism\data\state\ValueCollection;
use qtism\data\state\Value;
use qtism\data\rules\SetOutcomeValue;
use qtism\data\rules\OutcomeRuleCollection;
use qtism\data\rules\OutcomeRule;
use qtism\data\processing\OutcomeProcessing;
use qtism\data\expressions\ExpressionCollection;
use qtism\data\expressions\NumberCorrect;
use qtism\data\expressions\TestVariables;
use qtism\data\expressions\operators\Sum;

/**
 * Utility class for Test Category Rules Generation.
 * 
 * Provides utility methods supporting Test Category Rules Generation process.
 */
class TestCategoryRulesUtils
{
    const NUMBER_ITEMS_SUFFIX = '_CATEGORY_NUMBER_ITEMS';
    const NUMBER_CORRECT_SUFFIX = '_CATEGORY_NUMBER_CORRECT';
    const TOTAL_SCORE_SUFFIX = '_CATEGORY_TOTAL_SCORE';
    
    /**
     * Extract all categories from a given QTI-SDK AssessmentTest object.
     * 
     * This method will extract all category identifiers found as assessmentItemRef
     * category identifiers from a given $test object.
     * 
     * An optional $exclusion array can be given as a second parameter. Each of the Pearl
     * Compatible Regular Expression will be applied on the categories to be extracted. If 
     * one of them matches a category, it will be excluded from the extraction process.
     * 
     * Identifiers returned will be unique.
     * 
     * @param qtism\data\AssessmentTest $test A QTI-SDK AssessmentTest object.
     * @param array $exclusion (optional) An optional array of Pearl Compatible Regular Expressions.
     * @return array An array of QTI category identifiers.
     */
    static public function extractCategories(AssessmentTest $test, array $exclusion = array())
    {
        $categories = array();
        
        $assessmentItemRefs = $test->getComponentsByClassName('assessmentItemRef');
        foreach ($assessmentItemRefs as $assessmentItemRef) {
            $assessmentItemRefCategories = $assessmentItemRef->getCategories()->getArrayCopy();
            
            $count = count($assessmentItemRefCategories);
            for ($i = 0; $i < $count; $i++) {
                foreach ($exclusion as $excl) {
                    if (@preg_match($excl, $assessmentItemRefCategories[$i]) === 1) {
                        unset($assessmentItemRefCategories[$i]);
                        break;
                    }
                }
            }
            
            $categories = array_merge($categories, $assessmentItemRefCategories);
        }
        
        return array_unique($categories);
    }
    
    /**
     * Append a variable dedicated to counting number of items related to a given category.
     * 
     * This method will append a QTI outcome variable dedicated to count the number of items
     * related to a given QTI $category, to a given QTI $test.
     * 
     * @param qtism\data\AssessmentTest $test A QTI-SDK AssessmentTest object.
     * @param string $category A QTI category identifier.
     * @return string the identifier of the created QTI outcome variable.
     */
    static public function appendNumberOfItemsVariable(AssessmentTest $test, $category)
    {
        $varName = strtoupper($category) . self::NUMBER_ITEMS_SUFFIX;
        self::appendOutcomeDeclarationToTest($test, $varName, BaseType::INTEGER, self::countNumberOfItemsWithCategory($test, $category));
        
        return $varName;
    }
    
    /**
     * Append a variable dedicated to counting number of correctly responded items related to a given category.
     * 
     * This method will append a QTI outcome variable dedicated to count the number of items that are correctly responded
     * related to a given QTI $category, to a given QTI $test.
     * 
     * @param qtism\data\AssessmentTest $test A QTI-SDK AssessmentTest object.
     * @param string $category A QTI category identifier.
     * @return string the identifier of the created QTI outcome variable.
     */
    static public function appendNumberCorrectVariable(AssessmentTest $test, $category)
    {
        $varName = strtoupper($category) . self::NUMBER_CORRECT_SUFFIX;
        self::appendOutcomeDeclarationToTest($test, $varName, BaseType::INTEGER);
        
        return $varName;
    }
    
    /**
     * Append a variable dedicated to store the total score items related to a given category.
     * 
     * This method will append a QTI outcome variable dedicated to store the total score of items
     * related to a given QTI $category, to a given QTI $test.
     * 
     * @param qtism\data\AssessmentTest $test A QTI-SDK AssessmentTest object.
     * @param string $category A QTI category identifier.
     * @return string the identifier of the created QTI outcome variable.
     */
     static public function appendTotalScoreVariable(AssessmentTest $test, $category)
     {
        $varName = strtoupper($category) . self::TOTAL_SCORE_SUFFIX;
        self::appendOutcomeDeclarationToTest($test, $varName, BaseType::FLOAT);

        return $varName;
     }
    
    /**
     * Append the outcome processing rules to populate an outcome variable with the number of items correctly responded related to a given category.
     * 
     * This method will append a QTI outcome processing to a given QTI-SDK AssessmentTest $test, dedicated to count the number
     * of correctly responded items related to a given QTI $category.
     * 
     * In case of an outcome processing rule targetting a variable name $varName already exists in the test, the outcome
     * processing rule is not appended to the test.
     * 
     * @param qtism\data\AssessmentTest $test A QTI-SDK AssessmentTest object.
     * @param string $category A QTI category identifier.
     * @param string $varName The QTI identifier of the variable to be populated by the outcome processing rule.
     */
    static public function appendNumberCorrectOutcomeProcessing(AssessmentTest $test, $category, $varName)
    {
        if (self::isVariableSetOutcomeValueTarget($test, $varName) === false) {
            $numberCorrectExpression = new NumberCorrect();
            $numberCorrectExpression->setIncludeCategories(
                new IdentifierCollection(
                    array($category)
                )
            );
            
            $setOutcomeValue = new SetOutcomeValue(
                $varName,
                $numberCorrectExpression
            );
            
            self::appendOutcomeRule($test, $setOutcomeValue);
        }
    }
    
    /**
     * Append the outcome processing rules to populate an outcome variable with total score of items related to a given category.
     * 
     * This method will append a QTI outcome processing to a given QTI-SDK AssessmentTest $test, dedicated to store 
     * the total score of items related to a given QTI $category.
     * 
     * In case of the $weightIdentifier argument is given, the score will consider weights defined at the assessmentItemRef
     * level identified by $weightIdentifier. Otherwise, no weights are taken into account while computing total scores.
     * 
     * In case of an outcome processing rule targetting a variable name $varName already exists in the test, the outcome
     * processing rule is not appended to the test.
     * 
     * @param qtism\data\AssessmentTest $test A QTI-SDK AssessmentTest object.
     * @param string $category A QTI category identifier.
     * @param string $varName The QTI identifier of the variable to be populated by the outcome processing rule.
     * @param string $scoreIdentifier (optional) An optional QTI identifier to be used as items' score variable (defaults to "SCORE").
     * @param string $weightIdentifier (optional) An optional QTI identifier to be used as items' weight to be considered for total score. (defaults to empty string).
     */
    static public function appendTotalScoreOutcomeProcessing(AssessmentTest $test, $category, $varName, $scoreVariableIdentifier = 'SCORE', $weightIdentifier = '')
    {
        if (self::isVariableSetOutcomeValueTarget($test, $varName) === false) {
            $testVariablesExpression = new TestVariables($scoreVariableIdentifier, BaseType::FLOAT);
            $testVariablesExpression->setWeightIdentifier($weightIdentifier);
            $testVariablesExpression->setIncludeCategories(
                new IdentifierCollection(
                    array($category)
                )
            );    
            
            $setOutcomeValue = new SetOutcomeValue(
                $varName,
                new Sum(
                    new ExpressionCollection(
                        array(
                            $testVariablesExpression
                        )
                    )
                )
            );
            
            self::appendOutcomeRule($test, $setOutcomeValue);
        }
    }
    
    /**
     * Append an outcome declaration to a test.
     * 
     * This method will append an outcome declaration with identifier $varName, single cardinality 
     * to a given QTI-SDK AssessmentTest $test object.
     * 
     * @param qtism\data\AssessmentTest $test A QTI-SDK AssessmentTest object.
     * @param string $varName The variable name to be used for the outcome declaration.
     * @param integer $baseType A QTI-SDK Base Type.
     * @param mixed (optional) A default value for the variable.
     */
    static public function appendOutcomeDeclarationToTest(AssessmentTest $test, $varName, $baseType, $defaultValue = null)
    {
        $outcomeDeclarations = $test->getOutcomeDeclarations();
        $outcome = new OutcomeDeclaration($varName, $baseType, Cardinality::SINGLE);
        
        if ($defaultValue !== null) {
            $outcome->setDefaultValue(
                new DefaultValue(
                    new ValueCollection(
                        array(
                            new Value(
                                $defaultValue, 
                                $baseType
                            )
                        )
                    )
                )
            );
        }
        
        $outcomeDeclarations->attach($outcome);
    }
    
    /**
     * Count the number of items in a test that belong to a given category.
     * 
     * This method will count the number of items in a test that belong to a given category.
     * 
     * @param qtism\data\AssessmentTest $test A QTI-SDK AssessmentTest object.
     * @param string $category a QTI category identifier.
     * @return integer The number of items that belong to $category.
     */
    static public function countNumberOfItemsWithCategory(AssessmentTest $test, $category)
    {
        $count = 0;
        
        $assessmentItemRefs = $test->getComponentsByClassName('assessmentItemRef');
        foreach ($assessmentItemRefs as $assessmentItemRef) {
            if (in_array($category, $assessmentItemRef->getCategories()->getArrayCopy()) === true) {
                $count++;
            }
        }
        
        return $count;
    }
    
    /**
     * Know whether or not a variable is the target of an existing setOutcomeValue QTI rule.
     * 
     * This method enables the client code to know whether or not a variable with identifier
     * $varName is the target of an existing setOutcomeValue QTI rule with a given
     * AssessmentTest $test object.
     * 
     * @param qtism\data\AssessmentTest $test A QTI-SDK AssessmentTest object.
     * @param string $varName A QTI variable identifier.
     * @return boolean
     */
    static public function isVariableSetOutcomeValueTarget(AssessmentTest $test, $varName)
    {
        $setOutcomeValues = $test->getComponentsByClassName('setOutcomeValue');
        foreach ($setOutcomeValues as $setOutcomeValue) {
            if ($setOutcomeValue->getIdentifier() === $varName) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Append a QTI-SDK OutcomeRule object in an AssessmentTest's OutcomeProcessing.
     * 
     * In case of no OutcomeProcessing is set yet for the AssessmentTest $test object,
     * it will be automatically created, with the OutcomeRule $rule as its first
     * rule. Otherwise, the OutcomeRule $rule is simply appended to the existing
     * OutcomeProcessing object.
     * 
     * @param qtism\data\AssessmentTest $test A QTI-SDK AssessmentTest object.
     * @param qtism\data\rules\OutcomeRule A QTI-SDK OutcomeRule object.
     */
    static private function appendOutcomeRule(AssessmentTest $test, OutcomeRule $rule)
    {
        $outcomeProcessing = $test->getOutcomeProcessing();
        if ($outcomeProcessing === null) {
            $test->setOutcomeProcessing(
                new OutcomeProcessing(
                    new OutcomeRuleCollection(
                        array(
                            $rule
                        )
                    )
                )
            );
        } else {
            $outcomeProcessing->getOutcomeRules()[] = $rule;
        }
    }
}
