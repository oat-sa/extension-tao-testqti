<?php

/*
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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA
 */
declare(strict_types=1);

namespace oat\taoQtiTest\models\render;

use oat\taoItems\model\render\ItemAssetsReplacement;

class UpdateItemContentReferencesService
{
    /**
     * @var ItemAssetsReplacement
     */
    private $itemAssetsReplacement;

    public function __construct(ItemAssetsReplacement $itemAssetsReplacement)
    {
        $this->itemAssetsReplacement = $itemAssetsReplacement;
    }

    public function __invoke(array $itemContent): array
    {

        $jsonAssets = [];

        if (empty($itemContent['assets'])) {
            return $itemContent;
        }

        foreach ($itemContent['assets'] as $type => $assets) {
            foreach ($assets as $key => $asset) {
                $jsonAssets[$type][$key] = $this->itemAssetsReplacement->postProcessAssets($asset);
            }
        }

        $itemContent['assets'] = $jsonAssets;

        return $itemContent;
    }
}
