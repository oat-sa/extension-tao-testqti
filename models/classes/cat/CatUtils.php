<?php

namespace oat\taoQtiTest\models\cat;

use qtism\data\AssessmentTest;
use qtism\data\AssessmentSection;

class CatUtils
{
    public static function getCatInfo(AssessmentTest $test, $namespace = '')
    {
        if ($namespace === '') {
            $namespace = CatService::QTI_2X_ADAPTIVE_XML_NAMESPACE;
        }
        
        $info = [];
        
        foreach ($test->getComponentsByClassName('assessmentSection') as $assessmentSection) {
            if (($selection = $assessmentSection->getSelection()) !== null && (($xmlExtension = $selection->getXml())) !== null) {
                $xpath = new \DOMXPath($xmlExtension);
                $xpath->registerNamespace('ais', $namespace);
                
                // Reference QTI assessmentSection identifier.
                $sectionIdentifier = $assessmentSection->getIdentifier();
                $info[$sectionIdentifier] = [];
                
                // Get the adaptiveEngineRef.
                foreach ($xpath->query('.//ais:adaptiveItemSelection/ais:adaptiveEngineRef', $xmlExtension) as $adaptiveEngineRef) {
                    $info[$sectionIdentifier]['adaptiveEngineRef'] = $adaptiveEngineRef->getAttribute('href');
                }
                
                // Get the adaptiveSettingsRef.
                foreach ($xpath->query('.//ais:adaptiveItemSelection/ais:adaptiveSettingsRef', $xmlExtension) as $adaptiveSettingsRef) {
                    $info[$sectionIdentifier]['adaptiveSettingsRef'] = $adaptiveSettingsRef->getAttribute('href');
                }
            }
        }
        
        return $info;
    }
    
    public static function isAssessmentSectionAdaptive(AssessmentSection $section, $namespace = '')
    {
        if ($namespace === '') {
            $namespace = CatService::QTI_2X_ADAPTIVE_XML_NAMESPACE;
        }
        
        $isAdaptive = false;
        
        if (($selection = $assessmentSection->getSelection()) !== null && (($xmlExtension = $selection->getXml())) !== null)
        {
            $xpath = new \DOMXPath($xmlExtension);
            $xpath->registerNamespace('ais', $namespace);
            
            if ($xpath->query('.//ais:adaptiveItemSelection/', $xmlExtension)->length > 0) {
                $isAdaptive = true;
            }
        }
        
        return $isAdaptive;
    }
}
