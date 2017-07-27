<?php

namespace oat\taoQtiTest\models\cat;

use oat\oatbox\service\ConfigurableService;
use oat\libCat\CatEngine;
use qtism\data\AssessmentTest;
use qtism\data\storage\php\PhpDocument;

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
    
    private $infoMapCache = [];
    
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
        $doc = new PhpDocument();
        $doc->loadFromString($privateCompilationDirectory->read("adaptive-assessment-item-ref-${identifier}.php"));
        
        return $doc->getDocumentComponent();
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
    
    public function getAdaptiveInfoMap(\tao_models_classes_service_StorageDirectory $privateCompilationDirectory)
    {
        $dirId = $privateCompilationDirectory->getId();
        
        if (!isset($this->infoMapCache[$dirId])) {
            $infoMap = json_decode($privateCompilationDirectory->read(\taoQtiTest_models_classes_QtiTestCompiler::ADAPTIVE_INFO_MAP_FILENAME), true);
            $this->infoMapCache[$dirId] = $infoMap;
        }
        
        return $this->infoMapCache[$dirId];
    }
}
