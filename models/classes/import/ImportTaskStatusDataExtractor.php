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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\import;

use common_report_Report as Report;
use core_kernel_classes_Resource;
use oat\tao\model\taskQueue\TaskLog\Entity\EntityInterface;

class ImportTaskStatusDataExtractor
{
    /**
     * Build extra getStatus payload fields from a deferred import task log entity.
     *
     * @return array{testIds?: string[], testId?: string}
     */
    public function extract(EntityInterface $taskLogEntity): array
    {
        $report = $taskLogEntity->getReport();
        if (!$report instanceof Report) {
            return [];
        }

        $testIds = [];
        foreach ($report->getSuccesses(true) as $successReport) {
            $testId = $this->extractTestId($successReport->getData());
            if ($testId !== null) {
                $testIds[] = $testId;
            }
        }

        $testIds = array_values(array_unique($testIds));

        return $testIds === []
            ? []
            : ['testIds' => $testIds, 'testId' => $testIds[0]];
    }

    /**
     * @param mixed $data
     */
    private function extractTestId($data): ?string
    {
        if ($data instanceof core_kernel_classes_Resource) {
            return null;
        }

        if (!is_array($data) && !is_object($data)) {
            return null;
        }

        if (!$this->isTestImportContext($data)) {
            return null;
        }

        $rdfsResource = is_array($data) ? ($data['rdfsResource'] ?? null) : ($data->rdfsResource ?? null);
        $uri = $this->resolveResourceUri($rdfsResource);
        if ($uri !== null) {
            return $uri;
        }

        if (is_array($data) && isset($data['uriResource'])) {
            return (string) $data['uriResource'];
        }

        if (is_object($data) && isset($data->uriResource)) {
            return (string) $data->uriResource;
        }

        return null;
    }

    /**
     * @param mixed $data
     */
    private function isTestImportContext($data): bool
    {
        if (is_array($data)) {
            return isset($data['items']) || isset($data['manifestResource']) || isset($data['itemClass']);
        }

        if (is_object($data)) {
            return isset($data->items) || isset($data->manifestResource) || isset($data->itemClass);
        }

        return false;
    }

    /**
     * @param mixed $resource
     */
    private function resolveResourceUri($resource): ?string
    {
        if ($resource instanceof core_kernel_classes_Resource) {
            return $resource->getUri();
        }

        if (is_array($resource) && isset($resource['uriResource'])) {
            return (string) $resource['uriResource'];
        }

        if (is_object($resource) && isset($resource->uriResource)) {
            return (string) $resource->uriResource;
        }

        return is_string($resource) ? $resource : null;
    }
}
