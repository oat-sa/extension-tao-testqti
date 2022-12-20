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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiTest\models\export\metadata;

use common_report_Report as Report;
use core_kernel_classes_Class;
use oat\oatbox\event\EventManagerAwareTrait;
use \oat\taoQtiItem\model\Export\ItemMetadataByClassExportHandler;
use oat\taoQtiTest\models\event\QtiTestMetadataExportEvent;

class TestMetadataByClassExportHandler extends ItemMetadataByClassExportHandler
{
    use EventManagerAwareTrait;

    /**
     * @return string
     */
    public function getLabel()
    {
        return 'QTI Test Metadata';
    }

    public function export($formValues, $destPath)
    {
        if (!isset($formValues['filename'])) {
            return Report::createFailure('Missing filename for export using ' . __CLASS__);
        }

        if (!isset($formValues['uri']) && isset($formValues['classUri'])) {
            return $this->exportClass($formValues, $destPath);
        }

        return $this->exportTest($formValues, $destPath);
    }

    protected function exportTest($formValues, $destPath): Report
    {
        if (!isset($formValues['uri'])) {
            return Report::createFailure('No uri selected for export using ' . __CLASS__);
        }

        $report = Report::createSuccess();

        $instance = new \core_kernel_classes_Resource(\tao_helpers_Uri::decode($formValues['uri']));

        /** @var \core_kernel_classes_Resource $model */
        $model = \taoQtiTest_models_classes_QtiTestService::singleton()->getTestModel($instance);
        if ($model->getUri() != \taoQtiTest_models_classes_QtiTestService::INSTANCE_TEST_MODEL_QTI) {
            return Report::createFailure(__('Metadata export is not available for test "%s."', $instance->getLabel()));
        }

        $fileName = $formValues['filename'] . '_' . time() . '.csv';

        if (!\tao_helpers_File::securityCheck($fileName, true)) {
            throw new \Exception('Unauthorized file name');
        }

        /** @var TestExporter $exporterService */
        $exporterService = $this->getServiceManager()->get(TestMetadataExporter::SERVICE_ID);
        $exporterService->setOption(TestExporter::OPTION_FILE_NAME, $fileName);

        $filePath = $exporterService->export($formValues['uri']);

        $report->setData($filePath);
        $report->setMessage(__('Test metadata successfully exported.'));

        $this->getEventManager()->trigger(new QtiTestMetadataExportEvent($instance));

        return $report;
    }

    protected function exportClass($formValues, $destPath): Report
    {
        $classToExport = $this->getClassToExport($formValues['classUri']);

        $zip = new \ZipArchive();
        $zipPath = $formValues['filename'] . '_' . time() . '.zip';
        $zip->open($zipPath, \ZipArchive::CREATE);

        /** @var TestExporter $exporterService */
        $exporterService = $this->getServiceManager()->get(TestMetadataExporter::SERVICE_ID);

        $tmpFiles = [];

        foreach ($this->extractInstancesRecursively($classToExport) as $path => $uri) {
            $tmpFileName = str_replace(DIRECTORY_SEPARATOR, '_', $path)
                . '_metadata_'
                . time()
                . '.csv';

            $exporterService->setOption(
                TestExporter::OPTION_FILE_NAME,
                $tmpFileName
            );

            $filePath = $exporterService->export($uri);
            $zip->addFile($filePath, $path . '.csv');

            $tmpFiles[] = $filePath;
        }

        $zip->close();

        foreach ($tmpFiles as $tmpFile) {
            unlink($tmpFile);
        }

        $report = Report::createSuccess();
        $report->setData($zipPath);
        $report->setMessage(__('Test metadata successfully exported.'));

        return $report;
    }

    private function extractInstancesRecursively(core_kernel_classes_Class $class): array
    {
        $data = [];

        foreach ($class->getSubClasses() as $subClass) {
            $data = array_merge(
                $data,
                $this->extractInstancesRecursively($subClass)
            );
        }

        foreach ($class->getInstances() as $instance) {
            $path = $this->replaceSpaces($instance->getLabel());
            $data[$path] = $instance->getUri();
        }

        $prefix = $this->replaceSpaces($class->getLabel()) . DIRECTORY_SEPARATOR;
        $res = [];
        foreach ($data as $path => $uri) {
            $res[$prefix . $path] = $uri;
        }

        return $res;
    }

    private function replaceSpaces(string $str): string
    {
        return preg_replace('~\s+~', '_', $str);
    }
}