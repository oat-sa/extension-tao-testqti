<?php

namespace oat\taoQtiTest\models\cat;

use oat\oatbox\service\ConfigurableService;
use oat\generis\model\OntologyAwareTrait;
use oat\libCat\CatEngine;
use oat\taoQtiTest\models\event\QtiContinueInteractionEvent;
use qtism\data\AssessmentTest;
use qtism\data\AssessmentSection;
use qtism\data\SectionPartCollection;
use qtism\data\AssessmentItemRef;
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
    
    const CAT_ADAPTIVE_IDS_PROPERTY = 'http://www.tao.lu/Ontologies/TAOTest.rdf#QtiCatAdaptiveSections';

    const IS_CAT_ADAPTIVE = 'is-cat-adaptive';

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
     * Get AssessmentItemRefs corresponding to a given Adaptive Placeholder.
     * 
     * This method will return an array of AssessmentItemRef objects corresponding to an Adaptive Placeholder.
     * 
     * @return array
     */
    public function getAssessmentItemRefsByPlaceholder(\tao_models_classes_service_StorageDirectory $privateCompilationDirectory, AssessmentItemRef $placeholder)
    {
        $urlinfo = parse_url($placeholder->getHref());
        $adaptiveSectionId = ltrim($urlinfo['path'], '/');
        
        $doc = new PhpDocument();
        $doc->loadFromString($privateCompilationDirectory->read("adaptive-assessment-section-${adaptiveSectionId}.php"));
        
        return $doc->getDocumentComponent()->getComponentsByClassName('assessmentItemRef')->getArrayCopy();
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
     * Import XML data to QTI test RDF properties.
     * 
     * This method will import the information found in the CAT specific information of adaptive sections
     * of a QTI test into the ontology for a given $test. This method is designed to be called at QTI Test Import time.
     *
     * @param \core_kernel_classes_Resource $testResource
     * @param \qtism\data\AssessmentTest $testDefinition
     * @param string $localTestPath The path to the related QTI Test Definition file (XML) during import.
     * @return bool
     * @throws \common_Exception In case of error.
     */
    public function importCatSectionIdsToRdfTest(\core_kernel_classes_Resource $testResource, AssessmentTest $testDefinition, $localTestPath)
    {
        $testUri = $testResource->getUri();
        $catProperties = [];
        $assessmentSections = $testDefinition->getComponentsByClassName('assessmentSection', true);
        $catInfo = CatUtils::getCatInfo($testDefinition);
        $testBasePath = pathinfo($localTestPath, PATHINFO_DIRNAME);

        /** @var AssessmentSection $assessmentSection */
        foreach ($assessmentSections as $assessmentSection) {
            $assessmentSectionIdentifier = $assessmentSection->getIdentifier();
            
            if (isset($catInfo[$assessmentSectionIdentifier])) {
                $settingsPath = "${testBasePath}/" . $catInfo[$assessmentSectionIdentifier]['adaptiveSettingsRef'];
                $settingsContent = trim(file_get_contents($settingsPath));
                $catProperties[$assessmentSectionIdentifier] = $settingsContent;

                $this->validateAdaptiveAssessmentSection(
                    $assessmentSection->getSectionParts(),
                    $catInfo[$assessmentSectionIdentifier]['adaptiveEngineRef'],
                    $settingsContent
                );
            }
        }

        if (empty($catProperties)) {
            \common_Logger::t("No QTI CAT property value to store for test '${testUri}'.");
            return true;
        }

        if ($testResource->setPropertyValue($this->getProperty(self::CAT_ADAPTIVE_IDS_PROPERTY), json_encode($catProperties))) {
            return true;
        } else {
            throw new \common_Exception("Unable to store CAT property value to test '${testUri}'.");
        }
    }


    /**
     * Validation for adaptive section
     * @param SectionPartCollection $sectionsParts
     * @param string $ref
     * @param string $testAdminId
     * @throws AdaptiveSectionInjectionException
     */
    public function validateAdaptiveAssessmentSection(SectionPartCollection $sectionsParts, $ref, $testAdminId)
    {
        $engine = $this->getEngine($ref);
        $adaptSection = $engine->setupSection($testAdminId);
        $itemReferences = $adaptSection->getItemReferences();
        $dependencies = $sectionsParts->getKeys();

        if ($catDiff = array_diff($itemReferences, $dependencies)) {
            throw new AdaptiveSectionInjectionException('Missed some CAT service items: '. implode(', ', $catDiff));
        }

        if ($packageDiff = array_diff($dependencies, $itemReferences)) {
            throw new AdaptiveSectionInjectionException('Missed some package items: '. implode(', ', $packageDiff));
        }
    }
    
    /**
     * Is an AssessmentSection Adaptive?
     * 
     * This method returns whether or not a given $section is adaptive.
     * 
     * @param \qtism\data\AssessmentSection $section
     * @return boolean
     */
    public function isAssessmentSectionAdaptive(AssessmentSection $section)
    {
        $assessmentItemRefs = $section->getComponentsByClassName('assessmentItemRef');
        return count($assessmentItemRefs) === 1 && $this->isAdaptivePlaceholder($assessmentItemRefs[0]);
    }
    
    /**
     * Is an AssessmentItemRef an Adaptive Placeholder?
     * 
     * This method returns whether or not a given $assessmentItemRef is a runtime adaptive placeholder.
     * 
     * @param \qtism\data\AssessmentItemRef $assessmentItemRef
     * @return boolean
     */
    public function isAdaptivePlaceholder(AssessmentItemRef $assessmentItemRef)
    {
        return in_array(\taoQtiTest_models_classes_QtiTestCompiler::ADAPTIVE_PLACEHOLDER_CATEGORY, $assessmentItemRef->getCategories()->getArrayCopy());
    }

    public function onQtiContinueInteraction($event)
    {
        if($event instanceof QtiContinueInteractionEvent){
            $isCat = false;
            $context = $event->getContext();
            if($context->isAdaptive()){
                $isCat = true;
            }

            $itemIdentifier = $event->getContext()->getCurrentAssessmentItemRef()->getIdentifier();
            $hrefParts = explode('|', $event->getRunnerService()->getItemHref($context, $itemIdentifier));
            $event->getRunnerService()->storeTraceVariable($context, $hrefParts[0], self::IS_CAT_ADAPTIVE, $isCat);

        }
    }
}
