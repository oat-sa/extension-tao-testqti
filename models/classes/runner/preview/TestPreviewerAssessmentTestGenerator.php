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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA ;
 */

namespace oat\taoQtiTest\models\runner\preview;

use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\qti\Service;
use qtism\data\AssessmentTest;
use qtism\data\storage\xml\XmlCompactDocument;
use qtism\data\storage\xml\XmlStorageException;
use taoQtiTest_helpers_ItemResolver;
use taoQtiTest_models_classes_QtiTestService;

class TestPreviewerAssessmentTestGenerator extends ConfigurableService
{
    use OntologyAwareTrait;

    /**
     * @throws XmlStorageException
     */
    public function generate(string $testUri): AssessmentTest
    {
        $testService = $this->getServiceLocator()->get(taoQtiTest_models_classes_QtiTestService::class);
        $test = $this->getResource($testUri);

        $service = $this->getServiceLocator()->get(Service::class);

        $resolver = new taoQtiTest_helpers_ItemResolver($service);
        $originalDoc = $testService->getDoc($test);

        $compiledDoc = XmlCompactDocument::createFromXmlAssessmentTestDocument($originalDoc, $resolver, $resolver);

        return $compiledDoc->getDocumentComponent();
    }
}
