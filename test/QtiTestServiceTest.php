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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */
namespace oat\taoQtiTest\test;

use oat\tao\test\TaoPhpUnitTestRunner;
use \taoQtiTest_models_classes_QtiTestService;
use \core_kernel_classes_Property;
use \taoQtiTest_models_classes_TestModel;
use \common_report_Report;


/**
 * This test case focuses on testing the ManifestParser model.
 *
 * @author Aamir
 * @package taoQtiTest
 */
class QtiTestServiceTest extends TaoPhpUnitTestRunner
{

    /**
     *
     * @var taoQtiTest_models_classes_QtiTestService
     */
    protected $testService = null;

    public function setUp()
    {
        TaoPhpUnitTestRunner::initTest();
        $this->testService = taoQtiTest_models_classes_QtiTestService::singleton();
    }

    /**
     * verify main class
     * 
     * @return void
     */
    public function testService()
    {
        $this->assertIsA($this->testService, 'taoQtiTest_models_classes_QtiTestService');
    }

    /**
     * create qtitest instance
     * 
     * @return \core_kernel_classes_Resource
     */
    public function testCreateInstance()
    {
        $qtiTest = $this->testService->createInstance($this->testService->getRootclass(), 'UnitTestQtiItem');
        $this->assertInstanceOf('core_kernel_classes_Resource', $qtiTest);
        
        $type = current($qtiTest->getTypes());
        $this->assertEquals(TAO_TEST_CLASS, $type->getUri());
        return $qtiTest;
    }

    /**
     * verify that the test exists
     * @depends testCreateInstance
     * 
     * @param $qtiTest
     * @return void
     */
    public function testQtiTestExists($qtiTest)
    {
        $this->assertTrue($qtiTest->exists());
    }

    /**
     * Delete test
     * @depends testCreateInstance
     * 
     * @param  $qtiTest
     */
    public function testDeleteInstance($qtiTest)
    {
        $this->testService->deleteTest($qtiTest);
        $this->assertFalse($qtiTest->exists());
    }

    /**
     * Create SubClass
     * 
     * @return \core_kernel_classes_Class
     */
    public function testSubClassCreate()
    {
        $subClass = $this->testService->createSubClass($this->testService->getRootClass(), 'UnitTestQtiItemClass');
        $this->assertInstanceOf('core_kernel_classes_Class', $subClass);
        
        return $subClass;
    }

    /**
     * Verify that just created subclass class exists
     * @depends testSubClassCreate
     * 
     * @param $subClass
     * @return void
     */
    public function testSubClassExists($subClass)
    {
        $this->assertTrue($subClass->exists());
    }

    /**
     * Verify parent of just created subclass
     * @depends testSubClassCreate
     * 
     * @param $subClass
     * @return void
     */
    public function testSubClassParent($subClass)
    {
        $subclass = $subClass->getOnePropertyValue(new core_kernel_classes_Property(RDFS_SUBCLASSOF));
        $this->assertEquals(TAO_TEST_CLASS, $subclass->getUri());
    }

    /**
     * Create a qtiTest instance of the created subclass
     * @depends testSubClassCreate
     * 
     * @param $subClass
     * @return \core_kernel_classes_Resource
     */
    public function testSubClassInstanceCreate($subClass)
    {
        $qtiTest = $this->testService->createInstance($subClass, 'UnitTestQtiItem2');
        $this->assertInstanceOf('core_kernel_classes_Resource', $qtiTest);
        
        return $qtiTest;
    }

    /**
     * Verify that just created qtiTest instance exists
     * @depends testSubClassInstanceCreate
     * 
     * @param $qtiTest
     * @return void
     */
    public function testSubClassInstanceExists($qtiTest)
    {
        $this->assertTrue($qtiTest->exists());
    }

    /**
     * Verify tye number of types of the test
     * @depends testSubClassInstanceCreate
     * 
     * @param $qtiTest
     * @return void
     */
    public function testSubClassInstanceTypes($qtiTest)
    {
        $types = $qtiTest->getTypes();
        $this->assertEquals(1, count($types));
        $this->assertInstanceOf('core_kernel_classes_Class', current($types));
    }

    /**
     * Verify that qtiTest is an instance of the created subclass
     * @depends testSubClassInstanceCreate
     * @depends testSubClassCreate
     * 
     * @param $qtiTest
     * @param $subClass
     * @return void
     */
    public function testVerifyInstanceClass($qtiTest, $subClass)
    {
        $this->assertTrue($qtiTest->isInstanceOf($subClass));
    }

