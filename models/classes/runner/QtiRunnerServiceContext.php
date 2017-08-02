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

use oat\taoQtiTest\models\QtiTestCompilerIndex;
use oat\taoQtiTest\models\runner\session\TestSession;
use oat\taoQtiTest\models\SessionStateService;
use oat\taoQtiTest\models\cat\CatService;
use oat\taoQtiTest\models\ExtendedStateService;
use qtism\data\AssessmentTest;
use qtism\runtime\storage\binary\AbstractQtiBinaryStorage;
use qtism\runtime\storage\binary\BinaryAssessmentTestSeeker;
use oat\libCat\result\ItemResult;


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
    
    private $catSection = null;
    
    private $catSession = null;
    
    private $lastCatItemId = null;
    
    private $lastCatItemOutput;

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
    public function getCatEngine()
    {
        $compiledDirectory = $this->getCompilationDirectory()['private'];
        $adaptiveSectionMap = $this->getServiceManager()->get(CatService::SERVICE_ID)->getAdaptiveSectionMap($compiledDirectory);
        $sectionId = $this->getTestSession()->getCurrentAssessmentSection()->getIdentifier();
        $catEngine = false;
        
        if ($sectionId && isset($adaptiveSectionMap[$sectionId])) {
            $catEngine = $this->getServiceManager()->get(CatService::SERVICE_ID)->getEngine($adaptiveSectionMap[$sectionId]['endpoint']);
        }
        
        return $catEngine;
    }
    
    /**
     * Initialize the CAT Session.
     * 
     * This method has to be invoked whenever a new adaptive Assessment Section is encountered
     * during an Assessment Test Session.
     */
    public function initCatSession()
    {
        $catEngine = $this->getCatEngine();
        $catSession = $this->getCatSession();
        
        // Deal with the CAT Section.
        $catSection = $this->getCatEngine()->restoreSection($this->getCurrentCatSection());
        
        // Deal with the CAT Session.
        if(!empty($catSession)){
            $catSession = $catSection->restoreSession($catSession);
        } else {
            $catSession = $catSection->initSession();
        }
        
        $this->persistCatSession(json_encode($catSession));
    }
    
    /**
     * Get the current CAT Session Data.
     * 
     * Get the current CAT Session Data (data is cached).
     * 
     * @return string JSON encoded CAT Session data.
     */
    public function getCatSession()
    {
        if (!isset($this->catSession)) {
            $sessionId = $this->getTestSession()->getSessionId();
            $catSession = $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID)->getCatValue(
                $sessionId, 
                $this->getCurrentCatSection(), 
                'cat-session'
            );
            $this->catSession = (is_null($catSession)) ? false : $catSession; 
        }
        
        return $this->catSession;
    }
    
    /**
     * Persist the CAT Session Data.
     * 
     * Persist the current CAT Session Data in storage.
     * 
     * @param string $catSession JSON encoded CAT Session data.
     */
    public function persistCatSession($catSession)
    {
        $this->catSession = $catSession;
        
        $sessionId = $this->getTestSession()->getSessionId();
        $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID)->setCatValue(
            $sessionId,
            $this->getCurrentCatSection(),
            'cat-session', 
            $catSession
        );
    }
    
    /**
     * Clear CAT Session Data.
     * 
     * Remove the CAT Session Data from persistent storage.
     */
    public function clearCatSession()
    {
        $this->catSession = false;
        
        $sessionId = $this->getTestSession()->getSessionId();
        $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID)->removeCatValue(
            $sessionId,
            $this->getCurrentCatSection(),
            'cat-session'
        );
    }
    
    /**
     * Get the CAT Item ID.
     * 
     * Returns the last CAT Item Identifier provided by the CAT Engine.
     * 
     * @return string
     */
    public function getLastCatItemId()
    {
        if (!isset($this->lastCatItemId)) {
            $sessionId = $this->getTestSession()->getSessionId();
            $id = $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID)->getCatValue(
                $sessionId, 
                $this->getCurrentCatSection(),
                'cat-last-item-ids'
            );
            $this->lastCatItemId = (is_null($id)) ? false : $id;
        }
        
        return $this->lastCatItemId[0];
    }
    
    /**
     * Persist the CAT Item ID.
     * 
     * Persists the last CAT Item Identifiers provided by the CAT Engine.
     * 
     * @param string $lastCatItemId
     */
    public function persistLastCatItemIds(array $lastCatItemIds)
    {
        $this->lastCatItemId = $lastCatItemIds;
        
        $sessionId = $this->getTestSession()->getSessionId();
        $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID)->setCatValue(
            $sessionId, 
            $this->getCurrentCatSection(),
            'cat-last-item-ids', 
            $lastCatItemIds
        );
    }
    
    /**
     * Clear the CAT Item ID.
     * 
     * Remove the last CAT Item Identifier provided by the CAT Engine from persistent storage.
     */
    public function clearLastCatItemIds()
    {
        $this->lastCatItemId = false;
        
        $sessionId = $this->getTestSession()->getSessionId();
        $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID)->removeCatValue(
            $sessionId,
            $this->getCurrentCatSection(),
            'cat-last-item-ids'
        );
    }
    
    /**
     * Get Last CAT Item Output.
     * 
     * Get the last CAT Item Result from memory.
     */
    public function getLastCatItemOutput()
    {
        return $this->lastCatItemOutput;
    }
    
    /**
     * Persist CAT Item Output.
     * 
     * Persist the last CAT Item Result in memory.
     */
    public function persistLastCatItemOutput($lastCatItemOutput)
    {
        $this->lastCatItemOutput = $lastCatItemOutput;
    }
    
    /**
     * Get Current CAT Section ID.
     * 
     * Returns the current CAT Section Identifier. In case of the current Assessment Section is not adaptive, the method
     * returns the boolean false value.
     * 
     * @return string|boolean
     */
    public function getCurrentCatSection()
    {
        $compiledDirectory = $this->getCompilationDirectory()['private'];
        $adaptiveSectionMap = $this->getServiceManager()->get(CatService::SERVICE_ID)->getAdaptiveSectionMap($compiledDirectory);
        $section = $this->getTestSession()->getCurrentAssessmentSection();
        
        if (!$section) {
            return false;
        }
        
        $identifier = $section->getIdentifier();
        
        return (isset($adaptiveSectionMap[$identifier])) ? $adaptiveSectionMap[$identifier]['section'] : false;
    }
    
    /**
     * Is the Assessment Test Session Context Adaptive.
     * 
     * Determines whether or not the current Assessment Test Session is in an adaptive context.
     * 
     * @return boolean
     */
    public function isAdaptive()
    {
        $currentAssessmentItemRef = $this->getTestSession()->getCurrentAssessmentItemRef();
        if ($currentAssessmentItemRef) {
            return $this->getServiceManager()->get(CatService::SERVICE_ID)->isAdaptivePlaceholder($currentAssessmentItemRef);
        } else {
            return false;
        }
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
     * @return string|null
     */
    public function selectAdaptiveNextItem()
    {
        $lastItemId = $this->getLastCatItemId();
        $lastOutput = $this->getLastCatItemOutput();
        $catSection = $this->getCatEngine()->restoreSection($this->getCurrentCatSection());
        $catSession = $catSection->restoreSession($this->getCatSession());
        
        if (!empty($lastItemId)) {
            $selection = $catSession->getTestMap([$lastOutput]);
        } else {
            $selection = $catSession->getTestMap([]);
        }
        
        if (is_array($selection) && count($selection) == 0) {
            
            return null;
        } else {
            $this->persistLastCatItemIds($selection);
            $this->persistCatSession(json_encode($catSession));
            return $selection[0];
        }
    }
}
