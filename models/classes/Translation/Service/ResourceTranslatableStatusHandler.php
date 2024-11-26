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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA.
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\Translation\Service;

use oat\generis\model\data\Ontology;
use oat\tao\model\Translation\Entity\ResourceTranslatableStatus;
use taoQtiTest_models_classes_QtiTestService;

class ResourceTranslatableStatusHandler
{
    private taoQtiTest_models_classes_QtiTestService $testQtiService;
    private Ontology $ontology;

    public function __construct(taoQtiTest_models_classes_QtiTestService $testQtiService, Ontology $ontology)
    {
        $this->testQtiService = $testQtiService;
        $this->ontology = $ontology;
    }

    public function __invoke(ResourceTranslatableStatus $status): void
    {
        $originalTest = $this->ontology->getResource($status->getUri());

        $status->setEmpty(empty($this->testQtiService->getItems($originalTest)));
    }
}
