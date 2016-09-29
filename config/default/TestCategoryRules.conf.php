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
        )
    )
);
