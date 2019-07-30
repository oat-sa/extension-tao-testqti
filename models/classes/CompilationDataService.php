<?php

namespace oat\taoQtiTest\models;

use oat\oatbox\service\ConfigurableService;
use qtism\data\AssessmentTest;
use qtism\data\QtiComponent;

/**
 * Compilation Data Service
 * 
 * An abstract Compilation Data Service. Its implementation aim 
 * at proding a way to compile Delivery data in various ways.
 */
abstract class CompilationDataService extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/CompilationDataService';
    
    /**
     * Create a new CompilationDataService object.
     * 
     * @param $options
     */
    public function __construct($options = []) {
        parent::__construct($options);
    }
    
    /**
     * Write PHP Compilation Data
     * 
     * Write a QtiComponent $object into a given $compilationDirectory at a given $path.
     * 
     * @param \tao_models_classes_service_StorageDirectory $compilationDirectory
     * @param string $path
     * @param \qtism\data\QtiComponent $object
     */
    abstract public function writeCompilationData(\tao_models_classes_service_StorageDirectory $compilationDirectory, $path, QtiComponent $object);
    
    
    /**
     * Read PHP Compilation Data
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

    public function writeCompilationMetadata(\tao_models_classes_service_StorageDirectory $compilationDirectory, AssessmentTest $test)
    {
        $meta = \taoQtiTest_helpers_TestCompilerUtils::testMeta($test);
        $phpCode = \common_Utils::toPHPVariableString($meta);
        $phpCode = '<?php return ' . $phpCode . '; ?>';
        $compilationDirectory->write(\taoQtiTest_models_classes_QtiTestService::TEST_COMPILED_META_FILENAME . '.php', $phpCode);
    }

    public function readCompilationMetadata(\tao_models_classes_service_StorageDirectory $compilationDirectory)
    {
        $data = $compilationDirectory->read(\taoQtiTest_models_classes_QtiTestService::TEST_COMPILED_META_FILENAME . '.php');
        $data = str_replace('<?php', '', $data);
        $data = str_replace('?>', '', $data);
        return eval($data);
    }
}
