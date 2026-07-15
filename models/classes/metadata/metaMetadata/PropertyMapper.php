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
 * Copyright (c) 2024-2026 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\classes\metadata\metaMetadata;

use core_kernel_classes_Property as Property;
use core_kernel_classes_Resource as Resource;

class PropertyMapper
{
    private array $metaMetadataCollectionToExport;

    public function __construct(array $metaMetadataCollectionToExport)
    {
        $this->metaMetadataCollectionToExport = $metaMetadataCollectionToExport;
    }

    public function getMetadataProperties(Property $property): array
    {
        $fields = [];

        foreach ($this->metaMetadataCollectionToExport as $key => $stringProperty) {
            $fields['uri'] = $property->getUri();
            $metaProperty = $property->getOnePropertyValue(new Property($stringProperty));
            if ($metaProperty !== null) {
                $fields[$key] = $metaProperty instanceof Resource
                    ? $metaProperty->getUri()
                    : (string) $metaProperty;
            }
        }

        return $fields;
    }
}
