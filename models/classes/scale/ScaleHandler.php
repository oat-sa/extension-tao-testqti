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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\classes\scale;

use core_kernel_classes_Resource;
use oat\taoQtiItem\model\qti\metadata\exporter\scale\ScalePreprocessor;
use oat\taoQtiItem\model\QtiCreator\Scales\RemoteScaleListService;
use taoQtiTest_models_classes_QtiTestService as QtiTestService;

/**
 * Service for handling scale persistence for QTI test outcome declarations.
 *
 * This handler processes JSON-based test models to extract scale references from outcome
 * declarations, save scale metadata as JSON files in the test's scales directory, and
 * transform outcome declarations to reference stored scales via longInterpretation attributes.
 *
 * Key responsibilities:
 * - Validate and decode JSON test models
 * - Check feature flag state (RemoteScaleListService)
 * - Save scale metadata to test's scales directory
 * - Transform outcome declarations to use longInterpretation references
 * - Clean up unused scale files and directories
 *
 * Architecture Note:
 * This handler is separate from taoQtiItem\model\qti\scale\ScaleHandler because:
 * - Processes JSON (test model) vs XML (item QTI)
 * - Uses QtiTestService for directory access vs ScaleStorageService
 * - Optimized for test authoring context vs item authoring
 *
 * @see \oat\taoQtiItem\model\qti\scale\ScaleHandler for item-level scale handling
 * @see /tao/taoQtiTest/.notes/ScaleHandler-documentation.md for detailed documentation
 *
 * @author Open Assessment Technologies SA
 * @package oat\taoQtiTest\models\classes\scale
 */
class ScaleHandler
{
    private const SCALE_DIRECTORY_PATH = 'scales';
    private QtiTestService $qtiTestService;
    private ScalePreprocessor $scalePreprocessor;
    private RemoteScaleListService $remoteScaleListService;

    /**
     * ScaleHandler constructor.
     *
     * @param QtiTestService $qtiTestService Service for accessing test directory and files
     * @param ScalePreprocessor $scalePreprocessor Service for accessing remote scale list
     * @param RemoteScaleListService $remoteScaleListService Service for checking if remote list is enabled
     */
    public function __construct(
        QtiTestService $qtiTestService,
        ScalePreprocessor $scalePreprocessor,
        RemoteScaleListService $remoteScaleListService
    ) {
        $this->qtiTestService = $qtiTestService;
        $this->scalePreprocessor = $scalePreprocessor;
        $this->remoteScaleListService = $remoteScaleListService;
    }

