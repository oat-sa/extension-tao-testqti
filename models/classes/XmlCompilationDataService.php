<?php

namespace oat\taoQtiTest\models;

use qtism\data\QtiComponent;
use qtism\data\storage\xml\XmlCompactDocument;


class XmlCompilationDataService extends CompilationDataService
{
    public function writeCompilationData(\tao_models_classes_service_StorageDirectory $compilationDirectory, $path, QtiComponent $object)
    {
        $path .= '.xml';
        $compactDoc = new XmlCompactDocument();
        $compactDoc->setDocumentComponent($object);
        
        $compilationDirectory->write(
            $path,
            $compactDoc->saveToString()
        );
    }
    
    public function readCompilationData(\tao_models_classes_service_StorageDirectory $compilationDirectory, $path, $cacheInfo = '')
    {
        $path .= '.xml';
        $compactDoc = new XmlCompactDocument();
        $compactDoc->loadFromString($compilationDirectory->read($path));

        return $compactDoc->getDocumentComponent();
    }
}
