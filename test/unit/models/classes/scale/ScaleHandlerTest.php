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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\test\unit\models\classes\scale;

use core_kernel_classes_Resource;
use oat\generis\test\MockObject;
use oat\generis\test\TestCase;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\filesystem\File;
use oat\taoQtiItem\model\qti\metadata\exporter\scale\ScalePreprocessor;
use oat\taoQtiItem\model\QtiCreator\Scales\RemoteScaleListService;
use oat\taoQtiTest\models\classes\scale\ScaleHandler;
use taoQtiTest_models_classes_QtiTestService as QtiTestService;

class ScaleHandlerTest extends TestCase
{
    /** @var QtiTestService|MockObject */
    private $qtiTestService;

    /** @var ScalePreprocessor|MockObject */
    private $scalePreprocessor;

    /** @var RemoteScaleListService|MockObject */
    private $remoteScaleListService;

    /** @var ScaleHandler */
    private $sut;

    /**
     * @before
     */
    public function init(): void
    {
        $this->qtiTestService = $this->createMock(QtiTestService::class);
        $this->scalePreprocessor = $this->createMock(ScalePreprocessor::class);
        $this->remoteScaleListService = $this->createMock(RemoteScaleListService::class);

        $this->sut = new ScaleHandler(
            $this->qtiTestService,
            $this->scalePreprocessor,
            $this->remoteScaleListService
        );
    }

    public function testHandleThrowsExceptionOnInvalidJson(): void
    {
        $test = $this->createMock(core_kernel_classes_Resource::class);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid JSON model provided');

        $this->sut->handle('invalid json', $test);
    }

    public function testHandleStripsScaleDataWhenRemoteListIsDisabled(): void
    {
        $test = $this->createMock(core_kernel_classes_Resource::class);

        $model = [
            'outcomeDeclarations' => [
                [
                    'identifier' => 'OUTCOME_1',
                    'scale' => 'http://www.tao.lu/Ontologies/TAO.rdf#CEFR-A1-B2',
                    'rubric' => 'http://example.com/rubric.pdf',
                    'longInterpretation' => 'scales/OUTCOME_1.json'
                ]
            ]
        ];

        $this->remoteScaleListService
            ->expects($this->once())
            ->method('isRemoteListEnabled')
            ->willReturn(false);

        $result = $this->sut->handle(json_encode($model), $test);
        $resultModel = json_decode($result, true);

        $this->assertArrayNotHasKey('scale', $resultModel['outcomeDeclarations'][0]);
        $this->assertArrayNotHasKey('rubric', $resultModel['outcomeDeclarations'][0]);
        $this->assertArrayNotHasKey('longInterpretation', $resultModel['outcomeDeclarations'][0]);
    }

    public function testHandleRemovesScaleDirectoryWhenNoScalesAreDefined(): void
    {
        $test = $this->createMock(core_kernel_classes_Resource::class);
        $testDir = $this->createMock(Directory::class);
        $scaleDir = $this->createMock(Directory::class);

        $model = [
            'outcomeDeclarations' => [
                [
                    'identifier' => 'OUTCOME_1',
                    'interpretation' => 'Label'
                ]
            ]
        ];

        $this->remoteScaleListService
            ->expects($this->once())
            ->method('isRemoteListEnabled')
            ->willReturn(true);

        $this->qtiTestService
            ->expects($this->once())
            ->method('getQtiTestDir')
            ->with($test)
            ->willReturn($testDir);

        $testDir
            ->expects($this->once())
            ->method('getDirectory')
            ->with('scales')
            ->willReturn($scaleDir);

        $scaleDir
            ->expects($this->once())
            ->method('exists')
            ->willReturn(true);

        $scaleDir
            ->expects($this->once())
            ->method('deleteSelf');

        $result = $this->sut->handle(json_encode($model), $test);
        $resultModel = json_decode($result, true);

        $this->assertEquals($model, $resultModel);
    }

