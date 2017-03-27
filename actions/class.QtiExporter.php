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

use oat\taoQtiTest\models\export\metadata\TestMetadataByClassExportHandler;

/**
 * Class taoQtiTest_actions_QtiExporter
 *
 * @author Gyula Szucs, <gyula@taotesting.com>
 */
class taoQtiTest_actions_QtiExporter extends \tao_actions_Export
{
    /**
     * Override available export handlers
     *
     * @return array
     */
    protected function getAvailableExportHandlers()
    {
        return [
            new TestMetadataByClassExportHandler()
        ];
    }

    protected function isExportable(array $formData)
    {
        /** @var \core_kernel_classes_Resource $model */
        $model = \taoQtiTest_models_classes_QtiTestService::singleton()->getTestModel($formData['instance']);
        return $model->getUri() == taoQtiTest_models_classes_QtiTestService::INSTANCE_TEST_MODEL_QTI;
    }

    protected function getNotExportableMessage($formData)
    {
        return __(
            'Metadata export is not available for test "%s."',
            ($formData['instance'] instanceof \core_kernel_classes_Resource ? $formData['instance']->getLabel() : '')
        );
    }
}