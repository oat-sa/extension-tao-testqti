<?php

namespace oat\taoQtiTest\models;

use qtism\data\storage\php\PhpDocument;
use qtism\data\QtiComponent;

/**
 * PHP Code Compilation Data Service.
 * 
 * This Compilation Data Service implementation aims at compiling
 * Delivery data as plain PHP code.
 */
class PhpCodeCompilationDataService extends CompilationDataService
{
    protected $cacheDir;
    
    public function __construct($options = []) {
        parent::__construct($options);
        
        $this->cacheDir = sys_get_temp_dir() . '/taooldtestrunnerphpcache';
    }
    
    public function writePhpCompilationData(\tao_models_classes_service_StorageDirectory $compilationDirectory, $path, QtiComponent $object)
    {
        $doc = new PhpDocument();
        $doc->setDocumentComponent($object);
        
        $compilationDirectory->write(
            $path,
            $doc->saveToString()
        );
    }
    
    public function readPhpCompilationData(\tao_models_classes_service_StorageDirectory $compilationDirectory, $path, $cacheInfo = '')
    {
        $dir = $this->ensureCacheDirectory($compilationDirectory);
        $cacheKey = $this->cacheKey($cacheInfo);
        $cacheFile = "${dir}/${cacheKey}.php";
        
        if (!is_file($cacheFile)) {
            $data = $compilationDirectory->read($path);
            file_put_contents($cacheFile, $data);
        }
        
        $doc = new PhpDocument();
        $doc->load($cacheFile);
        
        return $doc->getDocumentComponent();
    }
    
    protected function ensureCacheDirectory(\tao_models_classes_service_StorageDirectory $compilationDirectory)
    {
        $dirId = md5($compilationDirectory->getId());
        
        for ($i = 1; $i < 6; $i += 2) {
            $dirId = substr_replace($dirId, '/', $i, 0);
        }
        
        $path = $this->cacheDir . "/${dirId}";
        
        if (!is_dir($path)) {
            @mkdir($path, 0700, true);
        }
        
        return $path;
    }
    
    protected function cacheKey($cacheInfo = '')
    {
        $key = 'php-data';
        
        if (!empty($cacheInfo)) {
            $key .= "-${cacheInfo}";
        }
        
        return $key;
    }
}
