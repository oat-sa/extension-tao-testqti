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

use common_Exception;
use DOMDocument;
use InvalidArgumentException;
use oat\generis\test\ServiceManagerMockTrait;
use oat\generis\test\TestCase;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\filesystem\FileSystemService;
use oat\oatbox\service\ServiceManager;
use oat\taoQtiItem\model\qti\Resource;
use oat\taoQtiTest\models\QtiTestUtils;
use PHPUnit\Framework\MockObject\MockObject;

/**
 * Unit tests for QtiTestUtils service
 */
class QtiTestUtilsTest extends TestCase
{
    use ServiceManagerMockTrait;

    private const FILESYSTEM_ID = 'test-filesystem';
    private const TEST_CONTENT_PATH = '/test/content/path';

    private QtiTestUtils $sut;
    private FileSystemService|MockObject $fileSystemServiceMock;

    /**
     * @return void
     */
    public function setUp(): void
    {
        $this->fileSystemServiceMock = $this->createMock(FileSystemService::class);
        $this->sut = new QtiTestUtils();
        $this->sut->setServiceLocator($this->createServiceManagerMock());
    }

    // ========================================
    // Tests for storeQtiResource()
    // ========================================

    /**
     * @return void
     */
    public function testStoreQtiResourceWithStringPath(): void
    {
        $tempFile = $this->createTempFile('test-content');
        try {
            $origin = dirname($tempFile);
            $filePath = basename($tempFile);
            $expectedPath = self::TEST_CONTENT_PATH . DIRECTORY_SEPARATOR . $filePath;

            $this->configureFileSystemMock(true);
            $testContent = $this->createDirectoryMock();

            $result = $this->sut->storeQtiResource($testContent, $filePath, $origin);

            $this->assertSame($expectedPath, $result);
        } finally {
            $this->cleanupTempFile($tempFile);
        }
    }

    /**
     * @return void
     */
    public function testStoreQtiResourceWithResourceObject(): void
    {
        $tempFile = $this->createTempFile('test-content');
        try {
            $origin = dirname($tempFile);
            $fileName = basename($tempFile);
            $expectedPath = self::TEST_CONTENT_PATH . DIRECTORY_SEPARATOR . $fileName;

            $resourceMock = $this->createMock(Resource::class);
            $resourceMock->method('getFile')->willReturn($fileName);

            $this->configureFileSystemMock(true);
            $testContent = $this->createDirectoryMock();

            $result = $this->sut->storeQtiResource($testContent, $resourceMock, $origin);

            $this->assertSame($expectedPath, $result);
        } finally {
            $this->cleanupTempFile($tempFile);
        }
    }

    /**
     * @return void
     */
    public function testStoreQtiResourceWithSubdirectory(): void
    {
        $tempDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'qti-test-' . uniqid();
        mkdir($tempDir);
        $subDir = $tempDir . DIRECTORY_SEPARATOR . 'subdir';
        mkdir($subDir);
        $tempFile = $subDir . DIRECTORY_SEPARATOR . 'test-file.txt';
        file_put_contents($tempFile, 'test content');

        try {
            $filePath = 'subdir/test-file.txt';
            $expectedPath = self::TEST_CONTENT_PATH
                . DIRECTORY_SEPARATOR
                . 'subdir'
                . DIRECTORY_SEPARATOR
                . 'test-file.txt';

            $this->configureFileSystemMock(true);
            $testContent = $this->createDirectoryMock();

            $result = $this->sut->storeQtiResource($testContent, $filePath, $tempDir);

            $this->assertSame($expectedPath, $result);
        } finally {
            unlink($tempFile);
            rmdir($subDir);
            rmdir($tempDir);
        }
    }

    /**
     * @return void
     */
    public function testStoreQtiResourceWithRename(): void
    {
        $tempFile = $this->createTempFile('test-content');
        try {
            $origin = dirname($tempFile);
            $filePath = basename($tempFile);
            $newName = 'renamed-file.txt';
            $expectedPath = self::TEST_CONTENT_PATH . DIRECTORY_SEPARATOR . $newName;

            $this->configureFileSystemMock(true);
            $testContent = $this->createDirectoryMock();

            $result = $this->sut->storeQtiResource($testContent, $filePath, $origin, true, $newName);

            $this->assertSame($expectedPath, $result);
        } finally {
            $this->cleanupTempFile($tempFile);
        }
    }

