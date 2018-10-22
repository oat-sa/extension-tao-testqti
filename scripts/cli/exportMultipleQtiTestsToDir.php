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
 * Copyright (c) 2018  (original work) Open Assessment Technologies SA;
 *
 * @author Alexander Zagovorichev <zagovorichev@1pt.com>
 */

namespace oat\taoQtiTest\scripts\cli;


use common_report_Report;
use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\extension\script\ScriptAction;
use oat\oatbox\filesystem\FileSystem;
use oat\oatbox\filesystem\FileSystemService;
use Zend\ServiceManager\ServiceLocatorAwareTrait;
use ZipArchive;

/**
 * php index.php "\oat\taoQtiTest\scripts\cli\exportMultipleQtiTestsToDir" https://nccersso.taocloud.org/nccer_sso.rdf#i15325945796246250 https://nccersso.taocloud.org/nccer_sso.rdf#i15325921352024194 1234
 *
 * Class exportMultipleTestsToDir
 * @package oat\taoQtiTest\scripts\cli
 */
class exportMultipleQtiTestsToDir extends ScriptAction
{
    use OntologyAwareTrait;
    use ServiceLocatorAwareTrait;

    /**
     * Location of the directory inside upload filesystem
     */
    const TEST_FOLDER_EXPORT = 'testExport';

    /**
     * @var FileSystem
     */
    protected $fileSystem;

    /**
     * @var array
     */
    private $params = [];

    /**
     * @var int
     */
    private $total = 0;

    public function provideDescription()
    {
        return 'TAO QTI Test exporter - QTI Test Exporter';
    }

    public function provideOptions()
    {
        return [
            'testId' => [
                'prefix' => 't',
                'longPrefix' => 'testId',
                'description' => 'List of the test ID\'s to export: `test_1 test_2 .. test_n`.'
            ]
        ];
    }

    protected function provideUsage()
    {
        // Overriding this method is option. Simply describe which option prefixes have to
        // to be used in order to display the usage of the script to end user.
        return [
            'prefix' => 'h',
            'longPrefix' => 'help',
            'description' => 'Prints a help statement'
        ];
    }

    public function __invoke($params)
    {
        $this->params = $params;
        $report = parent::__invoke($params);
        return $report;
    }

    /**
     * Load self::TEST_FOLDER_IMPORT directory
     *
     * @throws \Exception
     */
    protected function init()
    {
        /** @var FileSystemService $service */
        $service = $this->getServiceLocator()->get(FileSystemService::SERVICE_ID);
        $defaultFileSystemId = 'testExports';
        try {
            $this->fileSystem = $service->getFileSystem($defaultFileSystemId);
        } catch (\Exception $e) {
            $this->fileSystem = $service->createLocalFileSystem($defaultFileSystemId);
        }

        $this->getServiceLocator()->get(\common_ext_ExtensionsManager::SERVICE_ID)->getExtensionById('taoQtiTest');
    }

    public function run()
    {
        try {
            $this->init();
            $report = $this->exportTests();
        } catch (\Exception $e) {
            $report = $this->returnFailure($e->getMessage());
        }

        return $report;
    }

    private function exportTests()
    {
        $report = common_report_Report::createInfo('Start Test Exporter');
        $this->total = count($this->params);
        foreach ($this->params as $testUri) {
            if ($testUri == '-d') {
                $this->total--;
                // for the ScriptAction compatibility
                continue;
            }
            $report->add($this->exportTest($testUri));
        }

        if ($this->total) {
            $report->add($this->returnSuccess($this->total));
        }

        return $report;
    }

    /**
     * @param $testUri
     * @return common_report_Report
     * @throws \common_exception_Error
     */
    private function exportTest($testUri)
    {
        // Create a new ZIP archive to store data related to the QTI Test.
        $zip = new ZipArchive();
        $manifest = \taoQtiTest_helpers_Utils::emptyImsManifest('2.1');
        $resource = $this->getResource($testUri);
        if($resource->exists()) {
            $file = tempnam(sys_get_temp_dir(), 'testExport_');
            $zip->open($file, ZipArchive::CREATE);
            $exporter = new \taoQtiTest_models_classes_export_QtiTestExporter22($resource, $zip, $manifest);
            $expReport = $exporter->export();
            $zip->close();
            $zipArchiveHandler = fopen($file, 'r');
            $fileName = $this->getFileName($testUri);
            $this->fileSystem->put($fileName, $zipArchiveHandler);
            fclose($zipArchiveHandler);
            $expReport->add(common_report_Report::createInfo($this->fileSystem->getId() . '/' . $fileName));
            $report = $expReport;
        } else {
            $this->total--;
            $report = $this->returnFailure('Resource does not found for the URI: ' . $testUri);
        }

        return $report;
    }

    protected function getFileName($testUri)
    {
        $i = 0;
        $fileName = \tao_helpers_File::getSafeFileName($testUri . '.zip');
        while ($this->fileSystem->has($fileName) ) {
            $i++;
            $fileName = \tao_helpers_File::getSafeFileName($testUri . '_' . $i . '.zip');
        }

        return $fileName;
    }

    /**
     * Return error \common_report_Report
     *
     * @param $msg
     * @return common_report_Report
     */
    protected function returnFailure($msg)
    {
        return new common_report_Report(common_report_Report::TYPE_ERROR, $msg);
    }

    /**
     * Return success \common_report_Report
     *
     * @param $testsCount
     * @return \common_report_Report
     */
    protected function returnSuccess($testsCount)
    {
        return new common_report_Report(common_report_Report::TYPE_SUCCESS, $testsCount . ' tests exported');
    }

}
