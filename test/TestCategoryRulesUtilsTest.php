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
use oat\taoQtiTest\models\TestCategoryRulesUtils;
use qtism\data\storage\xml\XmlDocument;

/**
 * This test case focuses on testing the TestCompilerUtils helper.
 *
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 * @package taoQtiTest
 * 
 */
class TestCategoryRulesUtilsTest extends TaoPhpUnitTestRunner 
{
    
    static public function samplesDir() 
    {
        return dirname(__FILE__) . '/samples/xml/category_rules/';
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
    
    public function testCountNumberOfItemsWithCategory()
    {
        $doc = new XmlDocument();
        $doc->load(self::samplesDir() . 'categories.xml');
        
        $this->assertEquals(2, TestCategoryRulesUtils::CountNumberOfItemsWithCategory($doc->getDocumentComponent(), 'math'));
        $this->assertEquals(2, TestCategoryRulesUtils::CountNumberOfItemsWithCategory($doc->getDocumentComponent(), 'english'));
    }
}
