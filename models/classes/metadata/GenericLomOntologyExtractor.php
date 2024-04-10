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

use core_kernel_classes_Resource as Resource;
use core_kernel_classes_Triple as Triple;
use DOMDocument;
use oat\generis\model\data\Ontology;
use oat\taoQtiItem\model\qti\metadata\MetadataExtractionException;
use oat\taoQtiTest\models\classes\metadata\metaMetadata\PropertyMapper;

class GenericLomOntologyExtractor
{
    private Ontology $ontology;
    private PropertyMapper $propertyMapper;
    private MetadataLomService $metadataLomService;

    public function __construct(
        Ontology $ontology,
        PropertyMapper $propertyMapper,
        MetadataLomService $metadataLomService
    ) {
        $this->ontology = $ontology;
        $this->propertyMapper = $propertyMapper;
        $this->metadataLomService = $metadataLomService;
    }

    /**
     * @param Resource[] $resourceCollection
     * @throws MetadataExtractionException
     */
    public function extract(array $resourceCollection, DOMDocument $manifest): void
    {
        $properties = [];

        foreach ($resourceCollection as $resource) {
            if (!$resource instanceof Resource) {
                throw new MetadataExtractionException(
                    __('The given target is not an instance of core_kernel_classes_Resource')
                );
            }

            foreach ($resource->getRdfTriples() as $triple) {
                if ($this->mappingRequired($properties, $triple)) {
                    $properties[] = $this->propertyMapper
                        ->getMetadataProperties(
                            $this->ontology->getProperty($triple->predicate)
                        );
                }
            }
        }

        $this->metadataLomService->addPropertiesToMetadataBlock($properties, $manifest);
    }

    /**
     * Mapping action only applies for confirmed properties that are not already mapped
     */
    private function mappingRequired(array $properties, Triple $triple): bool
    {
        return $this->ontology->getProperty($triple->predicate)->isProperty() &&
            array_filter($properties, function ($property) use ($triple) {
                return $property['uri'] === $triple->predicate;
            }) === [];
    }
}
