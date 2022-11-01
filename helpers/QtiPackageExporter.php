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
 * Copyright (c) 2020-2022 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\helpers;

use common_Exception;
use common_exception_Error;
use oat\oatbox\filesystem\File;
use oat\oatbox\filesystem\FileSystemService;
use oat\oatbox\reporting\Report;
use oat\oatbox\reporting\ReportInterface;
use oat\tao\helpers\FileHelperService;
use oat\tao\model\service\InjectionAwareService;
use oat\taoQtiTest\models\Export\Formats\Package2p2\TestPackageExport;

class QtiPackageExporter extends InjectionAwareService
{
    public const SERVICE_ID = 'taoQtiTest/QtiPackageExporter';
    public const QTI_PACKAGE_FILENAME = 'qti_test_export';

    private TestPackageExport $testExporter;

    private FileSystemService $fileSystemService;

    private FileHelperService $fileHelperService;

    public function __construct(
        TestPackageExport $testExporter,
        FileSystemService $fileSystemService,
        FileHelperService $fileHelperService
    ) {
        $this->testExporter = $testExporter;
        $this->fileSystemService = $fileSystemService;
        $this->fileHelperService = $fileHelperService;
    }

    /**
     * @throws common_Exception
     * @throws common_exception_Error
     */
    public function exportDeliveryQtiPackage(string $testUri): Report
    {
        $exportReport = $this->testExporter->export(
            [
                'filename' => self::QTI_PACKAGE_FILENAME,
                'instances' => $testUri,
                'uri' => $testUri
            ],
            $this->fileHelperService->createTempDir()
        );

        if ($exportReport->getType() === ReportInterface::TYPE_ERROR) {
            throw new common_Exception('QTI Test package export failed.');
        }

        $reportData = $exportReport->getData();

        if (!isset($reportData['path']) || !is_string($reportData['path'])) {
            throw new common_Exception('Export report does not contain path to exported QTI package: ' . json_encode($reportData));
        }

        return $exportReport;
    }

    /**
     * @throws common_Exception
     */
    public function exportQtiTestPackageToFile(string $testUri, string $fileSystemId, string $filePath): File
    {
        $result = $this->exportDeliveryQtiPackage($testUri)->getData();

        return $this->moveFileToSharedFileSystem($result['path'], $fileSystemId, $filePath);
    }

    /**
     * @throws common_Exception
     */
    private function moveFileToSharedFileSystem(string $sourceFilePath, string $fileSystemId, string $destinationFilePath): File
    {
        $source = $this->fileHelperService->readFile($sourceFilePath);

        $file = $this->fileSystemService->getDirectory($fileSystemId)->getFile($destinationFilePath);
        $file->put($source);

        $this->fileHelperService->closeFile($source);
        $this->fileHelperService->removeFile($sourceFilePath);

        return $file;
    }
}
