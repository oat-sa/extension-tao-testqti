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

use Exception;
use oat\generis\model\data\ModelManager;
use oat\generis\model\data\Ontology;
use oat\oatbox\service\ServiceManager;
use oat\tao\test\integration\RestTestRunner;
use oat\taoQtiTest\helpers\QtiPackageExporter;
use Slim\Http\Headers;
use Slim\Http\Request;
use Slim\Http\RequestBody;
use Slim\Http\Uri;
use tao_helpers_File;
use taoQtiTest_actions_RestQtiTests;
use taoQtiTest_models_classes_QtiTestService as QtiTestService;
use taoTests_models_classes_TestsService as TestsService;
use Zend\ServiceManager\ServiceLocatorInterface;
use common_report_Report as Report;
use ZipArchive;

class QtiPackageExportTest extends RestTestRunner
{
    private const GET_REQUEST = 'GET';
    /** @var ServiceLocatorInterface */
    private $serviceLocatorMock;

    public function setUp(): void
    {
        parent::setUp();

        $this->serviceLocatorMock = $this->getServiceLocatorMock([
            QtiPackageExporter::SERVICE_ID => ServiceManager::getServiceManager()->get(QtiPackageExporter::SERVICE_ID),
            Ontology::SERVICE_ID => ModelManager::getModel(),
        ]);
    }

    public function testWithEmptyStringInParameterQuery()
    {

        $restQtiTests = new TestableRestQtiTests();
        $restQtiTests->setServiceLocator($this->serviceLocatorMock);

        //Preparing right url
        $query = sprintf('?testUri=');
        $stream = new RequestBody();
        $headers = new Headers();
        $request = new Request(self::GET_REQUEST, Uri::createFromString($query), $headers, [], [], $stream);
        $restQtiTests->setRequest($request);

        $response = $restQtiTests->exportQtiPackage();
        $this->assertJson($response);
        $this->assertTrue((bool) strpos($response, 'At least one mandatory parameter was required but found missing in your request'));
    }

    public function testWithMissingResource()
    {
        $restQtiTests = new TestableRestQtiTests();
        $restQtiTests->setServiceLocator($this->serviceLocatorMock);

        //Preparing right url
        $query = sprintf('?testUri=%s', 'http://this-does-not-matter-really');
        $stream = new RequestBody();
        $headers = new Headers();
        $request = new Request(self::GET_REQUEST, Uri::createFromString($query), $headers, [], [], $stream);
        $restQtiTests->setRequest($request);

        $response = $restQtiTests->exportQtiPackage();
        $this->assertJson($response);
        $this->assertTrue((bool) strpos($response, 'Resource not found'));
    }

    public function testWithMissingParam()
    {

        $restQtiTests = new TestableRestQtiTests();
        $restQtiTests->setServiceLocator($this->serviceLocatorMock);

        //Preparing right url
        $query = sprintf('?test=%s', 'http://this-does-not-matter-really');
        $stream = new RequestBody();
        $headers = new Headers();
        $request = new Request(self::GET_REQUEST, Uri::createFromString($query), $headers, [], [], $stream);
        $restQtiTests->setRequest($request);

        $response = $restQtiTests->exportQtiPackage();
        $this->assertJson($response);
        $this->assertTrue((bool) strpos($response, 'At least one mandatory parameter was required but found missing in your request'));
    }

    public function testExportQtiPackage()
    {
        //create test resource based on qti package zip
        $testFile = __DIR__ . '/samples/archives/QTI 2.2/exportWithoutLongPaths/test_with_long_path_and_shared_stimulus.zip';
        //create temporary subclass
        $class = TestsService::singleton()->getRootclass()->createSubClass(uniqid('test-exporter', true));
        //Importing test form zip file into temporary subclass
        /** @var Report $report */
        $report = QtiTestService::singleton()
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
        $zip = new ZipArchive();
        if ($zip->open($exportTempFile)) {
            $zip->extractTo($extractExportPath);
            $zip->close();
        }
        $manifestFile = $extractExportPath . '/imsmanifest.xml';
        $itemsPath = $extractExportPath . '/items';
        $itemsInExtractedPath = array_slice(scandir($itemsPath, null), 2);

        //Assert zip content
        $this->assertFileExists($manifestFile);
        $this->assertCount(3, $itemsInExtractedPath);

        //Clean up
        $class->delete(true);
        tao_helpers_File::delTree($extractExportPath);
        tao_helpers_File::remove($exportTempFile);
    }

    public function testExportQtiPackageWithDependencies()
    {
        //create test resource based on qti package zip
        $testFile = __DIR__ . '/samples/archives/QTI 2.2/exportWithoutLongPaths/qtiItemDependency.zip';
        //create temporary subclass
        $class = TestsService::singleton()->getRootclass()->createSubClass(uniqid('test-exporter', true));
        //Importing test form zip file into temporary subclass
        /** @var Report $report */
        $report = QtiTestService::singleton()
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
        $zip = new ZipArchive();
        if ($zip->open($exportTempFile)) {
            $zip->extractTo($extractExportPath);
            $zip->close();
        }
        $manifestFile = $extractExportPath . '/imsmanifest.xml';
        $itemsPath = $extractExportPath . '/items';
        $itemsInDir = scandir($itemsPath, null);
        $itemsInExtractedPath = array_slice($itemsInDir, 2);

        // images
        foreach ($itemsInExtractedPath as $item) {
            $expected = $itemsPath.'/'.$item.'/assets/img';
            $this->assertFileExists($expected);
            $itemsInDirAssets = scandir($expected, null);
            $itemsInExtractedAssetsPath = array_slice($itemsInDirAssets, 2);
            $this->assertCount(6, $itemsInExtractedAssetsPath);
        }

        //Assert zip content
        $this->assertFileExists($manifestFile);
        $this->assertCount(2, $itemsInExtractedPath);

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

    /**
     * @param Exception $exception
     * @param bool $withMessage
     *
     * @return string|void
     * @throws \common_exception_NotImplemented
     */
    public function returnFailure(Exception $exception, $withMessage = true)
    {
        $data = [];
        if ($withMessage) {
            $data['success']    =  false;
            $data['errorCode']  =  $exception->getCode();
            $data['errorMsg']   =  $this->getErrorMessage($exception);
        }

        return $this->encode($data);
    }
}
