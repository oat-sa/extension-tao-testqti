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
namespace oat\taoQtiTest\test\unit;

use oat\generis\test\TestCase;
use oat\taoQtiTest\models\TestCategoryRulesGenerator;
use oat\taoQtiTest\models\TestCategoryRulesUtils;
use qtism\data\expressions\NumberCorrect;
use qtism\data\expressions\operators\Sum;
use qtism\data\storage\xml\XmlDocument;

class TestCategoryRulesGeneratorTest extends TestCase
{
    
    static public function samplesDir() 
    {
        return dirname(__FILE__) . '/../samples/xml/category_rules/';
    }
    
    public function testApplyAll()
    {
        $generator = new TestCategoryRulesGenerator();
        $doc = new XmlDocument();
        $doc->load(self::samplesDir() . 'categories.xml');
        
        $generator->apply($doc->getDocumentComponent());
        
        $outcomes = $doc->getDocumentComponent()->getOutcomeDeclarations();
        $this->assertCount(6, $outcomes);
        $this->assertTrue(isset($outcomes['MATH' . TestCategoryRulesUtils::NUMBER_ITEMS_SUFFIX]));
        $this->assertTrue(isset($outcomes['MATH' . TestCategoryRulesUtils::NUMBER_CORRECT_SUFFIX]));
        $this->assertTrue(isset($outcomes['MATH' . TestCategoryRulesUtils::TOTAL_SCORE_SUFFIX]));
        $this->assertTrue(isset($outcomes['ENGLISH' . TestCategoryRulesUtils::NUMBER_ITEMS_SUFFIX]));
        $this->assertTrue(isset($outcomes['ENGLISH' . TestCategoryRulesUtils::NUMBER_CORRECT_SUFFIX]));
        $this->assertTrue(isset($outcomes['ENGLISH' . TestCategoryRulesUtils::TOTAL_SCORE_SUFFIX]));
        
        $setOutcomeValues = $doc->getDocumentComponent()->getComponentsByClassName('setOutcomeValue');
        $this->assertCount(4, $setOutcomeValues);
        
        $this->assertEquals('MATH' . TestCategoryRulesUtils::NUMBER_CORRECT_SUFFIX, $setOutcomeValues[0]->getIdentifier());
        $this->assertInstanceOf(NumberCorrect::class, $setOutcomeValues[0]->getExpression());
        $this->assertEquals(array('math'), $setOutcomeValues[0]->getExpression()->getIncludeCategories()->getArrayCopy());

        $this->assertEquals('MATH' . TestCategoryRulesUtils::TOTAL_SCORE_SUFFIX, $setOutcomeValues[1]->getIdentifier());
        $this->assertInstanceOf(Sum::class, $setOutcomeValues[1]->getExpression());
        $this->assertEquals(array('math'), $setOutcomeValues[1]->getExpression()->getExpressions()[0]->getIncludeCategories()->getArrayCopy());
        $this->assertEquals('', $setOutcomeValues[1]->getExpression()->getExpressions()[0]->getWeightIdentifier());
        $this->assertEquals('SCORE', $setOutcomeValues[1]->getExpression()->getExpressions()[0]->getVariableIdentifier());
        
        $this->assertEquals('ENGLISH' . TestCategoryRulesUtils::NUMBER_CORRECT_SUFFIX, $setOutcomeValues[2]->getIdentifier());
        $this->assertInstanceOf(NumberCorrect::class, $setOutcomeValues[2]->getExpression());
        $this->assertEquals(array('english'), $setOutcomeValues[2]->getExpression()->getIncludeCategories()->getArrayCopy());
        
        $this->assertEquals('ENGLISH' . TestCategoryRulesUtils::TOTAL_SCORE_SUFFIX, $setOutcomeValues[3]->getIdentifier());
        $this->assertInstanceOf(Sum::class, $setOutcomeValues[3]->getExpression());
        $this->assertEquals(array('english'), $setOutcomeValues[3]->getExpression()->getExpressions()[0]->getIncludeCategories()->getArrayCopy());
        $this->assertEquals('', $setOutcomeValues[3]->getExpression()->getExpressions()[0]->getWeightIdentifier());
        $this->assertEquals('SCORE', $setOutcomeValues[3]->getExpression()->getExpressions()[0]->getVariableIdentifier());
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
        $this->assertInstanceOf(NumberCorrect::class, $setOutcomeValues[0]->getExpression());
        $this->assertEquals(array('math'), $setOutcomeValues[0]->getExpression()->getIncludeCategories()->getArrayCopy());
        
        $this->assertEquals('ENGLISH' . TestCategoryRulesUtils::NUMBER_CORRECT_SUFFIX, $setOutcomeValues[1]->getIdentifier());
        $this->assertInstanceOf(NumberCorrect::class, $setOutcomeValues[1]->getExpression());
        $this->assertEquals(array('english'), $setOutcomeValues[1]->getExpression()->getIncludeCategories()->getArrayCopy());
    }
    
