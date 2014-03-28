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
* Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
*
*
*/

use qtism\data\AssessmentTest;
use qtism\data\storage\xml\XmlDocument;

require_once dirname(__FILE__) . '/../../tao/test/TaoPhpUnitTestRunner.php';
include_once dirname(__FILE__) . '/../includes/raw_start.php';

/**
 * Integration test of the {@link taoQtiTest_helpers_Utils} class.
 *
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 * @package taoQtiTest
 * @subpackage test
 */
class QtiTestServiceTestCase extends TaoPhpUnitTestRunner {
    
    /**
     * @dataProvider buildAssessmentItemRefsMapProvider
     * 
     * @param string $testPath
     * @param string $manifestPath
     * @param string $basePath
     * @param array $expectedMap
     */
    public function testBuildAssessmentItemRefsMap($testPath, $manifestPath, $basePath, $expectedMap) {
        $test = new XmlDocument();
        $test->load($testPath);
        $manifestParser = new taoQtiTest_models_classes_ManifestParser($manifestPath);
        
        $map = taoQtiTest_helpers_Utils::buildAssessmentItemRefsTestMap($test->getDocumentComponent(), $manifestParser, $basePath);
        $this->assertEquals(count($expectedMap), count($map));
        
        foreach ($expectedMap as $id => $truePath) {
            $this->assertTrue(isset($map[$id]));
            
            if ($truePath !== false) {
                $this->assertEquals(helpers_File::truePath(tao_helpers_File::concat(array($basePath, $map[$id]->getFile()))), $truePath);
            }
            else {
                $this->assertEquals($truePath, $map[$id]);
            }
        }
    }
    
    public function buildAssessmentItemRefsMapProvider() {
        $returnValue = array();
        $samplesDir = dirname(__FILE__) . '/data/';

        // ims_manifest_mapping_1.xml is the base of the test.
        $testPath = $samplesDir . 'imsmanifest_mapping_test_1.xml';
        $manifestPath = $samplesDir . 'imsmanifest_mapping_1.xml';
        $returnValue[] = array($testPath, $manifestPath, '/qtism/', array('Q01' => '/qtism/Q01/qti.xml', 'Q02' => '/qtism/Q02/qti.xml', 'Q03' => '/qtism/Q03/qti.xml'));
        
        // ims_manifest_mapping_2.xml is the base of the test.
        $testPath = $samplesDir . 'imsmanifest_mapping_test_2.xml';
        $manifestPath = $samplesDir . 'imsmanifest_mapping_2.xml';
        $returnValue[] = array($testPath, $manifestPath, '/qtism/', array('Q01' => '/qtism/Q01/qti.xml', 'Q02' => false, 'Q03' => '/qtism/Q03/qti.xml'));
        
        // ims_manifest_mapping_3.xml is the base of the test.
        $testPath = $samplesDir . 'imsmanifest_mapping_test_3.xml';
        $manifestPath = $samplesDir . 'imsmanifest_mapping_3.xml';
        $returnValue[] = array($testPath, $manifestPath, '/qtism/', array('Q01' => '/qtism/Q01/qti.xml', 'Q02' => '/qtism/Q02/qti.xml', 'Q03' => '/qtism/Q03/qti.xml'));
        
        return $returnValue;
    }
}