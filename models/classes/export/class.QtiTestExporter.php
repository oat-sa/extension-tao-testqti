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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

use qtism\data\storage\xml\XmlDocument;
use oat\oatbox\filesystem\Directory;
use oat\taoQtiItem\model\qti\metadata\exporter\MetadataExporter;
use oat\taoQtiItem\model\qti\metadata\MetadataService;
use oat\oatbox\service\ServiceManager;
use oat\taoQtiTest\models\export\preprocessor\AssessmentItemRefPreProcessor;

/**
 * A specialization of QTI ItemExporter aiming at exporting IMS QTI Test definitions from the TAO
 * platform to a ZIP archive.
 *
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 *
 */
class taoQtiTest_models_classes_export_QtiTestExporter extends taoItems_models_classes_ItemExporter
{

    /**
     * The QTISM XmlDocument representing the Test to be
     * exported.
     *
     * @var XmlDocument
     */
    private $testDocument;

    /**
     * A reference to the QTI Test Service.
     *
     * @var taoQtiTest_models_classes_QtiTestService
     */
    private $testService;

    /**
     * An array of items related to the current Test Export. The array is associative. Its
     * keys are actually the assessmentItemRef identifiers.
     *
     * @var array
     */
    private $items;

    /**
     * A DOMDocument representing the IMS Manifest to be
     * populated while exporting the Test.
     *
     * @var DOMDocument
     */
    private $manifest = null;

    /**
     * @var MetadataExporter Service to export metadata to IMSManifest
     */
    protected $metadataExporter;

    /**
     * Create a new instance of QtiTestExport.
     *
     * @param core_kernel_classes_Resource $test The Resource in the ontology representing the QTI Test to be exported.
     * @param ZipArchive $zip An instance of ZipArchive were components of the QTI Test will be stored into.
     * @param DOMDocument $manifest A DOMDocument representing the IMS Manifest to be populated during the Test Export.
     */
    public function __construct(core_kernel_classes_Resource $test, ZipArchive $zip, DOMDocument $manifest)
    {
        parent::__construct($test, $zip);
        $this->setTestService(taoQtiTest_models_classes_QtiTestService::singleton());
        $this->setTestDocument($this->getTestService()->getDoc($test));
        $this->setItems($this->getTestService()->getItems($test));
        $this->setManifest($manifest);
    }

    /**
     * Set the QTISM XmlDocument which holds the QTI Test definition to be exported.
     *
     * @param XmlDocument $testDocument
     */
    protected function setTestDocument(XmlDocument $testDocument)
    {
        $this->testDocument = $testDocument;
    }

    /**
     * Get the QTISM XmlDocument which holds the QTI Test definition to be exported.
     *
     * @return XmlDocument
     */
    protected function getTestDocument()
    {
        return $this->testDocument;
    }

    /**
     * Set a reference on the QTI Test Service.
     *
     * @param taoQtiTest_models_classes_QtiTestService $service
     */
    protected function setTestService(taoQtiTest_models_classes_QtiTestService $service)
    {
        $this->testService = $service;
    }

    /**
     * Get a reference on the QTI Test Service.
     *
     * @return taoQtiTest_models_classes_QtiTestService
     */
    protected function getTestService()
    {
        return $this->testService;
    }

    /**
     * Set the array of items that are involved in the QTI Test Definition to
     * be exported.
     *
     * @param array $items An associative array where keys are assessmentItemRef identifiers and values are core_kernel_classes_Resource objects representing the items in the knowledge base.
     */
    protected function setItems(array $items)
    {
        $this->items = $items;
    }

    /**
     * Get the array of items that are involved in the QTI Test Definition
     * to be exported.
     *
     * @return array An associative array where keys are assessmentItemRef identifiers and values are core_kernel_classes_Resource objects representing the items in the knowledge base.
     */
    protected function getItems()
    {
        return $this->items;
    }

    /**
     * Set the DOMDocument representing the IMS Manifest to be
     * populated during Test Export.
     *
     * @param DOMDocument $manifest
     */
    protected function setManifest(DOMDocument $manifest)
    {
        $this->manifest = $manifest;
    }

