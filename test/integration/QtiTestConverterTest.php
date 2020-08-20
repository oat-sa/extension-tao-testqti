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
use qtism\data\storage\StorageException;
use qtism\data\storage\xml\XmlDocument;
use ReflectionClass;
use \taoQtiTest_models_classes_QtiTestConverter;

/**
 * Integration test of the {@link taoQtiTest_models_classes_QtiTestConverter} class.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 * @package taoQtiTest

 */
class QtiTestConverterTest extends GenerisPhpUnitTestRunner
{

    /**
     * Data provider
     * @return array[] the parameters
     */
    public function dataProvider()
    {
        $dataPath = __DIR__ . '/data/';
        
        return [
            [
                $dataPath . 'qtitest.xml',
                json_encode(json_decode(file_get_contents($dataPath . 'qtitest.json')))
            ],
            [
                $dataPath . 'branching/test.xml',
                json_encode(json_decode(file_get_contents($dataPath . 'branching/test.json')))

            ]
        ];
    }

    /**
     * Test {@link taoQtiTest_models_classes_QtiTestConverter::toJson}
     * @dataProvider dataProvider
     *
     * @param string $testPath
     *            the path of the QTI test to convert
     * @param string $expected
     *            the expected json result
     */
    public function testToJson($testPath, $expected)
    {
        $doc = new XmlDocument('2.1');
        try {
            $doc->load($testPath);
        } catch (StorageException $e) {
            $this->fail($e->getMessage());
        }
        
        $converter = new taoQtiTest_models_classes_QtiTestConverter($doc);
        $result = $converter->toJson();

        $this->assertEquals($expected, $result);
    }

    /**
     * Test {@link taoQtiTest_models_classes_QtiTestConverter::fromJson}
     * @dataProvider dataProvider
     *
     * @param string $testPath
     * @param string $json
     */
    public function testFromJson($testPath, $json)
    {
        $doc = new XmlDocument('2.1');
        $converter = new taoQtiTest_models_classes_QtiTestConverter($doc);
        $converter->fromJson($json);
        
        $result = preg_replace([
            '/ {2,}/',
            '/<!--.*?-->|\t|(?:\r?\n[ \t]*)+/s'
        ], [
            ' ',
            ''
        ], $doc->saveToString())

        ;
        $expected = preg_replace([
            '/ {2,}/',
            '/<!--.*?-->|\t|(?:\r?\n[ \t]*)+/s'
        ], [
            ' ',
            ''
        ], file_get_contents($testPath))

        ;
        
        $this->assertEquals($result, $expected);
    }

    public function testLookupClass()
    {
        $class = new ReflectionClass(taoQtiTest_models_classes_QtiTestConverter::class);
        $lookupClassMethod = $class->getMethod('lookupClass');
        $lookupClassMethod->setAccessible(true);

        $doc = new XmlDocument('2.1');
        $converter = new taoQtiTest_models_classes_QtiTestConverter($doc);

        $result = $lookupClassMethod->invoke($converter, 'or');
        $this->assertEquals($result, 'qtism\data\expressions\operators\OrOperator');

        $result = $lookupClassMethod->invoke($converter, 'lt');
        $this->assertEquals($result, 'qtism\data\expressions\operators\Lt');
    }
}
