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
 * Copyright (c) 2017-2023 (original work) Open Assessment Technologies SA.
 */

namespace oat\taoQtiTest\models\runner;

use common_exception_InvalidArgumentType;
use common_ext_ExtensionException;
use common_ext_ExtensionsManager;
use common_session_SessionManager;
use core_kernel_classes_Resource;
use oat\libCat\CatEngine;
use oat\libCat\CatSection;
use oat\libCat\CatSession;
use oat\libCat\exception\CatEngineException;
use oat\libCat\result\AbstractResult;
use oat\libCat\result\ItemResult;
use oat\libCat\result\ResultVariable;
use oat\oatbox\event\EventManager;
use oat\oatbox\service\ServiceNotFoundException;
use oat\oatbox\user\User;
use oat\tao\helpers\UserHelper;
use oat\taoDelivery\model\execution\DeliveryServerService;
use oat\taoQtiTest\helpers\TestSessionMemento;
use oat\taoQtiTest\models\cat\CatEngineNotFoundException;
use oat\taoQtiTest\models\CompilationDataService;
use oat\taoQtiTest\models\event\QtiTestChangeEvent;
use oat\taoQtiTest\models\QtiTestCompilerIndex;
use oat\taoQtiTest\models\runner\session\TestSession;
use oat\taoQtiTest\models\cat\CatService;
use oat\taoQtiTest\models\ExtendedStateService;
use oat\taoQtiTest\models\SectionPauseService;
use oat\taoQtiTest\models\event\SelectAdaptiveNextItemEvent;
use Psr\Container\ContainerInterface;
use qtism\data\AssessmentTest;
use qtism\data\AssessmentItemRef;
use qtism\data\ExtendedAssessmentItemRef;
use qtism\data\NavigationMode;
use qtism\runtime\storage\binary\AbstractQtiBinaryStorage;
use qtism\runtime\storage\binary\BinaryAssessmentTestSeeker;
use qtism\runtime\storage\common\StorageException;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\tests\AssessmentTestSessionException;
use qtism\runtime\tests\RouteItem;
use tao_models_classes_service_FileStorage;
use tao_models_classes_service_StorageDirectory;
use taoQtiTest_helpers_SessionManager;
use taoQtiTest_helpers_TestCompilerUtils;
use taoQtiTest_helpers_TestRunnerUtils;
use taoQtiTest_models_classes_QtiTestService;
use taoResultServer_models_classes_Variable;
use common_Exception;
use common_exception_Error;
use common_exception_NotImplemented;
use common_Logger;
use Exception;

