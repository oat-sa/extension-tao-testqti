<?php
/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 *
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiTest\models\cat;

use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\service\ConfigurableService;
use qtism\data\AssessmentSection;
use qtism\data\storage\xml\XmlDocument;

/**
 * Class CatService
 *
 * Service to manage CAT side of QTI test
 *
 * @package oat\taoQtiTest\models\cat
 */
class CatService extends ConfigurableService
{
    use OntologyAwareTrait;

    const SERVICE_ID = 'taoQtiTest/catService';

    const CAT_PROPERTY_SECTIONS = 'http://www.tao.lu/Ontologies/TAOTest.rdf#QtiCatAdaptiveSections';

    /**
     * Import XML data to QTI test RDF properties
     *
     * @param \core_kernel_classes_Resource $test
     * @param XmlDocument $xml
     * @return bool
     * @throws \common_Exception
     */
    public function importCatSectionsIdToRdfTest(\core_kernel_classes_Resource $test, XmlDocument $xml)
    {
        $catProperties = [];
        $assessmentSections = $xml->getDocumentComponent()->getComponentsByClassName('assessmentSection', true);

        /** @var AssessmentSection $assessmentSection */
        foreach ($assessmentSections as $assessmentSection) {
            $catProperties[$assessmentSection->getIdentifier()] = $assessmentSection->getSelection()->getSectionId();
        }

        if (empty($catProperties)) {
            \common_Logger::t('No CAT property to store');
            return true;
        }

        if ($test->setPropertyValue($this->getProperty(self::CAT_PROPERTY_SECTIONS), json_encode($catProperties))) {
            return true;
        } else {
            throw new \common_Exception('Unable to store CAT property to test ' . $test->getUri());
        }
    }
}