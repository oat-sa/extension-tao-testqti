<?php

namespace oat\taoQtiTest\models;

use qtism\data\QtiComponent;
use qtism\data\AssessmentItemRef;

/**
 * PHP Serialization Compilation Data Service.
 *
 * This Compilation Data Service implementation aims at compiling
 * Delivery data as PHP serialized data (see serialize/unserialize PHP
 * core functions).
 */
class PhpSerializationCompilationDataService extends CompilationDataService
{
    const OUTPUT_FILE_TYPE = 'php';

    /**
     * @return string
     */
    public function getOutputFileType()
    {
        return self::OUTPUT_FILE_TYPE;
    }

    public function writeCompilationData(\tao_models_classes_service_StorageDirectory $compilationDirectory, $path, QtiComponent $object)
    {
        $path .= '.' . self::OUTPUT_FILE_TYPE;

        // Clone the component to make sure observers are not saved.
        if ($object instanceof AssessmentItemRef) {
            $object = clone $object;
        }
        
        $compilationDirectory->write(
            $path,
            serialize($object)
        );
    }
    
    public function readCompilationData(\tao_models_classes_service_StorageDirectory $compilationDirectory, $path, $cacheInfo = '')
    {

        $path .= '.' . self::OUTPUT_FILE_TYPE;

        if (($compilationData = $compilationDirectory->read($path)) !== false) {
            if (($component = @unserialize($compilationData)) !== false) {
                return $component;
            } else {
                $msg = "PHP Compilation Data '" . substr($compilationData, 0, 20) . "...' in directory '" . $compilationDirectory->getId() . "' at path '" . $path . "' could not be unserialized properly.";
                throw new \common_Exception($msg);
            }
        } else {
            $msg = "PHP Compilation data in directory '" . $compilationDirectory->getId() . "' could not be read properly.";
            throw new \common_Exception($msg);
        }
    }
}
