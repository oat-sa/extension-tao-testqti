<?php

declare(strict_types=1);

/*
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
 * Copyright (c) 2013-2020 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

use oat\oatbox\service\ServiceManager;

$testService = ServiceManager::getServiceManager()->get(taoQtiTest_models_classes_QtiTestService::class);
$testClass = $testService->getRootClass();
$samplesDirectory = new DirectoryIterator(__DIR__);

try {
    foreach ($samplesDirectory as $file) {
        if ($file->isReadable() && $file->isFile() && 'zip' === $file->getExtension()) {
            $report = $testService->importMultipleTests($testClass, $file->getRealPath());
        }
    }
} catch (Throwable $e) {
    common_Logger::e(
        'An error occurred while importing QTI Test Example. The system reported the following error: '
            . $e->getMessage()
    );
    throw $e;
}
