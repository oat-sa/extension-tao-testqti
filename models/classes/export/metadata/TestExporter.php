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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 *
 */

namespace oat\taoQtiTest\models\export\metadata;

use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\service\ConfigurableService;
use oat\taoQtiItem\model\flyExporter\simpleExporter\ItemExporter;
use oat\taoQtiItem\model\flyExporter\simpleExporter\SimpleExporter;
use qtism\data\AssessmentItemRef;
use qtism\data\AssessmentSection;
use qtism\data\TestPart;

/**
 * Class TestExporter
 */
class TestExporter extends ConfigurableService implements TestMetadataExporter
{
    use OntologyAwareTrait;

    const TEST_PART = 'testPart';
    const TEST_SECTION = 'section';
    const TEST_ITEM = 'assessmentItemRef';
    const ITEM_SHUFFLE = 'shuffle';
    const ITEM_ORDER = 'section-order';
    const ITEM_URI = 'uri';

    const OPTION_FILE_NAME = 'fileName';

    /**
     * Item exporter to handle each items
     *
     * @var SimpleExporter
     */
    protected $itemExporter;

    /**
     * Uri of assessment to export
     *
     * @var string
     */
    protected $assessmentUri;

    /**
     * Item data extracted from assessment
     *
     * @var array
     */
    protected $assessmentItemData = [];

    /**
     * @param string $uri
     * @return string
     * @throws \common_exception_Error
     */
    public function export($uri)
    {
        $this->assessmentUri = $uri;

        $testData = $this->getAssessmentData();

        $finalData = [];
        foreach ($testData as $data) {
            $item = new \core_kernel_classes_Resource($data[self::ITEM_URI]);
            unset($data[self::ITEM_URI]);
            $itemData = $this->getItemExporter()->getDataByItem($item);
            foreach ($itemData as &$column) {
                $column = array_merge($column, $data);
            }
            $finalData[] = $itemData;
        }

        $headers = array_merge($this->getItemExporter()->getHeaders(), $this->getHeaders());

        return $this->getItemExporter()->save($headers, $finalData);
    }


    /**
     * Fetch assessment item data
     *
     * @return array
     */
    protected function getAssessmentData()
    {
        if (empty($this->assessmentItemData)) {
            $xml = \taoQtiTest_models_classes_QtiTestService::singleton()->getDoc($this->getResource($this->assessmentUri));
            $testPartCollection = $xml->getDocumentComponent()->getComponentsByClassName(self::TEST_PART);

            /** @var TestPart $testPart */
            foreach ($testPartCollection as $testPart) {
                $sectionCollection = $testPart->getAssessmentSections();
                /** @var AssessmentSection $section */
                foreach ($sectionCollection as $section) {
                    $itemCollection = $section->getComponentsByClassName(self::TEST_ITEM);
                    $order = 1;
                    /** @var AssessmentItemRef $item */
                    foreach ($itemCollection as $item) {
                        $this->assessmentItemData[$item->getIdentifier()] = [
                            self::ITEM_URI     => $item->getHref(),
                            self::TEST_PART    => $testPart->getIdentifier(),
                            self::TEST_SECTION => $section->getIdentifier(),
                            self::ITEM_SHUFFLE => is_null($section->getOrdering()) ? 0 : (int)$section->getOrdering()->getShuffle(),
                            self::ITEM_ORDER   => $order,
                        ];
                        $order++;
                    }
                }
            }
        }

        return $this->assessmentItemData;
    }

    /**
     * Get headers of additional data for assessment items
     *
     * @return array
     */
    protected function getHeaders()
    {
        return [self::TEST_PART, self::TEST_SECTION, self::ITEM_SHUFFLE, self::ITEM_ORDER];
    }

    /**
     * Get item exporter service
     *
     * @return SimpleExporter
     */
    protected function getItemExporter()
    {
        if (!$this->itemExporter) {
            $this->itemExporter = $this->getServiceLocator()->get(SimpleExporter::SERVICE_ID);
            if ($this->hasOption(self::OPTION_FILE_NAME)) {
                $this->itemExporter->setOption(ItemExporter::OPTION_FILE_LOCATION, $this->getOption(self::OPTION_FILE_NAME));
            }
        }

        return $this->itemExporter;
    }
}