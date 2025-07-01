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
 * Copyright (c) 2024-2025 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\export\Formats\Package3p0;

use core_kernel_classes_Resource as Resource;
use DOMDocument;
use oat\taoQtiItem\model\Export\Qti3Package\ExporterFactory;
use oat\taoQtiTest\models\export\AbstractQtiTestExporter;
use oat\taoQtiTest\models\export\QtiItemExporterInterface;

class QtiTestExporter extends AbstractQtiTestExporter
{
    protected const TEST_RESOURCE_TYPE = 'imsqti_test_xmlv3p0';

    private const QTI_SCHEMA_NAMESPACE = 'http://www.imsglobal.org/xsd/imsqtiasi_v3p0';
    private const XML_SCHEMA_INSTANCE = 'http://www.w3.org/2001/XMLSchema-instance';
    private const XSI_SCHEMA_LOCATION = 'http://www.imsglobal.org/xsd/imsqtiasi_v3p0';
    // phpcs:ignore Generic.Files.LineLength.TooLong
    private const XSI_SCHEMA_LOCATION_XSD = 'https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd';

    protected function getItemExporter(Resource $item): QtiItemExporterInterface
    {
        $exporter = new QtiItemExporter($item, $this->getZip(), $this->getManifest());
        $exporter->setTransformationService($this->getExporterFactory()->getTransformationService());
        return $exporter;
    }

    protected function adjustTestXml(string $xml): string
    {
        return $this->itemContentPostProcessing($xml);
    }

    protected function itemContentPostProcessing($content): string
    {
        $transformationService = $this->getExporterFactory()->getTransformationService();
        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->loadXML($content);

        $newDom = new DOMDocument('1.0', 'UTF-8');
        $newDom->preserveWhiteSpace = false;
        $newDom->formatOutput = true;

        $oldRoot = $dom->documentElement;
        $newRoot = $newDom->createElement($transformationService->createQtiElementName($oldRoot->nodeName));

        //QTI3 namespace
        $newRoot->setAttribute('xmlns', self::QTI_SCHEMA_NAMESPACE);
        $newRoot->setAttribute('xmlns:xsi', self::XML_SCHEMA_INSTANCE);
        $newRoot->setAttribute(
            'xsi:schemaLocation',
            sprintf('%s %s', self::XSI_SCHEMA_LOCATION, self::XSI_SCHEMA_LOCATION_XSD)
        );

        $transformationService->transformAttributes($oldRoot, $newRoot);

        $newDom->appendChild($newRoot);

        $transformationService->transformChildren($oldRoot, $newRoot, $newDom);

        return $newDom->saveXML();
    }

    private function getExporterFactory(): ExporterFactory
    {
        return $this->getServiceManager()->getContainer()->get(ExporterFactory::class);
    }
}
