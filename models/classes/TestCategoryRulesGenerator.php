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

class TestCategoryRulesGenerator
{
    const COUNT = 1;
    const CORRECT = 2;
    const SCORE = 4;
    
    public function apply(AssessmentTest $test, $flags = 0)
    {
        if ($flags == 0) {
            $flags = (self::COUNT | self::CORRECT | self::SCORE);
        }
        
        $categories = TestCategoryRulesUtils::extractCategories($test);
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
                TestCategoryRulesUtils::appendTotalScoreOutcomeProcessing($test, $category, $totalScoreVarName);
            }
        }
    }
}
