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

use oat\generis\model\data\Ontology;
use oat\generis\model\DependencyInjection\ContainerServiceProviderInterface;
use oat\generis\model\GenerisRdf;
use oat\taoQtiTest\models\classes\metadata\metaMetadata\PropertyMapper;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

use function Symfony\Component\DependencyInjection\Loader\Configurator\service;

class MetadataServiceProvider implements ContainerServiceProviderInterface
{
    public function __invoke(ContainerConfigurator $configurator): void
    {
        $services = $configurator->services();
        $services->set(MetadataLomService::class, MetadataLomService::class);

        $services->set(PropertyMapper::class, PropertyMapper::class)
            ->args([
                service(Ontology::SERVICE_ID),
                [
                    'label' => RDFS_LABEL,
                    'domain' => RDFS_DOMAIN,
                    'alias' => GenerisRdf::PROPERTY_ALIAS,
                    'multiple' => GenerisRdf::PROPERTY_MULTIPLE
                ]
            ]);

        $services
            ->set(GenericLomOntologyExtractor::class, GenericMetadataExtractor::class)
            ->public()
            ->args([
                service(Ontology::SERVICE_ID),
                service(PropertyMapper::class),
                service(MetadataLomService::class)
            ]);
    }
}