    /**
     * Process and persist outcome declaration scales for a test.
     *
     * Processing flow:
     * 1. Validates and decodes the JSON model
     * 2. If remote list disabled: Strips scale data from outcome declarations
     * 3. If no scales defined: Removes scales directory if exists
     * 4. For each outcome declaration with scale:
     *    - Matches scale URI against remote scale list
     *    - Saves scale metadata to scales/{identifier}.json
     *    - Transforms outcome declaration to use longInterpretation reference
     *    - Removes scale and rubric attributes (now stored in file)
     *
     * Example transformation:
     * Input:
     * ```json
     * {
     *   "identifier": "SCORE",
     *   "scale": "http://example.org/scales/cefr",
     *   "rubric": "Award A1 for basic..."
     * }
     * ```
     *
     * Output:
     * ```json
     * {
     *   "identifier": "SCORE",
     *   "longInterpretation": "scales/SCORE.json"
     * }
     * ```
     *
     * Created file (scales/SCORE.json):
     * ```json
     * {
     *   "rubric": "Award A1 for basic...",
     *   "scale": {
     *     "uri": "http://example.org/scales/cefr",
     *     "label": "CEFR",
     *     "values": {"1": "A1", "2": "A2", ...}
     *   }
     * }
     * ```
     *
     * @param string $model JSON-encoded test model containing outcome declarations
     * @param core_kernel_classes_Resource $test The test resource being processed
     * @return string JSON-encoded updated model with scale references transformed
     * @throws \InvalidArgumentException If the model JSON is invalid
     * @throws \RuntimeException If scale directory deletion or file writing fails due to I/O errors
     */
    public function handle(string $model, core_kernel_classes_Resource $test): string
    {
        $model = json_decode($model, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \InvalidArgumentException('Invalid JSON model provided');
        }

        //Is REMOTE_LIST_SCALE disable but scales are present we need to strip outcome declarations from scales fields
        if (!$this->remoteScaleListService->isRemoteListEnabled() && $this->isScaleDefined($model)) {
            //We need to remove scale related data from outcomeDeclarations
            foreach ($model['outcomeDeclarations'] as &$outcomeDeclaration) {
                unset($outcomeDeclaration['scale']);
                unset($outcomeDeclaration['rubric']);
                unset($outcomeDeclaration['longInterpretation']);
            }

            return json_encode($model);
        }

        $scaleDir = $this->qtiTestService
            ->getQtiTestDir($test)
            ->getDirectory(self::SCALE_DIRECTORY_PATH);

        // If no scales are defined, remove the scales directory if it exists
        if (!$this->isScaleDefined($model)) {
            if ($scaleDir->exists()) {
                try {
                    $scaleDir->deleteSelf();
                } catch (\Exception $e) {
                    throw new \RuntimeException(
                        'Failed to delete scales directory: ' . $e->getMessage(),
                        0,
                        $e
                    );
                }
            }
            return json_encode($model);
        }

        // Get remote scale list and convert to array if it's an iterator
        $scaleList = $this->scalePreprocessor->getScaleRemoteList();
        if ($scaleList instanceof \Traversable) {
            $scaleList = iterator_to_array($scaleList);
        } elseif (!is_array($scaleList)) {
            $scaleList = [];
        }

        foreach ($model['outcomeDeclarations'] as &$outcomeDeclaration) {
            if (
                !isset($outcomeDeclaration['scale'])
                || $outcomeDeclaration['scale'] === null
                || $outcomeDeclaration['scale'] === ''
            ) {
                continue;
            }
            $filename = $outcomeDeclaration['identifier'] . '.json';
            $scaleFile = $scaleDir->getFile($filename);
            // We need to get the scale where outcomeDeclaration.scale is equal to rs['uri'] using array filter
            $scaleData = array_filter(
                $scaleList,
                function ($scale) use ($outcomeDeclaration) {
                    return isset($scale['uri']) && $scale['uri'] === $outcomeDeclaration['scale'];
                }
            );

            if (empty($scaleData)) {
                continue;
            }

            $rubric = $outcomeDeclaration['rubric'] ?? null;

            $scaleToSave = [
                'rubric' => $rubric,
                'scale' => array_values($scaleData)[0] ?? null,
            ];

            $outcomeDeclaration['longInterpretation'] = 'scales/' . $scaleFile->getBasename();
            unset($outcomeDeclaration['scale']);
            unset($outcomeDeclaration['rubric']);

            try {
                $scaleFile->put(json_encode($scaleToSave));
            } catch (\Exception $e) {
                throw new \RuntimeException(
                    sprintf('Failed to write scale file "%s": %s', $filename, $e->getMessage()),
                    0,
                    $e
                );
            }
        }

        return json_encode($model);
    }

    /**
     * Check if any outcome declaration in the model has a scale defined.
     *
     * Iterates through outcome declarations to find at least one with a non-empty scale value.
     * This is used to determine if scale processing is needed or if cleanup should occur.
     *
     * @param array $model Decoded test model with outcomeDeclarations array
     * @return bool True if at least one outcome has a scale, false otherwise
     */
    private function isScaleDefined(array $model): bool
    {
        if (!isset($model['outcomeDeclarations']) || !is_array($model['outcomeDeclarations'])) {
            return false;
        }

        foreach ($model['outcomeDeclarations'] as $outcomeDeclaration) {
            if (isset($outcomeDeclaration['scale']) && !empty($outcomeDeclaration['scale'])) {
                return true;
            }
        }

        return false;
    }
}
