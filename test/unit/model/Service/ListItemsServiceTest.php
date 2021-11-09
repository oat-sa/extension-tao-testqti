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
 *
 * @author Ricardo Quintanilha <ricardo.quintanilha@taotesting.com>
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\model\Service;

use common_exception_Unauthorized as UnauthorizedException;
use oat\generis\test\TestCase;
use oat\taoQtiTest\model\Service\ActionResponse;
use oat\taoQtiTest\model\Service\ListItemsQuery;
use oat\taoQtiTest\model\Service\ListItemsService;
use oat\taoQtiTest\models\runner\config\RunnerConfig;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\RunnerService;
use oat\taoQtiTest\models\runner\RunnerServiceContext;
use PHPUnit\Framework\MockObject\MockObject;
use Psr\Log\LoggerInterface;
use stdClass;

class ListItemsServiceTest extends TestCase
{
    /** @var ListItemsService */
    private $subject;

    /** @var RunnerService|MockObject */
    private $runnerService;

    /** @var RunnerServiceContext|MockObject */
    private $serviceContext;

    /** @var LoggerInterface|MockObject */
    private $logger;

    protected function setUp(): void
    {
        parent::setUp();

        $this->runnerService = $this->createMock(RunnerService::class);
        $this->serviceContext = $this->createMock(QtiRunnerServiceContext::class);
        $this->logger = $this->createMock(LoggerInterface::class);

        $this->runnerService->method('getItemPublicUrl')
            ->willReturn('http://localhost');

        $this->runnerService->method('getItemData')
            ->willReturn([]);

        $this->runnerService->method('getItemPortableElements')
            ->willReturn([]);

        $this->subject = new ListItemsService(
            $this->runnerService,
            $this->logger
        );
    }

    public function testListsItemsByItemIdentifiers(): void
    {
        $this->expectCachedEnabled();

        $this->runnerService->method('getItemState')
            ->willReturn(['state' => 1]);

        $expectedResponse = ActionResponse::success()
            ->withAttribute(
                'items',
                [
                    $this->createItemResponse('item-1', ['state' => 1]),
                    $this->createItemResponse('item-2', ['state' => 1]),
                ]
            );

        $response = $this->executeAction(
            $this->createQuery(['item-1', 'item-2'])
        );

        $this->assertEquals($expectedResponse->toArray(), $response->toArray());
    }

    public function testReturnsStdclassInItemStateWhenRetrievedItemStateIsEmpty(): void
    {
        $this->expectCachedEnabled();

        $this->runnerService->method('getItemState')
            ->willReturnOnConsecutiveCalls(
                ['state' => 1], // item-1 state
                [] // item-2 state
            );

        $expectedResponse = ActionResponse::success()
            ->withAttribute(
                'items',
                [
                    $this->createItemResponse('item-1', ['state' => 1]),
                    $this->createItemResponse('item-2', new stdClass()),
                ]
            );

        $response = $this->executeAction(
            $this->createQuery(['item-1', 'item-2'])
        );

        $this->assertEquals($expectedResponse->toArray(), $response->toArray());
    }

    public function testReturnsSuccessResponseWithoutItemsAttributeWhenItemIdentifiersInQueryIsEmpty(): void
    {
        $this->expectCachedEnabled();

        $expectedResponse = ActionResponse::success();

        $response = $this->executeAction();

        $this->assertEquals($expectedResponse->toArray(), $response->toArray());
    }

    public function testThrowsUnauthorizedWhenCacheIsDisabled(): void
    {
        $this->expectCachedDisabled();

        $this->expectException(UnauthorizedException::class);

        $this->executeAction();
    }

    public function testGeneratesLogWhenCacheConfigIsDisabled(): void
    {
        $this->expectCachedDisabled();

        $this->logger->expects($this->once())
            ->method('warning');

        try {
            $this->executeAction();

            $this->fail('It should throw UnauthorizedException');
        } catch (UnauthorizedException $exception) {
        }
    }

    private function createQuery(array $itemIdentifiers = []): ListItemsQuery
    {
        return new ListItemsQuery($this->serviceContext, $itemIdentifiers);
    }

    private function executeAction(?ListItemsQuery $command = null): ActionResponse
    {
        if ($command === null) {
            $command = $this->createQuery();
        }

        return $this->subject->__invoke($command);
    }

    private function createItemResponse(string $itemIdentifier, $state): array
    {
        return [
            'baseUrl' => 'http://localhost',
            'itemData' => [],
            'itemState' => $state,
            'itemIdentifier' => $itemIdentifier,
            'portableElements' => []
        ];
    }

    private function expectCachedEnabled(): void
    {
        $this->configureTestConfig(true);
    }

    private function expectCachedDisabled(): void
    {
        $this->configureTestConfig(false);
    }

    private function configureTestConfig(bool $cacheEnabled): void
    {
        $testConfig = $this->createMock(RunnerConfig::class);

        $testConfig->method('getConfigValue')
            ->with('itemCaching.enabled')
            ->willReturn($cacheEnabled);

        $this->runnerService->method('getTestConfig')
            ->willReturn($testConfig);
    }
}
