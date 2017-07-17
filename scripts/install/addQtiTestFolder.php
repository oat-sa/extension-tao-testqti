<?php
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
 * Copyright (c) 2002-2008 (original work) Public Research Centre Henri Tudor & University of Luxembourg (under the project TAO & TAO2);
 *               2008-2010 (update and modification) Deutsche Institut für Internationale Pädagogische Forschung (under the project TAO-TRANSFER);
 *               2009-2012 (update and modification) Public Research Centre Henri Tudor (under the project TAO-SUSTAIN & TAO-DEV);
 * 
 */

/*
 * This post-installation script creates a fodler for the QTI Tests
 */
$dataPath = FILES_PATH . 'taoQtiTest' . DIRECTORY_SEPARATOR. 'testData' . DIRECTORY_SEPARATOR;
if (file_exists($dataPath)) {
    helpers_File::emptyDirectory($dataPath);
}

$serviceManager = oat\oatbox\service\ServiceManager::getServiceManager();
$fsService = $serviceManager->get(oat\oatbox\filesystem\FileSystemService::SERVICE_ID); 
$fsService->createFileSystem('taoQtiTest');
$serviceManager->register(oat\oatbox\filesystem\FileSystemService::SERVICE_ID, $fsService);

taoQtiTest_models_classes_QtiTestService::singleton()->setQtiTestFileSystem('taoQtiTest');
