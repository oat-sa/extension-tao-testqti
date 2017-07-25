<?php

namespace oat\taoQtiTest\models\cat;

use oat\oatbox\service\ConfigurableService;
use oat\libCat\CatEngine;
use qtism\data\AssessmentTest;

/**
 * Wrap a Cat Engine in a service.
 *
 * @access public
 * @author Joel Bout, <joel@taotesting.com>
 * @package taoDelivery
 */
class CatService extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/CatService';
    
    const OPTION_ENGINE_CLASS = 'class';
    
    const OPTION_ENGINE_ARGS = 'args';
    
    const QTI_2X_ADAPTIVE_XML_NAMESPACE = 'http://www.taotesting.com/xsd/ais_v1p0p0';
    
    private $engine = null;
    
    /**
     * Returns the Adaptive Engine
     * 
     * Returns an CatEngine implementation object.
     * 
     * @return oat\libCat\CatEngine
     */
    public function getEngine() {
        if (is_null($this->engine)) {
            $class = $this->getOption(self::OPTION_ENGINE_CLASS);
            $args = $this->getOption(self::OPTION_ENGINE_ARGS);
            $this->engine = new $class(...$args);
        }
        return $this->engine;
    }
    
    public function getAssessmentItemRefByIdentifier(\tao_models_classes_service_StorageDirectory $privateCompilationDirectory, $identifier)
    {
        return $privateCompilationDirectory->read("adaptive-assessment-item-ref-${identifier}.php");
    }
    
    public function getAdaptiveAssessmentSectionInfo(AssessmentTest $test, \tao_models_classes_service_StorageDirectory $compilationDirectory, $basePath, $qtiAssessmentSectionIdentifier)
    {
        $info = CatUtils::getCatInfo($test);
        $adaptiveInfo = [
            'qtiSectionIdentifier' => $qtiAssessmentSectionIdentifier,
            'adaptiveSectionIdentifier' => false,
            'adaptiveEngineRef' => false
        ];
        
        if (isset($info[$qtiAssessmentSectionIdentifier])) {
            if (isset($info[$qtiAssessmentSectionIdentifier]['adaptiveEngineRef'])) {
                $adaptiveInfo['adaptiveEngineRef'] = $info[$qtiAssessmentSectionIdentifier]['adaptiveEngineRef'];
            }
            
            if (isset($info[$qtiAssessmentSectionIdentifier]['adaptiveSettingsRef'])) {
                 $adaptiveInfo['adaptiveSectionIdentifier'] = trim($compilationDirectory->read("./${basePath}/" . $info[$qtiAssessmentSectionIdentifier]['adaptiveSettingsRef']));
            }
        }
        
        return (!isset($info[$qtiAssessmentSectionIdentifier]['adaptiveEngineRef']) || !isset($info[$qtiAssessmentSectionIdentifier]['adaptiveSettingsRef'])) ? false : $adaptiveInfo;
    }
}
