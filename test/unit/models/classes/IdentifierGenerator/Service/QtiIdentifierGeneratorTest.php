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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes\IdentifierGenerator\Service;

use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\tao\model\featureFlag\FeatureFlagCheckerInterface;
use oat\tao\model\IdentifierGenerator\Generator\IdentifierGeneratorInterface;
use oat\taoQtiTest\models\IdentifierGenerator\Generator\QtiIdentifierGenerator;
use PHPUnit\Framework\TestCase;

class QtiIdentifierGeneratorTest extends TestCase
{
    public function testGenerateWithoutFeatureFlag(): void
    {
        $resource = $this->createMock(core_kernel_classes_Resource::class);

        $resource
            ->expects($this->once())
            ->method('getLabel')
            ->willReturn('Label');

        $ontology = $this->createMock(Ontology::class);
        $featureFlagChecker = $this->createMock(FeatureFlagCheckerInterface::class);

        $featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_FLAG_UNIQUE_NUMERIC_QTI_IDENTIFIER')
            ->willReturn(false);

        $identifier = (new QtiIdentifierGenerator($ontology, $featureFlagChecker))->generate([
            IdentifierGeneratorInterface::OPTION_RESOURCE => $resource,
        ]);

        $this->assertIsString($identifier);
        $this->assertEquals(8, strlen($identifier));
        $this->assertTrue(ctype_alpha($identifier), 'The string contains non-letter characters."');
    }

    public function testGenerateWithFeatureFlag(): void
    {
        $ontology = $this->createMock(Ontology::class);
        $featureFlagChecker = $this->createMock(FeatureFlagCheckerInterface::class);

        $featureFlagChecker
            ->expects($this->once())
            ->method('isEnabled')
            ->with('FEATURE_FLAG_UNIQUE_NUMERIC_QTI_IDENTIFIER')
            ->willReturn(true);

        $identifier = (new QtiIdentifierGenerator($ontology, $featureFlagChecker))->generate([]);

        $this->assertIsString($identifier);
        $this->assertNotEmpty($identifier);
    }
}
