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

require_once dirname(__FILE__) . '/../../tao/test/TaoPhpUnitTestRunner.php';
include_once dirname(__FILE__) . '/../includes/raw_start.php';

/**
 * Integration test of the {@link taoQtiTest_models_classes_export_QtiTestExporter} class.
 *
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 * @package taoQtiTest
 * @subpackage test
 */
class QtiTestExporterTestCase extends TaoPhpUnitTestRunner {
    
    const IMPORT_TEST_TARGET_CLASS = 'http://www.tao.lu/Ontologies/TAOTest.rdf#unitTestImportTargetClass';
    
    const IMPORT_ITEM_TARGET_CLASS = 'http://www.tao.lu/Ontologies/TAOTest.rdf#unitItemImportTargetClass';
    
    protected $currentTestResource = '';
    
    public function setUp() {
        // Create QTI Test import target class.
        $baseClass = new core_kernel_classes_Class(TAO_TEST_CLASS);
        $label = "taoQtiTestExporterTestCase Test Target Class.";
        $comment = "PHPUnit Generated.";
        core_kernel_classes_ClassFactory::createSubClass($baseClass, $label, $comment, self::IMPORT_TEST_TARGET_CLASS);
        
        $baseClass = new core_kernel_classes_Class(TAO_ITEM_CLASS);
        $label = "taoQtiTestExporterTestCase Item Target Class.";
        $itemClass = core_kernel_classes_ClassFactory::createSubClass($baseClass, $label, $comment, self::IMPORT_ITEM_TARGET_CLASS);
    }
    
    public function tearDown() {
        
        if (empty($this->currentTestResource) === false) {
            
            // Delete items...
            $itemService = taoItems_models_classes_ItemsService::singleton();
            $testService = taoQtiTest_models_classes_QtiTestService::singleton();
            foreach ($testService->getItems($this->currentTestResource) as $item) {
                $itemService->deleteItem($item);
            }
            
            // Delete the test itself.
            $testService->deleteTest(new core_kernel_classes_Resource($this->currentTestResource));
        }
        
        // Delete the import target RDFS classes.
        $class = new core_kernel_classes_Class(self::IMPORT_TEST_TARGET_CLASS);
        $class->delete();
        $class = new core_kernel_classes_Class(self::IMPORT_ITEM_TARGET_CLASS);
        $class->delete();
    }
    
    /**
     * @dataProvider validExportProvider
     * @param string $testArchive
     */
    public function testValidExport($testArchive) {
        $zip = new ZipArchive();
        $zip->open($testArchive);
        
        if ($zip->numFiles === 0) {
            $this->fail("No files found in IMS QTI Test archive '${testArchive}'.");
        }
        
        // Retrieve all the files that should be inside the exported archive
        // from $testArchive, our benchmark.
        $expectedFiles = array();
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $stat = $zip->statIndex($i);
            if ($stat['size'] > 0) {
                $expectedFiles[] = $stat['name'];
            }
        }
        
        $zip->close();
        
        // Import the QTI Test.
        $service = taoQtiTest_models_classes_QtiTestService::singleton();
        $testResource = $service->createInstance(new core_kernel_classes_Class(self::IMPORT_TEST_TARGET_CLASS));
        $itemClass = new core_kernel_classes_Class(self::IMPORT_ITEM_TARGET_CLASS);
        $importReport = $service->importTest($testResource, $testArchive, $itemClass);
        
        if ($importReport->containsError() === true || $importReport->getType() === common_report_Report::TYPE_ERROR) {
            $this->fail("Could not import IMS QTI Test archive '${testArchive}'.");
        }
        
        $this->currentTestResource = $importReport->getData();
        $zip = new ZipArchive();
        $zipPath = tempnam('/tmp', 'tao');
        $zip->open($zipPath, ZipArchive::CREATE);
        $manifest = taoQtiTest_helpers_Utils::emptyImsManifest();
        $exporter = new taoQtiTest_models_classes_export_QtiTestExporter($this->currentTestResource, $zip, $manifest);
        $exporter->export();
        
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $stat = $zip->statIndex($i);
            if ($stat['size'] > 0) {
                echo "Exported --> " . $stat['name'] . "\n";
            }
        }
        
        $zip->close();
        unlink($zipPath);
    }
    
    public function validExportProvider() {
        $ds = DIRECTORY_SEPARATOR;
        $samplesDir = dirname(__FILE__) . $ds . 'samples' . $ds;
        
        return array(
//             array($samplesDir . 'Basic.zip'), 
//             array($samplesDir . 'TestDefinitionInSubFolders.zip'),
            array($samplesDir . 'RubricBlocksNoIdStylesheetsImages.zip')
        );
    }
}