/**
 * Class QtiRunnerServiceContext
 *
 * Defines a container to store and to share runner service context of the QTI implementation
 *
 * @package oat\taoQtiTest\models
 *
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
class QtiRunnerServiceContext extends RunnerServiceContext
{
    /**
     * The session storage
     */
    protected ?AbstractQtiBinaryStorage $storage = null;

    protected ?taoQtiTest_helpers_SessionManager $sessionManager = null;

    /**
     * The assessment test definition
     */
    protected ?AssessmentTest $testDefinition = null;

    /**
     * The path of the compilation directory.
     *
     * @var tao_models_classes_service_StorageDirectory[]
     */
    protected ?array $compilationDirectory = null;

    /**
     * The metadata about the test definition being executed.
     */
    private ?array $testMeta = null;

    /**
     * The index of compiled items.
     */
    private QtiTestCompilerIndex $itemIndex;

    /**
     * The URI of the assessment test
     */
    protected string $testDefinitionUri;

    /**
     * The URI of the compiled delivery
     */
    protected string $testCompilationUri;

    /**
     * The URI of the delivery execution
     */
    protected string $testExecutionUri;

    /**
     * Whether we are in synchronization mode
     */
    private bool $syncingMode = false;

    private ?string $userUri;

    private ?ContainerInterface $container = null;

    /**
     * QtiRunnerServiceContext constructor.
     *
     * @param string $testDefinitionUri
     * @param string $testCompilationUri
     * @param string $testExecutionUri
     */
    public function __construct(
        string $testDefinitionUri,
        string $testCompilationUri,
        string $testExecutionUri
    ) {
        $this->testDefinitionUri = $testDefinitionUri;
        $this->testCompilationUri = $testCompilationUri;
        $this->testExecutionUri = $testExecutionUri;
    }

    /**
     * Starts the context
     */
    public function init()
    {
        $this->retrieveItemIndex();
    }

    /**
     * Extracts the path of the compilation directory
     */
    protected function initCompilationDirectory()
    {
        $fileStorage = tao_models_classes_service_FileStorage::singleton();
        $directoryIds = explode('|', $this->getTestCompilationUri());
        $directories = [
            'private' => $fileStorage->getDirectoryById($directoryIds[0]),
            'public' => $fileStorage->getDirectoryById($directoryIds[1])
        ];

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
     *
     * @throws ServiceNotFoundException
     * @throws common_Exception
     * @throws common_exception_Error
     * @throws common_ext_ExtensionException
     */
    protected function initStorage()
    {
        /** @var DeliveryServerService $deliveryServerService */
        $deliveryServerService = $this->getServiceManager()->get(DeliveryServerService::SERVICE_ID);
        $resultStore = $deliveryServerService->getResultStoreWrapper($this->getTestExecutionUri());
        $testResource = new core_kernel_classes_Resource($this->getTestDefinitionUri());
        $sessionManager = new taoQtiTest_helpers_SessionManager($resultStore, $testResource);

        $seeker = new BinaryAssessmentTestSeeker($this->getTestDefinition());
        $userUri = $this->getUserUri();

        $config = common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest')->getConfig('testRunner');
        $storageClassName = $config['test-session-storage'];
        $this->storage = new $storageClassName($sessionManager, $seeker, $userUri);
        $this->sessionManager = $sessionManager;
    }

    /**
     * Loads the test session
     *
     * @throws StorageException
     * @throws common_exception_Error
     * @throws common_exception_InvalidArgumentType
     * @throws common_ext_ExtensionException
     */
    protected function initTestSession()
    {
        $storage = $this->getStorage();
        $sessionId = $this->getTestExecutionUri();

        if ($storage->exists($sessionId) === false) {
            common_Logger::d("Instantiating QTI Assessment Test Session");
            $this->setTestSession($storage->instantiate($this->getTestDefinition(), $sessionId));

            $testTaker = $this->getTestTakerFromSessionOrRds();
            taoQtiTest_helpers_TestRunnerUtils::setInitialOutcomes($this->getTestSession(), $testTaker);
        } else {
            common_Logger::d("Retrieving QTI Assessment Test Session '${sessionId}'...");
            $this->setTestSession($storage->retrieve($this->getTestDefinition(), $sessionId));
        }

        taoQtiTest_helpers_TestRunnerUtils::preserveOutcomes($this->getTestSession());
    }

    /**
     * @deprecated
     */
    protected function retrieveTestMeta()
    {
    }

    /**
     * Retrieves the index of compiled items.
     */
    protected function retrieveItemIndex()
    {
        $this->itemIndex = new QtiTestCompilerIndex();
        try {
            $directories = $this->getCompilationDirectory();
            $data = $directories['private']->read(taoQtiTest_models_classes_QtiTestService::TEST_COMPILED_INDEX);
            if ($data) {
                $this->itemIndex->unserialize($data);
            }
        } catch (Exception $e) {
            common_Logger::d('Ignoring file not found exception for Items Index');
        }
    }

    /**
     * Sets the test session
     * @param mixed $testSession
     * @throws common_exception_InvalidArgumentType
     */
    public function setTestSession($testSession)
    {
        if ($testSession instanceof TestSession) {
            parent::setTestSession($testSession);
        } else {
            throw new common_exception_InvalidArgumentType(
                'QtiRunnerServiceContext',
                'setTestSession',
                0,
                TestSession::class,
                $testSession
            );
        }
    }

    /**
     * Gets the session storage
     * @return AbstractQtiBinaryStorage
     * @throws common_exception_Error
     * @throws common_ext_ExtensionException
     */
    public function getStorage()
    {
        if (!$this->storage) {
            $this->initStorage();
        }
        return $this->storage;
    }

    /**
     * @return EventManager
     * @throws \Zend\ServiceManager\Exception\ServiceNotFoundException
     */
    protected function getEventManager()
    {
        return $this->getServiceLocator()->get(EventManager::SERVICE_ID);
    }

    /**
     * @return taoQtiTest_helpers_SessionManager
     * @throws common_exception_Error
     * @throws common_ext_ExtensionException
     */
    public function getSessionManager()
    {
        if (null === $this->sessionManager) {
            $this->initStorage();
        }
        return $this->sessionManager;
    }

    /**
     * Gets the assessment test definition
     * @return AssessmentTest
     */
    public function getTestDefinition()
    {
        if (null === $this->testDefinition) {
            $this->initTestDefinition();
        }
        return $this->testDefinition;
    }

    /**
     * Gets the path of the compilation directory
     * @return tao_models_classes_service_StorageDirectory[]
     */
    public function getCompilationDirectory()
    {
        if (null === $this->compilationDirectory) {
            $this->initCompilationDirectory();
        }
        return $this->compilationDirectory;
    }

    /**
     * Gets the meta data about the test definition being executed.
     * @return array
     * @throws common_Exception
     */
    public function getTestMeta()
    {
        if (!isset($this->testMeta)) {
            $directories = $this->getCompilationDirectory();

            /** @var CompilationDataService $compilationDataService */
            $compilationDataService = $this->getServiceLocator()->get(CompilationDataService::SERVICE_ID);
            $this->testMeta = $compilationDataService->readCompilationMetadata($directories['private']);
        }

        return $this->testMeta;
    }

    public function getTestCompilationVersion(): int
    {
        return $this->getTestMeta()[taoQtiTest_helpers_TestCompilerUtils::COMPILATION_VERSION] ?? 0;
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
     * @throws common_exception_Error
     */
    public function getItemIndex($id)
    {
        return $this->itemIndex->getItem($id, common_session_SessionManager::getSession()->getInterfaceLanguage());
    }


    /**
     * @return string
     * @throws common_exception_Error
     */
    public function getUserUri()
    {
        if ($this->userUri === null) {
            $this->userUri = common_session_SessionManager::getSession()->getUserUri();
        }
        return $this->userUri;
    }

    /**
     * @param string $userUri
     */
    public function setUserUri($userUri)
    {
        $this->userUri = $userUri;
    }

    /**
     * Gets a particular value from item index
     * @param string $id
     * @param string $name
     * @return mixed
     * @throws common_exception_Error
     */
    public function getItemIndexValue($id, $name)
    {
        return $this->itemIndex->getItemValue(
            $id,
            common_session_SessionManager::getSession()->getInterfaceLanguage(),
            $name
        );
    }

    /**
     * Get Cat Engine Implementation
     *
     * Get the currently configured Cat Engine implementation.
     *
     * @param RouteItem|null $routeItem
     * @return CatEngine
     *
     * @throws ServiceNotFoundException
     * @throws CatEngineNotFoundException
     * @throws common_exception_Error
     */
    public function getCatEngine(RouteItem $routeItem = null)
    {
        $compiledDirectory = $this->getCompilationDirectory()['private'];
        $adaptiveSectionMap = $this->getCatService()->getAdaptiveSectionMap($compiledDirectory);
        $routeItem = $routeItem ? $routeItem : $this->getTestSession()->getRoute()->current();

        $sectionId = $routeItem->getAssessmentSection()->getIdentifier();
        $catEngine = false;

        if (isset($adaptiveSectionMap[$sectionId])) {
            $catEngine = $this->getCatService()->getEngine(
                $adaptiveSectionMap[$sectionId]['endpoint']
            );
        }

        return $catEngine;
    }

    /**
     * @return AssessmentTestSession
     * @throws common_exception_Error
     */
    public function getTestSession()
    {
        if (!$this->testSession) {
            $this->initTestSession();
        }
        return parent::getTestSession();
    }


    /**
     * Get the current CAT Session Object.
     *
     * @param RouteItem|null $routeItem
     * @return CatSession|false
     *
     * @throws ServiceNotFoundException
     * @throws common_exception_Error
     */
    public function getCatSession(RouteItem $routeItem = null)
    {
        return $this->getCatService()->getCatSession(
            $this->getTestSession(),
            $this->getCompilationDirectory()['private'],
            $routeItem
        );
    }

    /**
     * Persist the CAT Session Data.
     *
     * Persist the current CAT Session Data in storage.
     *
     * @param string $catSession JSON encoded CAT Session data.
     * @param RouteItem|null $routeItem
     * @return mixed
     *
     * @throws ServiceNotFoundException
     * @throws common_exception_Error
     */
    public function persistCatSession($catSession, RouteItem $routeItem = null)
    {
        return $this->getCatService()->persistCatSession(
            $catSession,
            $this->getTestSession(),
            $this->getCompilationDirectory()['private'],
            $routeItem
        );
    }

    /**
     * Persist seen CAT Item identifiers.
     *
     * @param string $seenCatItemId
     *
     * @throws ServiceNotFoundException
     * @throws common_exception_Error
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

        $output = [];

        if (!is_null($itemOutput)) {
            $rawData = json_decode($itemOutput, true);

            foreach ($rawData as $result) {
                /** @var ItemResult $itemResult */
                $itemResult = ItemResult::restore($result);
                $output[$itemResult->getItemRefId()] = $itemResult;
            }
        }

        return $output;
    }

    /**
     * Persist CAT Item Output.
     *
     * Persist the last CAT Item Result in memory.
     *
     * @throws common_exception_Error
     * @throws ServiceNotFoundException
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
     * @param RouteItem|null $routeItem
     * @return CatSection|boolean
     *
     * @throws ServiceNotFoundException
     * @throws common_exception_Error
     */
    public function getCatSection(RouteItem $routeItem = null)
    {
        return $this->getCatService()->getCatSection(
            $this->getTestSession(),
            $this->getCompilationDirectory()['private'],
            $routeItem
        );
    }

    /**
     * Is the Assessment Test Session Context Adaptive.
     *
     * Determines whether the current Assessment Test Session is in an adaptive context.
     *
     * @param ?AssessmentItemRef $currentAssessmentItemRef An AssessmentItemRef object to be considered as
     *                                                    the current assessmentItemRef.
     * @return boolean
     *
     * @throws common_exception_Error
     * @throws ServiceNotFoundException
     */
    public function isAdaptive(AssessmentItemRef $currentAssessmentItemRef = null)
    {
        return $this->getCatService()->isAdaptive(
            $this->getTestSession(),
            $currentAssessmentItemRef
        );
    }

    /**
     * Contains Adaptive Content.
     *
     * Whether the current Assessment Test Session has some adaptive contents.
     *
     * @return boolean
     *
     * @throws ServiceNotFoundException
     */
    public function containsAdaptive()
    {
        $adaptiveSectionMap = $this->getCatService()->getAdaptiveSectionMap(
            $this->getCompilationDirectory()['private']
        );

        return !empty($adaptiveSectionMap);
    }

    /**
     * Select the next Adaptive Item and store the retrieved results from CAT engine
     *
     * Ask the CAT Engine for the Next Item to be presented to the candidate, depending on the last
     * CAT Item ID and last CAT Item Output currently stored.
     *
     * This method returns a CAT Item ID in case of the CAT Engine returned one. Otherwise, it returns
     * null meaning that there is no CAT Item to be presented.
     *
     * @return mixed|null
     *
     * @throws common_Exception
     * @throws ServiceNotFoundException
     */
    public function selectAdaptiveNextItem()
    {
        $lastItemId = $this->getCurrentCatItemId();
        $lastOutput = $this->getLastCatItemOutput();
        $catSession = $this->getCatSession();

        $preSelection = $catSession->getTestMap();

        try {
            if (!$this->syncingMode) {
                $selection = $catSession->getTestMap(array_values($lastOutput));

                if (!$this->saveAdaptiveResults($catSession)) {
                    common_Logger::w('Unable to save CatService results.');
                }
                $isShadowItem = false;
            } else {
                $selection = $catSession->getTestMap();
                $isShadowItem = true;
            }
        } catch (CatEngineException $e) {
            common_Logger::e('Error during CatEngine processing. ' . $e->getMessage());
            $selection = $catSession->getTestMap();
            $isShadowItem = true;
        }

        $event = new SelectAdaptiveNextItemEvent(
            $this->getTestSession(),
            $lastItemId,
            $preSelection,
            $selection,
            $isShadowItem
        );
        $this->getServiceManager()->get(EventManager::SERVICE_ID)->trigger($event);

        $this->persistCatSession($catSession);
        if (is_array($selection) && count($selection) > 0) {
            common_Logger::d("New CAT item selection is '" . implode(', ', $selection) . "'.");
            return $selection[0];
        } else {
            common_Logger::d('No new CAT item selection.');
            return null;
        }
    }

    /**
     * Get Current AssessmentItemRef object.
     *
     * This method returns the current AssessmentItemRef object depending on the test $context.
     *
     * @return ExtendedAssessmentItemRef|false
     *
     * @throws ServiceNotFoundException
     * @throws common_exception_Error
     */
    public function getCurrentAssessmentItemRef()
    {
        if ($this->isAdaptive()) {
            return $this->getCatService()->getAssessmentItemRefByIdentifier(
                $this->getCompilationDirectory()['private'],
                $this->getCurrentCatItemId()
            );
        } else {
            return $this->getTestSession()->getCurrentAssessmentItemRef();
        }
    }

    /**
     * @return array
     *
     * @throws ServiceNotFoundException
     * @throws common_exception_Error
     */
    public function getPreviouslySeenCatItemIds(RouteItem $routeItem = null)
    {
        return $this->getCatService()->getPreviouslySeenCatItemIds(
            $this->getTestSession(),
            $this->getCompilationDirectory()['private'],
            $routeItem
        );
    }


    /**
     * @return array
     *
     * @throws ServiceNotFoundException
     * @throws common_exception_Error
     */
    public function getShadowTest(RouteItem $routeItem = null)
    {
        return $this->getCatService()->getShadowTest(
            $this->getTestSession(),
            $this->getCompilationDirectory()['private'],
            $routeItem
        );
    }

    /**
     * @return mixed
     *
     * @throws ServiceNotFoundException
     * @throws common_exception_Error
     */
    public function getCurrentCatItemId(RouteItem $routeItem = null)
    {
        return $this->getCatService()->getCurrentCatItemId(
            $this->getTestSession(),
            $this->getCompilationDirectory()['private'],
            $routeItem
        );
    }

    /**
     * @return void
     *
     * @throws ServiceNotFoundException
     * @throws common_exception_Error
     */
    public function persistCurrentCatItemId($catItemId)
    {
        $session = $this->getTestSession();
        $sessionId = $session->getSessionId();
        $this->getServiceManager()->get(ExtendedStateService::SERVICE_ID)->setCatValue(
            $sessionId,
            $this->getCatSection()->getSectionId(),
            'current-cat-item-id',
            $catItemId
        );

        $event = new QtiTestChangeEvent($session, new TestSessionMemento($session));
        $this->getServiceManager()->propagate($event);
        $this->getEventManager()->trigger($event);
    }

    /**
     * @return int
     *
     * @throws ServiceNotFoundException
     * @throws common_exception_Error
     */
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
     *
     * @throws common_exception_Error
     * @throws ServiceNotFoundException
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

    /**
     * @return int|mixed
     *
     * @throws ServiceNotFoundException
     * @throws common_exception_Error
     */
    public function getCatAttempts($identifier, RouteItem $routeItem = null)
    {
        return $this->getCatService()->getCatAttempts(
            $this->getTestSession(),
            $this->getCompilationDirectory()['private'],
            $identifier,
            $routeItem
        );
    }

    /**
     * @return void
     *
     * @throws ServiceNotFoundException
     * @throws common_exception_Error
     */
    public function persistCatAttempts($identifier, $attempts)
    {
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

    /**
     * Can Move Backward
     *
     * Whether the Test Taker is able to navigate backward.
     * This implementation takes the CAT sections into consideration.
     *
     * @return boolean
     * @throws AssessmentTestSessionException
     *
     * @throws common_exception_Error
     * @throws ServiceNotFoundException
     */
    public function canMoveBackward()
    {
        $moveBack = false;
        $session = $this->getTestSession();
        if ($this->isAdaptive()) {
            $positionInCatSession = array_search(
                $this->getCurrentCatItemId(),
                $this->getShadowTest()
            );

            if ($positionInCatSession === 0) {
                // First item in cat section.
                if ($session->getRoute()->getPosition() !== 0) {
                    $testPart = $session->getPreviousRouteItem()->getTestPart();
                    $moveBack = $testPart->getNavigationMode() === NavigationMode::NONLINEAR;
                }
            } else {
                $testPart = $session->getRoute()->current()->getTestPart();
                $moveBack = $testPart->getNavigationMode() === NavigationMode::NONLINEAR;
            }
        } else {
            $moveBack = $session->canMoveBackward();

            // Check also if the sectionPause prevents you from moving backward
            if ($moveBack) {
                $moveBack = $this->getSectionPauseService()->canMoveBackward($session);
            }
        }

        return $moveBack;
    }

    /**
     * Save the Cat service result for tests and items
     *
     * @param CatSession $catSession
     * @return bool
     *
     * @throws ServiceNotFoundException
     */
    protected function saveAdaptiveResults(CatSession $catSession)
    {
        $testResult = $catSession->getTestResult();
        $testResult = empty($testResult) ? [] : [$testResult];
        return $this->storeResult(array_merge($testResult, $catSession->getItemResults()));
    }

    /**
     * Store a Cat Result variable
     *
     * The result has to be an ItemResult and TestResult to embed CAT variables
     * After converted them to taoResultServer variables
     * Use the runner service to store the variables
     *
     * @param AbstractResult[] $results
     * @return bool
     * @throws ServiceNotFoundException
     */
    protected function storeResult(array $results)
    {
        /** @var QtiRunnerService $runnerService */
        $runnerService = $this->getServiceLocator()->get(QtiRunnerService::SERVICE_ID);

        $success = true;
        try {
            foreach ($results as $result) {
                if (!$result instanceof AbstractResult) {
                    throw new common_Exception(__FUNCTION__ . ' requires a CAT result to store it.');
                }

                $variables = $this->convertCatVariables($result->getVariables());
                if (empty($variables)) {
                    common_Logger::t('No Cat result variables to store.');
                    continue;
                }

                if ($result instanceof ItemResult) {
                    $itemId = $result->getItemRefId();
                    $itemUri = $this->getItemUriFromRefId($itemId);
                } else {
                    $itemUri = $itemId = null;
                    $sectionId = $this
                        ->getTestSession()
                        ->getRoute()
                        ->current()
                        ->getAssessmentSection()
                        ->getIdentifier();
                    foreach ($variables as $variable) {
                        /** @var taoResultServer_models_classes_Variable $variable */
                        $variable->setIdentifier($sectionId . '-' . $variable->getIdentifier());
                    }
                }

                if (!$runnerService->storeVariables($this, $itemUri, $variables, $itemId)) {
                    $success = false;
                }
            }
        } catch (Exception $e) {
            common_Logger::w('An error has occurred during CAT result storing: ' . $e->getMessage());
            $success = false;
        }

        return $success;
    }

    /**
     * Convert CAT variables to taoResultServer variables
     *
     * Following the variable type, use the Runner service to get the appropriate variable
     * The method manage the trace, response and outcome variable
     *
     * @param array $variables
     * @return array
     * @throws common_exception_NotImplemented If variable type is not managed
     */
    protected function convertCatVariables(array $variables)
    {
        /** @var QtiRunnerService $runnerService */
        $runnerService = $this->getServiceLocator()->get(QtiRunnerService::SERVICE_ID);
        $convertedVariables = [];

        foreach ($variables as $variable) {
            switch ($variable->getVariableType()) {
                case ResultVariable::TRACE_VARIABLE:
                    $getVariableMethod = 'getTraceVariable';
                    break;
                case ResultVariable::RESPONSE_VARIABLE:
                    $getVariableMethod = 'getResponseVariable';
                    break;
                case ResultVariable::OUTCOME_VARIABLE:
                    $getVariableMethod = 'getOutcomeVariable';
                    break;
                case ResultVariable::TEMPLATE_VARIABLE:
                default:
                    $getVariableMethod = null;
                    break;
            }

            if (is_null($getVariableMethod)) {
                common_Logger::w(
                    'Variable of type ' . $variable->getVariableType() . ' is not implemented in ' . __METHOD__
                );
                throw new common_exception_NotImplemented();
            }

            $convertedVariables[] = call_user_func_array(
                [$runnerService, $getVariableMethod],
                [$variable->getId(), $variable->getValue()]
            );
        }

        return $convertedVariables;
    }

    /**
     * Get item uri associated to the given $itemId.
     *
     * @return string The uri
     * @throws ServiceNotFoundException
     */
    protected function getItemUriFromRefId($itemId)
    {
        $ref = $this->getCatService()->getAssessmentItemRefByIdentifier(
            $this->getCompilationDirectory()['private'],
            $itemId
        );
        return explode('|', $ref->getHref())[0];
    }

    /**
     * Are we in a synchronization mode
     * @return bool
     */
    public function isSyncingMode()
    {
        return $this->syncingMode;
    }

    /**
     * Set/Unset the synchronization mode
     * @param bool $syncing
     */
    public function setSyncingMode($syncing)
    {
        $this->syncingMode = (bool) $syncing;
    }

    /**
     * @return User
     * @throws common_exception_Error
     */
    private function getTestTakerFromSessionOrRds()
    {
        try {
            $session = common_session_SessionManager::getSession();
        } catch (common_exception_Error $exception) {
            $session = null;
            common_Logger::w($exception->getMessage());
        }

        if ($session == null || $session->getUser() == null) {
            $testTaker = UserHelper::getUser($this->getUserUri());
        } else {
            $testTaker = $session->getUser();
        }

        return $testTaker;
    }

    /**
     * @throws ServiceNotFoundException
     */
    private function getSectionPauseService(): SectionPauseService
    {
        return $this->getServiceManager()->get(SectionPauseService::SERVICE_ID);
    }

    /**
     * @throws ServiceNotFoundException
     */
    private function getCatService(): CatService
    {
        return $this->getServiceManager()->get(CatService::SERVICE_ID);
    }
}
