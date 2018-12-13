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
use oat\taoQtiTest\models\TestCategoryRulesUtils;
use qtism\common\enums\BaseType;
use qtism\common\enums\Cardinality;
use qtism\data\expressions\NumberCorrect;
use qtism\data\processing\OutcomeProcessing;
use qtism\data\rules\SetOutcomeValue;
use qtism\data\state\DefaultValue;
use qtism\data\state\OutcomeDeclaration;
use qtism\data\storage\xml\XmlDocument;

class TestCategoryRulesUtilsTest extends TestCase
{
    
    static public function samplesDir() 
    {
        return dirname(__FILE__) . '/../samples/xml/category_rules/';
    }
    
    public function testExtractCategories()
    {
        $doc = new XmlDocument();
        $doc->load(self::samplesDir() . 'categories.xml');
        
        $this->assertEquals(
            array('math', 'english'),
            TestCategoryRulesUtils::extractCategories($doc->getDocumentComponent())
        );
    }
    
    public function testExtractCategoriesNoCategoriesFound()
    {
        $doc = new XmlDocument();
        $doc->load(self::samplesDir() . 'no-categories.xml');
        
        $this->assertEquals(
            array(),
            TestCategoryRulesUtils::extractCategories($doc->getDocumentComponent())
        );
    }
    
    public function testExtractCategoriesWithExclusionsOne()
    {
        $doc = new XmlDocument();
        $doc->load(self::samplesDir() . 'categories.xml');
        
        $this->assertEquals(
            array(),
            TestCategoryRulesUtils::extractCategories($doc->getDocumentComponent(), array('/math/', '/engl/'))
        );
    }
    
    public function testExtractCategoriesWithExclusionsTwo()
    {
        $doc = new XmlDocument();
        $doc->load(self::samplesDir() . 'categories.xml');
        
        $this->assertEquals(
            array('english'),
            TestCategoryRulesUtils::extractCategories($doc->getDocumentComponent(), array('/math/', '/math/'))
        );
    }
    
    public function testExtractCategoriesWithExclusionsThree()
    {
        $doc = new XmlDocument();
        $doc->load(self::samplesDir() . 'categories.xml');
        
        $this->assertEquals(
            array('english'),
            TestCategoryRulesUtils::extractCategories($doc->getDocumentComponent(), array('/MATH/i'))
        );
    }
    
    public function testExtractCategoriesWithExclusionsFour()
    {
        $doc = new XmlDocument();
        $doc->load(self::samplesDir() . 'categories-x-tao.xml');
        
        $this->assertEquals(
            array('math', 'english'),
            TestCategoryRulesUtils::extractCategories($doc->getDocumentComponent(), array('/^X-TAO-/i'))
        );
    }
    
    public function testCountNumberOfItemsWithCategory()
    {
        $doc = new XmlDocument();
        $doc->load(self::samplesDir() . 'categories.xml');
        
        $this->assertEquals(2, TestCategoryRulesUtils::CountNumberOfItemsWithCategory($doc->getDocumentComponent(), 'math'));
        $this->assertEquals(2, TestCategoryRulesUtils::CountNumberOfItemsWithCategory($doc->getDocumentComponent(), 'english'));
        $this->assertEquals(0, TestCategoryRulesUtils::CountNumberOfItemsWithCategory($doc->getDocumentComponent(), 'X'));
    }
    
    public function testAppendOutcomeDeclarationToTest()
    {
        $doc = new XmlDocument();
        $doc->load(self::samplesDir() . 'no-categories.xml');
        
        TestCategoryRulesUtils::appendOutcomeDeclarationToTest($doc->getDocumentComponent(), 'TEST', BaseType::FLOAT, 0.0);
        
        $outcome = $doc->getDocumentComponent()->getComponentByIdentifier('TEST');
        $this->assertInstanceOf(OutcomeDeclaration::class, $outcome);
        $this->assertCount(1, $doc->getDocumentComponent()->getComponentsByClassName('outcomeDeclaration'));
        $this->assertEquals(Cardinality::SINGLE, $outcome->getCardinality());
        $this->assertEquals(BaseType::FLOAT, $outcome->getBaseType());
        $this->assertEquals('TEST', $outcome->getIdentifier());
        
        $defaultValue = $outcome->getDefaultValue();
        $this->assertInstanceOf(DefaultValue::class, $defaultValue);
        $values = $defaultValue->getValues();
        $this->assertCount(1, $values);
        $this->assertEquals(0., $values[0]->getValue());
        
        // Check that there is no duplicate if we add the same variable twice...
        TestCategoryRulesUtils::appendOutcomeDeclarationToTest($doc->getDocumentComponent(), 'TEST', BaseType::FLOAT, 0.0);
        
        $outcome = $doc->getDocumentComponent()->getComponentByIdentifier('TEST');
        $this->assertInstanceOf(OutcomeDeclaration::class, $outcome);
        $this->assertEquals(1, count($doc->getDocumentComponent()->getComponentsByClassName('outcomeDeclaration')));
    }
    
