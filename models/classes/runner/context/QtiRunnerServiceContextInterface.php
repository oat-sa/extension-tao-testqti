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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA ;
 */

namespace oat\taoQtiTest\models\runner;

use common_Exception;
use common_exception_Error;
use common_exception_InvalidArgumentType;
use common_ext_ExtensionException;
use oat\libCat\CatEngine;
use oat\libCat\CatSection;
use oat\libCat\CatSession;
use oat\libCat\result\ItemResult;
use qtism\data\AssessmentTest;
use qtism\data\AssessmentItemRef;
use qtism\data\ExtendedAssessmentItemRef;
use qtism\runtime\storage\binary\AbstractQtiBinaryStorage;
use qtism\runtime\tests\RouteItem;
use tao_models_classes_service_StorageDirectory;
use taoQtiTest_helpers_SessionManager;

interface QtiRunnerServiceContextInterface
{
    public function init();

    /**
     * @param mixed $testSession
     *
     * @throws common_exception_InvalidArgumentType
     */
    public function setTestSession($testSession);

    /**
     * @return AbstractQtiBinaryStorage
     *
     * @throws common_exception_Error
     * @throws common_ext_ExtensionException
     */
    public function getStorage();

    /**
     * @return taoQtiTest_helpers_SessionManager
     *
     * @throws common_exception_Error
     * @throws common_ext_ExtensionException
     */
    public function getSessionManager();

    /**
     * @return AssessmentTest
     */
    public function getTestDefinition();

    /**
     * @return tao_models_classes_service_StorageDirectory[]
     */
    public function getCompilationDirectory();

    /**
     * @return array
     */
    public function getTestMeta();

    /**
     * @return string
     */
    public function getTestDefinitionUri();

    /**
     * @return string
     */
    public function getTestCompilationUri();

    /**
     * @return string
     */
    public function getTestExecutionUri();

    /**
     * @param string $id
     *
     * @return mixed
     *
     * @throws common_exception_Error
     */
    public function getItemIndex($id);

    /**
     * @return string
     *
     * @throws common_exception_Error
     */
    public function getUserUri();

    /**
     * @param string $userUri
     */
    public function setUserUri($userUri);

    /**
     * @param string $id
     * @param string $name
     *
     * @return mixed
     *
     * @throws common_exception_Error
     */
    public function getItemIndexValue($id, $name);

    /**
     * @return CatEngine
     */
    public function getCatEngine(RouteItem $routeItem = null);

    /**
     * @return mixed
     */
    public function getTestSession();

    /**
     * @param RouteItem|null $routeItem
     *
     * @return CatSession|false
     */
    public function getCatSession(RouteItem $routeItem = null);

    /**
     * @param string $catSession JSON encoded CAT Session data.
     *
     * @param RouteItem|null $routeItem
     *
     * @return mixed
     */
    public function persistCatSession($catSession, RouteItem $routeItem = null);

    /**
     * @param string $seenCatItemId
     */
    public function persistSeenCatItemIds($seenCatItemId);

    /**
     * @return ItemResult[]
     */
    public function getLastCatItemOutput();

    public function persistLastCatItemOutput(array $lastCatItemOutput);

    /**
     * @return CatSection|boolean
     */
    public function getCatSection(RouteItem $routeItem = null);

    /**
     * @param AssessmentItemRef $currentAssessmentItemRef
     * @return boolean
     */
    public function isAdaptive(AssessmentItemRef $currentAssessmentItemRef = null);

    /**
     * @return boolean
     */
    public function containsAdaptive();

    /**
     * @return mixed|null
     *
     * @throws common_Exception
     */
    public function selectAdaptiveNextItem();

    /**
     * @return ExtendedAssessmentItemRef
     */
    public function getCurrentAssessmentItemRef();

    /**
     * @param RouteItem|null $routeItem
     *
     * @return mixed
     */
    public function getPreviouslySeenCatItemIds(RouteItem $routeItem = null);

    /**
     * @param RouteItem|null $routeItem
     *
     * @return mixed
     */
    public function getShadowTest(RouteItem $routeItem = null);

    /**
     * @param RouteItem|null $routeItem
     *
     * @return mixed
     */
    public function getCurrentCatItemId(RouteItem $routeItem = null);

    /**
     * @param $catItemId
     *
     * @return mixed
     */
    public function persistCurrentCatItemId($catItemId);

    /**
     * @param $refId
     * @param string $catItemId
     *
     * @return mixed
     */
    public function getItemPositionInRoute($refId, &$catItemId = '');

    /**
     * @return integer A zero-based index.
     */
    public function getCurrentPosition();

    /**
     * @param $identifier
     *
     * @param RouteItem|null $routeItem
     *
     * @return mixed
     */
    public function getCatAttempts($identifier, RouteItem $routeItem = null);

    /**
     * @param $identifier
     *
     * @param $attempts
     *
     * @return mixed
     */
    public function persistCatAttempts($identifier, $attempts);

    /**
     * @return boolean
     */
    public function canMoveBackward();

    /**
     * @return bool
     */
    public function isSyncingMode();

    /**
     * @param bool $syncing
     */
    public function setSyncingMode($syncing);
}
