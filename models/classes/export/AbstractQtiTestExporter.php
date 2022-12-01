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
 * Copyright (c) 2014-2022 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\export;

use common_exception_Error;
use common_exception_InconsistentData;
use common_Logger;
use core_kernel_classes_Resource as Resource;
use core_kernel_persistence_Exception;
use DOMDocument;
use DOMException;
use DOMXPath;
use oat\oatbox\reporting\Report;
use oat\oatbox\reporting\ReportInterface;
use qtism\data\storage\xml\marshalling\MarshallingException;
use qtism\data\storage\xml\XmlDocument;
use oat\oatbox\filesystem\Directory;
use oat\taoQtiItem\model\qti\metadata\exporter\MetadataExporter;
use oat\taoQtiItem\model\qti\metadata\MetadataService;
use oat\oatbox\service\ServiceManager;
use oat\taoQtiTest\models\export\preprocessor\AssessmentItemRefPreProcessor;
use qtism\data\storage\xml\XmlStorageException;
use tao_helpers_Uri;
use taoItems_models_classes_ItemExporter as ItemExporter;
use taoQtiTest_models_classes_QtiTestService as QtiTestService;
use taoQtiTest_models_classes_QtiTestServiceException;
use ZipArchive;

abstract class AbstractQtiTestExporter extends ItemExporter implements QtiTestExporterInterface
{
    /** The QTISM XmlDocument representing the Test to be exported. */
    private XmlDocument $testDocument;

    /** A reference to the QTI Test Service. */
    private QtiTestService $testService;

    /**
     * An array of items related to the current Test Export. The array is associative.
     * Its keys are actually the assessmentItemRef identifiers.
     */
    private array $items;

    /** A DOMDocument representing the IMS Manifest to be populated while exporting the Test. */
    private DOMDocument $manifest;

    /** Service to export metadata to IMSManifest */
    protected MetadataExporter $metadataExporter;

    /**
     * Create a new instance of QtiTestExport.
     * @param Resource $test The Resource in the ontology representing the QTI Test to be exported.
     * @param ZipArchive $zip An instance of ZipArchive were components of the QTI Test will be stored into.
     * @param DOMDocument $manifest A DOMDocument representing the IMS Manifest to be populated during the Test Export.
     * @throws taoQtiTest_models_classes_QtiTestServiceException
     */
    public function __construct(Resource $test, ZipArchive $zip, DOMDocument $manifest)
    {
        parent::__construct($test, $zip);

        /** @noinspection PhpParamsInspection */
        $this->setTestService(QtiTestService::singleton());
        $this->setTestDocument($this->getTestService()->getDoc($test));
        $this->setItems($this->getTestService()->getItems($test));
        $this->setManifest($manifest);
    }

    abstract protected function getItemExporter(Resource $item): QtiItemExporterInterface;

    abstract protected function adjustTestXml(string $xml): string;

    /** Set the QTISM XmlDocument which holds the QTI Test definition to be exported. */
    protected function setTestDocument(XmlDocument $testDocument): void
    {
        $this->testDocument = $testDocument;
    }

    /** Get the QTISM XmlDocument which holds the QTI Test definition to be exported. */
    protected function getTestDocument(): XmlDocument
    {
        return $this->testDocument;
    }

    /** Set a reference on the QTI Test Service. */
    protected function setTestService(QtiTestService $service): void
    {
        $this->testService = $service;
    }

    /** Get a reference on the QTI Test Service. */
    protected function getTestService(): QtiTestService
    {
        return $this->testService;
    }

    /**
     * Set the array of items that are involved in the QTI Test Definition to be exported.
     * @param array $items An associative array where keys are assessmentItemRef identifiers and values are core_kernel_classes_Resource objects representing the items in the knowledge base.
     */
    protected function setItems(array $items): void
    {
        $this->items = $items;
    }

    /**
     * Get the array of items that are involved in the QTI Test Definition to be exported.
     * @return array An associative array where keys are assessmentItemRef identifiers and values are core_kernel_classes_Resource objects representing the items in the knowledge base.
     */
    protected function getItems(): array
    {
        return $this->items;
    }

    /** Set the DOMDocument representing the IMS Manifest to be populated during Test Export. */
    protected function setManifest(DOMDocument $manifest): void
    {
        $this->manifest = $manifest;
    }

    /** Get the DOMDocument representing the IMS Manifest to be populated during Test Export. */
    protected function getManifest(): DOMDocument
    {
        return $this->manifest;
    }

    protected function preProcessing(): void
    {
        if (!$this->getServiceManager()->has(AssessmentItemRefPreProcessor::SERVICE_ID)) {
            return;
        }

        /** @var AssessmentItemRefPreProcessor $preprocessor */
        $preprocessor = $this->getServiceManager()->get(AssessmentItemRefPreProcessor::SERVICE_ID);

        $this->setItems($preprocessor->process($this->testDocument));
    }

    /** Export the test definition and all its dependencies (media, items, ...) into the related ZIP archive. */
    public function export(array $options = []): Report
    {
        $this->preProcessing();

        // 1. Export the items bound to the test.
        $report = $this->exportItems();

        // 2. Export the test definition itself.
        $this->exportTest($report->getData());

        // 3. Export test metadata to manifest
        $this->getMetadataExporter()->export($this->getItem(), $this->getManifest());

        // 4. Persist manifest in archive.
        $this->getZip()->addFromString('imsmanifest.xml', $this->getManifest()->saveXML());

        return $report;
    }