    public function testHandleSavesScaleFilesAndTransformsOutcomeDeclarations(): void
    {
        $test = $this->createMock(core_kernel_classes_Resource::class);
        $testDir = $this->createMock(Directory::class);
        $scaleDir = $this->createMock(Directory::class);
        $scaleFile = $this->createMock(File::class);

        $scaleUri = 'http://www.tao.lu/Ontologies/TAO.rdf#CEFR-A1-B2';
        $rubricUrl = 'http://example.com/rubric.pdf';

        $model = [
            'outcomeDeclarations' => [
                [
                    'identifier' => 'OUTCOME_1',
                    'scale' => $scaleUri,
                    'rubric' => $rubricUrl,
                    'interpretation' => 'Label'
                ]
            ]
        ];

        $scaleRemoteList = [
            [
                'uri' => $scaleUri,
                'label' => 'CEFR A1-B2',
                'values' => [
                    '1' => 'A1',
                    '2' => 'A2',
                    '3' => 'B1',
                    '4' => 'B2'
                ]
            ]
        ];

        $this->remoteScaleListService
            ->expects($this->once())
            ->method('isRemoteListEnabled')
            ->willReturn(true);

        $this->qtiTestService
            ->expects($this->once())
            ->method('getQtiTestDir')
            ->with($test)
            ->willReturn($testDir);

        $testDir
            ->expects($this->once())
            ->method('getDirectory')
            ->with('scales')
            ->willReturn($scaleDir);

        $scaleDir
            ->expects($this->once())
            ->method('getFile')
            ->with('OUTCOME_1.json')
            ->willReturn($scaleFile);

        $scaleFile
            ->expects($this->once())
            ->method('getBasename')
            ->willReturn('OUTCOME_1.json');

        $this->scalePreprocessor
            ->expects($this->once())
            ->method('getScaleRemoteList')
            ->willReturn($scaleRemoteList);

        $expectedScaleContent = [
            'rubric' => $rubricUrl,
            'scale' => $scaleRemoteList[0]
        ];

        $scaleFile
            ->expects($this->once())
            ->method('put')
            ->with(json_encode($expectedScaleContent));

        $result = $this->sut->handle(json_encode($model), $test);
        $resultModel = json_decode($result, true);

        $this->assertEquals('scales/OUTCOME_1.json', $resultModel['outcomeDeclarations'][0]['longInterpretation']);
        $this->assertArrayNotHasKey('scale', $resultModel['outcomeDeclarations'][0]);
        $this->assertArrayNotHasKey('rubric', $resultModel['outcomeDeclarations'][0]);
    }

    public function testHandleSkipsOutcomeDeclarationsWithNullScale(): void
    {
        $test = $this->createMock(core_kernel_classes_Resource::class);
        $testDir = $this->createMock(Directory::class);
        $scaleDir = $this->createMock(Directory::class);

        $model = [
            'outcomeDeclarations' => [
                [
                    'identifier' => 'OUTCOME_1',
                    'scale' => null,
                    'interpretation' => 'Label'
                ],
                [
                    'identifier' => 'OUTCOME_2',
                    'scale' => 'http://www.tao.lu/Ontologies/TAO.rdf#CEFR-A1-B2',
                    'rubric' => 'http://example.com/rubric.pdf',
                    'interpretation' => 'Label'
                ]
            ]
        ];

        $this->remoteScaleListService
            ->expects($this->once())
            ->method('isRemoteListEnabled')
            ->willReturn(true);

        $this->qtiTestService
            ->expects($this->once())
            ->method('getQtiTestDir')
            ->with($test)
            ->willReturn($testDir);

        $testDir
            ->expects($this->once())
            ->method('getDirectory')
            ->with('scales')
            ->willReturn($scaleDir);

        $scaleDir
            ->expects($this->once())
            ->method('getFile')
            ->with('OUTCOME_2.json');

        $this->scalePreprocessor
            ->expects($this->once())
            ->method('getScaleRemoteList')
            ->willReturn([]);

        $result = $this->sut->handle(json_encode($model), $test);
        $resultModel = json_decode($result, true);

        // OUTCOME_1 should be unchanged (scale was null)
        $this->assertNull($resultModel['outcomeDeclarations'][0]['scale']);
        $this->assertArrayNotHasKey('longInterpretation', $resultModel['outcomeDeclarations'][0]);
    }

