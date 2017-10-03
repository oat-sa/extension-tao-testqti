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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
 
namespace oat\taoQtiTest\scripts\tools;

use qtism\data\storage\php\PhpDocument;
use qtism\data\storage\php\PhpStorageException;

/**
 * 
 * @package oat\taoQtiTest\scripts\tools
 */
class CompileDeliveriesWithPhpSerialization extends CompileDeliveriesPhpData
{
    protected function compileData($file)
    {
        try {
            $phpDocument = new PhpDocument();
            $phpDocument->loadFromString($file->read());
            $file->put(serialize($phpDocument->getDocumentComponent()));
            
            return true;
        } catch (PhpStorageException $e) {
            
            return false;
        }
    }
}
