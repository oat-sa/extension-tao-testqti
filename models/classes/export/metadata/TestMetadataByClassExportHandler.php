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

use \oat\taoQtiItem\model\flyExporter\form\ItemMetadataByClassExportHandler;
use oat\taoQtiItem\model\flyExporter\extractor\ExtractorException;

class TestMetadataByClassExportHandler extends ItemMetadataByClassExportHandler
{
    public function getLabel()
    {
        return 'test-metadata-export';
    }

    public function export($formValues, $destPath)
    {
        if (isset($formValues['filename']) && isset($formValues['uri'])) {
            try {
                /** @var TestExporter $exporterService */
                $exporterService = $this->getServiceManager()->get(TestMetadataExporter::SERVICE_ID);
                $file =  $exporterService->export($formValues['uri']);
                return $this->output($file);
            } catch (ExtractorException $e) {
                return \common_report_Report::createFailure('Selected object does not have any item to export.');
            }
        }
    }
}