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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA
 *
 */

namespace oat\taoQtiTest\test\integration;
use oat\tao\test\integration\RestTestRunner;

/**
 * connects as a client agent on the rest controller
 * @author patrick
 * @package taoTestTaker
 */
class RestTestImportTest extends RestTestRunner
{
    public function testImport()
    {
        $endpoint = ROOT_URL.'taoQtiTest/RestQtiTests/import';
        $file = __DIR__.'/../samples/archives/QTI 2.1/basic/Basic.zip';
        $this->assertFileExists($file);
        
        $post_data = array('qtiPackage' => new \CURLFile($file));
        
        $options = array(
            CURLOPT_POSTFIELDS => $post_data 
        );
        $content = $this->curl($endpoint, CURLOPT_POST, "data", $options);
        $data = json_decode($content, true);
        
        $this->assertTrue(is_array($data), 'Should return json encoded array');
        $this->assertTrue($data['success']);
        $this->assertTrue(isset($data['data']));
        $this->assertTrue(is_array($data['data']));
        $this->assertCount(1, $data['data']);
        $testData = reset($data['data']);
        $this->assertTrue(isset($testData['testId']));
        
        $uri = $testData['testId'];
        $test = new \core_kernel_classes_Resource($uri);
        
        $this->assertTrue($test->exists());
        
        $deletionCall = ROOT_URL.'taoTests/RestTests?uri='.urlencode($uri);
        $content = $this->curl($deletionCall, 'DELETE', "data");
        $data = json_decode($content, true);
        
        $this->assertTrue(is_array($data), 'Should return json encoded array');
        $this->assertTrue($data['success']);
        $this->assertFalse($test->exists());
        
        // should return an error, instance no longer exists
        $content = $this->curl($deletionCall, 'DELETE', "data");
        $data = json_decode($content, true);
        $this->assertTrue(is_array($data), 'Should return json encoded array');
        $this->assertFalse($data['success']);
    }
    
    public function testError()
    {
        $endpoint = ROOT_URL.'taoQtiTest/RestQtiTests';
        $file = __DIR__.'/../samples/archives/QTI 2.1/invalid/MissingItemDependency.zip';
        $this->assertFileExists($file);
        
        $post_data = array('qtiPackage' => new \CURLFile($file));
    
        $options = array(
            CURLOPT_POSTFIELDS => $post_data
        );
        $content = $this->curl($endpoint, CURLOPT_POST, "data", $options);
        $data = json_decode($content, true);
        
        $this->assertTrue(is_array($data), 'Should return json encoded array');
        $this->assertFalse($data['success']);
    }
    
    public function testInvalidFile()
    {
        $endpoint = ROOT_URL.'taoQtiTest/RestQtiTests';
        $post_data = array(
            'qtiPackage' => new \CURLFile(__DIR__.'/../samples/xml/compiler/meta/linear_nopreconditions_branchrules.xml')
        );
    
        $options = array(
            CURLOPT_POSTFIELDS => $post_data
        );
        $content = $this->curl($endpoint, CURLOPT_POST, "data", $options);
        $data = json_decode($content, true);
    
        $this->assertTrue(is_array($data), 'Should return json encoded array');
        $this->assertFalse($data['success']);
    }
}

