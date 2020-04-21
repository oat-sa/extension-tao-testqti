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

namespace oat\taoQtiTest\models\runner\toolsStates\DataAccess\Mapper;

use oat\tao\model\service\InjectionAwareService;
use oat\taoQtiTest\models\runner\config\Business\Domain\Option;
use oat\taoQtiTest\models\runner\config\Business\Domain\OptionCollection;

class OptionCollectionMapper extends InjectionAwareService
{
    public const SERVICE_ID = 'taoQtiTest/OptionCollectionMapper';

    /** @noinspection MagicMethodsValidityInspection */
    /** @noinspection PhpMissingParentConstructorInspection */
    public function __construct()
    {
    }

    public function toDomain(array $rawData): OptionCollection
    {
        $resultingOptions = [];

        foreach ($rawData as $tool => $status) {
            $resultingOptions[] = new Option((string)$tool, (bool)$status);
        }

        return new OptionCollection(...$resultingOptions);
    }
}