    public function testApplyScoreOnly()
    {
        $generator = new TestCategoryRulesGenerator();
        $doc = new XmlDocument();
        $doc->load(self::samplesDir() . 'categories.xml');
        
        $generator->apply($doc->getDocumentComponent(), TestCategoryRulesGenerator::SCORE);
        
        $outcomes = $doc->getDocumentComponent()->getOutcomeDeclarations();
        $this->assertCount(2, $outcomes);
        $this->assertTrue(isset($outcomes['MATH' . TestCategoryRulesUtils::TOTAL_SCORE_SUFFIX]));
        $this->assertTrue(isset($outcomes['ENGLISH' . TestCategoryRulesUtils::TOTAL_SCORE_SUFFIX]));
        
        $setOutcomeValues = $doc->getDocumentComponent()->getComponentsByClassName('setOutcomeValue');
        $this->assertCount(2, $setOutcomeValues);
        $this->assertEquals('MATH' . TestCategoryRulesUtils::TOTAL_SCORE_SUFFIX, $setOutcomeValues[0]->getIdentifier());
        $this->assertInstanceOf(Sum::class, $setOutcomeValues[0]->getExpression());
        $this->assertEquals(array('math'), $setOutcomeValues[0]->getExpression()->getExpressions()[0]->getIncludeCategories()->getArrayCopy());
        $this->assertEquals('', $setOutcomeValues[0]->getExpression()->getExpressions()[0]->getWeightIdentifier());
        $this->assertEquals('SCORE', $setOutcomeValues[0]->getExpression()->getExpressions()[0]->getVariableIdentifier());
        
        $this->assertEquals('ENGLISH' . TestCategoryRulesUtils::TOTAL_SCORE_SUFFIX, $setOutcomeValues[1]->getIdentifier());
        $this->assertInstanceOf(Sum::class, $setOutcomeValues[1]->getExpression());
        $this->assertEquals(array('english'), $setOutcomeValues[1]->getExpression()->getExpressions()[0]->getIncludeCategories()->getArrayCopy());
        $this->assertEquals('', $setOutcomeValues[1]->getExpression()->getExpressions()[0]->getWeightIdentifier());
        $this->assertEquals('SCORE', $setOutcomeValues[1]->getExpression()->getExpressions()[0]->getVariableIdentifier());
    }
    
    /**
     * @depends testApplyScoreOnly
     */
    public function testApplyScoreOnlyWithCustomScoreVariableIdentifier()
    {
        $generator = new TestCategoryRulesGenerator();
        $generator->setScoreVariableIdentifier('MY_SCORE');
        
        $doc = new XmlDocument();
        $doc->load(self::samplesDir() . 'categories.xml');
        
        $generator->apply($doc->getDocumentComponent(), TestCategoryRulesGenerator::SCORE);
        
        $outcomes = $doc->getDocumentComponent()->getOutcomeDeclarations();
        $this->assertCount(2, $outcomes);
        $this->assertTrue(isset($outcomes['MATH' . TestCategoryRulesUtils::TOTAL_SCORE_SUFFIX]));
        $this->assertTrue(isset($outcomes['ENGLISH' . TestCategoryRulesUtils::TOTAL_SCORE_SUFFIX]));
        
        $setOutcomeValues = $doc->getDocumentComponent()->getComponentsByClassName('setOutcomeValue');
        $this->assertCount(2, $setOutcomeValues);
        $this->assertEquals('MY_SCORE', $setOutcomeValues[0]->getExpression()->getExpressions()[0]->getVariableIdentifier());
        $this->assertEquals('MY_SCORE', $setOutcomeValues[1]->getExpression()->getExpressions()[0]->getVariableIdentifier());
    }
    
    /**
     * @depends testApplyScoreOnlyWithCustomScoreVariableIdentifier
     */
    public function testApplyScoreOnlyWithCustomScoreVariableIdentifierAndCustomWeightIdentifier()
    {
        $generator = new TestCategoryRulesGenerator();
        $generator->setScoreVariableIdentifier('MY_SCORE');
        $generator->setWeightIdentifier('MY_WEIGHT');
        
        $doc = new XmlDocument();
        $doc->load(self::samplesDir() . 'categories.xml');
        
        $generator->apply($doc->getDocumentComponent(), TestCategoryRulesGenerator::SCORE);
        
        $outcomes = $doc->getDocumentComponent()->getOutcomeDeclarations();
        $this->assertCount(2, $outcomes);
        $this->assertTrue(isset($outcomes['MATH' . TestCategoryRulesUtils::TOTAL_SCORE_SUFFIX]));
        $this->assertTrue(isset($outcomes['ENGLISH' . TestCategoryRulesUtils::TOTAL_SCORE_SUFFIX]));
        
        $setOutcomeValues = $doc->getDocumentComponent()->getComponentsByClassName('setOutcomeValue');
        $this->assertCount(2, $setOutcomeValues);
        $this->assertEquals('MY_SCORE', $setOutcomeValues[0]->getExpression()->getExpressions()[0]->getVariableIdentifier());
        $this->assertEquals('MY_WEIGHT', $setOutcomeValues[0]->getExpression()->getExpressions()[0]->getWeightIdentifier());
        $this->assertEquals('MY_SCORE', $setOutcomeValues[1]->getExpression()->getExpressions()[0]->getVariableIdentifier());
        $this->assertEquals('MY_WEIGHT', $setOutcomeValues[1]->getExpression()->getExpressions()[0]->getWeightIdentifier());
    }
}

