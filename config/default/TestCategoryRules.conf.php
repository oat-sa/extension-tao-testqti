<?php
/**
 * Default config header
 *
 * To replace this add a file taoQtiTest/conf/header/TestCategoryRules.conf.php
 */

return new \oat\taoQtiTest\models\TestCategoryRulesService(
    array(
        'score-variable-identifier' => 'SCORE',
        'weight-identifier' => 'WEIGHT',
        'category-exclusions' => array(
            '/x-tao-/'
        ),
        'flags' => \oat\taoQtiTest\models\TestCategoryRulesGenerator::COUNT | \oat\taoQtiTest\models\TestCategoryRulesGenerator::CORRECT | \oat\taoQtiTest\models\TestCategoryRulesGenerator::SCORE
    )
);
