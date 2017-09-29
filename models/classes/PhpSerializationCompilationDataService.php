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
}