    /**
     * Get the DOMDocument representing the IMS Manifest to
     * be populated during Test Export.
     *
     * @return DOMDocument
     */
    public function getManifest()
    {
        return $this->manifest;
    }


    public function preProcessing()
    {
        if($this->getServiceManager()->has(AssessmentItemRefPreProcessor::SERVICE_ID)) {
            /** @var AssessmentItemRefPreProcessor $preprocessor */
            $preprocessor = $this->getServiceManager()->get(AssessmentItemRefPreProcessor::SERVICE_ID);
            $items = $preprocessor->process($this->testDocument);
            $this->setItems($items);
        }

    }
    /**
     * Export the test definition and all its dependencies (media, items, ...) into
     * the related ZIP archive.
     *
     * @param array $options An array of options (not used by this implementation).
     * @return common_report_Report
     */
    public function export($options = array())
    {
        $this->preProcessing();

        // 1. Export the items bound to the test.
        $report = $this->exportItems();
        $itemIdentifiers = $report->getData();

        // 2. Export the test definition itself.
        $this->exportTest($itemIdentifiers);

        // 3. Export test metadata to manifest
        $this->getMetadataExporter()->export($this->getItem(), $this->getManifest());

        // 4. Persist manifest in archive.
        $this->getZip()->addFromString('imsmanifest.xml', $this->getManifest()->saveXML());

        return $report;
    }

    /**
     * Export the dependent items into the ZIP archive.
     *
     * @return common_report_Report that contains An array of identifiers that were assigned to exported items into the IMS Manifest.
     */
    protected function exportItems()
    {
        $report = common_report_Report::createSuccess(__('Export successful for the test "%s"', $this->getItem()->getLabel()));
        $identifiers = array();

        foreach ($this->getItems() as $refIdentifier => $item) {
            $itemExporter = $this->createItemExporter($item);
            if (!in_array($itemExporter->buildIdentifier(), $identifiers)) {
                $identifiers[] = $itemExporter->buildIdentifier();
                $subReport = $itemExporter->export();
            }

            // Modify the reference to the item in the test definition.
            $newQtiItemXmlPath = '../../items/' . tao_helpers_Uri::getUniqueId($item->getUri()) . '/qti.xml';
            $itemRef = $this->getTestDocument()->getDocumentComponent()->getComponentByIdentifier($refIdentifier);
            $itemRef->setHref($newQtiItemXmlPath);

            if ($report->getType() !== common_report_Report::TYPE_ERROR &&
                ($subReport->containsError() || $subReport->getType() === common_report_Report::TYPE_ERROR)
            ) {
                //only report erros otherwise the list of report can be very long
                $report->setType(common_report_Report::TYPE_ERROR);
                $report->setMessage(__('Export failed for the test "%s"', $this->getItem()->getLabel()));
                $report->add($subReport);
            }

        }
        $report->setData($identifiers);

        return $report;
    }

    /**
     * Export the Test definition itself and its related media.
     *
     * @param array $itemIdentifiers An array of identifiers that were assigned to exported items into the IMS Manifest.
     */
    protected function exportTest(array $itemIdentifiers)
    {
        $testXmlDocument = $this->postProcessing($this->getTestDocument()->saveToString());

        $newTestDir = 'tests/' . tao_helpers_Uri::getUniqueId($this->getItem()->getUri()).'/';
        $testRootDir = $this->getTestService()->getQtiTestDir($this->getItem());
        $testHref = $newTestDir . 'test.xml';

        common_Logger::t('TEST DEFINITION AT: ' . $testHref);
        $this->getZip()->addFromString($testHref, $testXmlDocument);
        $this->referenceTest($testHref, $itemIdentifiers);

        $iterator = $testRootDir->getFlyIterator(Directory::ITERATOR_RECURSIVE|Directory::ITERATOR_FILE);
        $indexFile = pathinfo(taoQtiTest_models_classes_QtiTestService::QTI_TEST_DEFINITION_INDEX , PATHINFO_BASENAME);
        foreach ($iterator as $f) {
            // Only add dependency files...
            if ($f->getBasename() !== taoQtiTest_models_classes_QtiTestService::TAOQTITEST_FILENAME && $f->getBasename() !== $indexFile) {

                // Add the file to the archive.
                $fileHref = $newTestDir . $f->getBaseName();
                common_Logger::t('AUXILIARY FILE AT: ' . $fileHref);
                $this->getZip()->addFromString($fileHref, $f->read());
                $this->referenceAuxiliaryFile($fileHref);
            }
        }
    }

