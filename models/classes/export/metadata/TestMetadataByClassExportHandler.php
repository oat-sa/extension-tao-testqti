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

use \oat\taoQtiItem\model\Export\ItemMetadataByClassExportHandler;
use oat\taoQtiItem\model\flyExporter\extractor\ExtractorException;

class TestMetadataByClassExportHandler extends ItemMetadataByClassExportHandler
{
    public function getLabel()
    {
        return 'QTI Test Metadata';
    }

    public function export($formValues, $destPath)
    {
        if (isset($formValues['filename']) && isset($formValues['uri'])) {
            try {
                $instance = new \core_kernel_classes_Resource(\tao_helpers_Uri::decode($formValues['uri']));
                /** @var \core_kernel_classes_Resource $model */
                $model = \taoQtiTest_models_classes_QtiTestService::singleton()->getTestModel($instance);
                if ($model->getUri() != \taoQtiTest_models_classes_QtiTestService::INSTANCE_TEST_MODEL_QTI) {
                    return \common_report_Report::createFailure(__('Metadata export is not available for test "%s."', $instance->getLabel()));
                }

                /** @var TestExporter $exporterService */
                $exporterService = $this->getServiceManager()->get(TestMetadataExporter::SERVICE_ID);
                $this->output(
                    $exporterService->export($formValues['uri']),
                    $formValues['filename']
                );
            } catch (ExtractorException $e) {
                return \common_report_Report::createFailure('Selected object does not have any item to export.');
            }
        }
    }
}