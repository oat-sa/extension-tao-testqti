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

namespace oat\taoQtiTest\test\unit\models\classes\metadata;

use DOMDocument;
use oat\taoQtiTest\models\classes\metadata\MetadataLomService;
use PHPUnit\Framework\TestCase;

class MetadataLomServiceTest extends TestCase
{
    public function setUp(): void
    {
        $this->metadataLomService = new MetadataLomService();
    }

    public function testAddPropertiesToMetadataBlock(): void
    {
        $manifest = new DOMDocument();
        $manifest->appendChild($manifest->createElement('metadata'));

        $proerties = [
            [
                'label' => 'label_example',
                'domain' => 'domain_example',
                'alias' => 'alias_example',
                'multiple' => 'multiple_example',
            ],
            [
                'label' => 'label_another_example',
                'domain' => 'domain_another_example',
                'alias' => 'alias_another_example',
                'multiple' => 'multiple_another_example',
            ]
        ];

        $this->metadataLomService->addPropertiesToMetadataBlock($proerties, $manifest);
        self::assertXmlStringEqualsXmlFile(
            __DIR__ . '/imsManifestMetadata.xml',
            $manifest->saveXML()
        );
    }

}
