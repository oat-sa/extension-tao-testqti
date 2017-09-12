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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */

namespace oat\taoQtiTest\models\runner;

use oat\libCat\Exception\CatEngineException;
use oat\taoQtiTest\models\QtiTestCompilerIndex;
use oat\taoQtiTest\models\runner\session\TestSession;
use oat\taoQtiTest\models\SessionStateService;
use oat\taoQtiTest\models\cat\CatService;
use oat\taoQtiTest\models\ExtendedStateService;
use qtism\data\AssessmentTest;
use qtism\data\AssessmentItemRef;
use qtism\runtime\storage\binary\AbstractQtiBinaryStorage;
use qtism\runtime\storage\binary\BinaryAssessmentTestSeeker;
use qtism\runtime\tests\RouteItem;
use oat\oatbox\event\EventManager;
use oat\taoQtiTest\models\event\SelectAdaptiveNextItemEvent;
use oat\taoQtiTest\models\event\InitializeAdaptiveSessionEvent;
use oat\libCat\result\ItemResult;
use oat\libCat\result\ResultVariable;

/**
 * Class QtiRunnerServiceContext
 *
 * Defines a container to store and to share runner service context of the QTI implementation
 * 
 * @package oat\taoQtiTest\models
 */
class QtiRunnerServiceContext extends RunnerServiceContext
{
    /**
     * The session storage
     * @var AbstractQtiBinaryStorage
     */
    protected $storage;
    
    protected $sessionManager;

    /**
     * The assessment test definition
     * @var AssessmentTest 
     */
    protected $testDefinition;

    /**
     * The path of the compilation directory.
     *
     * @var \tao_models_classes_service_StorageDirectory[]
     */
    protected $compilationDirectory;

    /**
     * The meta data about the test definition being executed.
     *
     * @var array
     */
    private $testMeta;
    
    /**
     * The index of compiled items.
     *
     * @var QtiTestCompilerIndex
     */
    private $itemIndex;

    /**
     * The URI of the assessment test
     * @var string
     */
    protected $testDefinitionUri;

    /**
     * The URI of the compiled delivery
     * @var string
     */
    protected $testCompilationUri;

    /**
     * The URI of the delivery execution
     * @var string
     */
    protected $testExecutionUri;
    
    private $catSession = [];
    
    private $lastCatItemId = null;

    /**
     * QtiRunnerServiceContext constructor.
     * 
     * @param string $testDefinitionUri
     * @param string $testCompilationUri
     * @param string $testExecutionUri
     * @throws \common_Exception
     */
    public function __construct($testDefinitionUri, $testCompilationUri, $testExecutionUri)
    {
        $this->testDefinitionUri = $testDefinitionUri;
        $this->testCompilationUri = $testCompilationUri;
        $this->testExecutionUri = $testExecutionUri;

        $this->initCompilationDirectory();
        $this->initTestDefinition();
        $this->initStorage();
        $this->initTestSession();
    }

    /**
     * Starts the context
     * @throws \common_Exception
     */
    public function init()
    {
        // code borrowed from the previous implementation, maybe obsolete...
        /** @var SessionStateService $sessionStateService */
        $sessionStateService = $this->getServiceManager()->get(SessionStateService::SERVICE_ID);
        $sessionStateService->resumeSession($this->getTestSession());
        
        $this->retrieveTestMeta();
        $this->retrieveItemIndex();
    }

    /**
     * Extracts the path of the compilation directory
     */
    protected function initCompilationDirectory()
    {
        $fileStorage = \tao_models_classes_service_FileStorage::singleton();
        $directoryIds = explode('|', $this->getTestCompilationUri());
        $directories = array(
            'private' => $fileStorage->getDirectoryById($directoryIds[0]),
            'public' => $fileStorage->getDirectoryById($directoryIds[1])
        );

        $this->compilationDirectory = $directories;
    }

    /**
     * Loads the test definition
     */
    protected function initTestDefinition()
    {
        $this->testDefinition = \taoQtiTest_helpers_Utils::getTestDefinition($this->getTestCompilationUri());
    }

    /**
     * Loads the storage
     * @throws \common_exception_Error
     */
    protected function initStorage()
    {
        $resultServer = \taoResultServer_models_classes_ResultServerStateFull::singleton();
        $testResource = new \core_kernel_classes_Resource($this->getTestDefinitionUri());
        $sessionManager = new \taoQtiTest_helpers_SessionManager($resultServer, $testResource);

        $seeker = new BinaryAssessmentTestSeeker($this->getTestDefinition());
        $userUri = \common_session_SessionManager::getSession()->getUserUri();


        $config = \common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->getConfig('testRunner');
        $storageClassName = $config['test-session-storage'];
        $this->storage = new $storageClassName($sessionManager, $seeker, $userUri);
        $this->sessionManager = $sessionManager;
    }

