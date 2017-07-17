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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 */
return new \oat\taoQtiTest\models\TestCategoryRulesService(
    array(
        // Variable identifier to be used for generated <testVariables> based rules.
        'score-variable-identifier' => 'SCORE',
        
        // Weight identifier to be used for generated <testVariables> based rules.
        'weight-identifier' => 'WEIGHT',
        
        // Categories (expressed as PCREs) to be excluded from the rule generation process.
        'category-exclusions' => array(
            '/x-tao-/'
        ),
        // Configuration flags in use when applying the rule generation process (see TestCategoryRulesGenerator class constants).
        'flags' => \oat\taoQtiTest\models\TestCategoryRulesGenerator::COUNT | \oat\taoQtiTest\models\TestCategoryRulesGenerator::CORRECT | \oat\taoQtiTest\models\TestCategoryRulesGenerator::SCORE
    )
);
