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
namespace oat\taoQtiTest\test;

use oat\tao\test\TaoPhpUnitTestRunner;
use oat\taoQtiTest\models\TestCategoryRulesGenerator;
use oat\taoQtiTest\models\TestCategoryRulesUtils;
use qtism\data\storage\xml\XmlDocument;

class TestCategoryRulesUtilsTest extends TaoPhpUnitTestRunner 
{
    
    static public function samplesDir() 
    {
        return dirname(__FILE__) . '/samples/xml/category_rules/';
    }
    
    public function testApplyAll()
    {
        $generator = new TestCategoryRulesGenerator();
        $doc = new XmlDocument();
        $doc->load(self::samplesDir() . 'categories.xml');
        
        $generator->apply($doc->getDocumentComponent());
        
        $outcomes = $doc->getDocumentComponent()->getOutcomeDeclarations();
        $this->assertCount(4, $outcomes);
        $this->assertTrue(isset($outcomes['MATH' . TestCategoryRulesUtils::NUMBER_ITEMS_SUFFIX]));
        $this->assertTrue(isset($outcomes['MATH' . TestCategoryRulesUtils::NUMBER_CORRECT_SUFFIX]));
        $this->assertTrue(isset($outcomes['ENGLISH' . TestCategoryRulesUtils::NUMBER_ITEMS_SUFFIX]));
        $this->assertTrue(isset($outcomes['ENGLISH' . TestCategoryRulesUtils::NUMBER_CORRECT_SUFFIX]));
        
        $setOutcomeValues = $doc->getDocumentComponent()->getComponentsByClassName('setOutcomeValue');
        $this->assertCount(2, $setOutcomeValues);
        $this->assertEquals('MATH' . TestCategoryRulesUtils::NUMBER_CORRECT_SUFFIX, $setOutcomeValues[0]->getIdentifier());
        $this->assertInstanceOf('qtism\\data\\expressions\\NumberCorrect', $setOutcomeValues[0]->getExpression());
        $this->assertEquals(array('math'), $setOutcomeValues[0]->getExpression()->getIncludeCategories()->getArrayCopy());
        
        $this->assertEquals('ENGLISH' . TestCategoryRulesUtils::NUMBER_CORRECT_SUFFIX, $setOutcomeValues[1]->getIdentifier());
        $this->assertInstanceOf('qtism\\data\\expressions\\NumberCorrect', $setOutcomeValues[1]->getExpression());
        $this->assertEquals(array('english'), $setOutcomeValues[1]->getExpression()->getIncludeCategories()->getArrayCopy());
    }
    
    public function testApplyCountOnly()
    {
        $generator = new TestCategoryRulesGenerator();
        $doc = new XmlDocument();
        $doc->load(self::samplesDir() . 'categories.xml');
        
        $generator->apply($doc->getDocumentComponent(), TestCategoryRulesGenerator::COUNT);
        
        $this->assertNull($doc->getDocumentComponent()->getOutcomeProcessing());
        
        $outcomes = $doc->getDocumentComponent()->getOutcomeDeclarations();
        $this->assertCount(2, $outcomes);
        $this->assertTrue(isset($outcomes['MATH' . TestCategoryRulesUtils::NUMBER_ITEMS_SUFFIX]));
        $this->assertTrue(isset($outcomes['ENGLISH' . TestCategoryRulesUtils::NUMBER_ITEMS_SUFFIX]));
    }
    
    public function testApplyCorrectOnly()
    {
        $generator = new TestCategoryRulesGenerator();
        $doc = new XmlDocument();
        $doc->load(self::samplesDir() . 'categories.xml');
        
        $generator->apply($doc->getDocumentComponent(), TestCategoryRulesGenerator::CORRECT);
        
        $outcomes = $doc->getDocumentComponent()->getOutcomeDeclarations();
        $this->assertCount(2, $outcomes);
        $this->assertTrue(isset($outcomes['MATH' . TestCategoryRulesUtils::NUMBER_CORRECT_SUFFIX]));
        $this->assertTrue(isset($outcomes['ENGLISH' . TestCategoryRulesUtils::NUMBER_CORRECT_SUFFIX]));
        
        $setOutcomeValues = $doc->getDocumentComponent()->getComponentsByClassName('setOutcomeValue');
        $this->assertCount(2, $setOutcomeValues);
        $this->assertEquals('MATH' . TestCategoryRulesUtils::NUMBER_CORRECT_SUFFIX, $setOutcomeValues[0]->getIdentifier());
        $this->assertInstanceOf('qtism\\data\\expressions\\NumberCorrect', $setOutcomeValues[0]->getExpression());
        $this->assertEquals(array('math'), $setOutcomeValues[0]->getExpression()->getIncludeCategories()->getArrayCopy());
        
        $this->assertEquals('ENGLISH' . TestCategoryRulesUtils::NUMBER_CORRECT_SUFFIX, $setOutcomeValues[1]->getIdentifier());
        $this->assertInstanceOf('qtism\\data\\expressions\\NumberCorrect', $setOutcomeValues[1]->getExpression());
        $this->assertEquals(array('english'), $setOutcomeValues[1]->getExpression()->getIncludeCategories()->getArrayCopy());
    }
}

