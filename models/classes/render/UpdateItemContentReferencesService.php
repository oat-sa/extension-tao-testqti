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
use oat\taoQtiTest\models\render\CustomInteraction\CustomInteractionPostProcessorAllocator;

class UpdateItemContentReferencesService
{
    /** @var ItemAssetsReplacement */
    private $itemAssetsReplacement;
    /** @var CustomInteractionPostProcessorAllocator */
    private $customInteractionPostProcessorAllocator;

    public function __construct(
        ItemAssetsReplacement $itemAssetsReplacement,
        CustomInteractionPostProcessorAllocator $customInteractionPostProcessorAllocator
    ) {
        $this->itemAssetsReplacement = $itemAssetsReplacement;
        $this->customInteractionPostProcessorAllocator = $customInteractionPostProcessorAllocator;
    }

    public function __invoke(array $itemContent): array
    {
        if ($this->isQtiItemContent($itemContent)){
            $itemContent = $this->resolveCustomInteractionPostProcessing($itemContent);
        }

        if (empty($itemContent['assets'])) {
            return $itemContent;
        }

        $jsonAssets = [];
        foreach ($itemContent['assets'] as $type => $assets) {
            foreach ($assets as $key => $asset) {
                $jsonAssets[$type][$key] = $this->itemAssetsReplacement->postProcessAssets($asset);
            }
        }

        $itemContent['assets'] = $jsonAssets;

        return $itemContent;
    }

    private function isQtiItemContent($itemContent):bool
    {
        return isset($itemContent['type']) && $itemContent['type'] === 'qti';
    }

    private function resolveCustomInteractionPostProcessing(array $itemContent): array
    {
        foreach ($itemContent['data']['body']['elements'] as &$element) {
            $postProcessorAllocator = $this->customInteractionPostProcessorAllocator->allocatePostProcessor(
                $element['typeIdentifier'] ?? 'null'
            );
            $element = $postProcessorAllocator->postProcess($element);
        }

        return $itemContent;
    }
}
