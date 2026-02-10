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
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes;

use common_report_Report;
use core_kernel_classes_Resource;
use Exception;
use oat\generis\model\fileReference\FileReferenceSerializer;
use oat\generis\test\ServiceManagerMockTrait;
use oat\generis\test\TestCase;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\filesystem\File;
use oat\oatbox\service\ServiceManager;
use oat\taoQtiItem\model\qti\Resource;
use oat\taoQtiTest\models\scale\ScaleStorageService;
use PHPUnit\Framework\MockObject\MockObject;
use Throwable;
use taoQtiTest_models_classes_QtiTestService as QtiTestService;

/**
 * Unit tests for QtiTestService scale import/retrieval methods
 */
class QtiTestServiceScaleTest extends TestCase
{
    use ServiceManagerMockTrait;

    private const SCALE_DIR = 'scales';
    private const DIR_TAO_QTI_TEST = 'dir://taoQtiTest/';

    private QtiTestService|MockObject $sut;
    private ScaleStorageService|MockObject $scaleStorageServiceMock;
    private FileReferenceSerializer|MockObject $fileReferenceSerializerMock;
    private Directory|MockObject $testDirMock;
    private File|MockObject $testFileMock;

    public function setUp(): void
    {
        $this->scaleStorageServiceMock = $this->createMock(ScaleStorageService::class);
        $this->fileReferenceSerializerMock = $this->createMock(FileReferenceSerializer::class);
        $this->testDirMock = $this->createMock(Directory::class);
        $this->testFileMock = $this->createMock(File::class);

        $this->sut = $this->createPartialMock(
            QtiTestService::class,
            ['getQtiTestFile', 'getFileReferenceSerializer']
        );

        $this->sut->method('getFileReferenceSerializer')
            ->willReturn($this->fileReferenceSerializerMock);

        $this->sut->setServiceLocator($this->createServiceManagerMock());
    }

    // ========================================
    // Tests for extractScaleAuxiliaryFiles()
    // ========================================
    public function testExtractScaleAuxiliaryFilesReturnsEmptyArrayWhenNoAuxiliaryFiles(): void
    {
        $qtiResource = $this->createMock(Resource::class);
        $qtiResource->method('getAuxiliaryFiles')->willReturn([]);

        $result = $this->invokePrivateMethod($this->sut, 'extractScaleAuxiliaryFiles', [$qtiResource]);

        $this->assertSame([], $result);
        $this->assertEmpty($result);
    }

    public function testExtractScaleAuxiliaryFilesReturnsEmptyArrayWhenAuxiliaryFilesIsNull(): void
    {
        $qtiResource = $this->createMock(Resource::class);
        $qtiResource->method('getAuxiliaryFiles')->willReturn(null);

        $result = $this->invokePrivateMethod($this->sut, 'extractScaleAuxiliaryFiles', [$qtiResource]);

        $this->assertSame([], $result);
    }

    public function testExtractScaleAuxiliaryFilesExtractsScaleFilesOnly(): void
    {
        $qtiResource = $this->createMock(Resource::class);
        $auxiliaryFiles = [
            'styles/main.css',
            'images/logo.png',
            'scales/rubric_scale.json',
            'scales/performance_scale.json',
            'scripts/helper.js',
        ];

        $qtiResource->method('getAuxiliaryFiles')->willReturn($auxiliaryFiles);

        $expectedScaleFiles = [
            'scales/rubric_scale.json',
            'scales/performance_scale.json',
        ];

        $result = $this->invokePrivateMethod($this->sut, 'extractScaleAuxiliaryFiles', [$qtiResource]);

        $this->assertSame($expectedScaleFiles, $result);
        $this->assertCount(2, $result);
    }

    public function testExtractScaleAuxiliaryFilesHandlesPathNormalization(): void
    {
        $qtiResource = $this->createMock(Resource::class);
        $auxiliaryFiles = [
            'scales\\scale1.json',  // Windows path separator
            'scales//scale2.json',  // Double forward slash
            'other/file.txt',
        ];

        $qtiResource->method('getAuxiliaryFiles')->willReturn($auxiliaryFiles);

        $result = $this->invokePrivateMethod($this->sut, 'extractScaleAuxiliaryFiles', [$qtiResource]);

        $this->assertCount(2, $result);
        $this->assertContains('scales\\scale1.json', $result);
        $this->assertContains('scales//scale2.json', $result);
    }

