<?php
/**
 * Default config header
 *
 * To replace this add a file taoQtiTest/conf/header/TestCategoryRules.conf.php
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
