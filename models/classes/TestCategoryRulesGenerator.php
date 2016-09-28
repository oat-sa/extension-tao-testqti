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

use qtism\data\AssessmentTest;
use oat\taoQtiTest\models\TestCategoryRulesUtils;

/**
 * The TestCategoryRulesGenerator class makes possible to automatically apply various outcome processing rules on QTI-SDK AssessmentTest objects.
 * 
 * This classes provide mechanisms enabling the client code to apply automatically some outcome processing rules on existing QTI Assessment Tests,
 * provided as QTI-SDK AssessmentTest objects. It can be configured in multiple ways, in order to apply on tests:
 * 
 * * Outcome Declarations aiming at counting the number of items related to a given category (TestCategoryRulesGenerator::COUNT flag).
 * * Outcome Declarations and their related Outcome Processing Rules to determine the number of correctly responded items that belong to a given category (TestCategoryRulesGenerator::CORRECT flag).
 * * Outcome Declarations and their related Outcome Processing Rules to determine the total score of items that belong to a given category. (TestCategoryRulesGenerator::SCORE flag).
 * 
 * The TestCategoryRulesGenerator::COUNT, TestCategoryRulesGenerator::CORRECT and TestCategoryRulesGenerator::SCORE flags
 * can be provided to the TestCategoryRulesGenerator::apply() method, in order to select which kind of rules to be applied on
 * processed AssessmentTest objects.
 * 
 */
class TestCategoryRulesGenerator
{
    const COUNT = 1;
    const CORRECT = 2;
    const SCORE = 4;
 
    private $scoreVariableIdentifier = 'SCORE';
    private $weightIdentifier = '';
    private $categoryExclusions = array();
    
    /**
     * Set the identifier of the item variables involved in total scoring.
     * 
     * This method allows you to set the $identifier of the item variables involved
     * in total scoring Outcome Processing Rules (by default "SCORE").
     * 
     * @param string $identifier A QTI identifier.
     */
    public function setScoreVariableIdentifier($identifier)
    {
        $this->scoreVariableIdentifier = $identifier;
    }
    
    /**
     * Get the identifier of the item variables involved in total scoring.
     * 
     * This method allows you to get the $identifier of the item variables involved
     * in total scoring Outcome Processing Rules (by default "SCORE").
     * 
     * @return string A QTI identifier.
     */
    public function getScoreVariableIdentifier()
    {
        return $this->scoreVariableIdentifier;
    }
    
    /**
     * Set the identifier of the item weights involved in total scoring.
     * 
     * This method allows you to set the $identifier of the item weights
     * to be involved in generated total scoring Outcome Processing Rules.
     * 
     * By default, the $identifier is an empty string, meaning that no
     * specific weights must be used when generating the Outcome Processing
     * Rules.
     * 
     * @param string $identifier (optional) A QTI identifier.
     */
    public function setWeightIdentifier($identifier = '')
    {
        $this->weightIdentifier = $identifier;
    }
    
    /**
     * Get the identifier of the item weights involved in total scoring.
     * 
     * This method allows you to get the $identifier of the item weights
     * to be involved in generated total scoring Outcome Processing Rules.
     * 
     * By default, the $identifier is an empty string, meaning that no
     * specific weights must be used when generating the Outcome Processing
     * Rules.
     * 
     * @return string (optional) A QTI identifier.
     */
    public function getWeightIdentifier()
    {
        return $this->weightIdentifier;
    }
    
    /**
     * Set the category patterns to be excluded.
     * 
     * This method provides a way to define a set of Pearl Compatible Regular Expressions
     * that will determine which categories will be excluded from processing when calling
     * the TestCategoryRulesGenerator::apply() method.
     * 
     * @param array $exclusions (optional) An array of string representing PCREs.
     */
    public function setCategoryExclusions(array $exclusions = array())
    {
        $this->categoryExclusions = $exclusions;
    }
    
