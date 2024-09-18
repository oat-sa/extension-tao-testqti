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

namespace oat\taoQtiTest\models\Translation\Service;

use core_kernel_classes_Resource;
use oat\tao\model\Translation\Exception\ResourceTranslationException;
use Psr\Log\LoggerInterface;
use Throwable;

class TranslationPostCreationService
{
    private TestTranslator $testTranslator;
    private LoggerInterface $logger;

    public function __construct(TestTranslator $testTranslator, LoggerInterface $logger)
    {
        $this->testTranslator = $testTranslator;
        $this->logger = $logger;
    }

    public function __invoke(core_kernel_classes_Resource $test): core_kernel_classes_Resource
    {
        try {
            return $this->testTranslator->translate($test);
        } catch (Throwable $exception) {
            $this->logger->error(
                sprintf(
                    'An error occurred during test translation: (%s) %s',
                    get_class($exception),
                    $exception->getMessage()
                )
            );

            throw new ResourceTranslationException('An error occurred during test translation.');
        }
    }
}
