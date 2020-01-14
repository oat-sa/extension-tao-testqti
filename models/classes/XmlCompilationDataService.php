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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiTest\models;

use qtism\data\QtiComponent;
use qtism\data\storage\xml\XmlCompactDocument;

/**
 * XML Serialization Compilation Data Service.
 *
 * This Compilation Data Service implementation aims at compiling
 * Delivery data as XML serialized data (QTI native format).
 */
class XmlCompilationDataService extends CompilationDataService
{
    const OUTPUT_FILE_TYPE = 'xml';

    public function writeCompilationData(\tao_models_classes_service_StorageDirectory $compilationDirectory, $path, QtiComponent $object)
    {
        $path .= '.' . self::OUTPUT_FILE_TYPE;
        $compactDoc = new XmlCompactDocument();
        $compactDoc->setDocumentComponent($object);
        
        $compilationDirectory->write(
            $path,
            $compactDoc->saveToString()
        );
    }
    
    public function readCompilationData(\tao_models_classes_service_StorageDirectory $compilationDirectory, $path, $cacheInfo = '')
    {
        $path .= '.' . self::OUTPUT_FILE_TYPE;
        $compactDoc = new XmlCompactDocument();
        $compactDoc->loadFromString($compilationDirectory->read($path));

        return $compactDoc->getDocumentComponent();
    }

    /**
     * @return string
     */
    public function getOutputFileType()
    {
        return self::OUTPUT_FILE_TYPE;
    }
}
