<?php

namespace oat\taoQtiTest\scripts\cli;

use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\action\Action;
use oat\oatbox\service\ServiceManager;
use oat\taoQtiItem\model\qti\exception\ExtractException;
use oat\taoQtiItem\model\qti\exception\ParsingException;

class importMultipleTestsFromDir implements Action
{
    use OntologyAwareTrait;

    protected $uploadDirectoryPath;
    protected $uploadDirectoryUri;

    protected function init()
    {
        $this->uploadDirectoryPath = FILES_PATH . 'tao/upload/';
        if (!file_exists($this->uploadDirectoryPath)) {
            throw new \Exception('Unable to find ' . $this->uploadDirectoryPath);
        }

        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');

        $this->uploadDirectoryUri = \common_ext_ExtensionsManager::singleton()
            ->getExtensionById('tao')
            ->getConfig('defaultUploadFileSource');

    }

    public function __invoke($params = [])
    {
        try {
            $this->init();

            $uploadFileSystem = new \core_kernel_fileSystem_FileSystem($this->uploadDirectoryUri);

            $dir = new \tao_models_classes_service_StorageDirectory(
                $this->uploadDirectoryUri,
                $uploadFileSystem,
                '/import', null
            );
            $dir->setServiceLocator(ServiceManager::getServiceManager());

            /** @var \ArrayIterator $iterator */
            $tests = 0;
            $iterator = $dir->getIterator();
            while ($iterator->valid()) {
                if (substr($iterator->current(), 0, 1) !== '.') {
                    $this->importTest($this->uploadDirectoryPath . $iterator->current());
                    $tests++;
                    echo $iterator->current() . ' imported.' . PHP_EOL;
                } else {
                    echo $iterator->current() . ' skipped.' . PHP_EOL;
                }
                \tao_helpers_File::remove($this->uploadDirectoryPath . $iterator->current());
                $iterator->next();
            }
            return $this->returnSuccess($tests);
        } catch (ExtractException $e) {
            return $this->returnFailure('The ZIP archive containing the IMS QTI Item cannot be extracted.');
        } catch (ParsingException $e) {
            return $this->returnFailure('The ZIP archive does not contain an imsmanifest.xml file or is an invalid ZIP archive.');
        } catch (\Exception $e) {
            return $this->returnFailure($e->getMessage());
        }
    }

    protected function importTest($package)
    {
        // Call service to import package
        \helpers_TimeOutHelper::setTimeOutLimit(\helpers_TimeOutHelper::LONG);
        $report = \taoQtiTest_models_classes_QtiTestService::singleton()
            ->importMultipleTests($this->getDestinationClass(), $package);

        if ($report->getType() !== \common_report_Report::TYPE_SUCCESS) {
            throw new \Exception("ERROR: " . $report->getMessage());
        }
        return true;
    }

    protected function returnFailure($msg)
    {
        return new \common_report_Report(\common_report_Report::TYPE_ERROR, $msg);
    }

    protected function returnSuccess($testsCount)
    {
        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, $testsCount . ' tests imported');
    }

    protected function getDestinationClass()
    {
        return new \core_kernel_classes_Class(TAO_TEST_CLASS);
    }
}