    /**
     * Clone test
     * @depends testSubClassInstanceCreate
     * 
     * @param $qtiTest
     * @return \core_kernel_classes_Resource
     */
    public function testSubClassInstanceClone($qtiTest)
    {
        $clone = $this->testService->cloneInstance($qtiTest, $this->testService->getRootclass());
        $this->assertInstanceOf('\core_kernel_classes_Resource', $clone);
        $this->assertTrue($clone->exists());
        
        return $clone;
    }

    /**
     * test Cloning of a QTI Test Resource
     * 
     * @return \taoQtiTest_models_classes_TestModel
     */
    public function testTestModelInit()
    {
        $model = new taoQtiTest_models_classes_TestModel();
        $this->assertInstanceOf('taoQtiTest_models_classes_TestModel', $model);
        
        return $model;
    }

    /**
     * test Cloning of a QTI Test Resource
     * @depends testTestModelInit
     * @depends testSubClassInstanceCreate
     * @depends testSubClassInstanceClone
     * 
     * @param $model
     * @param $qtiTest
     * @param $clone
     */
    public function testSubClassInstanceCloneContent($model, $qtiTest, $clone)
    {
        $model->cloneContent($qtiTest, $clone);
        $model->onChangeTestLabel($clone);
        
        $destinationPath = $this->testService->createContent($clone, false)->getAbsolutePath();
        $this->assertTrue(file_exists($destinationPath));
        $this->assertTrue(strpos($clone->getLabel(), $qtiTest->getLabel()) === 0);
    }

    /**
     * Verify that TestModel import handlers are known and tested
     * @depends testTestModelInit
     * 
     * @param \taoQtiTest_models_classes_TestModel $model            
     */
    public function testTestModelImportHandlers($model)
    {
        $knownHandlers = [
            'taoQtiTest_models_classes_import_TestImport' => 1
        ];
        $unknownHandlers = [];
        foreach ($model->getImportHandlers() as $handler) {
            $handlerClass = get_class($handler);
            if (isset($knownHandlers[$handlerClass])) {
                unset($knownHandlers[$handlerClass]);
            } else {
                $unknownHandlers[] = $handlerClass;
            }
        }
        
        $this->assertTrue(count($knownHandlers) == 0);
        $this->assertTrue(count($unknownHandlers) == 0);
    }

    /**
     * Verify that TestModel export handlers are known and tested
     * @depends testTestModelInit
     * 
     * @param \taoQtiTest_models_classes_TestModel $model            
     */
    public function testTestModelExportHandlers($model)
    {
        $knownHandlers = [
            'taoQtiTest_models_classes_export_TestExport' => 1
        ];
        $unknownHandlers = [];
        foreach ($model->getExportHandlers() as $handler) {
            $handlerClass = get_class($handler);
            if (isset($knownHandlers[$handlerClass])) {
                unset($knownHandlers[$handlerClass]);
            } else {
                $unknownHandlers[] = $handlerClass;
            }
        }
        
        $this->assertTrue(count($knownHandlers) == 0);
        $this->assertTrue(count($unknownHandlers) == 0);
    }

    
    public function testImportMultipleTests()
    {
        $datadir = dirname(__FILE__) . '/data/';
        $report = $this->testService->importMultipleTests($datadir.'unitqtitest.zip');
        $this->assertInstanceOf('common_report_Report', $report);      
        $this->assertEquals($report->getType(), common_report_Report::TYPE_SUCCESS);
        
        //$this->assertInstanceOf('core_kernel_classes_Resource', current($report->getData()));
        foreach ($report as $rep){
            $result = ($rep->getData());
        }
        //taoTests_models_classes_TestsService::singleton()->deleteTest(current($report->getData());
    }
    
    
    /**
     * Verify TestModel compiler class
     * @depends testTestModelInit
     * 
     * @param \taoQtiTest_models_classes_TestModel $model            
     */
    public function testTestModelCompilerClass($model)
    {
        $this->assertTrue($model->getCompilerClass() == 'taoQtiTest_models_classes_QtiTestCompiler');
    }

    /**
     * Delete the qtiTest
     * @depends testSubClassInstanceCreate
     * 
     * @param $qtiTest
     */
    public function testSubClassInstanceDelete($qtiTest)
    {
        $this->testService->deleteTest($qtiTest);
        $this->assertFalse($qtiTest->exists());
    }

    /**
     * Delete the qtiTest clone
     * @depends testSubClassInstanceClone
     * 
     * @param $clone
     */
    public function testSubClassInstanceCloneDelete($clone)
    {
        $this->testService->deleteTest($clone);
        $this->assertFalse($clone->exists());
    }

    /**
     * Delete subclass
     * @depends testSubClassCreate
     * 
     * @param $subClass
     */
    public function testSubClassDelete($subClass)
    {
        $this->testService->deleteTestClass($subClass);
        $this->assertFalse($subClass->exists());
    }
}