    /**
     * Loads the test session
     * @throws \common_exception_Error
     */
    protected function initTestSession()
    {
        $storage = $this->getStorage();
        $sessionId = $this->getTestExecutionUri();

        if ($storage->exists($sessionId) === false) {
            \common_Logger::d("Instantiating QTI Assessment Test Session");
            $this->setTestSession($storage->instantiate($this->getTestDefinition(), $sessionId));

            $testTaker = \common_session_SessionManager::getSession()->getUser();
            \taoQtiTest_helpers_TestRunnerUtils::setInitialOutcomes($this->getTestSession(), $testTaker);
        }
        else {
            \common_Logger::d("Retrieving QTI Assessment Test Session '${sessionId}'...");
            $this->setTestSession($storage->retrieve($this->getTestDefinition(), $sessionId));
        }

        \taoQtiTest_helpers_TestRunnerUtils::preserveOutcomes($this->getTestSession());
    }

    /**
     * Retrieves the QTI Test Definition meta-data array stored into the private compilation directory.
     */
    protected function retrieveTestMeta() 
    {
        $directories = $this->getCompilationDirectory();
        $data = $directories['private']->read(TAOQTITEST_COMPILED_META_FILENAME);
        $data = str_replace('<?php', '', $data);
        $data = str_replace('?>', '', $data);
        $this->testMeta = eval($data);
    }
    
    /**
     * Retrieves the index of compiled items.
     */
    protected function retrieveItemIndex() 
    {
        $this->itemIndex = new QtiTestCompilerIndex();
        try {
            $directories = $this->getCompilationDirectory();
            $data = $directories['private']->read(TAOQTITEST_COMPILED_INDEX);
            if ($data) {
                $this->itemIndex->unserialize($data);
            }
        } catch(\Exception $e) {
            \common_Logger::d('Ignoring file not found exception for Items Index');
        }
    }

