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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiTest\scripts\cli;

use common_session_SessionManager;
use core_kernel_classes_Resource;
use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\extension\script\ScriptAction;
use oat\oatbox\reporting\Report;
use Psr\Container\ContainerInterface;
use taoTests_models_classes_TestsService;
use Throwable;

/**
 * Class DeleteTests
 *
 * Examples:
 * php index.php '\oat\taoQtiTest\scripts\cli\DeleteTests' -uri uri_of_the_test
 * php index.php '\oat\taoQtiTest\scripts\cli\DeleteTests' -uri uri_of_the_test --wet-run
 * php index.php '\oat\taoQtiTest\scripts\cli\DeleteTests' -class uri_of_the_class
 * php index.php '\oat\taoQtiTest\scripts\cli\DeleteTests' -class uri_of_the_class --wet-run
 * php index.php '\oat\taoQtiTest\scripts\cli\DeleteTests' -class uri_of_the_class --verbose
 *
 * By default, runs in dry-run mode (shows what would be deleted)
 * Use --wet-run to actually perform the deletion
 * Use --verbose to show detailed output
 *
 */
class DeleteTests extends ScriptAction
{
    use OntologyAwareTrait;

    private Report $report;

    /** @var taoTests_models_classes_TestsService */
    private taoTests_models_classes_TestsService $testsService;

    /** @var int Number of tests processed */
    private int $testsProcessed = 0;

    protected function provideOptions(): array
    {
        return [
            'dry-run' => [
                'prefix' => 'd',
                'flag' => true,
                'longPrefix' => 'dry-run',
                'description' => 'Show what would be deleted without actually deleting (default behavior)',
                'required' => false,
                'default' => true
            ],
            'wet-run' => [
                'prefix' => 'w',
                'flag' => true,
                'longPrefix' => 'wet-run',
                'description' => 'Actually perform the deletion (overrides dry-run)',
                'required' => false,
                'default' => false
            ],
            'verbose' => [
                'prefix' => 'v',
                'flag' => true,
                'longPrefix' => 'verbose',
                'description' => 'Show detailed output including directory paths',
                'required' => false,
                'default' => false
            ],
            'class' => [
                'prefix' => 'class',
                'longPrefix' => 'class',
                'description' => 'Class uri to delete tests from',
                'required' => false
            ],
            'uri' => [
                'prefix' => 'uri',
                'longPrefix' => 'uri',
                'description' => 'Uri of the test to delete',
                'required' => false
            ]

        ];
    }

    protected function provideDescription(): string
    {
        return 'Tool to remove tests from the tao';
    }

    protected function provideUsage(): array
    {
        return [
            'prefix' => 'h',
            'longPrefix' => 'help',
            'description' => 'Prints a help statement'
        ];
    }

    public function run(): Report
    {
        // Default to dry run unless --wet-run is explicitly passed (option parser may not apply defaults for missing flags)
        $isDryRun = !$this->getOption('wet-run');
        $runType = $isDryRun ? 'DRY RUN' : 'WET RUN';

        $this->report = Report::createInfo("Starting {$runType} deletion of tests");
        echo "=== {$runType} MODE ===\n";

        $user = new \core_kernel_users_GenerisUser(
            $this->getResource('https://backoffice.ngs.test/ontologies/tao.rdf#superUser')
        );
        $session = new \common_session_RestSession(
            $user
        );
        common_session_SessionManager::startSession($session);

        if ($this->getOption('uri')) {
            $this->deleteSingleTest($this->getOption('uri'), $isDryRun);
        } elseif ($this->getOption('class')) {
            $this->deleteClassTests($this->getOption('class'), $isDryRun);
        } else {
            echo "Error: Either --uri or --class parameter must be provided.\n";
            return $this->report;
        }

        if ($isDryRun) {
            echo "\n🎯 === DRY RUN COMPLETE ===\n";
            echo "💡 To actually perform the deletion, run with --wet-run flag\n";
        } else {
            echo "\n✅ === DELETION COMPLETE ===\n";
        }

        $this->displaySummaryReport($isDryRun);

        return $this->report;
    }