    public function testExtractScaleAuxiliaryFilesUpdatesResourceAuxiliaryFiles(): void
    {
        $qtiResource = $this->createMock(Resource::class);
        $originalFiles = [
            'styles/main.css',
            'scales/rubric_scale.json',
            'images/logo.png',
        ];

        $qtiResource->method('getAuxiliaryFiles')->willReturn($originalFiles);

        $qtiResource->expects($this->once())
            ->method('setAuxiliaryFiles')
            ->with([
                'styles/main.css',
                'images/logo.png',
            ]);

        $this->invokePrivateMethod($this->sut, 'extractScaleAuxiliaryFiles', [$qtiResource]);
    }

    public function testExtractScaleAuxiliaryFilesSkipsEmptyStrings(): void
    {
        $qtiResource = $this->createMock(Resource::class);
        $auxiliaryFiles = [
            'scales/valid.json',
            '',  // Empty string should be skipped
            'scales/another.json',
        ];

        $qtiResource->method('getAuxiliaryFiles')->willReturn($auxiliaryFiles);

        $result = $this->invokePrivateMethod($this->sut, 'extractScaleAuxiliaryFiles', [$qtiResource]);

        $this->assertCount(2, $result);
        $this->assertNotContains('', $result);
    }

    public function testExtractScaleAuxiliaryFilesSkipsNonStringValues(): void
    {
        $qtiResource = $this->createMock(Resource::class);
        $auxiliaryFiles = [
            'scales/valid.json',
            123,  // Non-string value
            null,  // Null value
            'scales/another.json',
        ];

        $qtiResource->method('getAuxiliaryFiles')->willReturn($auxiliaryFiles);

        $result = $this->invokePrivateMethod($this->sut, 'extractScaleAuxiliaryFiles', [$qtiResource]);

        $this->assertCount(2, $result);
        $this->assertContains('scales/valid.json', $result);
        $this->assertContains('scales/another.json', $result);
    }

    public function testExtractScaleAuxiliaryFilesHandlesRootScalesDirectory(): void
    {
        $qtiResource = $this->createMock(Resource::class);
        $auxiliaryFiles = [
            'scales',  // Directory itself
            'scales/file.json',  // File in directory
            'other/file.txt',
        ];

        $qtiResource->method('getAuxiliaryFiles')->willReturn($auxiliaryFiles);

        $result = $this->invokePrivateMethod($this->sut, 'extractScaleAuxiliaryFiles', [$qtiResource]);

        $this->assertContains('scales', $result);
        $this->assertContains('scales/file.json', $result);
        $this->assertNotContains('other/file.txt', $result);
    }

    // ========================================
    // Tests for storeTestScaleFiles()
    // ========================================

    public function testStoreTestScaleFilesDoesNothingWhenScaleFilesIsEmpty(): void
    {
        $testContent = $this->createMock(Directory::class);
        $report = $this->createMock(common_report_Report::class);

        $this->scaleStorageServiceMock->expects($this->never())
            ->method('storeScaleFiles');

        $report->expects($this->never())
            ->method('add');

        $this->invokeProtectedMethod(
            $this->sut,
            'storeTestScaleFiles',
            [$testContent, [], '/tmp/extraction', $report]
        );
    }

    public function testStoreTestScaleFilesCallsScaleStorageService(): void
    {
        $testContent = $this->createMock(Directory::class);
        $report = $this->createMock(common_report_Report::class);
        $scaleFiles = ['scales/rubric.json', 'scales/performance.json'];
        $extractionFolder = '/tmp/test-extraction';

        $this->scaleStorageServiceMock->expects($this->once())
            ->method('storeScaleFiles')
            ->with($testContent, $scaleFiles, $extractionFolder);

        $report->expects($this->never())
            ->method('add');

        $this->invokeProtectedMethod(
            $this->sut,
            'storeTestScaleFiles',
            [$testContent, $scaleFiles, $extractionFolder, $report]
        );
    }

