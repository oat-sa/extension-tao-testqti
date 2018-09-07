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
use oat\oatbox\filesystem\FileSystem;
use oat\oatbox\filesystem\FileSystemService;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use oat\oatbox\action\Action;
use Zend\ServiceManager\ServiceLocatorAwareTrait;
use ZipArchive;

/**
 * php index.php "\oat\taoQtiTest\scripts\cli\exportMultipleQtiTestsToDir" https://nccersso.taocloud.org/nccer_sso.rdf#i15325945796246250 https://nccersso.taocloud.org/nccer_sso.rdf#i15325921352024194 1234
 *
 * Class exportMultipleTestsToDir
 * @package oat\taoQtiTest\scripts\cli
 */
class exportMultipleQtiTestsToDir implements Action, ServiceLocatorAwareInterface
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
     * Load self::TEST_FOLDER_IMPORT directory
     *
     * @throws \Exception
     * @throws \common_ext_ExtensionException
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

    public function __invoke($params)
    {
        try {
            $this->init();
            $report = $this->exportTests($params);
        } catch (\Exception $e) {
            $report = $this->returnFailure($e->getMessage());
        }

        return $report;
    }

    private function exportTests($list)
    {
        // Create a new ZIP archive to store data related to the QTI Test.
        $zip = new ZipArchive();
        $manifest = \taoQtiTest_helpers_Utils::emptyImsManifest('2.1');

        $report = common_report_Report::createInfo('Start Test Exporter');
        foreach ($list as $testUri) {
            $resource = $this->getResource($testUri);
            if($resource->exists()) {
                $file = tempnam(sys_get_temp_dir(), 'testExport_');
                $zip->open($file, ZipArchive::CREATE);
                $exporter = new \taoQtiTest_models_classes_export_QtiTestExporter22($resource, $zip, $manifest);
                $expReport = $exporter->export();
                $zip->close();
                $zipArchiveHandler = fopen($file, 'r');
                $this->fileSystem->put($this->getFileName($testUri), $zipArchiveHandler);
                fclose($zipArchiveHandler);
                $report->add($expReport);
            } else {
                $report->add($this->returnFailure('Resource does not found for URI: ' . $testUri));
            }
        }

        if (count($list)) {
            $report->add($this->returnSuccess(count($list)));
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
