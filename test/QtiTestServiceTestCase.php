<?php
/*  
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
 * Copyright (c) 2013 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *               
 * 
 */

require_once dirname(__FILE__) . '/../../tao/test/TaoTestRunner.php';
include_once dirname(__FILE__) . '/../includes/raw_start.php';

/**
 * Integration test of the {@link taoQtiTest_models_classes_QtiTestService} class.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 * @package taoQtiTest
 * @subpackage test
 */
class QtiTestServiceTestCase extends UnitTestCase {
    
    /**
     * The tested service
     * @var taoQtiTest_models_classes_QtiTestService 
     */
    private $service;
    
    /**
     * A resource used to test the service
     * @var core_kernel_classes_Resource 
     */
    private $test;
    
    /**
     * Set up test cases: set up the service and create a test
     */
    public function setUp() {
        
        //initialize service
        if(is_null($this->service)){
            $this->service = taoQtiTest_models_classes_QtiTestService::singleton();
        }
        
        //initialize test
        $this->test = core_kernel_classes_ResourceFactory::create(new core_kernel_classes_Class(TAO_TEST_CLASS), 'Test test', '');
        $this->test->setPropertyValue(new core_kernel_classes_Property(PROPERTY_TEST_TESTMODEL), INSTANCE_TEST_MODEL_QTI);
        $this->test->setPropertyValue(new core_kernel_classes_Property(TEST_ACTIVE_PROP), GENERIS_TRUE);
    }
    
    /**
     * Get the path to test's content file (the file must exists prior to the call)
     * @param core_kernel_classes_Resource $test
     * @return string|false the path
     */
    private function getTestContentPath(core_kernel_classes_Resource $test){
        return realpath(dirname(__FILE__) .'/../data/testdata/' . md5($test->getUri()) . '.xml');
    }
    
    
    /**
     * Remove the created test and it's content
     */
    public function tearDown() {
        if($this->test != null && $this->service != null){
            @unlink($this->getTestContentPath($this->test));
            $this->test->delete();
        }
    }
	
    /**
     * Check the test content is set when acessing the test the 1st time
     */
    public function testCreateContent() {
        $this->assertNotNull($this->service);
        $this->assertNotNull($this->test);
        
        //the first call should create default content
        $items = $this->service->getItems($this->test);
        $this->assertTrue(count($items) == 0);
        
        $file = new core_kernel_classes_File(
                $this->test->getOnePropertyValue(new core_kernel_classes_Property(TEST_TESTCONTENT_PROP))
            );
        
        $contentPath = $this->getTestContentPath($this->test);
        
        $this->assertTrue(is_string($contentPath));
        $this->assertEqual($file->getAbsolutePath(), $contentPath, "The test content property should refer to the file.");
        $this->assertTrue(file_exists($contentPath), "The test content file should exist.");
        
        
        $this->assertEqual(file_get_contents($file->getAbsolutePath()), file_get_contents($contentPath), "The file content match the template file");
    }
}
