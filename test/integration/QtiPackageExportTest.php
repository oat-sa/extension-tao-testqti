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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiTest\test\integration;

use oat\tao\test\integration\RestTestRunner;
use oat\taoQtiTest\helpers\QtiPackageExporter;
use Slim\Http\Headers;
use Slim\Http\Request;
use Slim\Http\RequestBody;
use Slim\Http\Uri;
use tao_helpers_File;
use taoQtiTest_actions_RestQtiTests;
use Zend\ServiceManager\ServiceLocatorInterface;
use common_report_Report as Report;

class QtiPackageExportTest extends RestTestRunner
{
    private const GET_REQUEST = 'GET';
    /** @var ServiceLocatorInterface */
    private $serviceLocatorMock;

    public function setUp()
    {
        parent::setUp();
        $this->serviceLocatorMock = $this->getServiceLocatorMock([
            QtiPackageExporter::class => new QtiPackageExporter(),
        ]);
    }

    public function testExportQtiPackage()
    {
        //create test resource based on qti package zip
        $testFile = __DIR__ . '/samples/archives/QTI 2.2/exportWithoutLongPaths/multiple_items_with_ms.zip';
        //create temporary subclass
        $class = \taoTests_models_classes_TestsService::singleton()->getRootclass()->createSubClass(uniqid('test-exporter', true));
        //Importing test form zip file into temporary subclass
        /** @var Report $report */
        $report = \taoQtiTest_models_classes_QtiTestService::singleton()
            ->importMultipleTests($class, $testFile);
        $reportSuccesses = $report->getSuccesses();
        $successfulImport = reset($reportSuccesses);
        $this->assertCount(1, $reportSuccesses);
        $this->assertEquals($report->getType(), \common_report_Report::TYPE_SUCCESS);
        $this->assertFalse($report->containsError());

        //Detremine what uri our new class was defined in tao
        $uriResource = $successfulImport->getData()->uriResource;
        //Encode resource uri so it can be passed to url param
        $testUriEncoded = urlencode($uriResource);
        $query = sprintf('?testUri=%s', $testUriEncoded);

        $restQtiTests = new TestableRestQtiTests();
        $restQtiTests->setServiceLocator($this->serviceLocatorMock);

        //Preparing right url
        $stream = new RequestBody();
        $headers = new Headers();
        $request = new Request(self::GET_REQUEST, Uri::createFromString($query), $headers, [], [], $stream);
        $restQtiTests->setRequest($request);

        //Execute
        $response = $restQtiTests->exportQtiPackage();

        //Handle Zip file
        $exportTempFile = tempnam(sys_get_temp_dir(), 'testExport_');
        $filehandler = fopen($exportTempFile, 'wb');
        fwrite($filehandler, base64_decode($response[TestableRestQtiTests::PARAM_PACKAGE_NAME]));
        fclose($filehandler);

        $extractExportPath = sys_get_temp_dir() . '/extractedExportPackage' . time();
        $zip = new \ZipArchive();
        if ($zip->open($exportTempFile)) {
            $zip->extractTo($extractExportPath);
            $zip->close();
        }
        $manifestFile = $extractExportPath . '/imsmanifest.xml';
        $itemsPath = $extractExportPath . '/items';
        $itemsInExtractedPath = array_slice(scandir($itemsPath,  null), 2);

        //Assert zip content
        $this->assertFileExists($manifestFile);
        $this->assertCount(15, $itemsInExtractedPath);

        //Clean up
        $class->delete(true);
        tao_helpers_File::delTree($extractExportPath);
        tao_helpers_File::remove($exportTempFile);
    }
}

class TestableRestQtiTests extends taoQtiTest_actions_RestQtiTests
{
    public function __construct()
    {
    }

    public function returnSuccess($rawData = [], $withMessage = true)
    {
        return $rawData;
    }
}