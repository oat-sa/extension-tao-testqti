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
use taoQtiTest_models_classes_QtiTestService as QtiTestService;

class ScaleHandler
{
    private Ontology $ontology;
    private QtiTestService $qtiTestService;

    public function __construct(QtiTestService $qtiTestService
    )
    {
        $this->qtiTestService = $qtiTestService;
    }

    public function handle(string $model, core_kernel_classes_Resource $test)
    {
        $model = json_decode($model, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \InvalidArgumentException('Invalid JSON model provided');
        }

        return $this->qtiTestService->setTestOutcomeDeclarationScales($test, $model);
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
}
