<?php

namespace oat\taoQtiTest\models;

use oat\oatbox\service\ConfigurableService;

abstract class CompilationDataService extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/CompilationDataService';
    
    abstract public function writePhpCompilationData(\tao_models_classes_service_StorageDirectory $compilationDirectory, $path, $object);
    
    abstract public function readPhpCompilationData(\tao_models_classes_service_StorageDirectory $compilationDirectory, $path);
}
