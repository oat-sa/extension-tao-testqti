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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA;
 */
declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes\creator;

use common_session_AnonymousSession;
use core_kernel_classes_Class;
use oat\generis\test\MockObject;
use oat\generis\test\TestCase;
use oat\oatbox\session\SessionService;
use oat\tao\model\resources\ResourceLookup;
use oat\tao\model\resources\ResourceService;
use oat\tao\model\resources\TreeResourceLookup;
use oat\taoItems\model\CategoryService;
use oat\taoQtiTest\models\creator\TreeItemLookup;
use Zend\ServiceManager\ServiceLocatorInterface;

class TreeItemLookupTest extends TestCase
{
    /** @var array */
    private $resources = [];

    /** @var core_kernel_classes_Class */
    private $rootMock;

    /** @var CategoryService|MockObject */
    private $categoryServiceMock;

    /** @var ResourceLookup|MockObject */
    private $resourceLookupMock;

    /** @var ServiceLocatorInterface */
    private $serviceLocatorMock;

    /** @var TreeItemLookup */
    private $sut;

    /** @var ResourceService|MockObject */
    private $resourceServiceMock;

    /** @var SessionService|MockObject */
    private $sessionServiceMock;

    /** @var array */
    private $permissions;

    public function setUp(): void
    {
        $this->initializeTestDoubles();
        $this->initializeServiceLocator();
        $this->initializeSut();
        parent::setUp();
    }

    public function initializeTestDoubles(): void
    {
        $this->rootMock = $this->createMock(core_kernel_classes_Class::class);
        $this->categoryServiceMock = $this->createMock(CategoryService::class);
        $this->resourceLookupMock = $this->createMock(ResourceLookup::class);
        $this->resourceServiceMock = $this->createMock(ResourceService::class);
        $this->sessionServiceMock     = $this->createMock(SessionService::class);
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

        $sessionMock = new common_session_AnonymousSession();
        $this->sessionServiceMock
            ->method('getCurrentSession')
            ->willReturn($sessionMock);

        $self = $this;
        $this->resourceServiceMock
            ->method('getResourcesPermissions')
            ->willReturnCallback(static function($user, $resources) use ($self) {
                $data = [];
                foreach ($self->permissions as $uri) {
                    $data[$uri] = ['GRANT'];
                }
                return [
                    'supportedRights' => ['GRANT', 'WRITE', 'READ'],
                    'data' => $data,
                ];
            });
    }

    public function initializeServiceLocator(): void
    {
        $this->serviceLocatorMock = $this->getServiceLocatorMock(
            [
                CategoryService::SERVICE_ID    => $this->categoryServiceMock,
                TreeResourceLookup::SERVICE_ID => $this->resourceLookupMock,
                ResourceService::SERVICE_ID => $this->resourceServiceMock,
                SessionService::SERVICE_ID => $this->sessionServiceMock,
            ]
        );
    }

    public function initializeSut(): void
    {
        $this->sut = new TreeItemLookup();
        $this->sut->setServiceLocator($this->serviceLocatorMock);
    }

    public function getResources(): array
    {
        return $this->resources;
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
                        'uri'      => 'http://root',
                        'type'     => 'class',
                        'accessMode' => 'allowed',
                        'children' => [
                            [
                                'uri'        => 'http://child#1',
                                'type'       => 'instance',
                                'categories' => [],
                                'accessMode' => 'allowed',
                            ],
                        ],
                    ],
                ],
                'resources'           => [
                    [
                        'uri'      => 'http://root',
                        'type'     => 'class',
                        'children' => [
                            [
                                'uri'  => 'http://child#1',
                                'type' => 'instance',
                            ],
                        ],
                    ],
                ],
                'readableResourceMap' => [
                    'http://child#1',
                    'http://root'
                ],
            ],
            'Restrictions'    => [
                'expected'            => [
                    [
                        'uri'      => 'http://root',
                        'type'     => 'class',
                        'accessMode' => 'denied',
                        'children' => [
                            [
                                'uri'  => 'http://child#1',
                                'type' => 'instance',
                                'accessMode' => 'denied',
                                'categories' => [],
                            ],
                            [
                                'uri'        => 'http://child#2',
                                'type'       => 'instance',
                                'categories' => [],
                                'accessMode' => 'allowed'
                            ],
                            [
                                'uri'  => 'http://child#3',
                                'type' => 'class',
                                'accessMode' => 'denied',
                            ],
                        ],
                    ],
                ],
                'resources'           => [
                    [
                        'uri'      => 'http://root',
                        'type'     => 'class',
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
                    'http://child#2',
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
        $this->initializeTestDoubleExpectancies();

        $this->resources = $resources;
        $this->permissions = $readableResourceMap;

        /** @noinspection PhpUnhandledExceptionInspection */
        $result = $this->sut->getItems($this->rootMock);

        if (!empty($result[0]['children'])) {
            $result[0]['children'] = array_values($result[0]['children']);
        }

        self::assertEquals($expected, $result);
    }

    public function testGetItemsNoResources(): void
    {
        $this->initializeTestDoubleExpectancies();
        $this->permissions = [];

        $data = [
            [
                'type' => 'class',
                'children' => [
                    [
                        'type' => 'class'
                    ]
                ]
            ]
        ];

        $this->resourceLookupMock
            ->expects(static::once())
            ->method('getResources')
            ->willReturn($data);

        /** @noinspection PhpUnhandledExceptionInspection */
        $this->sut->getItems($this->rootMock);
    }
}
