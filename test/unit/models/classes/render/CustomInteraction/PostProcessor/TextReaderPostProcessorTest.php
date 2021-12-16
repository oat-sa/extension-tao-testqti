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

namespace oat\taoQtiTest\test\unit\models\classes\render\CustomInteraction\PostProcessor;

use oat\generis\test\TestCase;
use oat\taoItems\model\render\ItemAssetsReplacement;
use oat\taoQtiTest\models\classes\render\CustomInteraction\PostProcessor\TextReaderPostProcessor;

class TextReaderPostProcessorTest extends TestCase
{
    private const CONTENT_PREFIX = 'content-';
    private const CONTENT_REPLACER = 'replaced';

    /** @var TextReaderPostProcessor */
    private $subject;

    public function setUp(): void
    {
        $itemAssetsReplacement = $this->createMock(ItemAssetsReplacement::class);
        $itemAssetsReplacement->method('postProcessAssets')->willReturn(self::CONTENT_REPLACER);
        $this->subject = new TextReaderPostProcessor($itemAssetsReplacement);
    }

    /**
     * @dataProvider getCustomInteractionElement
     */
    public function testPostProcessing(array $inputElement, array $expectedElement): void
    {
        $element = ['properties' => $inputElement];
        $this->assertSame($expectedElement, $this->subject->postProcess($element)['properties']);
    }

    public function getCustomInteractionElement(): array
    {
        return [
            'Only data for post-processing' => [
                [
                    self::CONTENT_PREFIX . 'first' => uniqid(self::CONTENT_PREFIX, true),
                    self::CONTENT_PREFIX . 'second' => uniqid(self::CONTENT_PREFIX, true),
                    self::CONTENT_PREFIX . 'third' => uniqid(self::CONTENT_PREFIX, true),
                ], [
                    self::CONTENT_PREFIX . 'first' => self::CONTENT_REPLACER,
                    self::CONTENT_PREFIX . 'second' => self::CONTENT_REPLACER,
                    self::CONTENT_PREFIX . 'third' => self::CONTENT_REPLACER,
                ]
            ],
            'Without data for post-processing' => [
                [
                    'first' => 'first',
                    'second' => 'second',
                    'third' => 'third',
                ], [
                    'first' => 'first',
                    'second' => 'second',
                    'third' => 'third',
                ]
            ],
            'Mixed data for post-processing' => [
                [
                    self::CONTENT_PREFIX . 'first' => uniqid(self::CONTENT_PREFIX, true),
                    self::CONTENT_PREFIX . 'second' => uniqid(self::CONTENT_PREFIX, true),
                    self::CONTENT_PREFIX . 'third' => uniqid(self::CONTENT_PREFIX, true),
                    'first' => 'first',
                    'second' => 'second',
                    'third' => 'third',
                ], [
                    self::CONTENT_PREFIX . 'first' => self::CONTENT_REPLACER,
                    self::CONTENT_PREFIX . 'second' => self::CONTENT_REPLACER,
                    self::CONTENT_PREFIX . 'third' => self::CONTENT_REPLACER,
                    'first' => 'first',
                    'second' => 'second',
                    'third' => 'third',
                ]
            ]
        ];
    }
}
