<?php

namespace oat\taoQtiTest\test\unit\models\classes;

use oat\taoQtiTest\models\event\QtiTestDeletedEvent;
use PHPUnit\Framework\TestCase;

class QtiTestDeletedEventTest extends TestCase
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
        $event = new QtiTestDeletedEvent(
            $testUris,
            $itemClassesUris,
            $referencedResources
        );

        $this->assertEquals(QtiTestDeletedEvent::class, $event->getName());
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