    /**
     * Sets the test session
     * @param mixed $testSession
     * @throws \common_exception_InvalidArgumentType
     */
    public function setTestSession($testSession)
    {
        if ($testSession instanceof TestSession) {
            parent::setTestSession($testSession);
        } else {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerServiceContext',
                'setTestSession',
                0,
                'oat\taoQtiTest\models\runner\session\TestSession',
                $testSession
            );
        }
    }

    /**
     * Gets the session storage
     * @return AbstractQtiBinaryStorage
     */
    public function getStorage()
    {
        return $this->storage;
    }
    
    public function getSessionManager()
    {
        return $this->sessionManager;
    }

    /**
     * Gets the assessment test definition
     * @return AssessmentTest
     */
    public function getTestDefinition()
    {
        return $this->testDefinition;
    }

    /**
     * Gets the path of the compilation directory
     * @return \tao_models_classes_service_StorageDirectory[]
     */
    public function getCompilationDirectory()
    {
        return $this->compilationDirectory;
    }

    /**
     * Gets the meta data about the test definition being executed.
     * @return array
     */
    public function getTestMeta()
    {
        return $this->testMeta;
    }
    
    /**
     * Gets the URI of the assessment test
     * @return string
     */
    public function getTestDefinitionUri()
    {
        return $this->testDefinitionUri;
    }

    /**
     * Gets the URI of the compiled delivery
     * @return string
     */
    public function getTestCompilationUri()
    {
        return $this->testCompilationUri;
    }

    /**
     * Gets the URI of the delivery execution
     * @return string
     */
    public function getTestExecutionUri()
    {
        return $this->testExecutionUri;
    }

    /**
     * Gets info from item index
     * @param string $id
     * @return mixed
     * @throws \common_exception_Error
     */
    public function getItemIndex($id) 
    {
        return $this->itemIndex->getItem($id, \common_session_SessionManager::getSession()->getInterfaceLanguage());
    }

    /**
     * Gets a particular value from item index
     * @param string $id
     * @param string $name
     * @return mixed
     * @throws \common_exception_Error
     */
    public function getItemIndexValue($id, $name) 
    {
        return $this->itemIndex->getItemValue($id, \common_session_SessionManager::getSession()->getInterfaceLanguage(), $name);
    }
    
    /**
     * Get Cat Engine Implementation
     * 
     * Get the currently configured Cat Engine implementation.
     * 
     * @return \oat\libCat\CatEngine
     */
    public function getCatEngine(RouteItem $routeItem = null)
    {
        $compiledDirectory = $this->getCompilationDirectory()['private'];
        $adaptiveSectionMap = $this->getServiceManager()->get(CatService::SERVICE_ID)->getAdaptiveSectionMap($compiledDirectory);
        $routeItem = $routeItem ? $routeItem : $this->getTestSession()->getRoute()->current();
        
        $sectionId = $routeItem->getAssessmentSection()->getIdentifier();
        $catEngine = false;
        
        if (isset($adaptiveSectionMap[$sectionId])) {
            $catEngine = $this->getServiceManager()->get(CatService::SERVICE_ID)->getEngine($adaptiveSectionMap[$sectionId]['endpoint']);
        }
        
        return $catEngine;
    }
    
    /**
     * Get the current CAT Session Object.
     * 
     * @return \oat\libCat\CatSession|false
     */
    public function getCatSession(RouteItem $routeItem = null)
    {
        if ($catSection = $this->getCatSection($routeItem)) {
            $catSectionId = $catSection->getSectionId();
            
            if (!isset($this->catSession[$catSectionId])) {
                // No retrieval trial yet in the current execution context.
                $this->catSession = false;
                
                // A CAT Section exists for the current position in the flow.
                $testSession = $this->getTestSession();
                
                $catSessionData = $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID)->getCatValue(
                    $testSession->getSessionId(), 
                    $catSection->getSectionId(), 
                    'cat-session'
                );
                
                if ($catSessionData) {
                    // We already have something in persistence for the session, let's restore it.
                    $this->catSession[$catSectionId] = $catSection->restoreSession($catSessionData);
                    \common_Logger::d("CAT Session '" . $this->catSession[$catSectionId]->getTestTakerSessionId() . "' for CAT Section '${catSectionId}' restored.");
                } else {
                    // First time the session is required, let's initialize it.
                    $this->catSession[$catSectionId] = $catSection->initSession();
                    $assessmentSection = $routeItem ? $routeItem->getAssessmentSection() : $testSession->getCurrentAssessmentSection();

                    $event = new InitializeAdaptiveSessionEvent(
                        $testSession,
                        $assessmentSection,
                        $this->catSession[$catSectionId]
                    );
                    
                    $this->getServiceManager()->get(EventManager::SERVICE_ID)->trigger($event);
                    $this->persistCatSession($this->catSession[$catSectionId], $routeItem);
                    \common_Logger::d("CAT Session '" . $this->catSession[$catSectionId]->getTestTakerSessionId() . "' for CAT Section '${catSectionId}' initialized and persisted.");
                }
            }
            
            return $this->catSession[$catSectionId];
            
        } else {
            return false;
        }
    }
    
    /**
     * Persist the CAT Session Data.
     * 
     * Persist the current CAT Session Data in storage.
     * 
     * @param string $catSession JSON encoded CAT Session data.
     */
    public function persistCatSession($catSession, RouteItem $routeItem = null)
    {
        if ($catSection = $this->getCatSection($routeItem)) {
            $catSectionId = $catSection->getSectionId();
            $this->catSession[$catSectionId] = $catSession;
        
            $sessionId = $this->getTestSession()->getSessionId();
            $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID)->setCatValue(
                $sessionId,
                $catSectionId,
                'cat-session', 
                json_encode($this->catSession[$catSectionId])
            );
        }
    }

    /**
     * Persist seen CAT Item identifiers.
     *
     * @param string $seenCatItemId
     */
    public function persistSeenCatItemIds($seenCatItemId)
    {
        $sessionId = $this->getTestSession()->getSessionId();
        $items = $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID)->getCatValue(
            $sessionId,
            $this->getCatSection()->getSectionId(),
            'cat-seen-item-ids'
        );
        if (!$items) {
            $items = [];
        } else {
            $items = json_decode($items);
        }
        
        if (!in_array($seenCatItemId, $items)) {
            $items[] = $seenCatItemId;
        }
        
        $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID)->setCatValue(
            $sessionId,
            $this->getCatSection()->getSectionId(),
            'cat-seen-item-ids',
            json_encode($items)
        );
    }

    /**
     * Get Last CAT Item Output.
     * 
     * Get the last CAT Item Result from memory.
     */
    public function getLastCatItemOutput()
    {
        $sessionId = $this->getTestSession()->getSessionId();
        
        $itemOutput = $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID)->getCatValue(
            $sessionId,
            $this->getCatSection()->getSectionId(),
            'cat-item-output'
        );
        
        if (!$itemOutput) {
            $output = [];
        } else {
            $rawData = json_decode($itemOutput, true);

            foreach ($rawData as $result) {
                $itemIdentifier = $result['identifier'];
                $variables= [];
                foreach ($result['outcomeVariables'] as $outcomeVariable) {
                    $variables[] = ResultVariable::restore($outcomeVariable);
                }
                
                $output[$itemIdentifier] = new ItemResult($itemIdentifier, $variables);
            }
        }
        
        return $output;
    }
    
    /**
     * Persist CAT Item Output.
     * 
     * Persist the last CAT Item Result in memory.
     */
    public function persistLastCatItemOutput(array $lastCatItemOutput)
    {
        $sessionId = $this->getTestSession()->getSessionId();
        
        $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID)->setCatValue(
            $sessionId,
            $this->getCatSection()->getSectionId(),
            'cat-item-output',
            json_encode($lastCatItemOutput)
        );
    }
    
    /**
     * Get Current CAT Section.
     * 
     * Returns the current CatSection object. In case of the current Assessment Section is not adaptive, the method
     * returns the boolean false value.
     * 
     * @return \oat\libCat\CatSection|boolean
     */
    public function getCatSection(RouteItem $routeItem = null)
    {
        return $this->getServiceManager()->get(CatService::SERVICE_ID)->getCatSection(
            $this->getTestSession(),
            $this->getCompilationDirectory()['private'],
            $routeItem
        );
    }
    
    /**
     * Is the Assessment Test Session Context Adaptive.
     * 
     * Determines whether or not the current Assessment Test Session is in an adaptive context.
     * 
     * @param AssessmentItemRef $currentAssessmentItemRef (optional) An AssessmentItemRef object to be considered as the current assessmentItemRef.
     * @return boolean
     */
    public function isAdaptive(AssessmentItemRef $currentAssessmentItemRef = null)
    {
        return $this->getServiceManager()->get(CatService::SERVICE_ID)->isAdaptive($this->getTestSession(), $currentAssessmentItemRef);
    }
    
    /**
     * Contains Adaptive Content.
     * 
     * Whether or not the current Assessment Test Session has some adaptive contents.
     * 
     * @return boolean
     */
    public function containsAdaptive()
    {
        $adaptiveSectionMap = $this->getServiceManager()->get(CatService::SERVICE_ID)->getAdaptiveSectionMap($this->getCompilationDirectory()['private']);
        
        return !empty($adaptiveSectionMap);
    }

    /**
     * Select the next Adaptive Item.
     *
     * Ask the CAT Engine for the Next Item to be presented to the candidate, depending on the last
     * CAT Item ID and last CAT Item Output currently stored.
     *
     * This method returns a CAT Item ID in case of the CAT Engine returned one. Otherwise, it returns
     * null meaning that there is no CAT Item to be presented.
     *
     * @return mixed|null
     * @throws \common_Exception
     */
    public function selectAdaptiveNextItem()
    {
        $lastItemId = $this->getCurrentCatItemId();
        $lastOutput = $this->getLastCatItemOutput();
        $catSession = $this->getCatSession();

        try {
            $selection = $catSession->getTestMap(array_values($lastOutput));
            $isShadowItem = false;
        } catch (CatEngineException $e) {
            \common_Logger::e('Error during CatEngine processing. ' . $e->getMessage());
            $selection = $catSession->getTestMap();
            $isShadowItem = true;
        }

        $event = new SelectAdaptiveNextItemEvent($this->getTestSession(), $lastItemId, $selection, $isShadowItem);
        $this->getServiceManager()->get(EventManager::SERVICE_ID)->trigger($event);

        if (is_array($selection) && count($selection) == 0) {
            \common_Logger::d('No new CAT item selection.');
            return null;
        } else {
            $this->persistCatSession($catSession);
            \common_Logger::d("New CAT item selection is '" . implode(', ', $selection) . "'.");
            return $selection[0];
        }
    }
    
    /**
     * Get Current AssessmentItemRef object.
     * 
     * This method returns the current AssessmentItemRef object depending on the test $context.
     * 
     * @return \qtism\data\ExtendedAssessmentItemRef
     */
    public function getCurrentAssessmentItemRef()
    {
        if ($this->isAdaptive()) {
            return $this->getServiceManager()->get(CatService::SERVICE_ID)->getAssessmentItemRefByIdentifier(
                $this->getCompilationDirectory()['private'],
                $this->getCurrentCatItemId()
            );
        } else {
            return $this->getTestSession()->getCurrentAssessmentItemRef();
        }
    }
    
    public function getPreviouslySeenCatItemIds(RouteItem $routeItem = null)
    {
        $result = [];
        
        if ($catSection = $this->getCatSection($routeItem)) {        
            $items = $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID)->getCatValue(
                $this->getTestSession()->getSessionId(),
                $catSection->getSectionId(),
                'cat-seen-item-ids'
            );
            
            $result = !$items ? [] : json_decode($items);
        }
        
        return $result;
    }

    public function getShadowTest(RouteItem $routeItem = null)
    {
        $shadow = array_values(
            array_unique(
                array_merge(
                    $this->getPreviouslySeenCatItemIds($routeItem),
                    $this->getCatSession($routeItem)->getTestMap()
                )
            )
        );

        return $shadow;
    }
    
    public function getCurrentCatItemId(RouteItem $routeItem = null)
    {
        return $this->getServiceManager()->get(CatService::SERVICE_ID)->getCurrentCatItemId(
            $this->getTestSession(),
            $this->getCompilationDirectory()['private'],
            $routeItem
        );
    }
    
    public function persistCurrentCatItemId($catItemId)
    {
        $sessionId = $this->getTestSession()->getSessionId();
        
        $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID)->setCatValue(
            $sessionId,
            $this->getCatSection()->getSectionId(),
            'current-cat-item-id',
            $catItemId
        );
    }
    
    public function getItemPositionInRoute($refId, &$catItemId = '')
    {
        $route = $this->getTestSession()->getRoute();
        $routeCount = $route->count();
        
        $i = 0;
        $j = 0;
        
        while ($i < $routeCount) {
            $routeItem = $route->getRouteItemAt($i);
            
            if ($this->isAdaptive($routeItem->getAssessmentItemRef())) {
                $shadow = $this->getShadowTest($routeItem);
                
                for ($k = 0; $k < count($shadow); $k++) {
                    if ($j == $refId) {
                        $catItemId = $shadow[$k];
                        break 2;
                    }
                    
                    $j++;
                }
            } else {
                if ($j == $refId) {
                    break;
                }
                
                $j++;
            }
            
            $i++;
        }
        
        return $i;
    }
    
    /**
     * Get Real Current Position.
     * 
     * This method returns the real position of the test taker within
     * the item flow, by considering CAT sections.
     * 
     * @return integer A zero-based index.
     */
    public function getCurrentPosition()
    {
        $route = $this->getTestSession()->getRoute();
        $routeCount = $route->count();
        $routeItemPosition = $route->getPosition();
        $currentRouteItem = $route->getRouteItemAt($routeItemPosition);
        
        $finalPosition = 0;
        
        for ($i = 0; $i < $routeCount; $i++) {
            $routeItem = $route->getRouteItemAt($i);
            
            if ($routeItem !== $currentRouteItem) {
                if (!$this->isAdaptive($routeItem->getAssessmentItemRef())) {
                    $finalPosition++;
                } else {
                    $finalPosition += count($this->getShadowTest($routeItem));
                }
            } else {
                if ($this->isAdaptive($routeItem->getAssessmentItemRef())) {
                    $finalPosition += array_search(
                        $this->getCurrentCatItemId($routeItem),
                        $this->getShadowTest($routeItem)
                    );
                }
                
                break;
            }
        }
        
        return $finalPosition;
    }
    
    public function getCatAttempts($identifier, RouteItem $routeItem = null)
    {
        return $this->getServiceManager()->get(CatService::SERVICE_ID)->getCatAttempts(
            $this->getTestSession(),
            $this->getCompilationDirectory()['private'],
            $identifier,
            $routeItem
        );
    }
    
    public function persistCatAttempts($identifier, $attempts) {
        $sessionId = $this->getTestSession()->getSessionId();
        $sectionId = $this->getCatSection()->getSectionId();
        
        $catAttempts = $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID)->getCatValue(
            $sessionId,
            $sectionId,
            'cat-attempts'
        );
        
        $catAttempts = ($catAttempts) ? $catAttempts : [];
        $catAttempts[$identifier] = $attempts;
        
        $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID)->setCatValue(
            $sessionId,
            $sectionId,
            'cat-attempts',
            $catAttempts
        );
    }
}
