<?php declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes\creator;

use core_kernel_classes_Class;
use oat\generis\test\MockObject;
use oat\generis\test\TestCase;
use oat\tao\model\resources\ResourceLookup;
use oat\tao\model\resources\SecureResourceService;
use oat\tao\model\resources\TreeResourceLookup;
use oat\taoItems\model\CategoryService;
use oat\taoQtiTest\models\creator\TreeItemLookup;
use Zend\ServiceManager\ServiceLocatorInterface;

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
class TreeItemLookupTest extends TestCase
{
    /** @var array */
    private $resources = [];

    /** @var array */
    private $readableResourceMap = [];

    /** @var core_kernel_classes_Class */
    private $rootMock;

    /** @var CategoryService|MockObject */
    private $categoryServiceMock;

    /** @var ResourceLookup|MockObject */
    private $resourceLookupMock;

    /** @var SecureResourceService|MockObject */
    private $secureResourceServiceMock;

    /** @var ServiceLocatorInterface */
    private $serviceLocatorMock;

    /** @var TreeItemLookup */
    private $sut;

    public function setUp(): void
    {
        $this->initializeTestDoubles();
        $this->initializeTestDoubleExpectancies();
        $this->initializeServiceLocator();
        $this->initializeSut();
        parent::setUp();
    }

    public function initializeTestDoubles(): void
    {
        $this->rootMock                  = $this->createMock(core_kernel_classes_Class::class);
        $this->categoryServiceMock       = $this->createMock(CategoryService::class);
        $this->resourceLookupMock        = $this->createMock(ResourceLookup::class);
        $this->secureResourceServiceMock = $this->createPartialMock(SecureResourceService::class, ['getAllChildren']);
    }

    public function initializeTestDoubleExpectancies(): void
    {
        $this->resourceLookupMock
            ->expects(static::once())
            ->method('getResources')
            ->with($this->rootMock, [], [], 0, 30)
            ->willReturnCallback([$this, 'getResources']);

        $this->categoryServiceMock
            ->method('getItemCategories')
            ->willReturn([]);

        $this->secureResourceServiceMock
            ->method('getAllChildren')
            ->with($this->rootMock)
            ->willReturnCallback([$this, 'getReadableResourceMap']);
    }

    public function initializeServiceLocator(): void
    {
        $this->serviceLocatorMock = $this->createMock(ServiceLocatorInterface::class);

        $this->serviceLocatorMock
            ->method('get')
            ->willReturnMap(
                [
                    [CategoryService::SERVICE_ID, $this->categoryServiceMock],
                    [TreeResourceLookup::SERVICE_ID, $this->resourceLookupMock],
                    [SecureResourceService::SERVICE_ID, $this->secureResourceServiceMock],
                ]
            );
    }

    public function initializeSut(): void
    {
        $this->sut = $this->createPartialMock(TreeItemLookup::class, ['getServiceLocator']);

        $this->sut
            ->method('getServiceLocator')
            ->willReturn($this->serviceLocatorMock);
    }

    public function getResources(): array
    {
        return $this->resources;
    }

    public function getReadableResourceMap(): array
    {
        return $this->readableResourceMap;
    }

    public function dataProvider(): array
    {
        return [
            'Empty'           => [
                'expected' => [],
            ],
            'No restrictions' => [
                'expected'            => [
                    [
                        'uri'        => 'http://root',
                        'children'   => [
                            [
                                'uri'        => 'http://child#1',
                                'type'       => 'instance',
                                'categories' => [],
                            ],
                        ],
                    ],
                ],
                'resources'           => [
                    [
                        'uri'      => 'http://root',
                        'children' => [
                            [
                                'uri'  => 'http://child#1',
                                'type' => 'instance',
                            ],
                        ],
                    ],
                ],
                'readableResourceMap' => [
                    'http://child#1' => true,
                ],
            ],
            'Restrictions'    => [
                'expected'            => [
                    [
                        'uri'        => 'http://root',
                        'children'   => [
                            [
                                'uri'        => 'http://child#2',
                                'type'       => 'instance',
                                'categories' => [],
                            ],
                            [
                                'uri'        => 'http://child#3',
                                'type'       => 'class',
                            ],
                        ],
                    ],
                ],
                'resources'           => [
                    [
                        'uri'      => 'http://root',
                        'children' => [
                            [
                                'uri'  => 'http://child#1',
                                'type' => 'instance',
                            ],
                            [
                                'uri'  => 'http://child#2',
                                'type' => 'instance',
                            ],
                            [
                                'uri'  => 'http://child#3',
                                'type' => 'class',
                            ],
                        ],
                    ],
                ],
                'readableResourceMap' => [
                    'http://child#2' => true,
                ],
            ],
        ];
    }

    /**
     * @noinspection PhpDocMissingThrowsInspection
     *
     * @dataProvider dataProvider
     *
     * @param array $expected
     * @param array $resources
     * @param array $readableResourceMap
     */
    public function testGetItems(array $expected, array $resources = [], array $readableResourceMap = []): void
    {
        $this->resources           = $resources;
        $this->readableResourceMap = $readableResourceMap;

        /** @noinspection PhpUnhandledExceptionInspection */
        $result = $this->sut->getItems($this->rootMock);

        if (!empty($result[0]['children'])) {
            $result[0]['children'] = array_values($result[0]['children']);
        }

        $this->assertEquals($expected, $result);
    }
}
