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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 *
 *
 */

namespace oat\taoQtiTest\models\export\preprocessor;

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\qti\Service;
use qtism\common\utils\Format;
use qtism\data\storage\xml\XmlDocument;

/**
 * Class IdentifierReplacementPreProcessor
 * Replace the test identifier (item-1, item-2 ...) by the item identifier
 * @package oat\taoQtiTest\models\export\preprocessor
 */
class IdentifierReplacementPreProcessor extends ConfigurableService implements PreProcessor
{

    public function process(XmlDocument $testDocument)
    {
        /** @var \qtism\data\AssessmentItemRefCollection $assessmentItemRefs */
        $assessmentItemRefs = $testDocument->getDocumentComponent()->getComponentsByClassName('assessmentItemRef');
        /** @var \qtism\data\AssessmentItemRef $assessmentItemRef */
        $items = [];
        foreach ($assessmentItemRefs as $assessmentItemRef){
            $item = new \core_kernel_classes_Resource($assessmentItemRef->getHref());

            if($item->exists()){
                $itemRdf  = Service::singleton()
                    ->getDataItemByRdfItem($item);
                $identifier = $itemRdf->getIdentifier();
                $identifier = Format::sanitizeIdentifier($identifier);
                $assessmentItemRef->setIdentifier($identifier);
                $items[$identifier] = $item;
            }
        }

        return $items;
    }
}