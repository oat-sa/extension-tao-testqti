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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\UniqueId\Service;

use core_kernel_classes_Resource;
use Psr\Log\LoggerInterface;
use taoQtiTest_models_classes_QtiTestService;
use Throwable;

class QtiIdentifierRetriever
{
    private taoQtiTest_models_classes_QtiTestService $qtiTestService;
    private LoggerInterface $logger;

    public function __construct(taoQtiTest_models_classes_QtiTestService $qtiTestService, LoggerInterface $logger)
    {
        $this->qtiTestService = $qtiTestService;
        $this->logger = $logger;
    }

    public function retrieve(core_kernel_classes_Resource $test): ?string
    {
        try {
            $jsonTest = $this->qtiTestService->getJsonTest($test);
            $decodedTest = json_decode($jsonTest, true, 512, JSON_THROW_ON_ERROR);

            return $decodedTest['identifier'] ?? null;
        } catch (Throwable $exception) {
            $this->logger->error('An error occurred while retrieving test data: ' . $exception->getMessage());

            throw $exception;
        }
    }
}
