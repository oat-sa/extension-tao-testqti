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

use common_Exception;
use common_exception_Error;
use core_kernel_classes_Class as ResourcesClass;
use core_kernel_classes_Resource as Resource;
use Laminas\ServiceManager\ServiceLocatorAwareTrait;
use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\event\EventManagerAwareTrait;
use oat\oatbox\PhpSerializable;
use oat\oatbox\PhpSerializeStateless;
use oat\oatbox\reporting\Report;
use oat\oatbox\reporting\ReportInterface;
use oat\oatbox\service\ServiceManager;
use oat\tao\model\resources\SecureResourceServiceInterface;
use oat\taoQtiTest\models\event\QtiTestExportEvent;
use oat\taoQtiTest\models\QtiTestUtils;
use tao_helpers_File;
use tao_helpers_form_Form as Form;
use tao_models_classes_export_ExportHandler as ExportHandler;
use ZipArchive;

abstract class AbstractTestExport implements ExportHandler, PhpSerializable
{
    use PhpSerializeStateless;
    use EventManagerAwareTrait;
    use ServiceLocatorAwareTrait;
    use OntologyAwareTrait;

    protected ZipArchive $zip;

    abstract public function getLabel(): string;

    abstract protected function getFormTitle(): string;

    /** @throws common_Exception */
    public function getExportForm(Resource $resource): Form
    {
        return (new ExportForm($this->getFormData($resource), [], $this->getFormTitle()))->getForm();
    }

    abstract protected function getTestExporter(Resource $instance): QtiTestExporterInterface;

    protected function getFormData(Resource $resource): array
    {
        $formData = [];

        if ($resource instanceof ResourcesClass) {
            $formData['items'] = $this->getResourceService()->getAllChildren($resource);
            $formData['file_name'] = $resource->getLabel();
        } else {
            $formData['instance'] = $resource;
        }

        return $formData;
    }

    /**
     * @param array $formValues
     * @param string $destination
     * @throws common_Exception
     * @throws common_exception_Error
     */
    public function export($formValues, $destination): Report
    {
        if (empty($formValues['filename'])) {
            return Report::createError(__('Missing filename for QTI Test export'));
        }

        $instances = is_string($formValues['instances'])
            ? [$formValues['instances']]
            : $formValues['instances'];

        if (!count($instances)) {
            return Report::createError(__('No instance in form to export'));
        }

        $report = Report::createSuccess('');

        $path = tao_helpers_File::concat([$destination, $this->getExportingFileName($formValues['filename'])]);

        if (tao_helpers_File::securityCheck($path, true) === false) {
            throw new common_Exception('Unauthorized file name for QTI Test ZIP archive.');
        }

        // Create a new ZIP archive to store data related to the QTI Test.
        $this->zip = new ZipArchive();
        if ($this->zip->open($path, ZipArchive::CREATE) !== true) {
            throw new common_Exception(sprintf('Unable to create ZIP archive for QTI Test at location "%s".', $path));
        }

        $manifest = $this->getServiceManager()->get(QtiTestUtils::SERVICE_ID)->emptyImsManifest(static::VERSION);

        foreach ($instances as $instance) {
            $subReport = $this->getTestExporter($this->getResource($instance))->export(['manifest' => $manifest]);
            if (
                $report->getType() !== ReportInterface::TYPE_ERROR &&
                ($subReport->containsError() || $subReport->getType() === ReportInterface::TYPE_ERROR)
            ) {
                $report->setType(ReportInterface::TYPE_ERROR);
                $report->setMessage(__('Not all test could be exported'));
            }
            $report->add($subReport);
        }

        $this->zip->close();

        if (!isset($formValues['uri']) && !isset($formValues['classUri'])) {
            $report->add(Report::createError(__('Export failed. Key uri nor classUri in formValues are not defined')));
        } else {
            $subjectUri = $formValues['uri'] ?? $formValues['classUri'];
        }

        if (isset($subjectUri) && !$report->containsError()) {
            $this->triggerTestExportEvent($this->getResource($subjectUri));
            $report->setMessage(__('Resource(s) successfully exported.'));
        }

        $report->setData(['path' => $path]);

        return $report;
    }

    protected function triggerTestExportEvent(Resource $test)
    {
        $this->getEventManager()->trigger(new QtiTestExportEvent($test));
    }

    protected function getExportingFileName(string $userDefinedName): string
    {
        return sprintf('%s_%d.zip', $userDefinedName, time());
    }

    protected function getEmptyManifest()
    {
        return $this->getServiceManager()->get(QtiTestUtils::SERVICE_ID)->emptyImsManifest(static::VERSION);
    }

    /** @noinspection PhpIncompatibleReturnTypeInspection */
    protected function getResourceService(): SecureResourceServiceInterface
    {
        return $this->getServiceManager()->get(SecureResourceServiceInterface::SERVICE_ID);
    }

    protected function getServiceManager(): ServiceManager
    {
        return ServiceManager::getServiceManager();
    }

    protected function getZip(): ZipArchive
    {
        return $this->zip;
    }
}
