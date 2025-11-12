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

namespace oat\taoQtiTest\models\classes\scale;

use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\taoQtiItem\model\qti\metadata\exporter\scale\ScalePreprocessor;
use oat\taoQtiItem\model\QtiCreator\Scales\RemoteScaleListService;
use taoQtiTest_models_classes_QtiTestService as QtiTestService;

/**
 * Service for handling scale persistence for QTI test outcome declarations.
 *
 * This handler processes outcome declarations that reference scales, saving scale
 * data to JSON files in the test directory and transforming the model to store
 * references via longInterpretation fields.
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
     * This method:
     * - Validates and decodes the JSON model
     * - Strips scale data when remote list is disabled
     * - Saves scale JSON files to the test scales directory
     * - Transforms outcome declarations to reference scales via longInterpretation
     * - Cleans up the scales directory when no scales are defined
     *
     * @param string $model JSON-encoded test model containing outcome declarations
     * @param core_kernel_classes_Resource $test The test resource
     * @return string JSON-encoded updated model with scale references
     * @throws \InvalidArgumentException If the model JSON is invalid
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
                $scaleDir->deleteSelf();
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
            $scaleFile->put(json_encode($scaleToSave));
        }

        return json_encode($model);
    }


    /**
     * Check if any outcome declaration in the model has a scale defined
     * @param array $model
     * @return bool
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
