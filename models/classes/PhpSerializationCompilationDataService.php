<?php

namespace oat\taoQtiTest\models;

use qtism\data\QtiComponent;

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
        $compilationDirectory->write(
            $path,
            serialize(clone $object)
        );
    }
    
    public function readPhpCompilationData(\tao_models_classes_service_StorageDirectory $compilationDirectory, $path, $cacheInfo = '')
    {
        if (($component = @unserialize($compilationDirectory->read($path))) !== false) {
            return $component;
        } else {
            $msg = "PHP Compilation Data in directory '" . $compilationDirectory->getId() . "' at path '" . $path . "' could not be unserialized properly.";
            throw new \common_Exception($msg);
        }
    }
}
