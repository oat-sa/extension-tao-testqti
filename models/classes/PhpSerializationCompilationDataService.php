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
        $compilationDirectory->write(
            $path,
            serialize($object)
        );
    }
    
    public function readPhpCompilationData(\tao_models_classes_service_StorageDirectory $compilationDirectory, $path, $cacheInfo = '')
    {
        return unserialize($compilationDirectory->read($path));
    }
}
