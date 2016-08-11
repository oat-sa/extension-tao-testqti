<?php

namespace oat\taoQtiTest\scripts\cli;

use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\action\Action;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\filesystem\File;
use oat\oatbox\filesystem\FileSystemService;
use oat\oatbox\service\ServiceManager;
use oat\taoQtiItem\model\qti\exception\ExtractException;
use oat\taoQtiItem\model\qti\exception\ParsingException;

/**
 * Class importMultipleTestsFromDir
 * It will scan 'testImport' directory inside upload directory
 * Then import all test package found
 *
 * To launch this script:
 * php index.php '\oat\taoQtiTest\scripts\cli\importMultipleTestsFromDir'
 *
 * @package oat\taoQtiTest\scripts\cli
 */
class importMultipleTestsFromDir implements Action
{
    use OntologyAwareTrait;

    /**
     * Location of directory inside upload filesystem
     */
    const TEST_FOLDER_IMPORT = 'testImport';

    /**
     * Absolute path to directory to ensure importTest
     * @var string
     */
    protected $uploadDirectoryPath;

    /**
     * @var Directory
     */
    protected $directory;

    /**
     * Entry point, init & import test from $this->directory
     *
     * @param array $params
     * @return \common_report_Report
     */
    public function __invoke($params = [])
    {
        try {
            $this->init();

            $count = 0;
            $iterator = $this->directory->getFlyIterator(Directory::ITERATOR_FILE | Directory::ITERATOR_RECURSIVE);

            /** @var File $test */
            foreach ($iterator as $test) {
                if (substr($test->getPrefix(), 0, 1) === '.') {
                    echo $test->getPrefix() . ' skipped.' . PHP_EOL;
                    continue;
                }

                $this->importTest($this->uploadDirectoryPath . $test->getPrefix());
                $count++;
                echo $test->getPrefix() . ' imported.' . PHP_EOL;

                $test->delete();
            }

            return $this->returnSuccess($count);
        } catch (ExtractException $e) {
            return $this->returnFailure('The ZIP archive containing the IMS QTI Item cannot be extracted.');
        } catch (ParsingException $e) {
            return $this->returnFailure('The ZIP archive does not contain an imsmanifest.xml file or is an invalid ZIP archive.');
        } catch (\Exception $e) {
            return $this->returnFailure($e->getMessage());
        }
    }

    /**
     * Load self::TEST_FOLDER_IMPORT directory
     *
     * @throws \Exception
     * @throws \common_ext_ExtensionException
     */
    protected function init()
    {
        $this->directory = $this->getServiceManager()
            ->get(FileSystemService::SERVICE_ID)
            ->getDirectory(
                \common_ext_ExtensionsManager::singleton()
                    ->getExtensionById('tao')
                    ->getConfig('defaultUploadFileSource')
            )
            ->getDirectory(self::TEST_FOLDER_IMPORT)
        ;

        if (!$this->directory->exists()) {
            throw new \Exception('Unable to find ' . $this->uploadDirectoryPath);
        }

        $this->uploadDirectoryPath = FILES_PATH . 'tao/upload/';

        \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
    }

    /**
     * Call service to import package
     *
     * @param $package
     * @return bool
     * @throws \Exception
     */
    protected function importTest($package)
    {
        \helpers_TimeOutHelper::setTimeOutLimit(\helpers_TimeOutHelper::LONG);
        $report = \taoQtiTest_models_classes_QtiTestService::singleton()
            ->importMultipleTests($this->getDestinationClass(), $package);

        if ($report->getType() !== \common_report_Report::TYPE_SUCCESS) {
            throw new \Exception("ERROR: " . $report->getMessage());
        }
        return true;
    }

    /**
     * Return error \common_report_Report
     *
     * @param $msg
     * @return \common_report_Report
     */
    protected function returnFailure($msg)
    {
        return new \common_report_Report(\common_report_Report::TYPE_ERROR, $msg);
    }

    /**
     * Return success \common_report_Report
     *
     * @param $testsCount
     * @return \common_report_Report
     */
    protected function returnSuccess($testsCount)
    {
        return new \common_report_Report(\common_report_Report::TYPE_SUCCESS, $testsCount . ' tests imported');
    }

    /**
     * Return the test class to import
     *
     * @return \core_kernel_classes_Class
     */
    protected function getDestinationClass()
    {
        return $this->getClass(TAO_TEST_CLASS);
    }

    /**
     * @return ServiceManager
     */
    protected function getServiceManager()
    {
        return ServiceManager::getServiceManager();
    }
}