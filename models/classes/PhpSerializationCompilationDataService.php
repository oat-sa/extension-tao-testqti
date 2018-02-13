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
    public function writePhpCompilationData(\tao_models_classes_service_StorageDirectory $compilationDirectory, $path, QtiComponent $object)
    {
        // Clone the component to make sure observers are not saved.
        if ($object instanceof AssessmentItemRef) {
            $object = clone $object;
        }
        
        $compilationDirectory->write(
            $path,
            serialize($object)
        );
    }
    
    public function readPhpCompilationData(\tao_models_classes_service_StorageDirectory $compilationDirectory, $path, $cacheInfo = '')
    {

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
