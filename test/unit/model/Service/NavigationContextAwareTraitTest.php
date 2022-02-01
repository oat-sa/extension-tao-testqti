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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\model\Service;

use oat\generis\test\TestCase;
use oat\taoQtiTest\model\Service\NavigationContextAwareTrait;


class NavigationContextAwareTraitTest extends TestCase
{
    /** @var NavigationContextAwareTrait */
    private $subject;

    protected function setUp(): void
    {
        $this->subject = $this->getObjectForTrait(
            NavigationContextAwareTrait::class
        );
    }

    /**
     * @dataProvider setNavigationContextDataProvider
     */
    public function testSetNavigationContext(
        string  $expectedDirection,
        string  $expectedScope,
        ?string $expectedRef,
        ?string $direction,
        ?string $scope,
        ?string $ref
    ): void
    {
        $this->subject->setNavigationContext(
            $direction,
            $scope,
            $ref
        );

        $this->assertSame($expectedDirection, $this->subject->getDirection());
        $this->assertSame($expectedScope, $this->subject->getScope());
        $this->assertSame($expectedRef, $this->subject->getRef());
    }

    public function setNavigationContextDataProvider(): array
    {
        return [
            'All parameters set' => [
                'expectedDirection' => 'direction',
                'expectedScope' => 'scope',
                'expectedRef' => 'ref',
                'direction' => 'direction',
                'scope' => 'scope',
                'ref' => 'ref'
            ],
            'No direction set' => [
                'expectedDirection' => '',
                'expectedScope' => 'scope',
                'expectedRef' => 'ref',

                'direction' => null,
                'scope' => 'scope',
                'ref' => 'ref',
            ],
            'No scope set' => [
                'expectedDirection' => 'direction',
                'expectedScope' => '',
                'expectedRef' => 'ref',

                'direction' => 'direction',
                'scope' => null,
                'ref' => 'ref',
            ],
            'No ref set' => [
                'expectedDirection' => 'direction',
                'expectedScope' => 'scope',
                'expectedRef' => null,

                'direction' => 'direction',
                'scope' => 'scope',
                'ref' => null
            ],
        ];
    }
}
