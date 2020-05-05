<?php declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes\creator;

use core_kernel_classes_Class;
use oat\generis\model\data\permission\PermissionInterface;
use oat\generis\test\MockObject;
use oat\generis\test\TestCase;
use oat\oatbox\session\SessionService;
use oat\oatbox\user\User;
use oat\tao\model\resources\ListResourceLookup;
use oat\tao\model\resources\ResourceLookup;
use oat\taoDacSimple\model\PermissionProvider;
use oat\taoQtiTest\models\creator\ListItemLookup;
use Zend\ServiceManager\ServiceLocatorInterface;
use oat\generis\model\data\permission\PermissionHelper;

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
class ListItemLookupTest extends TestCase
{
    /** @var array */
    private $resources = [];

    /** @var array */
    private $permissions = [];

    /** @var User|MockObject */
    private $userMock;

    /** @var core_kernel_classes_Class */
    private $rootMock;

    /** @var ResourceLookup|MockObject */
    private $resourceLookupMock;

    /** @var SessionService|MockObject */
    private $sessionServiceMock;

    /** @var PermissionInterface|MockObject */
    private $permissionProviderMock;

    /** @var PermissionHelper */
    private $permissionHelper;

    /** @var ServiceLocatorInterface */
    private $serviceLocatorMock;

    /** @var ListItemLookup */
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
        $this->userMock               = $this->createMock(User::class);
        $this->rootMock               = $this->createMock(core_kernel_classes_Class::class);
        $this->sessionServiceMock     = $this->createMock(SessionService::class);
        $this->resourceLookupMock     = $this->createMock(ResourceLookup::class);
        $this->permissionProviderMock = $this->createMock(PermissionProvider::class);
        $this->permissionHelper       = new PermissionHelper();
    }

    public function initializeTestDoubleExpectancies(): void
    {
        $this->resourceLookupMock
            ->expects(static::once())
            ->method('getResources')
            ->with($this->rootMock, [], [], 0, 30)
            ->willReturnCallback([$this, 'getResources']);

        $this->sessionServiceMock
            ->method('getCurrentUser')
            ->willReturn($this->userMock);

        $this->permissionProviderMock
            ->method('getSupportedRights')
            ->willReturn(['READ']);
    }

    public function initializeServiceLocator(): void
    {
        $this->serviceLocatorMock = $this->createMock(ServiceLocatorInterface::class);

        $this->serviceLocatorMock
            ->method('get')
            ->willReturnMap(
                [
                    [SessionService::SERVICE_ID, $this->sessionServiceMock],
                    [ListResourceLookup::SERVICE_ID, $this->resourceLookupMock],
                    [PermissionInterface::SERVICE_ID, $this->permissionProviderMock],
                    [PermissionHelper::class, $this->permissionHelper],
                ]
            );
        $this->permissionHelper->setServiceLocator($this->serviceLocatorMock);
    }

    public function initializeSut(): void
    {
        $this->sut = $this->createPartialMock(ListItemLookup::class, ['getServiceLocator']);

        $this->sut
            ->method('getServiceLocator')
            ->willReturn($this->serviceLocatorMock);
    }

    public function setResources(array $resources): void
    {
        $this->resources = $resources;

        $nodeIds = [];
        foreach ($resources['nodes'] ?? [] as $node) {
            if ($node['type'] === 'instance') {
                $nodeIds[] = $node['uri'];
            }
        }

        $this->permissionProviderMock
            ->expects(static::once())
            ->method('getPermissions')
            ->with($this->userMock, $nodeIds)
            ->willReturnCallback([$this, 'getPermissions']);
    }

    public function getResources(): array
    {
        return $this->resources;
    }

    /** @noinspection PhpUnusedParameterInspection */
    public function getPermissions(User $user, array $nodeIds): array
    {
        return array_replace(
            array_fill_keys($nodeIds, []),
            $this->permissions
        );
    }

    public function dataProvider(): array
    {
        return [
            'Empty'           => [
                'expected' => [
                    'nodes' => [],
                    'total' => 0,
                ],
            ],
            'No restrictions' => [
                'expected'    => [
                    'nodes' => [
                        [
                            'uri'  => 'http://child#1',
                            'type' => 'instance',
                        ],
                    ],
                    'total' => 1,
                ],
                'resources'   => [
                    'nodes' => [
                        [
                            'uri'  => 'http://child#1',
                            'type' => 'instance',
                        ],
                    ],
                    'total' => 1,
                ],
                'permissions' => [
                    'http://child#1' => ['READ'],
                ],
            ],
            'Restrictions'    => [
                'expected'    => [
                    'nodes' => [
                        [
                            'uri'  => 'http://child#2',
                            'type' => 'instance',
                        ],
                        [
                            'uri'  => 'http://child#3',
                            'type' => 'class',
                        ],
                    ],
                    'total' => 2,
                ],
                'resources'   => [
                    'nodes' => [
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
                    'total' => 3,
                ],
                'permissions' => [
                    'http://child#2' => ['READ'],
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
     * @param array $permissions
     */
    public function testGetItems(
        array $expected,
        array $resources = ['nodes' => [], 'total' => 0],
        array $permissions = []
    ): void {
        $this->setResources($resources);
        $this->permissions = $permissions;

        /** @noinspection PhpUnhandledExceptionInspection */
        $result = $this->sut->getItems($this->rootMock);

        if (!empty($result['nodes'])) {
            $result['nodes'] = array_values($result['nodes']);
        }

        $this->assertEquals($expected, $result);
    }
}
