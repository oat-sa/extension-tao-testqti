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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\classes\metadata;

use DOMDocument;
use DOMNodeList;

class MetadataLomService
{
    public function addPropertiesToMetadataBlock(array $properties, DOMDocument $manifest): void
    {
        /** @var DOMNodeList $metadataBlock */
        $metadataBlock = $manifest->getElementsByTagName('metadata');

        if ($metadataBlock === null) {
            $metadataBlock = $manifest->createElement('metadata');
            $manifest->documentElement->appendChild($metadataBlock);
        }

        $metadataBlock->item(0)
            ->appendChild($manifest->createElement('imsmd:lom'))
            ->appendChild($manifest->createElement('imsmd:metaMetadata'))
            ->appendChild($manifest->createElement('extension'))
            ->appendChild($manifest->createElement('customProperties'));

        foreach ($properties as $property) {
            $propertyNode = $manifest->createElement('property');
            foreach ($property as $key => $value) {
                $propertyNode->appendChild($manifest->createElement($key, $value));
            }
            $metadataBlock->item(0)
                ->getElementsByTagName('customProperties')
                ->item(0)
                ->appendChild($propertyNode);
        }
    }
}
