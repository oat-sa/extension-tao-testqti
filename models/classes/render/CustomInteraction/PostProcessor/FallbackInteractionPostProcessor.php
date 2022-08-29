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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\render\CustomInteraction\PostProcessor;

use oat\taoItems\model\render\ItemAssetsReplacement;
use oat\taoItems\model\render\NoneItemReplacement;
use oat\taoQtiTest\models\render\CustomInteraction\PostProcessor\Api\CustomInteractionPostProcessorInterface;

class FallbackInteractionPostProcessor implements CustomInteractionPostProcessorInterface
{
    public const INTERACTION_IDENTIFIER = 'null';

    private const ASSET_REPLACER_PATTERN_OPTION = 'pattern';

    /** @var ItemAssetsReplacement */
    private $itemAssetsReplacement;

    public function __construct(ItemAssetsReplacement $itemAssetsReplacement)
    {
        $this->itemAssetsReplacement = $itemAssetsReplacement;
    }

    public function postProcess(array $element): array
    {
        if (! ($this->itemAssetsReplacement instanceof NoneItemReplacement) ) {
            $element = $this->iterateOverItemJson($element);
        }

        return $element;
    }

    private function iterateOverItemJson(array $jsonArray): array
    {
        $url = ROOT_URL;
        $parsedUrl = parse_url($url);
        $rootUrl = $parsedUrl['scheme'] . '://' . $parsedUrl['host'];

        foreach ($jsonArray as $key => $elem) {
            if (is_array($elem)) {
                if ($key === 'assets') {
                    continue;
                }
                $elemA = $this->iterateOverItemJson($elem);
                $jsonArray[$key] = $elemA;
            } else {
                if (is_string($elem) && false !== strpos($elem, $rootUrl)) {
                    if (0 === strpos($elem, 'https') && false === strpos($elem, 'Signature=')) {
                        $elemS = $this->itemAssetsReplacement->postProcessAssets($elem);
                        $jsonArray[$key] = $elemS;
                    } else {
                        $elemStripped = $elem;
                        $pattern = $this->itemAssetsReplacement->getOption(self::ASSET_REPLACER_PATTERN_OPTION);
                        preg_match_all($pattern, $elemStripped, $matches);
                        foreach ($matches[1] as $match) {
                            if (false !== strpos($match, $rootUrl) && false === strpos($elem, 'Signature=')) {
                                $elemStripped = str_replace($match, $this->itemAssetsReplacement->postProcessAssets($match), $elemStripped);
                            }
                        }
                        $jsonArray[$key] = $elemStripped;
                    }
            }
            }
        }
        return $jsonArray;
    }
}
