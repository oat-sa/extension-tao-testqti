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

namespace oat\taoQtiTest\models\classes\render\CustomInteraction\PostProcessor;

use DOMDocument;
use oat\taoItems\model\render\ItemAssetsReplacement;
use oat\taoQtiTest\models\classes\render\CustomInteraction\PostProcessor\Api\CustomInteractionPostProcessorInterface;

class TextReaderPostProcessor implements CustomInteractionPostProcessorInterface
{
    public const INTERACTION_IDENTIFIER = 'textReaderInteraction';
    private const CONTENT_PREFIX = 'content-';

    /** @var ItemAssetsReplacement */
    private $itemAssetsReplacement;

    public function __construct(ItemAssetsReplacement $itemAssetsReplacement)
    {
        $this->itemAssetsReplacement = $itemAssetsReplacement;
    }

    public function postProcess(array $element): array
    {
        foreach ($element['properties'] as $key => &$value) {
            if (strpos($key, self::CONTENT_PREFIX) === 0) {
                $value = $this->itemAssetsReplacement->postProcessAssets($value);
            }
        }
        unset($value);

        $element['properties'] = $this->replaceImageSourcesInPages($element['properties']);

        return $element;
    }

    private function replaceImageSourcesInPages(array $properties): array
    {
        if (!isset($properties['pages'])) {
            return $properties;
        }

        $pages = $this->normalizePages($properties['pages']);
        if ($pages === []) {
            return $properties;
        }

        $contentUrls = $this->extractContentUrls($properties);
        if ($contentUrls === []) {
            return $properties;
        }

        $updatedPages = [];

        foreach ($pages as $page) {
            if (!isset($page['content']) || !is_array($page['content'])) {
                $updatedPages[] = $page;
                continue;
            }

            foreach ($page['content'] as $index => $content) {
                if (!is_string($content) || $content === '') {
                    continue;
                }

                $page['content'][$index] = $this->replaceImageSourcesInContent($content, $contentUrls);
            }

            $updatedPages[] = $page;
        }

        $properties['pages'] = is_string($properties['pages'])
            ? json_encode($updatedPages)
            : $updatedPages;

        return $properties;
    }

    private function normalizePages($pages): array
    {
        try {
            return json_decode($pages, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $_) {
            return is_array($pages) ? $pages : [];
        }
    }

    private function extractContentUrls(array $properties): array
    {
        return array_values(
            array_filter(
                $properties,
                static fn ($value, $key): bool => strpos((string) $key, self::CONTENT_PREFIX) === 0
                    && is_string($value)
                    && $value !== '',
                ARRAY_FILTER_USE_BOTH
            )
        );
    }

    private function replaceImageSourcesInContent(string $content, array &$contentUrls): string
    {
        if ($contentUrls === []) {
            return $content;
        }

        $previousState = libxml_use_internal_errors(true);

        try {
            $dom = new DOMDocument();
            $dom->loadHTML('<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' . $content);
            libxml_clear_errors();

            foreach ($dom->getElementsByTagName('img') as $image) {
                $replacement = array_shift($contentUrls);
                if ($replacement === null) {
                    break;
                }

                $image->setAttribute('src', $replacement);
            }

            $body = $dom->getElementsByTagName('body')->item(0);
            if ($body === null) {
                return $content;
            }

            $result = '';
            foreach ($body->childNodes as $childNode) {
                $result .= $dom->saveHTML($childNode);
            }

            return $result;
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previousState);
        }
    }
}