    /**
     * Reference the test into the IMS Manifest.
     *
     * @param string $href The path (base path is the ZIP archive) to the test definition.
     * @param array $itemIdentifiers An array of identifiers that were assigned to exported items into the IMS Manifest.
     */
    protected function referenceTest($href, array $itemIdentifiers)
    {
        $identifier = tao_helpers_Uri::getUniqueId($this->getItem()->getUri());
        $manifest = $this->getManifest();

        // Identifiy the target node.
        $resources = $manifest->getElementsByTagName('resources');
        $targetElt = $resources->item(0);

        // Create the IMS Manifest <resource> element.
        $resourceElt = $manifest->createElement('resource');
        $resourceElt->setAttribute('identifier', $identifier);
        $resourceElt->setAttribute('type', $this->getTestResourceType());
        $resourceElt->setAttribute('href', $href);
        $targetElt->appendChild($resourceElt);

        // Append an IMS Manifest <file> element referencing the test definition.
        $fileElt = $manifest->createElement('file');
        $fileElt->setAttribute('href', $href);
        $resourceElt->appendChild($fileElt);

        foreach ($itemIdentifiers as $itemIdentifier) {
            $this->referenceDependency($itemIdentifier);
        }
    }

    /**
     * Reference a test dependency (i.e. Items related to the test) in the IMS Manifest.
     *
     * @param string $identifierRef The identifier of the item resource in the IMS Manifest.
     */
    protected function referenceDependency($identifierRef)
    {
        $xpath = new DOMXpath($this->getManifest());
        $identifier = tao_helpers_Uri::getUniqueId($this->getItem()->getUri());
        $manifest = $this->getManifest();

        $search = $xpath->query("//resource[@identifier='${identifier}']");
        $resourceElt = $search->item(0);

        // Append IMS Manifest <dependency> elements referencing $identifierRef.
        $dependencyElt = $manifest->createElement('dependency');
        $dependencyElt->setAttribute('identifierref', $identifierRef);
        $resourceElt->appendChild($dependencyElt);
    }

    /**
     * Reference a Test Auxiliary File (e.g. media, stylesheet, ...) in the IMS Manifest.
     *
     * @param string $href The path (base path is the ZIP archive) to the auxiliary file in the ZIP archive.
     */
    protected function referenceAuxiliaryFile($href)
    {
        $manifest = $this->getManifest();
        $testIdentifier = tao_helpers_Uri::getUniqueId($this->getItem()->getUri());
        $xpath = new DOMXPath($manifest);

        // Find the first <dependency> element.
        $dependencies = $xpath->query("//resource[@identifier='${testIdentifier}']/dependency");
        $firstDependencyElt = $dependencies->item(0);

        // Create an IMS Manifest <file> element.
        $fileElt = $manifest->createElement('file');
        $fileElt->setAttribute('href', ltrim($href, '/'));

        $firstDependencyElt->parentNode->insertBefore($fileElt, $firstDependencyElt);
    }
    
    protected function createItemExporter(core_kernel_classes_Resource $item)
    {
        return new taoQtiTest_models_classes_export_QtiItemExporter($item, $this->getZip(), $this->getManifest());
    }
    
    protected function getTestResourceType()
    {
        return 'imsqti_test_xmlv2p1';
    }
    
    protected function postProcessing($testXmlDocument)
    {
        return $testXmlDocument;
    }

    /**
     * Get the service to export Metadata
     *
     * @return MetadataExporter
     */
    protected function getMetadataExporter()
    {
        if (! $this->metadataExporter) {
            $this->metadataExporter = $this->getServiceManager()->get(MetadataService::SERVICE_ID)->getExporter();
        }
        return $this->metadataExporter;

    }

    protected function getServiceManager()
    {
        return ServiceManager::getServiceManager();
    }
}
