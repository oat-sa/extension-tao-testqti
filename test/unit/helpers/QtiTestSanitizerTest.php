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

namespace oat\taoQtiTest\test\unit\helpers;

use oat\generis\test\TestCase;
use oat\taoQtiTest\helpers\QtiTestSanitizer;

class QtiTestSanitizerTest extends TestCase
{
    /**
     * @dataProvider sanitizeContentProvider
     */
    public function testSanitizeContent(string $content, string $expected): void
    {
        $this->assertEquals($expected, QtiTestSanitizer::sanitizeContent($content));
    }

    public function sanitizeContentProvider(): array
    {
        return [
            [
                'content' => '<script>alert(123);</script>',
                'expected' => '',
            ],
            [
                'content' => '<script defer>alert(123);</script>',
                'expected' => '',
            ],
            [
                'content' => '&lt;script&gt;alert(123);&lt;/script&gt;',
                'expected' => '',
            ],
            [
                'content' => '<script>' . PHP_EOL . 'alert(123);' . PHP_EOL . '</script>',
                'expected' => '',
            ],
            [
                'content' => '<script>alert(123);<script>alert(123);</script></script>',
                'expected' => '',
            ],
            [
                'content' => '<div>content</div>',
                'expected' => '<div>content</div>',
            ],
            [
                'content' => '<div>content<script>alert(123);</script></div>',
                'expected' => '<div>content</div>',
            ],
            [
                'content' => '<div onload="alert(123);">content</div>',
                'expected' => '<div>content</div>',
            ],
            [
                'content' => '<div onload=&quot;alert(123);&quot;>content</div>',
                'expected' => '<div>content</div>',
            ],
        ];
    }
}
