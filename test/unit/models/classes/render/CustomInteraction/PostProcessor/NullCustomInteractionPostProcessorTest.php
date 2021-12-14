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
use oat\taoQtiTest\models\classes\render\CustomInteraction\PostProcessor\NullCustomInteractionPostProcessor;

class NullCustomInteractionPostProcessorTest extends TestCase
{
    /**
     * @var NullCustomInteractionPostProcessor
     */
    private $subject;

    public function setUp(): void
    {
        $this->subject = new NullCustomInteractionPostProcessor();
    }

    public function testNullPostProcessing(): void
    {
        $element = ['properties' => []];
        for ($i = 0, $iMax = random_int(1, 10); $i < $iMax; $i++) {
            $element['properties'][uniqid('prefix', true)] = uniqid((string) $i, true);
        }

        $this->assertSame($element, $this->subject->postProcess($element));
    }
}
