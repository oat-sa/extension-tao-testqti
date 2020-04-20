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
 *
 * @author Sergei Mikhailov <sergei.mikhailov@taotesting.com>
 */
declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes\runner\toolsStates\DataAccess\Repository;

use oat\generis\test\MockObject;
use oat\generis\test\TestCase;
use oat\taoQtiTest\models\runner\config\Business\Domain\Option;
use oat\taoQtiTest\models\runner\config\Business\Domain\OptionCollection;
use oat\taoQtiTest\models\runner\toolsStates\DataAccess\Repository\AbstractOverriddenToolsRepository;
use oat\taoQtiTest\models\TestCategoryPreset;
use oat\taoQtiTest\models\TestCategoryPresetProvider;

class OverriddenToolsRepositoryTest extends TestCase
{
    /** @var TestCategoryPresetProvider|MockObject */
    private $presetRepository;

    /** @var OptionCollection */
    private $unfilteredOptions;

    /** @var AbstractOverriddenToolsRepository */
    private $sut;

    /**
     * @before
     */
    public function init(): void
    {
        $this->presetRepository = $this->createMock(TestCategoryPresetProvider::class);

        $this->sut = new class (
            $this->presetRepository,
            function (): OptionCollection {
                return $this->unfilteredOptions;
            }
        ) extends AbstractOverriddenToolsRepository {
            private $unfilteredOptionsProvider;

            public function __construct(
                TestCategoryPresetProvider $presetRepository,
                callable $unfilteredOptionsProvider
            ) {
                parent::__construct($presetRepository);

                $this->unfilteredOptionsProvider = $unfilteredOptionsProvider;
            }

            protected function findAllUnfiltered(): OptionCollection
            {
                return call_user_func($this->unfilteredOptionsProvider);
            }
        };
    }

    /**
     * @param OptionCollection   $expected
     * @param OptionCollection   $unfilteredOption
     * @param TestCategoryPreset ...$availableToolPresets
     *
     * @dataProvider dataProvider
     */
    public function testFindAll(
        OptionCollection $expected,
        OptionCollection $unfilteredOption,
        TestCategoryPreset ...$availableToolPresets
    ): void {
        $this->unfilteredOptions = $unfilteredOption;
        $this->presetRepository
            ->expects(iterator_to_array($unfilteredOption) ? static::once() : static::never())
            ->method('findPresetGroupOrFail')
            ->willReturn(['presets' => $availableToolPresets]);

        $this->assertEquals($expected, $this->sut->findAll());
    }

    public function dataProvider(): array
    {
        return [
            'Matching options' => [
                new OptionCollection(
                    new Option('opt_1', true),
                    new Option('opt_2', false)
                ),
                new OptionCollection(
                    new Option('opt_1', true),
                    new Option('opt_2', false)
                ),
                $this->createPreset('opt_1'),
                $this->createPreset('opt_2'),
                $this->createPreset('opt_3'),
            ],
            'Extra options' => [
                new OptionCollection(
                    new Option('opt_1', true),
                    new Option('opt_2', false)
                ),
                new OptionCollection(
                    new Option('opt_1', true),
                    new Option('opt_2', false),
                    new Option('opt_4', false)
                ),
                $this->createPreset('opt_1'),
                $this->createPreset('opt_2'),
                $this->createPreset('opt_3'),
            ],
            'Empty unfiltered options' => [
                new OptionCollection(),
                new OptionCollection(),
                $this->createPreset('opt_1'),
                $this->createPreset('opt_2'),
                $this->createPreset('opt_3'),
            ]
        ];
    }

    private function createPreset(string $id): TestCategoryPreset
    {
        /** @noinspection PhpUnhandledExceptionInspection */
        return new TestCategoryPreset($id, 'test', 'test', []);
    }
}
