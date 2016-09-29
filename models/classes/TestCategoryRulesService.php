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

class TestCategoryRulesService extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/TestCategoryRules';
    
    private $generator;
    
    public function __construct(array $options = array())
    {
        parent::__construct($options);
        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
        
        $generator = new TestCategoryRulesGenerator();
        $generator->setScoreVariableIdentifier(empty($options['score-variable-identifier']) ? 'SCORE' : (string) $options['score-variable-identifier']);
        $generator->setWeightIdentifier(array_key_exists($options['weight-identifier']) ? (string) $options['weight-identifier'] : '');
        $generator->setCategoryExclusions(empty($options['category-exclusions']) ? array() : $options['category-exclusions']);
        $this->setGenerator($generator);
    }
    
    protected function setGenerator(TestCategoryRulesGenerator $generator)
    {
        $this->generator = $generator;
    }
    
    protected function getGenerator()
    {
        return $this->generator;
    }
    
    public function apply(AssessmentTest $test)
    {
        $this->getGenerator()->apply($test, (int) $this->getOption('flags'));
    }
}
