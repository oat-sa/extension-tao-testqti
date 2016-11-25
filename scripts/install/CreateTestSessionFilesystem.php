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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiTest\scripts\install;

/**
 * Create the Test Session Filesystem.
 * 
 * This filesystem will deal with Qti File persistence that are stored
 * by QTI Assessment Test Sessions.
 * 
 * @package oat\taoQtiTest\scripts\install
 */
class CreateTestSessionFilesystem extends \common_ext_action_InstallAction
{
    public function __invoke($params)
    {
        $serviceManager = \oat\oatbox\service\ServiceManager::getServiceManager();
        $fsService = $serviceManager->get(\oat\oatbox\filesystem\FileSystemService::SERVICE_ID); 
        $fsService->createFileSystem('taoQtiTestSessionFilesystem');
        $serviceManager->register(\oat\oatbox\filesystem\FileSystemService::SERVICE_ID, $fsService);
    }
}