    public function testHandleSkipsOutcomeDeclarationsWithUnmatchedScaleUri(): void
    {
        $test = $this->createMock(core_kernel_classes_Resource::class);
        $testDir = $this->createMock(Directory::class);
        $scaleDir = $this->createMock(Directory::class);
        $scaleFile = $this->createMock(File::class);

        $model = [
            'outcomeDeclarations' => [
                [
                    'identifier' => 'OUTCOME_1',
                    'scale' => 'http://www.tao.lu/Ontologies/TAO.rdf#NONEXISTENT',
                    'rubric' => 'http://example.com/rubric.pdf',
                    'interpretation' => 'Label'
                ]
            ]
        ];

        $this->remoteScaleListService
            ->expects($this->once())
            ->method('isRemoteListEnabled')
            ->willReturn(true);

        $this->qtiTestService
            ->expects($this->once())
            ->method('getQtiTestDir')
            ->with($test)
            ->willReturn($testDir);

        $testDir
            ->expects($this->once())
            ->method('getDirectory')
            ->with('scales')
            ->willReturn($scaleDir);

        $scaleDir
            ->expects($this->once())
            ->method('getFile')
            ->with('OUTCOME_1.json')
            ->willReturn($scaleFile);

        // getBasename should not be called because the code continues when no match is found
        $scaleFile
            ->expects($this->never())
            ->method('getBasename');

        $this->scalePreprocessor
            ->expects($this->once())
            ->method('getScaleRemoteList')
            ->willReturn([
                [
                    'uri' => 'http://www.tao.lu/Ontologies/TAO.rdf#DIFFERENT',
                    'label' => 'Different Scale'
                ]
            ]);

        // Scale file should not be written
        $scaleFile
            ->expects($this->never())
            ->method('put');

        $result = $this->sut->handle(json_encode($model), $test);
        $resultModel = json_decode($result, true);

        // Scale and rubric should not be removed since no match was found
        $this->assertEquals(
            'http://www.tao.lu/Ontologies/TAO.rdf#NONEXISTENT',
            $resultModel['outcomeDeclarations'][0]['scale']
        );
    }

    public function testHandleWithMultipleOutcomeDeclarations(): void
    {
        $test = $this->createMock(core_kernel_classes_Resource::class);
        $testDir = $this->createMock(Directory::class);
        $scaleDir = $this->createMock(Directory::class);
        $scaleFile1 = $this->createMock(File::class);
        $scaleFile2 = $this->createMock(File::class);

        $scaleUri1 = 'http://www.tao.lu/Ontologies/TAO.rdf#CEFR-A1-B2';
        $scaleUri2 = 'http://www.tao.lu/Ontologies/TAO.rdf#CEFR-C1-C2';

        $model = [
            'outcomeDeclarations' => [
                [
                    'identifier' => 'OUTCOME_1',
                    'scale' => $scaleUri1,
                    'rubric' => 'http://example.com/rubric1.pdf'
                ],
                [
                    'identifier' => 'OUTCOME_2',
                    'scale' => $scaleUri2,
                    'rubric' => 'http://example.com/rubric2.pdf'
                ]
            ]
        ];

        $scaleRemoteList = [
            [
                'uri' => $scaleUri1,
                'label' => 'CEFR A1-B2'
            ],
            [
                'uri' => $scaleUri2,
                'label' => 'CEFR C1-C2'
            ]
        ];

        $this->remoteScaleListService
            ->expects($this->once())
            ->method('isRemoteListEnabled')
            ->willReturn(true);

        $this->qtiTestService
            ->expects($this->once())
            ->method('getQtiTestDir')
            ->with($test)
            ->willReturn($testDir);

        $testDir
            ->expects($this->once())
            ->method('getDirectory')
            ->with('scales')
            ->willReturn($scaleDir);

        $scaleDir
            ->expects($this->exactly(2))
            ->method('getFile')
            ->willReturnCallback(function ($filename) use ($scaleFile1, $scaleFile2) {
                if ($filename === 'OUTCOME_1.json') {
                    return $scaleFile1;
                }
                if ($filename === 'OUTCOME_2.json') {
                    return $scaleFile2;
                }
                return null;
            });

        $scaleFile1->method('getBasename')->willReturn('OUTCOME_1.json');
        $scaleFile2->method('getBasename')->willReturn('OUTCOME_2.json');

        $this->scalePreprocessor
            ->expects($this->exactly(2))
            ->method('getScaleRemoteList')
            ->willReturn($scaleRemoteList);

        $scaleFile1->expects($this->once())->method('put');
        $scaleFile2->expects($this->once())->method('put');

        $result = $this->sut->handle(json_encode($model), $test);
        $resultModel = json_decode($result, true);

        $this->assertEquals('scales/OUTCOME_1.json', $resultModel['outcomeDeclarations'][0]['longInterpretation']);
        $this->assertEquals('scales/OUTCOME_2.json', $resultModel['outcomeDeclarations'][1]['longInterpretation']);
        $this->assertArrayNotHasKey('scale', $resultModel['outcomeDeclarations'][0]);
        $this->assertArrayNotHasKey('scale', $resultModel['outcomeDeclarations'][1]);
    }
}
