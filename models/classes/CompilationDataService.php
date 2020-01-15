<?php

namespace oat\taoQtiTest\models;

use oat\oatbox\service\ConfigurableService;
use qtism\data\AssessmentTest;
use qtism\data\QtiComponent;

/**
 * Compilation Data Service
 *
 * An abstract Compilation Data Service. Its implementation aim
 * at providing a way to compile Delivery data in various ways.
 */
abstract class CompilationDataService extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/CompilationDataService';
    
    /**
     * Create a new CompilationDataService object.
     *
     * @param $options
     */
    public function __construct($options = [])
    {
        parent::__construct($options);
    }

    /**
     * @return string
     */
    abstract public function getOutputFileType();

    /**
     * Write Compilation Data
     *
     * Write a QtiComponent $object into a given $compilationDirectory at a given $path.
     *
     * @param \tao_models_classes_service_StorageDirectory $compilationDirectory
     * @param string $path
     * @param \qtism\data\QtiComponent $object
     */
    abstract public function writeCompilationData(\tao_models_classes_service_StorageDirectory $compilationDirectory, $path, QtiComponent $object);
    
    
    /**
     * Read Compilation Data
     *
     * Read a QtiComponent object from a given $compilationDirectory at a given $path.
     *
     * @param \tao_models_classes_service_StorageDirectory $compilationDirectory
     * @param string $path
     * @param string $cacheInfo (optional) A context string possibly used by implementations for caching purpose.
     * @return \qtism\data\QtiComponent
     * @throws \common_Exception In case of error.
     */
    abstract public function readCompilationData(\tao_models_classes_service_StorageDirectory $compilationDirectory, $path, $cacheInfo = '');

    /**
     * Write Compilation Metadata
     *
     * @param \tao_models_classes_service_StorageDirectory $compilationDirectory
     * @param AssessmentTest $test
     * @throws \common_Exception
     */
    public function writeCompilationMetadata(\tao_models_classes_service_StorageDirectory $compilationDirectory, AssessmentTest $test)
    {
        try {
            $filename = \taoQtiTest_models_classes_QtiTestService::TEST_COMPILED_META_FILENAME . '.json';
            $meta = \taoQtiTest_helpers_TestCompilerUtils::testMeta($test);
            $compilationDirectory->write($filename, json_encode($meta));
        } catch (\Exception $e) {
            throw new \common_Exception("Unable to write file '${filename}'.");
        }
    }

    /**
     * Read Compilation Metadata
     *
     * @param \tao_models_classes_service_StorageDirectory $compilationDirectory
     * @return mixed
     * @throws \common_Exception
     */
    public function readCompilationMetadata(\tao_models_classes_service_StorageDirectory $compilationDirectory)
    {
        try {
            $data = $compilationDirectory->read(\taoQtiTest_models_classes_QtiTestService::TEST_COMPILED_META_FILENAME . '.json');
            return json_decode($data, true);
        } catch (\Exception $e) {
            // Legacy compilation support.
            try {
                $filename = \taoQtiTest_models_classes_QtiTestService::TEST_COMPILED_META_FILENAME . '.php';
                $data = $compilationDirectory->read($filename);
                $data = str_replace('<?php', '', $data);
                $data = str_replace('?>', '', $data);
                return eval($data);
            } catch (\Exception $e) {
                throw new \common_Exception("Unable to read file '${filename}'.");
            }
        }
    }
}
