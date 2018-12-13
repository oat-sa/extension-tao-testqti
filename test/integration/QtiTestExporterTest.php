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

namespace oat\taoQtiTest\test\integration;

use oat\generis\test\GenerisPhpUnitTestRunner;
use oat\tao\model\TaoOntology;
use taoQtiTest_models_classes_QtiTestService;
use taoQtiTest_models_classes_export_TestExport;
use tao_helpers_Uri;
use tao_helpers_form_Form;
use tao_helpers_form_FormElement;
use tao_helpers_form_xhtml_Form;
use ZipArchive;
use taoQtiTest_models_classes_export_QtiTestExporter;
use taoQtiTest_helpers_Utils;
use core_kernel_classes_Resource;
use common_report_Report;

/**
 * This test case focuses on testing the export_TestExport and export_QtiTestExporter models.
 *
 * @author Aamir
 * @package taoQtiTest
 */
class QtiTestExporterTest extends GenerisPhpUnitTestRunner
{

    private $dataDir = '';
    private $outputDir;
    

    public function setUp()
    {
        parent::initTest();
        $this->testService = taoQtiTest_models_classes_QtiTestService::singleton();
        $this->dataDir = dirname(__FILE__) . '/data/';
        $this->outputDir = sys_get_temp_dir() . '/' ;
    }

    /**
     * verify main class
     *
     * @return void
     */
    public function testService()
    {
        $this->assertInstanceOf(taoQtiTest_models_classes_QtiTestService::class, $this->testService);
    }

    /**
     * create qtitest instance
     *
     * @return \core_kernel_classes_Resource
     */
    public function testCreateInstance()
    {
        $qtiTest = $this->testService->createInstance($this->testService->getRootclass(), 'UnitTestQtiItem');
        $this->assertInstanceOf(core_kernel_classes_Resource::class, $qtiTest);

        $type = current($qtiTest->getTypes());
        $this->assertEquals(TaoOntology::TEST_CLASS_URI, $type->getUri());

        return $qtiTest;
    }

    /**
     * verify main class
     *
     * @return \taoQtiTest_models_classes_export_TestExport
     */
    public function testInitExport()
    {
        $testExport = new taoQtiTest_models_classes_export_TestExport();
        $this->assertInstanceOf(taoQtiTest_models_classes_export_TestExport::class, $testExport);

        return $testExport;
    }

    /**
	 * test export form create
	 *
     * @depends testInitExport
     * @depends testCreateInstance
     * @param  \taoQtiTest_models_classes_export_TestExport $testExport
     * @param  \core_kernel_classes_Resource                $qtiTest
     * @return \tao_helpers_form_Form
     */
    public function testExportFormCreate($testExport, $qtiTest)
    {
        $form = $testExport->getExportForm($qtiTest);
        $this->assertInstanceOf(tao_helpers_form_Form::class, $form);
        $this->assertInstanceOf(tao_helpers_form_xhtml_Form::class, $form);

        return $form;
    }

    /**
	 * test export form validators
	 *
     * @depends testExportFormCreate
     * @param  \tao_helpers_form_Form $form
     * @return void
     */
    public function testExportFormValid($form)
    {
        $this->assertFalse($form->isValid());
    }

    /**
	 * test export form values
	 *
     * @depends testExportFormCreate
	 * @depends testCreateInstance
     * @param \tao_helpers_form_Form $form
	 * @param  \core_kernel_classes_Resource $qtiTest
     * @return void
     */
    public function testExportFormValues($form, $qtiTest)
    {
        $this->assertEquals(2, count($form->getElements()));

        $elmSource = $form->getElement('filename');
        $this->assertInstanceOf(tao_helpers_form_FormElement::class, $elmSource);
        $elmSource->setValue('qti_unit_test');

        $elmInstance = $form->getElement('instances');
        $this->assertInstanceOf(tao_helpers_form_FormElement::class, $elmInstance);

        $uri = tao_helpers_Uri::encode($qtiTest->getUri());
        $elmInstance->setOptions(array(
            $uri => $qtiTest->getLabel()
        ));
    }

    /**
	 * test export form validate
	 *
     * @depends testExportFormCreate
	 * @depends testCreateInstance
     * @param \tao_helpers_form_Form $form
	 * @param  \core_kernel_classes_Resource $qtiTest
     * @return void
     */
    public function testExportFormValidate($form, $qtiTest)
    {
        $filename = $form->getElement('filename')->getRawValue();
        $this->assertEquals('qti_unit_test', $filename);

        $uri = tao_helpers_Uri::encode($qtiTest->getUri());
        $instances = $form->getElement('instances')->getRawValue();

        $this->assertTrue(in_array($uri, $instances));
    }

