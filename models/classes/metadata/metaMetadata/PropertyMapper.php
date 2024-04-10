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

namespace oat\taoQtiTest\models\classes\metadata\metaMetadata;

use core_kernel_classes_Property as Property;
use core_kernel_classes_Resource as Resource;
use oat\generis\model\OntologyRdf;
use oat\taoQtiTest\models\classes\metadata\ChecksumGenerator;
use taoTests_models_classes_TestsService;

class PropertyMapper
{
    public const DATATYPE_CHECKSUM = 'checksum';

    private array $metaMetadataCollectionToExport;
    private ChecksumGenerator $checksumGenerator;

    public function __construct(ChecksumGenerator $checksumGenerator, array $metaMetadataCollectionToExport)
    {
        $this->metaMetadataCollectionToExport = $metaMetadataCollectionToExport;
        $this->checksumGenerator = $checksumGenerator;
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

        if (!$this->isIgnoredForCollectionGathering($property)) {
            $fields[self::DATATYPE_CHECKSUM] = $this->checksumGenerator->getRangeChecksum($property);
        }

        return $fields;
    }

    private function isIgnoredForCollectionGathering(Property $property): bool
    {
        return in_array($property->getUri(), $this->getIgnoredProperties());
    }

    private function getIgnoredProperties(): array
    {
        return [
            OntologyRdf::RDF_TYPE,
            taoTests_models_classes_TestsService::PROPERTY_TEST_TESTMODEL,
            RDFS_LABEL
        ];
    }
}
