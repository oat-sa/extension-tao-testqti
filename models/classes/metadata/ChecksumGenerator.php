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

use common_Logger;
use core_kernel_classes_Property as Property;
use oat\generis\model\data\Ontology;

class ChecksumGenerator
{
    private Ontology $ontology;

    public function __construct(Ontology $ontology)
    {
        $this->ontology = $ontology;
    }

    public function getRangeChecksum(Property $property): string
    {
        $checksum = '';

        $resourceList = array_filter($property->getRange()->getNestedResources(), function ($range) {
            return $range['isclass'] === 0;
        });

        if (empty($resourceList)) {
            return '';
        }
        $labels = [];
        foreach ($resourceList as $resource) {
            $labels[] = strtolower($this->ontology->getResource($resource['id'])->getLabel());
        }
        asort($labels);
        $checksum = implode('', $labels);
        common_Logger::e(sprintf('ChecksumGenerator resource before sha1 : "%s"',  $checksum));
        return sha1(trim($checksum));
    }
}
