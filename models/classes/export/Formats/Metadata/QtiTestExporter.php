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
 * Copyright (c) 2015-2022 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\export\Formats\Metadata;

use core_kernel_classes_Resource as Resource;
use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\log\LoggerAwareTrait;
use oat\oatbox\reporting\Report;
use oat\oatbox\service\ServiceManager;
use oat\taoQtiItem\model\flyExporter\simpleExporter\SimpleExporter;
use oat\taoQtiTest\models\export\QtiTestExporterInterface;
use qtism\data\{AssessmentItemRef, AssessmentSection, storage\xml\XmlDocument, TestPart};
use tao_helpers_Uri as Uri;
use taoQtiTest_models_classes_QtiTestService as QtiTestService;
use ZipArchive;

class QtiTestExporter implements QtiTestExporterInterface
{
    use OntologyAwareTrait;
    use LoggerAwareTrait;

    const TEST_PART = 'testPart';
    const TEST_SECTION = 'section';
    const TEST_ITEM = 'assessmentItemRef';

    const ITEM_SHUFFLE = 'shuffle';
    const ITEM_ORDER = 'section-order';
    const ITEM_URI = 'uri';

    /** Resource object of the test, defined for export */
    protected Resource $instance;

    /** Archive object, which contains exported CSV files */
    protected ZipArchive $archive;

    public function __construct(Resource $instance, ZipArchive $archive)
    {
        $this->archive = $archive;
        $this->instance = $instance;
    }

    public function export(array $options = []): Report
    {
        $report = Report::createSuccess(__('Export successful for the test "%s"', $this->instance->getLabel()));

        $metadata = [];

        foreach ($this->getAssessmentData(QtiTestService::singleton()->getDoc($this->instance)) as $data) {
            $itemData = $this->getItemExporter()->getDataByItem($this->getResource($data[static::ITEM_URI]));
            unset($data[static::ITEM_URI]);

            $metadata[] = array_map(fn ($v) => array_merge($v, $data), $itemData);
        }

        $temporaryFilePath = $this->getItemExporter()->save(
            array_merge($this->getItemExporter()->getHeaders(), $this->getHeaders()),
            $metadata
        );

        $this->archive->addFile(
            $temporaryFilePath,
            sprintf('%s_%s.csv', $this->instance->getLabel(), Uri::getUniqueId($this->instance->getUri()))
        );

        return $report;
    }

    protected function getAssessmentData(XmlDocument $xml): array
    {
        $assessmentItemData = [];

        $testPartCollection = $xml->getDocumentComponent()->getComponentsByClassName(static::TEST_PART);

        /** @var TestPart $testPart */
        foreach ($testPartCollection as $testPart) {
            $sectionCollection = $testPart->getAssessmentSections();
            /** @var AssessmentSection $section */
            foreach ($sectionCollection as $section) {
                $itemCollection = $section->getComponentsByClassName(static::TEST_ITEM);
                $order = 1;
                /** @var AssessmentItemRef $item */
                foreach ($itemCollection as $item) {
                    $assessmentItemData[$item->getIdentifier()] = [
                        static::ITEM_URI     => $item->getHref(),
                        static::TEST_PART    => $testPart->getIdentifier(),
                        static::TEST_SECTION => $section->getIdentifier(),
                        static::ITEM_SHUFFLE => !is_null($section->getOrdering())
                            ? (int)$section->getOrdering()->getShuffle()
                            : 0,
                        static::ITEM_ORDER   => $order,
                    ];
                    $order++;
                }
            }
        }

        return $assessmentItemData;
    }

    /** Get headers of additional data for assessment items */
    protected function getHeaders(): array
    {
        return [
            static::TEST_PART,
            static::TEST_SECTION,
            static::ITEM_SHUFFLE,
            static::ITEM_ORDER
        ];
    }

    protected function getItemExporter(): SimpleExporter
    {
        /** @noinspection PhpIncompatibleReturnTypeInspection */
        return ServiceManager::getServiceManager()->get(SimpleExporter::SERVICE_ID);
    }
}
