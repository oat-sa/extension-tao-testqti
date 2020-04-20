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

namespace oat\taoQtiTest\models\runner\toolsStates\DataAccess\Repository;

use oat\tao\model\service\InjectionAwareService;
use oat\taoQtiTest\models\runner\config\Business\Contract\OverriddenOptionsRepositoryInterface;
use oat\taoQtiTest\models\runner\config\Business\Domain\Option;
use oat\taoQtiTest\models\runner\config\Business\Domain\OptionCollection;
use oat\taoQtiTest\models\TestCategoryPreset;
use oat\taoQtiTest\models\TestCategoryPresetProvider;
use RuntimeException;

abstract class OverriddenToolsRepositoryAbstract
    extends InjectionAwareService
    implements OverriddenOptionsRepositoryInterface
{
    /** @var TestCategoryPresetProvider */
    protected $presetRepository;

    /** @var int[]|null */
    private $availableToolIds;

    /** @noinspection MagicMethodsValidityInspection */
    /** @noinspection PhpMissingParentConstructorInspection */
    public function __construct(TestCategoryPresetProvider $presetRepository)
    {
        $this->presetRepository = $presetRepository;
    }

    /**
     * @inheritDoc
     */
    public function findAll(): OptionCollection
    {
        return $this
            ->findAllUnfiltered()
            ->filter(
                function (Option $option): bool {
                    return in_array($option->getId(), $this->fetchAvailableToolIds(), true);
                }
            );
    }

    abstract protected function findAllUnfiltered(): OptionCollection;

    private function fetchAvailableToolIds(): array
    {
        if (null === $this->availableToolIds) {
            try {
                $this->availableToolIds = array_map(
                    static function (TestCategoryPreset $preset): string {
                        return $preset->getId();
                    },
                    $this->presetRepository->findPresetGroupOrFail(TestCategoryPresetProvider::GROUP_TOOLS)['presets']
                );
            } catch (RuntimeException $exception) {
                $this->availableToolIds = [];
            }
        }

        return $this->availableToolIds;
    }
}
