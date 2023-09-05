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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\model\Infrastructure;

use core_kernel_classes_Resource;
use oat\generis\model\data\Ontology;
use oat\taoQtiItem\model\qti\Service;
use oat\taoQtiTest\model\Domain\Model\QtiTest;
use oat\taoQtiTest\model\Domain\Model\QtiTestRepositoryInterface;
use oat\taoQtiTest\models\TestModelService;

class QtiTestRepository implements QtiTestRepositoryInterface
{
    /** @var Ontology */
    private $ontology;

    /** @var TestModelService */
    private $testModelService;

    /** @var Service */
    private $qtiItemService;

    public function __construct(Ontology $ontology, TestModelService $testModelService, Service $qtiItemService = null)
    {
        $this->ontology = $ontology;
        $this->testModelService = $testModelService;
        $this->qtiItemService = $qtiItemService ?? Service::singleton();
    }

    public function findByDelivery(string $deliveryUri): ?QtiTest
    {
        $delivery = $this->ontology->getResource($deliveryUri);
        $deliveryTest = $delivery->getProperty('http://www.tao.lu/Ontologies/TAODelivery.rdf#AssembledDeliveryOrigin');
        $testId = $delivery->getOnePropertyValue($deliveryTest)->getUri();

        return new QtiTest($testId, $this->getFirstTestItemLanguage($testId));
    }

    private function getFirstTestItemLanguage(string $testId): ?string
    {
        $items = $this->testModelService->getItems($this->ontology->getResource($testId));

        $firstItem = current($items);

        if (!$firstItem instanceof core_kernel_classes_Resource) {
            return null;
        }

        $item = $this->qtiItemService->getDataItemByRdfItem($firstItem);

        if ($item) {
            return $item->getAttributeValue('xml:lang');
        }

        return null;
    }
}
