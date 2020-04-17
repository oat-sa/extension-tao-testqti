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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA;
 */
declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes\runner\config\Business\Domain;

use oat\generis\test\TestCase;
use oat\taoQtiTest\models\runner\config\Business\Domain\Option;
use oat\taoQtiTest\models\runner\config\Business\Domain\OptionCollection;

class OptionCollectionTest extends TestCase
{
    /**
     * @param OptionCollection $sut
     * @param callable         $callback
     * @param Option           ...$expected
     *
     * @dataProvider dataProvider
     */
    public function testFilter(OptionCollection $sut, callable $callback, Option ...$expected): void
    {
        $this->assertEquals(
            $expected,
            iterator_to_array($sut->filter($callback))
        );
    }

    public function dataProvider(): array
    {
        return [
            'Filter one'      => [
                new OptionCollection(
                    new Option('opt_1', true),
                    new Option('opt_2', true),
                    new Option('opt_3', false)
                ),
                $this->createFilteringOutCallback('opt_2'),
                new Option('opt_1', true),
                new Option('opt_3', false),
            ],
            'Filter multiple' => [
                new OptionCollection(
                    new Option('opt_1', true),
                    new Option('opt_2', true),
                    new Option('opt_3', false)
                ),
                $this->createFilteringOutCallback('opt_2', 'opt_1'),
                new Option('opt_3', false),
            ],
            'Filter none' => [
                new OptionCollection(
                    new Option('opt_1', true),
                    new Option('opt_2', true),
                    new Option('opt_3', false)
                ),
                $this->createFilteringOutCallback('opt_4'),
                new Option('opt_1', true),
                new Option('opt_2', true),
                new Option('opt_3', false)
            ],
        ];
    }

    private function createFilteringOutCallback(string ...$optionIds): callable
    {
        return static function (Option $option) use ($optionIds): bool {
            return !in_array($option->getId(), $optionIds, true);
        };
    }
}
