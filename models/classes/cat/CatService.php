<?php

namespace oat\taoQtiTest\models\cat;

use oat\oatbox\service\ConfigurableService;
use oat\generis\model\OntologyAwareTrait;
use oat\libCat\CatEngine;
use qtism\data\AssessmentTest;
use qtism\data\AssessmentSection;
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
    use OntologyAwareTrait;
    
    const SERVICE_ID = 'taoQtiTest/CatService';
    
    const OPTION_ENGINE_ENDPOINTS = 'endpoints';
    
    const OPTION_ENGINE_CLASS = 'class';
    
    const OPTION_ENGINE_ARGS = 'args';
    
    const QTI_2X_ADAPTIVE_XML_NAMESPACE = 'http://www.taotesting.com/xsd/ais_v1p0p0';
    
    const CAT_PROPERTY = 'http://www.tao.lu/Ontologies/TAOTest.rdf#QtiCatAdaptiveSection';
    
    private $engines = [];
    
    private $sectionMapCache = [];
    
    /**
     * Returns the Adaptive Engine
     * 
     * Returns an CatEngine implementation object.
     * 
     * @param string $endpoint
     * @return oat\libCat\CatEngine
     */
    public function getEngine($endpoint) {
        if (!isset($this->engine[$endpoint])) {
            $engineOptions = $this->getOption(self::OPTION_ENGINE_ENDPOINTS)[$endpoint];
            
            $class = $engineOptions[self::OPTION_ENGINE_CLASS];
            $args = $engineOptions[self::OPTION_ENGINE_ARGS];
            array_unshift($args, $endpoint);
            
            $this->engine[$endpoint] = new $class(...$args);
        }
        
        return $this->engine[$endpoint];
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
    
    public function getAdaptiveSectionMap(\tao_models_classes_service_StorageDirectory $privateCompilationDirectory)
    {
        $dirId = $privateCompilationDirectory->getId();
        
        if (!isset($this->sectionMapCache[$dirId])) {
            $sectionMap = json_decode($privateCompilationDirectory->read(\taoQtiTest_models_classes_QtiTestCompiler::ADAPTIVE_SECTION_MAP_FILENAME), true);
            $this->sectionMapCache[$dirId] = $sectionMap;
        }
        
        return $this->sectionMapCache[$dirId];
    }
    
    /**
     * Import XML data to QTI test RDF properties
     * 
     * This method will import the information found in the CAT specific information of adaptive sections
     * of a QTI test into the ontology for a given $test.
     *
     * @param \core_kernel_classes_Resource $test
     * @param XmlDocument $xml
     * @return bool
     * @throws \common_Exception
     */
    public function importCatSectionIdsToRdfTest(\core_kernel_classes_Resource $testResource, AssessmentTest $testDefinition, $localImportPath)
    {
        $testUri = $testResource->getUri();
        $catProperties = [];
        $assessmentSections = $testDefinition->getComponentsByClassName('assessmentSection', true);
        $catInfo = CatUtils::getCatInfo($testDefinition);

        /** @var AssessmentSection $assessmentSection */
        foreach ($assessmentSections as $assessmentSection) {
            $assessmentSectionIdentifier = $assessmentSection->getIdentifier();
            
            if (isset($catInfo[$assessmentSectionIdentifier])) {
                $catProperties[$assessmentSectionIdentifier] = $catInfo[$assessmentSectionIdentifier]['adaptiveSettingsRef'];
            }
        }

        if (empty($catProperties)) {
            \common_Logger::t("No QTI CAT property value to store for test '${testUri}'.");
            return true;
        }

        if ($testResource->setPropertyValue($this->getProperty(self::CAT_PROPERTY), json_encode($catProperties))) {
            return true;
        } else {
            throw new \common_Exception("Unable to store CAT property value to test '${testUri}'.");
        }
    }
}
