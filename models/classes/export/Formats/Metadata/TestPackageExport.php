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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA;
 */

declare(strict_types=1);

namespace oat\taoQtiTest\models\export\Formats\Metadata;

use core_kernel_classes_Resource as Resource;
use oat\oatbox\event\EventManagerAwareTrait;
use oat\taoQtiTest\models\event\QtiTestMetadataExportEvent;
use oat\taoQtiTest\models\export\AbstractTestExport;
use oat\taoQtiTest\models\export\QtiTestExporterInterface;

class TestPackageExport extends AbstractTestExport
{
    use EventManagerAwareTrait;

    public function getLabel(): string
    {
        return __('QTI Test Metadata');
    }

    protected function getFormTitle(): string
    {
        return sprintf('%s %s', __('Export'), $this->getLabel());
    }

    protected function getExportingFileName(string $userDefinedName): string
    {
        return sprintf('%s_%d_metadata.zip', $userDefinedName, time());
    }

    protected function triggerTestExportEvent(Resource $test)
    {
        $this->getEventManager()->trigger(new QtiTestMetadataExportEvent($test));
    }

    protected function getTestExporter(Resource $instance): QtiTestExporterInterface
    {
        return new QtiTestExporter($instance, $this->getZip());
    }
}

// for backward compatibility
class_alias(TestPackageExport::class, 'oat\\taoQtiTest\\models\\export\\metadata\\TestMetadataByClassExportHandler');