    public function testStoreTestScaleFilesAddsWarningOnException(): void
    {
        $testContent = $this->createMock(Directory::class);
        $report = $this->createMock(common_report_Report::class);
        $scaleFiles = ['scales/invalid.json'];
        $extractionFolder = '/tmp/test';
        $errorMessage = 'Failed to write scale file';

        $exception = new Exception($errorMessage);

        $this->scaleStorageServiceMock->expects($this->once())
            ->method('storeScaleFiles')
            ->willThrowException($exception);

        $report->expects($this->once())
            ->method('add')
            ->with($this->callback(function ($subReport) use ($errorMessage) {
                return $subReport instanceof common_report_Report
                    && $subReport->getType() === common_report_Report::TYPE_WARNING
                    && str_contains($subReport->getMessage(), $errorMessage);
            }));

        $this->invokeProtectedMethod(
            $this->sut,
            'storeTestScaleFiles',
            [$testContent, $scaleFiles, $extractionFolder, $report]
        );
    }

    public function testStoreTestScaleFilesHandlesThrowableException(): void
    {
        $testContent = $this->createMock(Directory::class);
        $report = $this->createMock(common_report_Report::class);
        $scaleFiles = ['scales/file.json'];
        $extractionFolder = '/tmp/test';

        // Use a real RuntimeException which implements Throwable
        $exception = new \RuntimeException('Storage error');

        $this->scaleStorageServiceMock->expects($this->once())
            ->method('storeScaleFiles')
            ->willThrowException($exception);

        $report->expects($this->once())
            ->method('add');

        $this->invokeProtectedMethod(
            $this->sut,
            'storeTestScaleFiles',
            [$testContent, $scaleFiles, $extractionFolder, $report]
        );
    }

    public function testStoreTestScaleFilesWarningMessageContainsExceptionMessage(): void
    {
        $testContent = $this->createMock(Directory::class);
        $report = $this->createMock(common_report_Report::class);
        $scaleFiles = ['scales/file.json'];
        $extractionFolder = '/tmp/test';
        $errorMessage = 'Permission denied when writing to filesystem';

        $exception = new Exception($errorMessage);

        $this->scaleStorageServiceMock->method('storeScaleFiles')
            ->willThrowException($exception);

        $report->expects($this->once())
            ->method('add')
            ->with($this->callback(function ($subReport) use ($errorMessage) {
                $message = $subReport->getMessage();
                return str_contains($message, 'Scale files could not be stored')
                    && str_contains($message, $errorMessage);
            }));

        $this->invokeProtectedMethod(
            $this->sut,
            'storeTestScaleFiles',
            [$testContent, $scaleFiles, $extractionFolder, $report]
        );
    }

    // ========================================
    // Tests for getTestOutcomeDeclarationScales()
    // ========================================

    public function testGetTestOutcomeDeclarationScalesReturnsEmptyArrayWhenScaleDirDoesNotExist(): void
    {
        $test = $this->createMock(core_kernel_classes_Resource::class);
        $scaleDirMock = $this->createMock(Directory::class);

        $this->setupTestFileAndDirectory();

        $this->testDirMock->method('getDirectory')
            ->with(self::SCALE_DIR)
            ->willReturn($scaleDirMock);

        $scaleDirMock->method('exists')->willReturn(false);

        $result = $this->sut->getTestOutcomeDeclarationScales($test);

        $this->assertSame([], $result);
        $this->assertEmpty($result);
    }

    public function testGetTestOutcomeDeclarationScalesParsesValidJsonFiles(): void
    {
        $test = $this->createMock(core_kernel_classes_Resource::class);
        $scaleDirMock = $this->createMock(Directory::class);

        $this->setupTestFileAndDirectory();

        $this->testDirMock->method('getDirectory')
            ->with(self::SCALE_DIR)
            ->willReturn($scaleDirMock);

        $scaleDirMock->method('exists')->willReturn(true);

        $file1 = $this->createScaleFileMock('rubric.json', 'application/json', '{"scale": {"uri": "test"}}');
        $file2 = $this->createScaleFileMock('performance.json', 'application/json', '{"scale": {"values": {}}}');

        $scaleDirMock->method('getIterator')
            ->willReturn(new \ArrayIterator([$file1, $file2]));

        $result = $this->sut->getTestOutcomeDeclarationScales($test);

        $this->assertCount(2, $result);
        $this->assertArrayHasKey('scales/rubric.json', $result);
        $this->assertArrayHasKey('scales/performance.json', $result);
        $this->assertSame(['scale' => ['uri' => 'test']], $result['scales/rubric.json']);
        $this->assertSame(['scale' => ['values' => []]], $result['scales/performance.json']);
    }

