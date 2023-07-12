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
 * Copyright (c) 2023 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes;

use oat\taoQtiTest\models\event\QtiTestsDeletedEvent;
use PHPUnit\Framework\TestCase;

class QtiTestsDeletedEventTest extends TestCase
{
    /**
     * @dataProvider removesDuplicatesDataProvider
     */
    public function testRemovesDuplicates(
        array $expectedTestUris,
        array $expectedItemClassesUris,
        array $expectedReferencedResources,
        array $testUris,
        array $itemClassesUris,
        array $referencedResources
    ): void {
        $event = new QtiTestsDeletedEvent(
            $testUris,
            $itemClassesUris,
            $referencedResources
        );

        $this->assertEquals(QtiTestsDeletedEvent::class, $event->getName());
        $this->assertEquals(
            $expectedTestUris,
            $event->getTestUris()
        );
        $this->assertEquals(
            $expectedItemClassesUris,
            $event->getItemClassesUri()
        );
        $this->assertEquals(
            $expectedReferencedResources,
            $event->getReferencedResources()
        );
    }

    public function removesDuplicatesDataProvider(): array
    {
        return [
            'Duplicated URIs on all parameters' => [
                'expectedTestUris' => [
                    'http://host/test1',
                    'http://host/test2',
                    'http://host/test3',
                ],
                'expectedItemClassesUris' => [
                    'http://host/itemClass1',
                    'http://host/itemClass2',
                    'http://host/itemClass3',
                ],
                'expectedReferencedResources' => [
                    'http://host/resource1',
                    'http://host/resource2',
                    'http://host/resource3',
                ],
                'testUris' => [
                    'http://host/test1',
                    'http://host/test1',
                    'http://host/test2',
                    'http://host/test2',
                    'http://host/test3',
                    'http://host/test3',
                ],
                'itemClassesUris' => [
                    'http://host/itemClass1',
                    'http://host/itemClass2',
                    'http://host/itemClass3',
                    'http://host/itemClass3',
                ],
                'referencedResources' => [
                    'http://host/resource1',
                    'http://host/resource1',
                    'http://host/resource2',
                    'http://host/resource2',
                    'http://host/resource3',
                ],
            ]
        ];
    }
}
