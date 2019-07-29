<?php

namespace oat\taoQtiTest\models;

use qtism\data\storage\php\PhpDocument;
use qtism\data\storage\php\PhpStorageException;
use qtism\data\QtiComponent;
use qtism\data\storage\xml\XmlCompactDocument;

/**
 * PHP Code Compilation Data Service.
 * 
 * This Compilation Data Service implementation aims at compiling
 * Delivery data as plain PHP code.
 */
class PhpCodeCompilationDataService extends CompilationDataService
{
    protected $cacheDir;

    const OPTION_CACHE_COMPACT_TEST_FILE = 'cacheCompactTestFile';

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

        if ($this->useCompactCacheFile() && !is_file($cacheFile)) {
            file_put_contents($cacheFile, $compilationDirectory->read($path));
        }

        try {
            $doc = new PhpDocument();
            if ($this->useCompactCacheFile()) {
                $doc->load($cacheFile);
            } else {
                $doc->loadFromString($compilationDirectory->read($path));
            }
        } catch (PhpStorageException $e) {
            $msg = "PHP Compilation Data in directory '" . $compilationDirectory->getId() . "' at path '" . $path . "' could not be executed properly.";
            throw new \common_Exception($msg);
        }
        
        return $doc->getDocumentComponent();
    }

    public function convertToSourceFormat($compiledString)
    {
        $phpDoc = new PhpDocument();
        $phpDoc->loadFromString($compiledString);

        $compactDoc = new XmlCompactDocument();
        $compactDoc->setDocumentComponent($phpDoc->getDocumentComponent());

        return $compactDoc->saveToString();
    }

    public function convertToCompiledFormat($sourceFormat)
    {
        $compactDoc = new XmlCompactDocument();
        $compactDoc->loadFromString($sourceFormat);

        $phpDoc = new PhpDocument();
        $phpDoc->setDocumentComponent($compactDoc->getDocumentComponent());

        return $phpDoc->saveToString();
    }

    /**
     * @return bool|mixed
     */
    protected function useCompactCacheFile()
    {
        $value = $this->getOption(static::OPTION_CACHE_COMPACT_TEST_FILE);

        return is_null($value) ? true : $value;
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