    public function testGetTestOutcomeDeclarationScalesSkipsNonJsonFiles(): void
    {
        $test = $this->createMock(core_kernel_classes_Resource::class);
        $scaleDirMock = $this->createMock(Directory::class);

        $this->setupTestFileAndDirectory();

        $this->testDirMock->method('getDirectory')
            ->with(self::SCALE_DIR)
            ->willReturn($scaleDirMock);

        $scaleDirMock->method('exists')->willReturn(true);

        $jsonFile = $this->createScaleFileMock('scale.json', 'application/json', '{"valid": true}');
        $textFile = $this->createScaleFileMock('readme.txt', 'text/plain', 'Not JSON');

        $scaleDirMock->method('getIterator')
            ->willReturn(new \ArrayIterator([$jsonFile, $textFile]));

        $result = $this->sut->getTestOutcomeDeclarationScales($test);

        $this->assertCount(1, $result);
        $this->assertArrayHasKey('scales/scale.json', $result);
        $this->assertArrayNotHasKey('scales/readme.txt', $result);
    }

    public function testGetTestOutcomeDeclarationScalesSkipsMalformedJson(): void
    {
        $test = $this->createMock(core_kernel_classes_Resource::class);
        $scaleDirMock = $this->createMock(Directory::class);

        $this->setupTestFileAndDirectory();

        $this->testDirMock->method('getDirectory')
            ->with(self::SCALE_DIR)
            ->willReturn($scaleDirMock);

        $scaleDirMock->method('exists')->willReturn(true);

        $validFile = $this->createScaleFileMock('valid.json', 'application/json', '{"valid": true}');
        $invalidFile = $this->createScaleFileMock('invalid.json', 'application/json', '{invalid json}');

        $scaleDirMock->method('getIterator')
            ->willReturn(new \ArrayIterator([$validFile, $invalidFile]));

        $result = $this->sut->getTestOutcomeDeclarationScales($test);

        $this->assertCount(1, $result);
        $this->assertArrayHasKey('scales/valid.json', $result);
        $this->assertArrayNotHasKey('scales/invalid.json', $result);
    }

    public function testGetTestOutcomeDeclarationScalesHandlesEmptyDirectory(): void
    {
        $test = $this->createMock(core_kernel_classes_Resource::class);
        $scaleDirMock = $this->createMock(Directory::class);

        $this->setupTestFileAndDirectory();

        $this->testDirMock->method('getDirectory')
            ->with(self::SCALE_DIR)
            ->willReturn($scaleDirMock);

        $scaleDirMock->method('exists')->willReturn(true);
        $scaleDirMock->method('getIterator')->willReturn(new \ArrayIterator([]));

        $result = $this->sut->getTestOutcomeDeclarationScales($test);

        $this->assertSame([], $result);
    }

    public function testGetTestOutcomeDeclarationScalesHandlesComplexScaleStructure(): void
    {
        $test = $this->createMock(core_kernel_classes_Resource::class);
        $scaleDirMock = $this->createMock(Directory::class);

        $this->setupTestFileAndDirectory();

        $this->testDirMock->method('getDirectory')
            ->with(self::SCALE_DIR)
            ->willReturn($scaleDirMock);

        $scaleDirMock->method('exists')->willReturn(true);

        $complexJson = json_encode([
            'scale' => [
                'uri' => 'http://example.com/scale/complex',
                'values' => [
                    ['score' => 0, 'label' => 'Poor'],
                    ['score' => 1, 'label' => 'Good'],
                    ['score' => 2, 'label' => 'Excellent'],
                ],
            ],
            'rubric' => 'Complex rubric text',
        ]);

        $file = $this->createScaleFileMock('complex.json', 'application/json', $complexJson);

        $scaleDirMock->method('getIterator')
            ->willReturn(new \ArrayIterator([$file]));

        $result = $this->sut->getTestOutcomeDeclarationScales($test);

        $this->assertCount(1, $result);
        $this->assertArrayHasKey('scales/complex.json', $result);

        $decoded = $result['scales/complex.json'];
        $this->assertArrayHasKey('scale', $decoded);
        $this->assertArrayHasKey('rubric', $decoded);
        $this->assertSame('http://example.com/scale/complex', $decoded['scale']['uri']);
        $this->assertCount(3, $decoded['scale']['values']);
    }

