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

namespace oat\taoQtiTest\test\unit\actions;

use oat\generis\test\ServiceManagerMockTrait;
use oat\generis\test\TestCase;
use oat\tao\model\taskQueue\TaskLog\Entity\EntityInterface;
use oat\taoQtiTest\models\import\ImportTaskStatusDataExtractor;
use taoQtiTest_actions_RestQtiTests;

class RestQtiTestsTest extends TestCase
{
    use ServiceManagerMockTrait;

    public function testAddExtraReturnDataDelegatesToImportTaskStatusDataExtractor(): void
    {
        $taskLogEntity = $this->createMock(EntityInterface::class);
        $extractor = $this->createMock(ImportTaskStatusDataExtractor::class);
        $extractor
            ->expects(self::once())
            ->method('extract')
            ->with($taskLogEntity)
            ->willReturn(['testIds' => ['http://example.com/ontologies/tao.rdf#test1']]);

        $subject = new TestableRestQtiTests($extractor);

        self::assertSame(
            ['testIds' => ['http://example.com/ontologies/tao.rdf#test1']],
            $subject->exposeAddExtraReturnData($taskLogEntity)
        );
    }

    public function testImportTaskStatusDataExtractorIsResolvedFromContainer(): void
    {
        $extractor = new ImportTaskStatusDataExtractor();
        $subject = new ContainerBackedRestQtiTests();
        $services = [
            ImportTaskStatusDataExtractor::class => $extractor,
        ];
        $serviceManager = $this->getServiceManagerMock($services);

        $subject->setServiceLocator($serviceManager);

        self::assertSame(
            $extractor,
            $subject->exposeImportTaskStatusDataExtractor()
        );
    }
}

class TestableRestQtiTests extends taoQtiTest_actions_RestQtiTests
{
    private ImportTaskStatusDataExtractor $importTaskStatusDataExtractor;

    public function __construct(ImportTaskStatusDataExtractor $importTaskStatusDataExtractor)
    {
        $this->importTaskStatusDataExtractor = $importTaskStatusDataExtractor;
    }

    public function exposeAddExtraReturnData(EntityInterface $taskLogEntity): array
    {
        return $this->addExtraReturnData($taskLogEntity);
    }

    protected function getImportTaskStatusDataExtractor(): ImportTaskStatusDataExtractor
    {
        return $this->importTaskStatusDataExtractor;
    }
}

class ContainerBackedRestQtiTests extends taoQtiTest_actions_RestQtiTests
{
    public function exposeImportTaskStatusDataExtractor(): ImportTaskStatusDataExtractor
    {
        return $this->getImportTaskStatusDataExtractor();
    }
}
