<?php

namespace oat\taoQtiTest\scripts\cli;

use oat\generis\model\OntologyAwareTrait;
use oat\oatbox\action\Action;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\filesystem\FileSystemService;
use oat\tao\model\TaoOntology;
use oat\taoQtiItem\model\qti\exception\ExtractException;
use oat\taoQtiItem\model\qti\exception\ParsingException;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorAwareTrait;

class importMultipleTestsFromDir implements Action, ServiceLocatorAwareInterface
{
    use OntologyAwareTrait;
    use ServiceLocatorAwareTrait;

    /**
     * Location of directory inside upload filesystem
     */
    const TEST_FOLDER_IMPORT = 'testImport';

    /** @var  Directory */
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
            $iterator = $this->directory->getFlyIterator(Directory::ITERATOR_FILE | Directory::ITERATOR_RECURSIVE);

            $tests = 0;
            foreach ($iterator as $file) {
                try {
                    $this->importTest($file);
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

    /**
     * Load self::TEST_FOLDER_IMPORT directory
     *
     * @throws \Exception
     * @throws \common_ext_ExtensionException
     */
    protected function init()
    {
        $this->directory = $this->getServiceLocator()
            ->get(FileSystemService::SERVICE_ID)
            ->getDirectory(
                \common_ext_ExtensionsManager::singleton()
                    ->getExtensionById('tao')
                    ->getConfig('defaultUploadFileSource')
            )
            ->getDirectory(self::TEST_FOLDER_IMPORT);

        if (!$this->directory->exists()) {
            throw new \Exception('Unable to find ' . $this->directory->getPrefix());
        }

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
        // Call service to import package
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
        return $this->getClass(TaoOntology::TEST_CLASS_URI);
    }
}