    /**
     * Set the category patterns to be excluded.
     * 
     * Get the PCRE patterns defining what are the category identifiers to be excluded
     * from the process.
     * 
     * @retun array An array of string representing PCREs.
     */
    public function getCategoryExclusions()
    {
        return $this->categoryExclusions;
    }
    
    /**
     * Apply Outcome Declaraton and Outcome Processing Rules.
     * 
     * This method will trigger the process of applying Outcome Declarations and Outcome Processing Rules on a given $test,
     * dependings on the assessmentItemRef categories found into it.
     * 
     * This method can be configure with the following flags:
     * 
     * TestCategoryRulesGenerator::COUNT:
     * 
     * The COUNT flag will trigger the process of creating Outcome Declarations where default values represent the number
     * of items involved in categories found in the $test. For instance, if $test contains two assessmentItemRef elements with a 'math'
     * category are found in the $test, an Outcome Declaration 'MATH_CATEGORY_NUMBER_ITEMS' with single cardinality, integer base type, and a default 
     * value of 2 will be injected in the $test definition.
     * 
     * TestCategoryRulesGenerator::CORRECT:
     * 
     * The CORRECT flag will trigger the process of creating Outcome Declarations and their related Outcome Processing Rules that
     * will take care of counting the number of items that were correctly responded, by category. As an example, if two assessmentItemRef elements with a
     * 'math' category are found in the $test, an Outcome Declaration 'MATH_CATEGORY_NUMBER_CORRECT' with single cardinality and integer base type
     * will be injected in the $test definition, in addition with the relevant Outcome Processing Rule in charge of computing the appropriate Outcome
     * value at test runtime.
     * 
     * TestCategoryRulesGenerator::SCORE:
     * 
     * The SCORE flag will trigger the process of creating Outcome Declarations and their related Outcome Processing Rules that
     * will take care of counting the total score of items, by category. As an example, if two assessmentItemRef elements with a
     * 'math' category are found in the $test, an Outcome Declaration 'MATH_CATEGORY_TOTAL_SCORE' with single cardinality and float base type
     * will be injected in the $test definition, in addition with the relevant Outcome Processing Rule in charge of computing the appropriate Outcome
     * value at test runtime. When this flag is enabled, the generation process for the Outcome Processing Rules will take into account the values
     * provided to the TestCategoryRulesGenerator::setScoreVariableIdentifier() and TestCategoryRulesGenerator::setWeightIdentifier() setters to
     * respectively identify which item variable (by default 'SCORE'), and which item weights should be used to compute total scores.
     * 
     * If no $flags are given, it is considered that all the flags above are enabled.
     * 
     * @param qtism\data\AssessmentTest $test A QTI-SDK AssessmentTest object.
     * @param integer $flags (optional) TestCategoryRulesGenerator::COUNT | TestCategoryRulesGenerator::CORRECT | TestCategoryRulesGenerator::SCORE
     */
    public function apply(AssessmentTest $test, $flags = 0)
    {
        if ($flags == 0) {
            $flags = (self::COUNT | self::CORRECT | self::SCORE);
        }
        
        $categories = TestCategoryRulesUtils::extractCategories($test, $this->getCategoryExclusions());
        foreach ($categories as $category) {
            if ($flags & self::COUNT) {
                TestCategoryRulesUtils::appendNumberOfItemsVariable($test, $category);
            }
            
            if ($flags & self::CORRECT ) {
                $numberCorrectVarName = TestCategoryRulesUtils::appendNumberCorrectVariable($test, $category);
                TestCategoryRulesUtils::appendNumberCorrectOutcomeProcessing($test, $category, $numberCorrectVarName);
            }
            
            if ($flags & self::SCORE) {
                $totalScoreVarName = TestCategoryRulesUtils::appendTotalScoreVariable($test, $category);
                TestCategoryRulesUtils::appendTotalScoreOutcomeProcessing(
                    $test, 
                    $category, 
                    $totalScoreVarName, 
                    $this->getScoreVariableIdentifier(), 
                    $this->getWeightIdentifier()
                );
            }
        }
    }
}
