<?php
/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiTest\models\cat;

use GuzzleHttp\ClientInterface;
use oat\oatbox\service\ConfigurableService;
use oat\generis\model\OntologyAwareTrait;
use oat\libCat\CatEngine;
use oat\taoQtiTest\models\event\QtiContinueInteractionEvent;
use qtism\data\AssessmentTest;
use qtism\data\AssessmentSection;
use qtism\data\SectionPartCollection;
use qtism\data\AssessmentItemRef;
use qtism\data\storage\php\PhpDocument;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\tests\RouteItem;
use oat\taoQtiTest\models\ExtendedStateService;

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
    
    const OPTION_ENGINE_URL = 'url';

    const OPTION_ENGINE_CLASS = 'class';
    
    const OPTION_ENGINE_ARGS = 'args';

    const OPTION_ENGINE_VERSION = 'version';

    const OPTION_ENGINE_CLIENT = 'client';

    const QTI_2X_ADAPTIVE_XML_NAMESPACE = 'http://www.taotesting.com/xsd/ais_v1p0p0';
    
    const CAT_ADAPTIVE_IDS_PROPERTY = 'http://www.tao.lu/Ontologies/TAOTest.rdf#QtiCatAdaptiveSections';

    const IS_CAT_ADAPTIVE = 'is-cat-adaptive';

    const IS_SHADOW_ITEM = 'is-shadow-item';

    private $engines = [];
    
    private $sectionMapCache = [];
    
    private $catSection = [];
    
    /**
     * Returns the Adaptive Engine
     * 
     * Returns an CatEngine implementation object.
     *
     * @param string $endpoint
     * @return CatEngine
     * @throws CatEngineNotFoundException
     */
    public function getEngine($endpoint)
    {
        if (!isset($this->engines[$endpoint])) {
            $endPoints = $this->getOption(self::OPTION_ENGINE_ENDPOINTS);
            
            if (!empty($endPoints[$endpoint])) {
                $engineOptions = $endPoints[$endpoint];
            
                $class = $engineOptions[self::OPTION_ENGINE_CLASS];
                $args = $engineOptions[self::OPTION_ENGINE_ARGS];
                $url = isset($engineOptions[self::OPTION_ENGINE_URL])
                    ? $engineOptions[self::OPTION_ENGINE_URL]
                    : $endpoint;
                array_unshift($args, $endpoint);

                try {
                    $this->engines[$endpoint] = new $class($url, $this->getCatEngineVersion($args), $this->getCatEngineClient($args));
                } catch (\Exception $e) {
                    \common_Logger::e('Fail to connect to CAT endpoint : ' . $e->getMessage());
                    throw new CatEngineNotFoundException('CAT Engine for endpoint "' . $endpoint . '" is misconfigured.', $endpoint, 0, $e);
                }

            }
        }
        
        if (empty($this->engines[$endpoint])) {
            // No configured endpoint found.
            throw new CatEngineNotFoundException("CAT Engine for endpoint '${endpoint}' is not configured.", $endpoint);
        }
        
        return $this->engines[$endpoint];
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
     * Get AssessmentItemRef by Identifiers
     * 
     * This method enables you to access to a collection of pre-compiled versions of stand alone AssessmentItemRef objects, that can be run
     * with stand alone AssessmentItemSessions.
     * 
     * @return array An array of AssessmentItemRef objects.
     */
    public function getAssessmentItemRefByIdentifiers(\tao_models_classes_service_StorageDirectory $privateCompilationDirectory, array $identifiers)
    {
        $assessmentItemRefs = [];
        
        foreach ($identifiers as $identifier) {
            $assessmentItemRefs[] = $this->getAssessmentItemRefByIdentifier($privateCompilationDirectory, $identifier);
        }
        
        return $assessmentItemRefs;
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
            $file = $privateCompilationDirectory->getFile(\taoQtiTest_models_classes_QtiTestCompiler::ADAPTIVE_SECTION_MAP_FILENAME);
            $sectionMap = $file->exists() ? json_decode($file->read(), true) : [];
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
            throw new AdaptiveSectionInjectionException('Missed some CAT service items: '. implode(', ', $catDiff), $catDiff);
        }

        if ($packageDiff = array_diff($dependencies, $itemReferences)) {
            throw new AdaptiveSectionInjectionException('Missed some package items: '. implode(', ', $packageDiff), $packageDiff);
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

    /**
     * @deprecated set on SelectNextAdaptiveItemEvent
     */
    public function onQtiContinueInteraction($event)
    {
        if ($event instanceof QtiContinueInteractionEvent) {
            $context = $event->getContext();
            $isAdaptive = $context->isAdaptive();
            $isCat = false;
            
            if ($isAdaptive) {
                $isCat = true;
            }

            $itemIdentifier = $event->getContext()->getCurrentAssessmentItemRef()->getIdentifier();
            $hrefParts = explode('|', $event->getRunnerService()->getItemHref($context, $itemIdentifier));
            $event->getRunnerService()->storeTraceVariable($context, $hrefParts[0], self::IS_CAT_ADAPTIVE, $isCat);
        }
    }

    /**
     * Create the client and version, based on the entry $options.
     *
     * @param array $options
     * @throws \common_exception_InconsistentData
     */
    protected function getCatEngineClient(array $options = [])
    {
        if (!isset($options[self::OPTION_ENGINE_CLIENT])) {
            throw new \InvalidArgumentException('No API client provided. Cannot connect to endpoint.');
        }

        $client = $options[self::OPTION_ENGINE_CLIENT];
        if (is_array($client)) {
            $clientClass = isset($client['class']) ? $client['class'] : null;
            $clientOptions = isset($client['options']) ? $client['options'] : array();
            if (!is_a($clientClass, ClientInterface::class, true)) {
                throw new \InvalidArgumentException('Client has to implement ClientInterface interface.');
            }
            $client = new $clientClass($clientOptions);
        } elseif (is_object($client)) {
            if (!is_a($client, ClientInterface::class)) {
                throw new \InvalidArgumentException('Client has to implement ClientInterface interface.');
            }
        } else {
            throw new \InvalidArgumentException('Client is misconfigured.');
        }
        return $client;
    }

    protected function getCatEngineVersion(array $options = [])
    {
        if (isset($options[self::OPTION_ENGINE_VERSION])) {
            return $options[self::OPTION_ENGINE_VERSION];
        }

        throw new \InvalidArgumentException('No API version provided. Cannot connect to endpoint.');
    }
    
    public function isAdaptive(AssessmentTestSession $testSession, AssessmentItemRef $currentAssessmentItemRef = null)
    {
        $currentAssessmentItemRef = (is_null($currentAssessmentItemRef)) ? $testSession->getCurrentAssessmentItemRef() : $currentAssessmentItemRef;
        
        if ($currentAssessmentItemRef) {
            return $this->isAdaptivePlaceholder($currentAssessmentItemRef);
        } else {
            return false;
        }
    }
    
    public function getCatSection(AssessmentTestSession $testSession, \tao_models_classes_service_StorageDirectory $compilationDirectory, RouteItem $routeItem = null)
    {
        $routeItem = $routeItem ? $routeItem : $testSession->getRoute()->current();
        $sectionId = $routeItem->getAssessmentSection()->getIdentifier();
        
        if (!isset($this->catSection[$sectionId])) {

            // No retrieval trial yet.
            $adaptiveSectionMap = $this->getAdaptiveSectionMap($compilationDirectory);


            if (isset($adaptiveSectionMap[$sectionId])) {
                $this->catSection[$sectionId] = $this->getCatEngine($testSession, $compilationDirectory, $routeItem)->restoreSection($adaptiveSectionMap[$sectionId]['section']);
            } else {
                $this->catSection[$sectionId] = false;
            }

        }
        
        return $this->catSection[$sectionId];
    }
    
    public function getCatEngine(AssessmentTestSession $testSession, \tao_models_classes_service_StorageDirectory $compilationDirectory, RouteItem $routeItem = null)
    {
        $adaptiveSectionMap = $this->getAdaptiveSectionMap($compilationDirectory);
        $routeItem = $routeItem ? $routeItem : $testSession->getRoute()->current();
        
        $sectionId = $routeItem->getAssessmentSection()->getIdentifier();
        $catEngine = false;
        
        if (isset($adaptiveSectionMap[$sectionId])) {
            $catEngine = $this->getEngine($adaptiveSectionMap[$sectionId]['endpoint']);
        }
        
        return $catEngine;
    }
    
    public function getCurrentCatItemId(AssessmentTestSession $testSession, \tao_models_classes_service_StorageDirectory $compilationDirectory, RouteItem $routeItem = null)
    {
        $sessionId = $testSession->getSessionId();
        
        $catItemId = $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID)->getCatValue(
            $sessionId,
            $this->getCatSection($testSession, $compilationDirectory, $routeItem)->getSectionId(),
            'current-cat-item-id'
        );
        
        return $catItemId;
    }
    
    public function getCatAttempts(AssessmentTestSession $testSession, \tao_models_classes_service_StorageDirectory $compilationDirectory, $identifier, RouteItem $routeItem = null)
    {
        $catAttempts = $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID)->getCatValue(
            $testSession->getSessionId(),
            $this->getCatSection($testSession, $compilationDirectory, $routeItem)->getSectionId(),
            'cat-attempts'
        );
        
        $catAttempts = ($catAttempts) ? $catAttempts : [];
        
        return (isset($catAttempts[$identifier])) ? $catAttempts[$identifier] : 0;
    }
}
