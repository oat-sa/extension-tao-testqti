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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiTest\test\integration;

use oat\generis\test\GenerisPhpUnitTestRunner;
use oat\oatbox\service\ServiceManager;
use oat\taoQtiTest\models\export\metadata\TestExporter;

/**
 * This test case focuses on testing the TestCompilerUtils helper.
 *
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 * @package taoQtiTest
 *
 */
class TestExporterTest extends GenerisPhpUnitTestRunner
{

    private $testCreatedUri;

    public static function samplesDir()
    {
        return dirname(dirname(__DIR__)) . '/samples/metadata/test/';
    }

    
    /**
     *
     * @dataProvider metaProvider
     * @param string $testFile
     * @param array $expectedMeta
     */
    public function testExport($testFile, $expectedMeta)
    {
        $class = \taoTests_models_classes_TestsService::singleton()->getRootclass()->createSubClass(uniqid('functional'));
        \helpers_TimeOutHelper::setTimeOutLimit(\helpers_TimeOutHelper::LONG);
        $report = \taoQtiTest_models_classes_QtiTestService::singleton()
            ->importMultipleTests($class, $testFile);
        \helpers_TimeOutHelper::reset();
        $resources = $class->getInstances();
        $resource = current($resources);
        $this->testCreatedUri = $resource->getUri();

        $testExporter = new TestExporter();
        $testExporter->setServiceLocator(ServiceManager::getServiceManager());
        $file = $testExporter->export($this->testCreatedUri);

        \taoTests_models_classes_TestsService::singleton()->deleteClass($class);

        $this->assertEquals(
            $this->normalizeLineEndings(file_get_contents($expectedMeta)),
            $this->normalizeLineEndings(file_get_contents($file))
        );
    }

    /**
     * Convert all line-endings to UNIX format
     * @param $s
     * @return mixed
     */
    private function normalizeLineEndings($s)
    {
        $s = str_replace("\r\n", "\n", $s);
        $s = str_replace("\r", "\n", $s);
        // Don't allow out-of-control blank lines
        $s = preg_replace("/\n{2,}/", "\n\n", $s);
        return $s;
    }

    public function metaProvider()
    {
        return [
            [self::samplesDir() . 'duplicate.zip', self::samplesDir() . 'export_duplicate.csv'],
        ];
    }
}
