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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA ;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\helpers;

use common_Exception;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\filesystem\File;
use oat\oatbox\filesystem\FileSystemService;
use oat\oatbox\reporting\Report;
use oat\tao\helpers\FileHelperService;
use oat\generis\test\MockObject;
use oat\generis\test\TestCase;
use oat\taoQtiTest\helpers\QtiPackageExporter;
use oat\taoQtiTest\models\export\Formats\Package2p2\TestPackageExport;

class QtiPackageExporterTest extends TestCase
{
    private QtiPackageExporter $subject;

    /** @var TestPackageExport|MockObject */
    private $exporterMock;

    /** @var FileSystemService|MockObject */
    private $fileSystemServiceMock;

    /** @var FileHelperService|MockObject */
    private $fileHelperServiceMock;

    protected function setUp(): void
    {
        parent::setUp();
        $this->exporterMock = $this->createMock(TestPackageExport::class);
        $this->fileSystemServiceMock = $this->createMock(FileSystemService::class);
        $this->fileHelperServiceMock = $this->createMock(FileHelperService::class);
        $this->fileHelperServiceMock->method('createTempDir')->willReturn('FAKE_TMP_DIR');

        $this->subject = new QtiPackageExporter(
            $this->exporterMock,
            $this->fileSystemServiceMock,
            $this->fileHelperServiceMock
        );
    }

    public function testExportDeliveryQtiPackageThrowsExceptionWhenExportFails(): void
    {
        $testUri = 'FAKE_TEST_URI';

        $expectedReport = Report::createError('FAKE ERROR MESSAGE');
        $this->exporterMock->method('export')
            ->willReturn($expectedReport);

        $this->expectException(common_Exception::class);
        $this->subject->exportDeliveryQtiPackage($testUri);
    }

    /**
     * @dataProvider dataProviderReportDataWithoutValidPath
     * @throws common_Exception
     */
    public function testExportQtiTestPackageToFileThrowsExceptionWhenReportDoesNotHaveValidPath(array $reportData): void
    {
        $testUri = 'FAKE_TEST_URI';
        $fileSystemId = 'FILE_SYSTEM_ID';
        $filePath = 'FILE_PATH';

        $expectedReport = Report::createSuccess('FAKE ERROR MESSAGE');
        $expectedReport->setData($reportData);

        $this->exporterMock->method('export')
            ->willReturn($expectedReport);

        $this->expectException(common_Exception::class);
        $this->subject->exportQtiTestPackageToFile($testUri, $fileSystemId, $filePath);
    }

    public function testExportQtiTestPackageToFileReturnsValidFileAfterSuccessfulExport(): void
    {
        $testUri = 'FAKE_TEST_URI';
        $fileSystemId = 'FILE_SYSTEM_ID';
        $filePath = 'FILE_PATH';

        $expectedFileContent =  'EXPORTED_FILE_CONTENT';
        $expectedReport = Report::createSuccess('FAKE ERROR MESSAGE');
        $expectedReport->setData(['path' => 'FAKE_QTI_PACKAGE_PATH']);
        $this->exporterMock->method('export')
            ->willReturn($expectedReport);

        $this->fileHelperServiceMock->method('readFile')
            ->willReturn($expectedFileContent);

        $fileMock = $this->createMock(File::class);
        $fileMock->expects(self::once())
            ->method('put')
            ->with($expectedFileContent);
        $directoryMock = $this->createMock(Directory::class);
        $directoryMock->expects(self::once())
            ->method('getFile')
            ->with($filePath)
            ->willReturn($fileMock);

        $this->fileSystemServiceMock
            ->expects(self::once())
            ->method('getDirectory')
            ->with($fileSystemId)
            ->willReturn($directoryMock);

        $this->subject->exportQtiTestPackageToFile($testUri, $fileSystemId, $filePath);
    }

    public function dataProviderReportDataWithoutValidPath(): array
    {
        return [
            'No path key' => [
                'reportData' => [],
            ],
            'Path is not a string' => [
                'reportData' => [
                    'path' => ['some array value'],
                ],
            ],
        ];
    }
}