    public function testGetTestOutcomeDeclarationScalesHandlesUnicodeContent(): void
    {
        $test = $this->createMock(core_kernel_classes_Resource::class);
        $scaleDirMock = $this->createMock(Directory::class);

        $this->setupTestFileAndDirectory();

        $this->testDirMock->method('getDirectory')
            ->with(self::SCALE_DIR)
            ->willReturn($scaleDirMock);

        $scaleDirMock->method('exists')->willReturn(true);

        $unicodeJson = json_encode([
            'scale' => [
                'uri' => 'test',
                'label' => 'Échelle de notation 中文',
            ],
        ], JSON_UNESCAPED_UNICODE);

        $file = $this->createScaleFileMock('unicode.json', 'application/json', $unicodeJson);

        $scaleDirMock->method('getIterator')
            ->willReturn(new \ArrayIterator([$file]));

        $result = $this->sut->getTestOutcomeDeclarationScales($test);

        $this->assertCount(1, $result);
        $this->assertStringContainsString('Échelle', $result['scales/unicode.json']['scale']['label']);
        $this->assertStringContainsString('中文', $result['scales/unicode.json']['scale']['label']);
    }

    // ========================================
    // Helper Methods
    // ========================================

    /**
     * Setup common test file and directory mocks
     */
    private function setupTestFileAndDirectory(): void
    {
        $this->testFileMock->method('getBasename')->willReturn('tao-qtitest-testdefinition.xml');
        $this->testFileMock->method('getPrefix')->willReturn('/test/path/tao-qtitest-testdefinition.xml');

        $this->sut->method('getQtiTestFile')
            ->willReturn($this->testFileMock);

        $this->fileReferenceSerializerMock->method('unserialize')
            ->with($this->stringContains(self::DIR_TAO_QTI_TEST))
            ->willReturn($this->testDirMock);
    }

    /**
     * Create a scale file mock
     *
     * @param string $basename File basename
     * @param string $mimeType File MIME type
     * @param string $content File content
     * @return File|MockObject
     */
    private function createScaleFileMock(string $basename, string $mimeType, string $content): File
    {
        $file = $this->createMock(File::class);
        $file->method('getBasename')->willReturn($basename);
        $file->method('getMimeType')->willReturn($mimeType);
        $file->method('read')->willReturn($content);

        return $file;
    }

    /**
     * Create the service manager mock with required services
     *
     * @return ServiceManager
     */
    private function createServiceManagerMock(): ServiceManager
    {
        return $this->getServiceManagerMock([
            ScaleStorageService::class => $this->scaleStorageServiceMock,
            'generis/fileReferenceSerializer' => $this->fileReferenceSerializerMock,
        ]);
    }

    /**
     * Invoke a private method on an object
     *
     * @param object $object Object instance
     * @param string $methodName Method name
     * @param array $parameters Method parameters
     * @return mixed Method result
     */
    private function invokePrivateMethod(object $object, string $methodName, array $parameters = [])
    {
        $reflection = new \ReflectionClass($object);
        $method = $reflection->getMethod($methodName);
        $method->setAccessible(true);

        return $method->invokeArgs($object, $parameters);
    }

    /**
     * Invoke a protected method on an object
     *
     * @param object $object Object instance
     * @param string $methodName Method name
     * @param array $parameters Method parameters
     * @return mixed Method result
     */
    private function invokeProtectedMethod(object $object, string $methodName, array $parameters = [])
    {
        return $this->invokePrivateMethod($object, $methodName, $parameters);
    }
}
