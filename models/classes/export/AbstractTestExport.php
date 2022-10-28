<?php

declare(strict_types=1);

namespace oat\taoQtiTest\models\Export;

use common_Exception;
use common_exception_Error;
use core_kernel_classes_Class as ResourcesClass;
use core_kernel_classes_Resource as Resource;
use DOMDocument;
use InvalidArgumentException;
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

    protected const VERSION_2P1 = '2.1';
    protected const VERSION_2P2 = '2.2';

    protected const AVAILABLE_VERSIONS = [
        self::VERSION_2P1,
        self::VERSION_2P2,
    ];

    protected static string $version;
    protected static string $qtiTestExporter;

    public function getLabel(): string
    {
        if (!in_array(static::$version, self::AVAILABLE_VERSIONS)) {
            throw new InvalidArgumentException('The wrong version of QTI package is defined');
        }

        return __('QTI Test Package %s', static::$version);
    }

    /** @throws common_Exception */
    public function getExportForm(Resource $resource): Form
    {
        return (new ExportForm($this->getFormData($resource), [], __('Export QTI %s Test Package', static::$version)))->getForm();
    }

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
        if (!isset($formValues['filename'])) {
            return Report::createError('Missing filename for QTI Test export using ' . __CLASS__);
        }

        $instances = is_string($formValues['instances'])
            ? [$formValues['instances']]
            : $formValues['instances'];

        if (!count($instances)) {
            return Report::createError("No instance in form to export");
        }

        $report = Report::createSuccess('');

        $fileName = $formValues['filename'] . '_' . time() . '.zip';
        $path = tao_helpers_File::concat([$destination, $fileName]);

        if (tao_helpers_File::securityCheck($path, true) === false) {
            throw new common_Exception('Unauthorized file name for QTI Test ZIP archive.');
        }

        // Create a new ZIP archive to store data related to the QTI Test.
        $zip = new ZipArchive();
        if ($zip->open($path, ZipArchive::CREATE) !== true) {
            throw new common_Exception("Unable to create ZIP archive for QTI Test at location '" . $path . "'.");
        }
        // Create an empty IMS Manifest as a basis.
        $manifest = $this->createManifest();

        foreach ($instances as $instance) {
            $testResource = $this->getResource($instance);
            $testExporter = $this->createExporter($testResource, $zip, $manifest);
            $subReport = $testExporter->export();
            if (
                $report->getType() !== ReportInterface::TYPE_ERROR &&
                ($subReport->containsError() || $subReport->getType() === ReportInterface::TYPE_ERROR)
            ) {
                $report->setType(ReportInterface::TYPE_ERROR);
                $report->setMessage(__('Not all test could be exported'));
            }
            $report->add($subReport);
        }

        $zip->close();

        if (!isset($formValues['uri']) && !isset($formValues['classUri'])) {
            $report->add(Report::createError('Export failed. Key uri nor classUri in formValues are not defined'));
        } else {
            $subjectUri = $formValues['uri'] ?? $formValues['classUri'];
        }

        if (isset($subjectUri) && !$report->containsError()) {
            $this->getEventManager()->trigger(new QtiTestExportEvent($this->getResource($subjectUri)));
            $report->setMessage(__('Resource(s) successfully exported.'));
        }

        $report->setData(['path' => $path]);

        return $report;
    }

    protected function createExporter(Resource $testResource, ZipArchive $zip, DOMDocument $manifest): QtiTestExporterInterface
    {
        return new static::$qtiTestExporter($testResource, $zip, $manifest);
    }

    protected function createManifest()
    {
        return $this->getServiceManager()->get(QtiTestUtils::SERVICE_ID)->emptyImsManifest(static::$version);
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
}
