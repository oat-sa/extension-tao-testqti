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

class ScaleHandler
{
    private const ScaleDirectoryPath = 'scales';
    private QtiTestService $qtiTestService;
    private ScalePreprocessor $scalePreprocessor;
    private RemoteScaleListService $remoteScaleListService;

    public function __construct(
        QtiTestService         $qtiTestService,
        ScalePreprocessor      $scalePreprocessor,
        RemoteScaleListService $remoteScaleListService
    )
    {
        $this->qtiTestService = $qtiTestService;
        $this->scalePreprocessor = $scalePreprocessor;
        $this->remoteScaleListService = $remoteScaleListService;
    }

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
            ->getDirectory(self::ScaleDirectoryPath);

        // If no scales are defined, remove the scales directory if it exists
        if (!$this->isScaleDefined($model)) {
            if ($scaleDir->exists()) {
                $scaleDir->deleteSelf();
            }
            return json_encode($model);
        }

        foreach ($model['outcomeDeclarations'] as &$outcomeDeclaration) {
            if ($outcomeDeclaration['scale'] === null) {
                continue;
            }
            $filename = $outcomeDeclaration['identifier'] . '.json';
            $scaleFile = $scaleDir->getFile($filename);
            // We need to get the scale where outcomeDeclaration.scale is equal to rs['uri'] using array filter
            $scaleData = array_filter(
                $this->scalePreprocessor->getScaleRemoteList(),
                function ($scale) use ($outcomeDeclaration) {
                    return $scale['uri'] === $outcomeDeclaration['scale'];
                }
            );

            if (empty($scaleData)) {
                continue;
            }

            $scaleToSave = [
                'rubric' => $outcomeDeclaration['rubric'],
                'scale' => array_values($scaleData)[0] ?? null,
            ];

            $outcomeDeclaration['longInterpretation'] = 'scales/' . $scaleFile->getBasename();
            unset($outcomeDeclaration['scale']);
            unset($outcomeDeclaration['rubric']);
            $scaleFile->put(json_encode($scaleToSave));
        }

        return json_encode($model);
    }

    private function getScaledFromOutcomeDeclarations(array $model)
    {
        $scaledOutcomes = [];
        if (isset($model['outcomeDeclarations']) && is_array($model['outcomeDeclarations'])) {
            foreach ($model['outcomeDeclarations'] as $outcomeDeclaration) {
                if (isset($outcomeDeclaration['scale'])) {
                    $scaledOutcomes[] = $outcomeDeclaration['identifier'];
                }
            }
        }
        return $scaledOutcomes;
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
