<?php declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes\creator;

use common_exception_Error;
use common_session_AnonymousSession;
use core_kernel_classes_Class;
use core_kernel_classes_Resource as RdfResource;
use oat\generis\model\data\Ontology;
use oat\generis\test\MockObject;
use oat\generis\test\TestCase;
use oat\oatbox\session\SessionService;
use oat\oatbox\user\User;
use oat\tao\model\resources\ListResourceLookup;
use oat\tao\model\resources\ResourceLookup;
use oat\tao\model\resources\ResourceService;
use oat\taoItems\model\CategoryService;
use oat\taoQtiTest\models\creator\ListItemLookup;
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
class ListItemLookupTest extends TestCase
{
    /** @var array */
    private $resources = [];

    /** @var User|MockObject */
    private $userMock;

    /** @var core_kernel_classes_Class */
    private $rootMock;

    /** @var ResourceLookup|MockObject */
    private $resourceLookupMock;

    /** @var SessionService|MockObject */
    private $sessionServiceMock;

    /** @var CategoryService|MockObject */
    private $categoryServiceMock;

    /** @var Ontology|MockObject */
    private $ontologyMock;

    /** @var ServiceLocatorInterface */
    private $serviceLocatorMock;

    /** @var ListItemLookup */
    private $sut;

    /** @var ResourceService|MockObject */
    private $resourceServiceMock;

    /**
     * @var array
     */
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
        $this->userMock               = $this->createMock(User::class);
        $this->rootMock               = $this->createMock(core_kernel_classes_Class::class);
        $this->sessionServiceMock     = $this->createMock(SessionService::class);
        $this->resourceLookupMock     = $this->createMock(ResourceLookup::class);
        $this->categoryServiceMock    = $this->createMock(CategoryService::class);
        $this->ontologyMock           = $this->createMock(Ontology::class);
        $this->resourceServiceMock = $this->createMock(ResourceService::class);
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
        $this->serviceLocatorMock = $this->getServiceLocatorMock([
            Ontology::SERVICE_ID => $this->ontologyMock,
            SessionService::SERVICE_ID => $this->sessionServiceMock,
            ListResourceLookup::SERVICE_ID => $this->resourceLookupMock,
            CategoryService::SERVICE_ID => $this->categoryServiceMock,
            ResourceService::SERVICE_ID => $this->resourceServiceMock,
        ]);
    }

    public function initializeSut(): void
    {
        $this->sut = new ListItemLookup();
        $this->sut->setServiceLocator($this->serviceLocatorMock);
    }

    public function setResources(array $resources): void
    {
        $this->resources = $resources;

        $resourceMap   = [];
        $categoriesMap = [];
        foreach ($resources['nodes'] ?? [] as $node) {
            $resource = $this->createMock(RdfResource::class);

            $resourceMap[]   = [$node['uri'], $resource];
            $categoriesMap[] = [$resource, $node['categories']];
        }

        $this->ontologyMock
            ->method('getResource')
            ->willReturnMap($resourceMap);

        $this->categoryServiceMock
            ->method('getItemCategories')
            ->willReturnMap($categoriesMap);
    }

    public function getResources(): array
    {
        return $this->resources;
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
                            'uri'        => 'http://child#1',
                            'categories' => ['child1_category'],
                            'accessMode' => 'allowed',
                        ],
                    ],
                    'total' => 1,
                ],
                'resources'   => [
                    'nodes' => [
                        [
                            'uri'        => 'http://child#1',
                            'categories' => ['child1_category'],
                        ],
                    ],
                    'total' => 1,
                ],
                'permissions' => [
                    'http://child#1',
                ],
            ],
            'Restrictions'    => [
                'expected'    => [
                    'nodes' => [
                        [
                            'uri'        => 'http://child#1',
                            'categories' => ['child1_category'],
                            'accessMode' => 'denied',
                        ],
                        [
                            'uri'        => 'http://child#2',
                            'categories' => ['child2_category'],
                            'accessMode' => 'allowed'
                        ],
                    ],
                    'total' => 2,
                ],
                'resources'   => [
                    'nodes' => [
                        [
                            'uri'        => 'http://child#1',
                            'categories' => ['child1_category'],
                        ],
                        [
                            'uri'        => 'http://child#2',
                            'categories' => ['child2_category'],
                        ],
                    ],
                    'total' => 2,
                ],
                'permissions' => [
                    'http://child#2',
                ],
            ],
        ];
    }

    /**
     * @dataProvider dataProvider
     *
     * @param array $expected
     * @param array $resources
     * @param array $permissions
     * @throws common_exception_Error
     */
    public function testGetItems(
        array $expected,
        array $resources = ['nodes' => [], 'total' => 0],
        array $permissions = []
    ): void {
        $this->initializeTestDoubleExpectancies();
        $this->setResources($resources);
        $this->permissions = $permissions;

        $result = $this->sut->getItems($this->rootMock);

        if (!empty($result['nodes'])) {
            $result['nodes'] = array_values($result['nodes']);
        }

        self::assertEquals($expected, $result);
    }

    /**
     * @throws common_exception_Error
     */
    public function testGetItemsNoResources(): void
    {
        $data = ['nodes' => []];

        $this->resourceLookupMock
            ->expects(static::once())
            ->method('getResources')
            ->willReturn($data);

        $this->sut->getItems($this->rootMock);
    }
}
