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

use oat\oatbox\service\ConfigurableService;
use qtism\data\AssessmentTest;

/**
 * The TestCategoryRulesService service implementation.
 * 
 * This service acts as a wrapper for the TestCategoryRulesGenerator class. The category
 * rules generation process is triggered using the TestCategoryRulesService::apply() method.
 * 
 * @see oat\taoQtiTest\models\TestCategoryRulesGenerator class for a in-depth documentation of the category-based rule generation process.
 */
class TestCategoryRulesService extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/TestCategoryRules';
    
    private $generator;
    
    /**
     * Create a new TestCategoryRulesService instance.
     * 
     * This constructor allows you to instantiate a new TestCategoryRulesService object with the following options available:
     * 
     * * 'score-variable-identifier' (string) : The identifier of the item session outcome variable to be used when generating <testVariables> based rules.
     * * 'weight-identifier' (string) : The identifier of the item reference weight to be used when generating <testVariables> based rules.
     * * 'category-exclusions' (array) : An array of PCREs describing what are the categories to be excluded from the rule generation process.
     * * 'flags' (integer) : A binary flags configuration of the rule generation process composed by values described by the TestCategoryRulesGenerator class constants.
     * 
     * @param array $options (optional) An optional array of options.
     */
    public function __construct(array $options = array())
    {
        parent::__construct($options);
        
        $generator = new TestCategoryRulesGenerator();
        $generator->setScoreVariableIdentifier(empty($options['score-variable-identifier']) ? 'SCORE' : (string) $options['score-variable-identifier']);
        $generator->setWeightIdentifier(array_key_exists('weight-identifier', $options) ? (string) $options['weight-identifier'] : '');
        $generator->setCategoryExclusions(empty($options['category-exclusions']) ? array() : $options['category-exclusions']);
        $this->setGenerator($generator);
    }
    
    /**
     * Set the generator.
     * 
     * Set the TestCategoryRulesGenerator object to be used by the service.
     * 
     * @param oat\taoQtiTest\models\TestCategoryRulesGenerator $generator A TestCategoryRulesGenerator object.
     */
    protected function setGenerator(TestCategoryRulesGenerator $generator)
    {
        $this->generator = $generator;
    }
    
    
    /**
     * Get the generator.
     * 
     * Get the TestCategoryRulesGenerator object to be used by the service.
     * 
     * @return oat\taoQtiTest\models\TestCategoryRulesGenerator A TestCategoryRulesGenerator object.
     */
    protected function getGenerator()
    {
        return $this->generator;
    }
    
    /**
     * Apply the category based rule generation process on a given Assessment Test.
     * 
     * Calling this method will trigger the category based rule generation process on the given
     * AssessmentTest $test object, depending on the $options parameters provided to the constructor
     * of the service.
     * 
     * @param qtism\data\AssessmentTest $test A QTI-SDK AssessmentTest object.
     */
    public function apply(AssessmentTest $test)
    {
        $this->getGenerator()->apply($test, (int) $this->getOption('flags'));
    }
}
