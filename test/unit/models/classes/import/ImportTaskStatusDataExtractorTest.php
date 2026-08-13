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

namespace oat\taoQtiTest\test\unit\models\classes\import;

use common_report_Report as Report;
use core_kernel_classes_Resource;
use oat\generis\test\TestCase;
use oat\tao\model\taskQueue\TaskLog\Entity\EntityInterface;
use oat\tao\model\taskQueue\TaskLog\CategorizedStatus;
use oat\taoQtiTest\models\import\ImportTaskStatusDataExtractor;

class ImportTaskStatusDataExtractorTest extends TestCase
{
    private ImportTaskStatusDataExtractor $subject;

    protected function setUp(): void
    {
        parent::setUp();
        $this->subject = new ImportTaskStatusDataExtractor();
    }

    public function testExtractReturnsEmptyArrayWhenReportIsMissing(): void
    {
        $taskLogEntity = $this->createMock(EntityInterface::class);
        $taskLogEntity->method('getReport')->willReturn(null);

        self::assertSame([], $this->subject->extract($taskLogEntity));
    }

    public function testExtractReturnsSingleTestIdFromResourceObject(): void
    {
        $testUri = 'http://example.com/ontologies/tao.rdf#test1';
        $resource = $this->createMock(core_kernel_classes_Resource::class);
        $resource->method('getUri')->willReturn($testUri);

        $reportData = new \stdClass();
        $reportData->rdfsResource = $resource;
        $reportData->items = [];

        $taskLogEntity = $this->createTaskLogEntityWithReports([
            $this->createChildReport($reportData),
        ]);

        $result = $this->subject->extract($taskLogEntity);

        self::assertSame(['testIds' => [$testUri]], $result);
    }

    public function testExtractReturnsAllTestIdsFromMultipleTestReports(): void
    {
        $firstTestUri = 'http://example.com/ontologies/tao.rdf#test1';
        $secondTestUri = 'http://example.com/ontologies/tao.rdf#test2';

        $firstReportData = new \stdClass();
        $firstReportData->rdfsResource = $this->createResourceMock($firstTestUri);
        $firstReportData->items = [];

        $secondReportData = new \stdClass();
        $secondReportData->rdfsResource = $this->createResourceMock($secondTestUri);
        $secondReportData->items = [];

        $rootReport = new Report(Report::TYPE_SUCCESS, 'Package imported');
        $rootReport->add(new Report(Report::TYPE_INFO, 'Preprocessing done'));
        $rootReport->add($this->createChildReport($firstReportData));
        $rootReport->add($this->createChildReport($secondReportData));

        $taskLogEntity = $this->createMock(EntityInterface::class);
        $taskLogEntity->method('getReport')->willReturn($rootReport);

        $result = $this->subject->extract($taskLogEntity);

        self::assertSame(
            ['testIds' => [$firstTestUri, $secondTestUri]],
            $result
        );
    }

    public function testExtractExtractsTestIdFromSerializedReportData(): void
    {
        $testUri = 'http://example.com/ontologies/tao.rdf#test1';
        $reportData = [
            'rdfsResource' => [
                'uriResource' => $testUri,
            ],
            'items' => [],
        ];

        $taskLogEntity = $this->createTaskLogEntityWithReports([
            $this->createChildReport($reportData),
        ]);

        $result = $this->subject->extract($taskLogEntity);

        self::assertSame(['testIds' => [$testUri]], $result);
    }

    public function testExtractIgnoresChildrenWithoutTestData(): void
    {
        $testUri = 'http://example.com/ontologies/tao.rdf#test1';
        $reportData = new \stdClass();
        $reportData->rdfsResource = $this->createResourceMock($testUri);
        $reportData->items = [];

        $rootReport = new Report(Report::TYPE_SUCCESS, 'Package imported');
        $rootReport->add(new Report(Report::TYPE_INFO, 'Preprocessing done'));
        $rootReport->add($this->createChildReport($reportData));
        $rootReport->add(new Report(Report::TYPE_ERROR, 'Invalid item'));

        $taskLogEntity = $this->createMock(EntityInterface::class);
        $taskLogEntity->method('getReport')->willReturn($rootReport);

        $result = $this->subject->extract($taskLogEntity);

        self::assertSame(['testIds' => [$testUri]], $result);
    }

    public function testExtractReturnsEmptyArrayWhenAllChildrenLackTestData(): void
    {
        $taskLogEntity = $this->createTaskLogEntityWithReports([
            new Report(Report::TYPE_INFO, 'Preprocessing done'),
            $this->createChildReport(null),
            $this->createChildReport(new \stdClass()),
            new Report(Report::TYPE_ERROR, 'Invalid item'),
        ]);

        $result = $this->subject->extract($taskLogEntity);

        self::assertSame([], $result);
    }

    public function testExtractDeduplicatesTestIds(): void
    {
        $testUri = 'http://example.com/ontologies/tao.rdf#test1';
        $reportData = new \stdClass();
        $reportData->rdfsResource = $this->createResourceMock($testUri);
        $reportData->items = [];

        $taskLogEntity = $this->createTaskLogEntityWithReports([
            $this->createChildReport($reportData),
            $this->createChildReport($reportData),
        ]);

        $result = $this->subject->extract($taskLogEntity);

        self::assertSame(['testIds' => [$testUri]], $result);
    }