    /**
     * Delete a single test by URI
     *
     * @param string $testUri URI of the test to delete
     * @param bool $isDryRun Whether this is a dry run
     */
    private function deleteSingleTest(string $testUri, bool $isDryRun): void
    {
        $this->testsService = $this->getTestsService();

        $instance = new core_kernel_classes_Resource($testUri);

        if (!$instance->exists()) {
            echo "Error: Test with URI '{$testUri}' does not exist.\n";
            return;
        }

        $testLabel = $instance->getLabel();
        echo "Deleting single test: {$testLabel} ({$testUri})\n";

        $this->updateProgressBar(1, 1, $testLabel, $isDryRun);

        $this->processTest($instance, $isDryRun);

        $this->updateProgressBar(1, 1, "COMPLETED", $isDryRun);
        echo "\n";

        echo "✓ " . ($isDryRun ? "[DRY RUN] Would delete this test" : "Test deleted successfully") . "\n";

        $this->testsProcessed++;
    }

    /**
     * Delete all tests in a class
     *
     * @param string $classUri URI of the class to delete tests from
     * @param bool $isDryRun Whether this is a dry run
     */
    private function deleteClassTests(string $classUri, bool $isDryRun): void
    {
        $this->testsService = $this->getTestsService();
        $class = $this->getClass($classUri);

        if (!$class->exists()) {
            echo "Error: Class with URI '{$classUri}' does not exist.\n";
            return;
        }
        $instances = $class->getInstances(true);
        $totalTests = count($instances);
        $currentTest = 0;

        echo "Found {$totalTests} tests in class: {$classUri}\n";

        if ($totalTests === 0) {
            echo "No tests found to delete.\n";
            return;
        }

        foreach ($instances as $instance) {
            if (!$instance->exists()) {
                continue;
            }

            $currentTest++;
            $testLabel = $instance->getLabel();

            $this->updateProgressBar($currentTest, $totalTests, $testLabel, $isDryRun);

            $this->processTest($instance, $isDryRun);

            $this->testsProcessed++;
        }

        $this->updateProgressBar($totalTests, $totalTests, "COMPLETED", $isDryRun);
        echo "\n";
    }

    private function getTestsService(): taoTests_models_classes_TestsService
    {
        return $this->getPsrContainer()->get(taoTests_models_classes_TestsService::class);
    }

    private function getPsrContainer(): ContainerInterface
    {
        return $this->getServiceManager()->getContainer();
    }

    /**
     * Process a single test (deletion logic with optional verbose output)
     *
     * @param core_kernel_classes_Resource $instance Test instance
     * @param bool $isDryRun Whether this is a dry run
     */
    private function processTest(core_kernel_classes_Resource $instance, bool $isDryRun): void
    {
        try {
            if (!$isDryRun) {
                $this->testsService->deleteTest($instance);
            }
        } catch (Throwable $e) {
            echo "Error: {$e->getMessage()}\n";
        }
    }

    /**
     * Update progress bar in console
     *
     * @param int $current Current test number
     * @param int $total Total number of tests
     * @param string $testLabel Current test label
     * @param bool $isDryRun Whether this is a dry run
     */
    private function updateProgressBar(int $current, int $total, string $testLabel, bool $isDryRun): void
    {
        $percentage = round(($current / $total) * 100);
        $barLength = 50;
        $filledLength = (int) round(($barLength * $current) / $total);

        $bar = str_repeat('█', $filledLength) . str_repeat('░', $barLength - $filledLength);

        echo "\r\033[K";

        $status = $isDryRun ? "[DRY RUN]" : "[WET RUN]";
        printf(
            "\r[%s] %d%% (%d/%d) %s %s",
            $bar,
            $percentage,
            $current,
            $total,
            $status,
            $this->truncateString($testLabel, 25)
        );

        if (ob_get_level()) {
            ob_flush();
        }
        flush();
    }

    /**
     * Display summary report of processed tests
     *
     * @param bool $isDryRun Whether this was a dry run
     */
    private function displaySummaryReport(bool $isDryRun): void
    {
        $action = $isDryRun ? "would be" : "were";
        $prefix = $isDryRun ? "[DRY RUN] " : "";

        echo "\n📊 === SUMMARY REPORT ===\n";
        echo "{$prefix}{$this->testsProcessed} test(s) {$action} deleted\n";

        echo "========================\n";
    }

    /**
     * Truncate string to specified length with ellipsis
     *
     * @param string $string String to truncate
     * @param int $length Maximum length
     * @return string Truncated string
     */
    private function truncateString(string $string, int $length): string
    {
        if (strlen($string) <= $length) {
            return $string;
        }

        return substr($string, 0, $length - 3) . '...';
    }
}
