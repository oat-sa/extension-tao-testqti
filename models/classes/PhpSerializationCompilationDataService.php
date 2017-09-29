<?php

namespace oat\taoQtiTest\models;

class PhpSerializationCompilationDataService extends CompilationDataService
{
    public function writePhpCompilationData(\tao_models_classes_service_StorageDirectory $compilationDirectory, $path, $object)
    {
        $compilationDirectory->write(
            $path,
            serialize($object)
        );
    }
    
    public function readPhpCompilationData(\tao_models_classes_service_StorageDirectory $compilationDirectory, $path)
    {
        return unserialize($compilationDirectory->read($path));
    }
}
