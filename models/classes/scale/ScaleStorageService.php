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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\scale;

use InvalidArgumentException;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\service\ConfigurableService;
use RuntimeException;

class ScaleStorageService extends ConfigurableService
{
    private const SCALE_DIRECTORY = 'scales';

    /**
     * Copy the provided scale files from the extracted package into the test content directory.
     *
     * @param Directory $testContent Directory where the test content is stored
     * @param string[] $scaleFiles Relative paths (from the extracted package root) to copy
     * @param string $extractionFolder Absolute path to the extracted package root
     */
    public function storeScaleFiles(Directory $testContent, array $scaleFiles, string $extractionFolder): void
    {
        if (empty($scaleFiles)) {
            return;
        }

        $scaleDirectory = $testContent->getDirectory(self::SCALE_DIRECTORY);
        $this->ensureDirectoryExists($scaleDirectory);

        foreach ($scaleFiles as $scaleFile) {
            $this->copyScaleFile($scaleDirectory, $scaleFile, $extractionFolder);
        }
    }

    private function ensureDirectoryExists(Directory $directory): void
    {
        if ($directory->exists()) {
            return;
        }

        $directory->getFileSystem()->createDirectory($directory->getPrefix());
    }

    private function copyScaleFile(Directory $scaleDirectory, string $relativePath, string $extractionFolder): void
    {
        $relativePath = $this->normalizeRelativePath($relativePath);

        if ($relativePath === '') {
            throw new InvalidArgumentException('Empty scale path provided.');
        }

        $sourcePath = rtrim($extractionFolder, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR
            . str_replace('/', DIRECTORY_SEPARATOR, $relativePath);

        if (!is_readable($sourcePath)) {
            throw new RuntimeException(sprintf('Scale file "%s" could not be read.', $relativePath));
        }

        $destinationRelativePath = $this->resolveDestinationPath($relativePath);

        if ($destinationRelativePath === '') {
            throw new InvalidArgumentException('Scale path must include a file name.');
        }

        $destinationDirectory = dirname($destinationRelativePath);

        if ($destinationDirectory !== '.' && $destinationDirectory !== '') {
            $scaleDirectory->getFileSystem()->createDirectory(
                rtrim($scaleDirectory->getPrefix(), '/') . '/' . $destinationDirectory
            );
        }

        $destinationFile = $scaleDirectory->getFile($destinationRelativePath);

        $resource = fopen($sourcePath, 'rb');

        if ($resource === false) {
            throw new RuntimeException(sprintf('Scale file "%s" could not be opened.', $relativePath));
        }

        try {
            $destinationFile->put($resource);
        } finally {
            fclose($resource);
        }
    }

    private function normalizeRelativePath(string $path): string
    {
        $path = str_replace('\\', '/', $path);
        $path = preg_replace('#/+#', '/', $path) ?? $path;
        $segments = array_filter(explode('/', ltrim($path, '/')), static function (string $segment): bool {
            return $segment !== '' && $segment !== '.';
        });

        $sanitized = [];

        foreach ($segments as $segment) {
            if ($segment === '..') {
                array_pop($sanitized);
                continue;
            }

            $sanitized[] = $segment;
        }

        return implode('/', $sanitized);
    }

    private function resolveDestinationPath(string $path): string
    {
        if ($path === self::SCALE_DIRECTORY) {
            return '';
        }

        $needle = self::SCALE_DIRECTORY . '/';
        $position = strpos($path, $needle);

        if ($position === false) {
            return basename($path);
        }

        $stripped = substr($path, $position + strlen($needle));

        if ($stripped === '' || $stripped === false) {
            return basename($path);
        }

        return ltrim($stripped, '/');
    }
}