    public function testAppendNumberOfItemsVariable()
    {
        $doc = new XmlDocument();
        $doc->load(self::samplesDir() . 'categories.xml');
        
        $this->assertEquals(
            'MATH' . TestCategoryRulesUtils::NUMBER_ITEMS_SUFFIX,
            TestCategoryRulesUtils::appendNumberOfItemsVariable($doc->getDocumentComponent(), 'math')
        );
        
        $outcome = $doc->getDocumentComponent()->getComponentByIdentifier('MATH' . TestCategoryRulesUtils::NUMBER_ITEMS_SUFFIX);
        $this->assertInstanceOf(OutcomeDeclaration::class, $outcome);
        $this->assertEquals(Cardinality::SINGLE, $outcome->getCardinality());
        $this->assertEquals(BaseType::INTEGER, $outcome->getBaseType());
        $this->assertEquals('MATH' . TestCategoryRulesUtils::NUMBER_ITEMS_SUFFIX, $outcome->getIdentifier());
        
        $defaultValue = $outcome->getDefaultValue();
        $this->assertInstanceOf(DefaultValue::class, $defaultValue);
        $values = $defaultValue->getValues();
        $this->assertCount(1, $values);
        $this->assertTrue(is_int($values[0]->getValue()));
        $this->assertEquals(2, $values[0]->getValue());
    }
    
    public function testAppendNumberCorrectVariable()
    {
        $doc = new XmlDocument();
        $doc->load(self::samplesDir() . 'categories.xml');
        
        $this->assertEquals(
            'MATH' . TestCategoryRulesUtils::NUMBER_CORRECT_SUFFIX,
            TestCategoryRulesUtils::appendNumberCorrectVariable($doc->getDocumentComponent(), 'math')
        );
        
        $outcome = $doc->getDocumentComponent()->getComponentByIdentifier('MATH' . TestCategoryRulesUtils::NUMBER_CORRECT_SUFFIX);
        $this->assertInstanceOf(OutcomeDeclaration::class, $outcome);
        $this->assertEquals(Cardinality::SINGLE, $outcome->getCardinality());
        $this->assertEquals(BaseType::INTEGER, $outcome->getBaseType());
        $this->assertEquals('MATH' . TestCategoryRulesUtils::NUMBER_CORRECT_SUFFIX, $outcome->getIdentifier());
        
        $defaultValue = $outcome->getDefaultValue();
        $this->assertNull($defaultValue);
    }
    
    public function testAppendTotalScoreVariable()
    {
        $doc = new XmlDocument();
        $doc->load(self::samplesDir() . 'categories.xml');
        
        $this->assertEquals(
            'MATH' . TestCategoryRulesUtils::TOTAL_SCORE_SUFFIX,
            TestCategoryRulesUtils::appendTotalScoreVariable($doc->getDocumentComponent(), 'math')
        );
        
        $outcome = $doc->getDocumentComponent()->getComponentByIdentifier('MATH' . TestCategoryRulesUtils::TOTAL_SCORE_SUFFIX);
        $this->assertInstanceOf(OutcomeDeclaration::class, $outcome);
        $this->assertEquals(Cardinality::SINGLE, $outcome->getCardinality());
        $this->assertEquals(BaseType::FLOAT, $outcome->getBaseType());
        $this->assertEquals('MATH' . TestCategoryRulesUtils::TOTAL_SCORE_SUFFIX, $outcome->getIdentifier());
        
        $defaultValue = $outcome->getDefaultValue();
        $this->assertNull($defaultValue);
    }
    
    public function testAppendNumberCorrectOutcomeProcessing()
    {
        $doc = new XmlDocument();
        $doc->load(self::samplesDir() . 'categories.xml');
        
        TestCategoryRulesUtils::appendNumberCorrectOutcomeProcessing($doc->getDocumentComponent(), 'math', 'MATH' . TestCategoryRulesUtils::NUMBER_CORRECT_SUFFIX);
        
        $this->assertInstanceOf(OutcomeProcessing::class, $doc->getDocumentComponent()->getOutcomeProcessing());
        $outcomeRules = $doc->getDocumentComponent()->getOutcomeProcessing()->getOutcomeRules();
        $this->assertCount(1, $outcomeRules);
        
        $this->assertInstanceOf(SetOutcomeValue::class, $outcomeRules[0]);
        $this->assertEquals('MATH' . TestCategoryRulesUtils::NUMBER_CORRECT_SUFFIX, $outcomeRules[0]->getIdentifier());
        
        $this->assertInstanceOF(NumberCorrect::class, $outcomeRules[0]->getExpression());
        $this->assertEquals(array('math'), $outcomeRules[0]->getExpression()->getIncludeCategories()->getArrayCopy());
        
        // If a second call to TestCategoryRulesUtils::appendNumberCorrectOutcomeProcessing occurs for a variable wich
        // is already targeted by a setOutcomeValue rule, no new outcome rule should appear to avoid duplicates.
        TestCategoryRulesUtils::appendNumberCorrectOutcomeProcessing($doc->getDocumentComponent(), 'math', 'MATH' . TestCategoryRulesUtils::NUMBER_CORRECT_SUFFIX);
        
        $outcomeRules = $doc->getDocumentComponent()->getOutcomeProcessing()->getOutcomeRules();
        $this->assertCount(1, $outcomeRules);
    }
}
