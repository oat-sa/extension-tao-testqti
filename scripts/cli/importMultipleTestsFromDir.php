<?php

namespace oat\taoQtiTest\scripts\cli;

use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\action\Action;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\filesystem\FileSystemService;
use oat\oatbox\service\ServiceManager;
use oat\taoQtiItem\model\qti\exception\ExtractException;
use oat\taoQtiItem\model\qti\exception\ParsingException;

class importMultipleTestsFromDir implements Action
{
    use OntologyAwareTrait;

    /** @var  Directory */
    protected $directory;

    protected function init()
    {
        $this->uploadDirectoryPath = FILES_PATH . 'tao/upload/';

        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');

        $uriDirectory = \common_ext_ExtensionsManager::singleton()
            ->getExtensionById('tao')
            ->getConfig('defaultUploadFileSource');

        $this->directory = ServiceManager::getServiceManager()
            ->get(FileSystemService::SERVICE_ID)
            ->getDirectory($uriDirectory)
            ->getDirectory('import');
    }

    public function __invoke($params = [])
    {
        try {
            $this->init();
            $iterator = $this->directory->getFlyIterator(Directory::ITERATOR_FILE | Directory::ITERATOR_RECURSIVE);

            $tests = 0;
            foreach ($iterator as $file) {
                try {
                    $this->importTest($this->uploadDirectoryPath . $file->getPrefix());
                    echo $file->getPrefix() . ' imported.' . PHP_EOL;
                    $tests++;
                } catch (\Exception $e) {
                    echo 'Error on package ' . $file->getPrefix() . ': ' . $e->getMessage();
                }
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