    public function testExtractIgnoresNestedItemReportsAfterJsonRoundTrip(): void
    {
        $testUri = 'http://example.com/ontologies/tao.rdf#test1';
        $itemUri = 'http://example.com/ontologies/tao.rdf#item1';

        $reportCtx = new \stdClass();
        $reportCtx->rdfsResource = new core_kernel_classes_Resource($testUri);
        $reportCtx->uriResource = $testUri;
        $reportCtx->items = ['ref1' => new core_kernel_classes_Resource($itemUri)];

        $testReport = new Report(Report::TYPE_SUCCESS, 'Test imported', $reportCtx);
        $testReport->add(new Report(Report::TYPE_SUCCESS, 'Item imported', new core_kernel_classes_Resource($itemUri)));

        $rootReport = new Report(Report::TYPE_SUCCESS, 'Package imported');
        $rootReport->add($testReport);

        $restoredReport = Report::jsonUnserialize(json_decode(json_encode($rootReport), true));
        $taskLogEntity = $this->createMock(EntityInterface::class);
        $taskLogEntity->method('getReport')->willReturn($restoredReport);

        $result = $this->subject->extract($taskLogEntity);

        self::assertSame(['testIds' => [$testUri]], $result);
    }

    public function testExtractIgnoresNestedSuccessReportWithRdfsResourceOnly(): void
    {
        $testUri = 'http://example.com/ontologies/tao.rdf#test1';
        $spuriousUri = 'http://example.com/ontologies/tao.rdf#spurious';

        $reportCtx = new \stdClass();
        $reportCtx->rdfsResource = new core_kernel_classes_Resource($testUri);
        $reportCtx->uriResource = $testUri;
        $reportCtx->items = [];

        $testReport = new Report(Report::TYPE_SUCCESS, 'Test imported', $reportCtx);
        $spuriousData = new \stdClass();
        $spuriousData->rdfsResource = new core_kernel_classes_Resource($spuriousUri);
        $testReport->add(new Report(Report::TYPE_SUCCESS, 'Nested success', $spuriousData));

        $rootReport = new Report(Report::TYPE_SUCCESS, 'Package imported');
        $rootReport->add($testReport);

        $taskLogEntity = $this->createMock(EntityInterface::class);
        $taskLogEntity->method('getReport')->willReturn($rootReport);

        $result = $this->subject->extract($taskLogEntity);

        self::assertSame(['testIds' => [$testUri]], $result);
    }

    public function testExtractReturnsTestIdsFromPersistedTaskLogReportJson(): void
    {
        $firstTestUri = 'http://example.com/ontologies/tao.rdf#test1';
        $secondTestUri = 'http://example.com/ontologies/tao.rdf#test2';

        $firstReportData = new \stdClass();
        $firstReportData->rdfsResource = new core_kernel_classes_Resource($firstTestUri);
        $firstReportData->uriResource = $firstTestUri;
        $firstReportData->items = [];

        $secondReportData = new \stdClass();
        $secondReportData->rdfsResource = new core_kernel_classes_Resource($secondTestUri);
        $secondReportData->uriResource = $secondTestUri;
        $secondReportData->items = [];

        $rootReport = new Report(Report::TYPE_SUCCESS, 'Package imported');
        $rootReport->add(new Report(Report::TYPE_INFO, 'Preprocessing done'));
        $rootReport->add(new Report(Report::TYPE_SUCCESS, 'Test imported', $firstReportData));
        $rootReport->add(new Report(Report::TYPE_SUCCESS, 'Test imported', $secondReportData));

        $persistedReport = Report::jsonUnserialize(json_decode(json_encode($rootReport), true));

        $taskLogEntity = $this->createMock(EntityInterface::class);
        $taskLogEntity->method('getReport')->willReturn($persistedReport);
        $taskLogEntity->method('getStatus')->willReturn(CategorizedStatus::createFromString('completed'));

        $result = $this->subject->extract($taskLogEntity);

        self::assertSame(
            ['testIds' => [$firstTestUri, $secondTestUri]],
            $result
        );
    }

    /**
     * @param Report[] $childReports
     */
    private function createTaskLogEntityWithReports(array $childReports): EntityInterface
    {
        $rootReport = new Report(Report::TYPE_SUCCESS, 'Package imported');
        foreach ($childReports as $childReport) {
            $rootReport->add($childReport);
        }

        $taskLogEntity = $this->createMock(EntityInterface::class);
        $taskLogEntity->method('getReport')->willReturn($rootReport);

        return $taskLogEntity;
    }

    /**
     * @param mixed $reportData
     */
    private function createChildReport($reportData): Report
    {
        return new Report(Report::TYPE_SUCCESS, 'Test imported', $reportData);
    }

    private function createResourceMock(string $uri): core_kernel_classes_Resource
    {
        $resource = $this->createMock(core_kernel_classes_Resource::class);
        $resource->method('getUri')->willReturn($uri);

        return $resource;
    }
}