    /**
     * @return void
     */
    public function testStoreQtiResourceWithoutCopying(): void
    {
        $tempFile = $this->createTempFile('test-content');
        try {
            $origin = dirname($tempFile);
            $filePath = basename($tempFile);
            $expectedPath = self::TEST_CONTENT_PATH . DIRECTORY_SEPARATOR . $filePath;

            // No filesystem mock configuration needed when $copy = false
            $testContent = $this->createDirectoryMock();

            $result = $this->sut->storeQtiResource($testContent, $filePath, $origin, false);

            $this->assertSame($expectedPath, $result);
        } finally {
            $this->cleanupTempFile($tempFile);
        }
    }

    /**
     * @return void
     */
    public function testStoreQtiResourceThrowsOnInvalidResourceType(): void
    {
        $testContent = $this->createDirectoryMock();
        $origin = sys_get_temp_dir();

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage(
            "The 'qtiResource' argument must be a string or a taoQTI_models_classes_QTI_Resource object."
        );

        $this->sut->storeQtiResource($testContent, 123, $origin);
    }

    /**
     * @return void
     */
    public function testStoreQtiResourceThrowsOnUnreadableFile(): void
    {
        $origin = sys_get_temp_dir();
        $filePath = 'non-existent-file.txt';

        $this->configureFileSystemMock(true);
        $testContent = $this->createDirectoryMock();

        $this->expectException(common_Exception::class);
        $this->expectExceptionMessageMatches('/An error occured while copying the QTI resource/');

        $this->sut->storeQtiResource($testContent, $filePath, $origin);
    }

    /**
     * @return void
     */
    public function testStoreQtiResourceThrowsWhenWriteStreamFails(): void
    {
        $tempFile = $this->createTempFile('test-content');
        try {
            $origin = dirname($tempFile);
            $filePath = basename($tempFile);

            // Mock writeStream to fail
            $this->configureFileSystemMock(false);
            $testContent = $this->createDirectoryMock();

            $this->expectException(common_Exception::class);
            $this->expectExceptionMessageMatches('/An error occured while copying the QTI resource/');

            $this->sut->storeQtiResource($testContent, $filePath, $origin);
        } finally {
            $this->cleanupTempFile($tempFile);
        }
    }

    // ========================================
    // Tests for emptyImsManifest()
    // Note: This method uses tao_helpers_Display::textCleaner which requires
    // ApplicationService and other dependencies. This is better suited for
    // integration tests rather than unit tests.
    // ========================================


    // ========================================
    // Helper Methods
    // ========================================

    /**
     * Create a temporary file for testing
     *
     * @param string $content Content to write to the file
     * @return string Path to the created temp file
     */
    private function createTempFile(string $content = 'test content'): string
    {
        $tempFile = tempnam(sys_get_temp_dir(), 'qti-utils-test-');
        if ($tempFile === false) {
            $this->fail('Unable to create temporary file for test.');
        }

        // Rename to add extension since tempnam creates files without extension
        $tempFileWithExt = $tempFile . '.txt';
        rename($tempFile, $tempFileWithExt);
        file_put_contents($tempFileWithExt, $content);

        return $tempFileWithExt;
    }

    /**
     * Clean up temporary file
     *
     * @param string $tempFile Path to temp file
     */
    private function cleanupTempFile(string $tempFile): void
    {
        if (file_exists($tempFile)) {
            unlink($tempFile);
        }
    }

    /**
     * Configure the FileSystemService mock for writeStream operation
     *
     * @param bool $writeStreamResult Result of the writeStream operation
     */
    private function configureFileSystemMock(bool $writeStreamResult): void
    {
        $fileSystemMock = $this->getMockBuilder(\stdClass::class)
            ->addMethods(['writeStream'])
            ->getMock();
        $fileSystemMock->method('writeStream')->willReturn($writeStreamResult);

        $this->fileSystemServiceMock
            ->method('getFileSystem')
            ->with(self::FILESYSTEM_ID)
            ->willReturn($fileSystemMock);
    }

    /**
     * Create a Directory mock
     *
     * @return Directory|MockObject
     */
    private function createDirectoryMock(): Directory
    {
        $fileSystemMock = $this->getMockBuilder(\stdClass::class)
            ->addMethods(['getId'])
            ->getMock();
        $fileSystemMock->method('getId')->willReturn(self::FILESYSTEM_ID);

        $directory = $this->createMock(Directory::class);
        $directory->method('getFileSystem')->willReturn($fileSystemMock);
        $directory->method('getPrefix')->willReturn(self::TEST_CONTENT_PATH);

        return $directory;
    }

    /**
     * Create the service manager mock with required services
     *
     * @return ServiceManager
     */
    private function createServiceManagerMock(): ServiceManager
    {
        return $this->getServiceManagerMock([
            FileSystemService::SERVICE_ID => $this->fileSystemServiceMock,
        ]);
    }
}
