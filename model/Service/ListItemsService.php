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

namespace oat\taoQtiTest\model\Service;

use common_exception_Unauthorized as UnauthorizedException;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\RunnerService;
use Psr\Log\LoggerInterface;
use stdClass;

class ListItemsService
{
    /** @var RunnerService */
    private $runnerService;

    /** @var LoggerInterface */
    private $logger;

    public function __construct(RunnerService $runnerService, LoggerInterface $logger)
    {
        $this->runnerService = $runnerService;
        $this->logger = $logger;
    }

    /**
     * @throws UnauthorizedException
     */
    public function __invoke(ListItemsQuery $query): ActionResponse
    {
        $this->validateCacheConfig();

        if (empty($query->getItemIdentifiers())) {
            return ActionResponse::success();
        }

        $items = [];
        foreach ($query->getItemIdentifiers() as $itemIdentifier) {
            $items[] = $this->getItem($itemIdentifier, $query->getServiceContext());
        }

        return ActionResponse::success()
            ->withAttribute('items', $items);
    }

    /**
     * @throws UnauthorizedException
     */
    private function validateCacheConfig(): void
    {
        if ($this->runnerService->getTestConfig()->getConfigValue('itemCaching.enabled')) {
            return;
        }

        $this->logger->warning('Attempt to disclose the next items without the configuration');

        throw new UnauthorizedException();
    }

    private function getItem(string $itemIdentifier, QtiRunnerServiceContext $serviceContext): array
    {
        $itemRef = $this->runnerService->getItemHref($serviceContext, $itemIdentifier);
        $itemData = $this->runnerService->getItemData($serviceContext, $itemRef);
        $baseUrl = $this->runnerService->getItemPublicUrl($serviceContext, $itemRef);
        $portableElements = $this->runnerService->getItemPortableElements($serviceContext, $itemRef);
        $itemState = $this->runnerService->getItemState($serviceContext, $itemIdentifier);

        if (
            $itemState === null
            || count($itemState) < 1
        ) {
            $itemState = new stdClass();
        }

        return [
            'baseUrl' => $baseUrl,
            'itemData' => $itemData,
            'itemState' => $itemState,
            'itemIdentifier' => $itemIdentifier,
            'portableElements' => $portableElements
        ];
    }
}