    /**
	 * test export
	 *
     * @depends testInitExport
     * @depends testExportFormCreate
	 * @depends testCreateInstance
     * @param \taoQtiTest_models_classes_export_TestExport $testExport
     * @param \tao_helpers_form_Form                       $form
	 * @param  \core_kernel_classes_Resource $qtiTest
     * @return void
     */
    public function testExportFormSubmit($testExport, $form)
    {
        $formValues = $form->getValues();
        $formValues['uri'] = 'TEST_URI';
        $report = $testExport->export($formValues, $this->outputDir);

        $this->assertInstanceOf(common_report_Report::class, $report);
        $file = $report->getData();
        
        $this->assertInternalType('string', $file);
        $this->assertFileExists($file);
        $this->assertStringStartsWith($this->outputDir, $file);

        $this->assertContains('qti_unit_test', $file);
        unlink($file);
    }

    /**
	 * test QtiTestExporter alone
	 *
	 * @depends testCreateInstance
	 * @param  \core_kernel_classes_Resource $qtiTest
     * @return void
     */
    public function testQtiTestExporter($qtiTest)
    {
        $file = $this->outputDir . 'qti_unit_test.zip';

        $zip = new ZipArchive();
        $this->assertTrue($zip->open($file, ZipArchive::CREATE));

        $qtiTestExporter = new taoQtiTest_models_classes_export_QtiTestExporter(
            $qtiTest, $zip, taoQtiTest_helpers_Utils::emptyImsManifest()
        );
        $qtiTestExporter->export();
        $zip->close();

        $this->assertFileExists($file);
        unlink($file);
    }

    /**
     * Scenario:
     * 1. Imports archive from samples with long paths to tests
     * 2. Exports created test
     * 3. Checks that created test has short paths
     *
     * @throws \common_exception_Error
     * @throws \common_exception_Unauthorized
     */
    public function testQtiTestExporterWithTestWithLongPaths()
    {
        // import
        $testFile = __DIR__ . '/samples/archives/QTI 2.2/exportWithoutLongPaths/test_with_long_path_and_shared_stimulus.zip';
        $class = \taoTests_models_classes_TestsService::singleton()->getRootclass()->createSubClass(uniqid('test-exporter'));
        $report = \taoQtiTest_models_classes_QtiTestService::singleton()
            ->importMultipleTests($class, $testFile);

        $this->assertEquals($report->getType(), \common_report_Report::TYPE_SUCCESS);
        $this->assertFalse($report->containsError());

        // find imported URI
        $resources = $class->getInstances();
        $this->assertCount(1, $resources);
        $resource = current($resources);
        $uri = $resource->getUri();
        $this->assertStringStartsWith('http', $uri);

        // export just imported to ZIP
        $file = $this->outputDir . 'qti_unit_test.zip';

        $zip = new ZipArchive();
        $this->assertTrue($zip->open($file, ZipArchive::CREATE));

        $qtiTestExporter = new taoQtiTest_models_classes_export_QtiTestExporter(
            new \core_kernel_classes_Resource($uri), $zip, taoQtiTest_helpers_Utils::emptyImsManifest()
        );
        $qtiTestExporter->export();
        $zip->close();
        $this->assertTrue($zip->open($file, ZipArchive::CREATE));

        // dump exported archive to a directory to check that
        $dirForChecking = mkdir(uniqid(sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'test-exporter-paths', true));

        $this->assertTrue($zip->extractTo($dirForChecking));

        // delete archive
        $zip->close();
        $this->assertFileExists($file);
        unlink($file);

        // check directory that archive was extracted to has short path to test.xml
        $allDirectoriesInsideTestsDirectory = scandir($dirForChecking);
        $this->assertEquals(end($allDirectoriesInsideTestsDirectory), 'tests');
        $testsDirectory = $dirForChecking . '/tests/';
        $testsDirectories = scandir($testsDirectory);
        $directoryWithTestXml = $testsDirectory . end($testsDirectories);
        $directoryWithTestXmlContents = scandir($directoryWithTestXml);
        $this->assertEquals(end($directoryWithTestXmlContents), 'test.xml');

        $class->delete(true);

        \tao_helpers_File::delTree($dirForChecking);
    }
}
