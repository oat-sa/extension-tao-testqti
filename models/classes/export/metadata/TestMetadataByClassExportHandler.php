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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiTest\models\export\metadata;

use common_report_Report as Report;
use oat\oatbox\event\EventManagerAwareTrait;
use \oat\taoQtiItem\model\Export\ItemMetadataByClassExportHandler;
use oat\taoQtiTest\models\event\QtiTestMetadataExportEvent;

class TestMetadataByClassExportHandler extends ItemMetadataByClassExportHandler
{
    use EventManagerAwareTrait;

    /**
     * @return string
     */
    public function getLabel()
    {
        return 'QTI Test Metadata';
    }

    public function export($formValues, $destPath)
    {
        if (!isset($formValues['filename'])) {
            return Report::createFailure('Missing filename for export using ' . __CLASS__);
        }

        if (!isset($formValues['uri'])) {
            return Report::createFailure('No uri selected for export using ' . __CLASS__);
        }

        $report = Report::createSuccess();

        $instance = new \core_kernel_classes_Resource(\tao_helpers_Uri::decode($formValues['uri']));

        /** @var \core_kernel_classes_Resource $model */
        $model = \taoQtiTest_models_classes_QtiTestService::singleton()->getTestModel($instance);
        if ($model->getUri() != \taoQtiTest_models_classes_QtiTestService::INSTANCE_TEST_MODEL_QTI) {
            return Report::createFailure(__('Metadata export is not available for test "%s."', $instance->getLabel()));
        }

        $fileName = $formValues['filename'] .'_'. time() .'.csv';

        if (!\tao_helpers_File::securityCheck($fileName, true)) {
            throw new \Exception('Unauthorized file name');
        }

        /** @var TestExporter $exporterService */
        $exporterService = $this->getServiceManager()->get(TestMetadataExporter::SERVICE_ID);
        $exporterService->setOption(TestExporter::OPTION_FILE_NAME, $fileName);

        $filePath = $exporterService->export($formValues['uri']);

        $report->setData($filePath);
        $report->setMessage(__('Test metadata successfully exported.'));

        $this->getEventManager()->trigger(new QtiTestMetadataExportEvent($instance));

        return $report;
    }
}