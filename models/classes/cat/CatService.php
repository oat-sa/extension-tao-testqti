<?php

namespace oat\taoQtiTest\models\cat;

use oat\oatbox\service\ConfigurableService;
use oat\libCat\CatEngine;
use qtism\data\AssessmentTest;
use qtism\data\storage\php\PhpDocument;

/**
 * Computerized Adaptive Testing Service
 * 
 * This Service gives you access to a CatEngine object in addition
 * with relevant services to deal with CAT in TAO.
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
    
    /**
     * Get AssessmentItemRef by Identifier
     * 
     * This method enables you to access to a pre-compiled version of a stand alone AssessmentItemRef, that can be run
     * with a stand alone AssessmentItemSession.
     * 
     * @return \qtism\data\ExtendedAssessmentItemRef
     */
    public function getAssessmentItemRefByIdentifier(\tao_models_classes_service_StorageDirectory $privateCompilationDirectory, $identifier)
    {
        $doc = new PhpDocument();
        $doc->loadFromString($privateCompilationDirectory->read("adaptive-assessment-item-ref-${identifier}.php"));
        
        return $doc->getDocumentComponent();
    }
    
    /**
     * Get Information about a given Adaptive Section.
     * 
     * This method returns Information about the "adaptivity" of a given QTI AssessmentSection.
     * The method returns an associative array containing the following information:
     * 
     * * 'qtiSectionIdentifier' => The original QTI Identifier of the section.
     * * 'adaptiveSectionIdentifier' => The identifier of the adaptive section as known by the Adaptive Engine.
     * * 'adaptiveEngineRef' => The URL to the Adaptive Engine End Point to be used for that Adaptive Section.
     * 
     * In case of the Assessment Section is not adaptive, the method returns false.
     * 
     * @param \qtism\data\AssessmentTest $test A given AssessmentTest object.
     * @param \tao_models_classes_service_StorageDirectory $compilationDirectory The compilation directory where the test is compiled as a TAO Delivery.
     * @param string $qtiAssessmentSectionIdentifier The QTI identifier of the AssessmentSection you would like to get "adaptivity" information.
     * @return array|boolean Some "adaptivity" information or false in case of the given $qtiAssessmentSectionIdentifier does not correspond to an adaptive Assessment Section.
     */
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
    
    /**
     * Get Adaptive Information Map
     * 
     * Returns a compiled information map giving information about "adaptivity" of Assessment Section for a TAO Delivery.
     * 
     * Below, an example of returned map for a test containing a single adaptive section with a QTI identifier have the "S01" value.
     * 
     * [
     *      'S01' =>
     *      [
     *          'adaptiveEngineRef' => 'http://somewhere.com/api',
     *          'adaptiveSettingsRef' => 'file.xml'
     *      ]
     * ]
     * 
     * @params \tao_models_classes_service_StorageDirectory $privateCompilationDirectory The private compilation directory corresponding to the TAO Delivery you would like to get information about.
     * @return array
     */
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