    /**
     * Export the dependent items into the ZIP archive.
     *
     * @return Report that contains An array of identifiers that were assigned to exported items into the IMS Manifest.
     * @throws common_exception_Error
     */
    protected function exportItems(): Report
    {
        $report = Report::createSuccess(__('Export successful for the test "%s"', $this->getItem()->getLabel()));

        $identifiers = [];

        foreach ($this->getItems() as $refIdentifier => $item) {
            $itemExporter = $this->getItemExporter($item);
            if (!in_array($itemExporter->buildIdentifier(), $identifiers)) {
                $identifiers[] = $itemExporter->buildIdentifier();
                $subReport = $itemExporter->export();
            }

            // Modify the reference to the item in the test definition.
            $newQtiItemXmlPath = '../../items/' . tao_helpers_Uri::getUniqueId($item->getUri()) . '/qti.xml';
            $itemRef = $this->getTestDocument()->getDocumentComponent()->getComponentByIdentifier($refIdentifier);
            $itemRef->setHref($newQtiItemXmlPath);

            if (
                $report->getType() !== ReportInterface::TYPE_ERROR &&
                isset($subReport) &&
                ($subReport->containsError() || $subReport->getType() === ReportInterface::TYPE_ERROR)
            ) {
                // only report errors otherwise the list of report can be very long
                $report->setType(ReportInterface::TYPE_ERROR);
                $report->setMessage(__('Export failed for the test "%s"', $this->getItem()->getLabel()));
                $report->add($subReport);
            }
        }

        return $report->setData($identifiers);
    }

    /**
     * Export the Test definition itself and its related media.
     * @param array $itemIdentifiers An array of identifiers that were assigned to exported items into the IMS Manifest.
     * @throws DOMException
     * @throws common_exception_InconsistentData
     * @throws core_kernel_persistence_Exception
     * @throws XmlStorageException
     * @throws MarshallingException
     * @throws taoQtiTest_models_classes_QtiTestServiceException
     */
    protected function exportTest(array $itemIdentifiers): void
    {
        $testXmlDocument = $this->adjustTestXml($this->getTestDocument()->saveToString());

        $newTestDir = 'tests/' . tao_helpers_Uri::getUniqueId($this->getItem()->getUri()) . '/';
        $testRootDir = $this->getTestService()->getQtiTestDir($this->getItem());
        $testHref = $newTestDir . 'test.xml';

        common_Logger::t('TEST DEFINITION AT: ' . $testHref);

        $this->getZip()->addFromString($testHref, $testXmlDocument);
        $this->referenceTest($testHref, $itemIdentifiers);

        $iterator = $testRootDir->getFlyIterator(Directory::ITERATOR_RECURSIVE | Directory::ITERATOR_FILE);
        $indexFile = pathinfo(QtiTestService::QTI_TEST_DEFINITION_INDEX, PATHINFO_BASENAME);
        foreach ($iterator as $f) {
            // Only add dependency files...
            if ($f->getBasename() !== QtiTestService::TAOQTITEST_FILENAME && $f->getBasename() !== $indexFile) {
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
     * @throws DOMException
     */
    protected function referenceTest(string $href, array $itemIdentifiers): void
    {
        $identifier = tao_helpers_Uri::getUniqueId($this->getItem()->getUri());
        $manifest = $this->getManifest();

        // Identify the target node.
        $resources = $manifest->getElementsByTagName('resources');
        $targetElt = $resources->item(0);

        // Create the IMS Manifest <resource> element.
        $resourceElt = $manifest->createElement('resource');
        $resourceElt->setAttribute('identifier', $identifier);
        $resourceElt->setAttribute('type', static::TEST_RESOURCE_TYPE);
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
     * @param string $identifierRef The identifier of the item resource in the IMS Manifest.
     * @throws DOMException
     */
    protected function referenceDependency(string $identifierRef): void
    {
        $manifest = $this->getManifest();
        $xpath = new DOMXpath($manifest);

        $identifier = tao_helpers_Uri::getUniqueId($this->getItem()->getUri());

        $search = $xpath->query("//resource[@identifier='${identifier}']");
        $resourceElement = $search->item(0);

        // Append IMS Manifest <dependency> elements referencing $identifierRef.
        $dependencyElement = $manifest->createElement('dependency');
        $dependencyElement->setAttribute('identifierref', $identifierRef);

        $resourceElement->appendChild($dependencyElement);
    }

    /**
     * Reference a Test Auxiliary File (e.g. media, stylesheet, ...) in the IMS Manifest.
     * @param string $href The path (base path is the ZIP archive) to the auxiliary file in the ZIP archive.
     * @throws DOMException
     */
    protected function referenceAuxiliaryFile(string $href): void
    {
        $manifest = $this->getManifest();
        $xpath = new DOMXPath($manifest);

        $testIdentifier = tao_helpers_Uri::getUniqueId($this->getItem()->getUri());

        // Find the first <dependency> element.
        $dependencies = $xpath->query("//resource[@identifier='${testIdentifier}']/dependency");
        $firstDependencyElement = $dependencies->item(0);

        // Create an IMS Manifest <file> element.
        $fileElement = $manifest->createElement('file');
        $fileElement->setAttribute('href', ltrim($href, '/'));

        $firstDependencyElement->parentNode->insertBefore($fileElement, $firstDependencyElement);
    }

    protected function setMetadataExporter(): MetadataExporter
    {
        $this->metadataExporter = $this->getServiceManager()->get(MetadataService::SERVICE_ID)->getExporter();

        return $this->metadataExporter;
    }

    protected function getMetadataExporter(): MetadataExporter
    {
        return $this->metadataExporter ?? $this->setMetadataExporter();
    }

    protected function getServiceManager(): ServiceManager
    {
        return ServiceManager::getServiceManager();
    }
}
