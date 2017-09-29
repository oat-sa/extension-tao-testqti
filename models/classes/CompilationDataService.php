<?php

namespace oat\taoQtiTest\models;

use oat\oatbox\service\ConfigurableService;
use qtism\data\QtiComponent;

abstract class CompilationDataService extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/CompilationDataService';
    
    public function __construct($options = []) {
        parent::__construct($options);
    }
    
    abstract public function writePhpCompilationData(\tao_models_classes_service_StorageDirectory $compilationDirectory, $path, QtiComponent $object);
    
    abstract public function readPhpCompilationData(\tao_models_classes_service_StorageDirectory $compilationDirectory, $path, $cacheInfo = '');
}
