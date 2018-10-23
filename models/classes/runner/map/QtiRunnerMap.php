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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */

namespace oat\taoQtiTest\models\runner\map;

use oat\oatbox\service\ConfigurableService;
use oat\taoQtiTest\models\ExtendedStateService;
use oat\taoQtiTest\models\cat\CatService;
use oat\taoQtiTest\models\runner\QtiRunnerServiceContext;
use oat\taoQtiTest\models\runner\RunnerServiceContext;
use oat\taoQtiTest\models\runner\config\RunnerConfig;
use oat\taoQtiTest\models\runner\session\TestSession;
use oat\taoQtiTest\models\runner\time\QtiTimeConstraint;
use qtism\data\NavigationMode;
use qtism\data\QtiComponent;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\tests\RouteItem;
use taoQtiTest_helpers_TestRunnerUtils as TestRunnerUtils;
use oat\taoQtiTest\models\cat\CatUtils;

/**
 * Class QtiRunnerMap
 * @package oat\taoQtiTest\models\runner\map
 */
class QtiRunnerMap extends ConfigurableService implements RunnerMap
{
    const SERVICE_ID = 'taoQtiTest/QtiRunnerMap';

    /**
     * Fallback index in case of the delivery was compiled without the index of item href
     * @var array
     */
    protected $itemHrefIndex;

    /**
     * Gets the file that contains the href for the AssessmentItemRef Identifier
     * @param QtiRunnerServiceContext $context
     * @param string $itemIdentifier
     * @return \oat\oatbox\filesystem\File
     */
    protected function getItemHrefIndexFile(QtiRunnerServiceContext $context, $itemIdentifier)
    {
        $compilationDirectory = $context->getCompilationDirectory()['private'];
        return $compilationDirectory->getFile(\taoQtiTest_models_classes_QtiTestCompiler::buildHrefIndexPath($itemIdentifier));
    }

    /**
     * Checks if the AssessmentItemRef Identifier is in the index.
     *
     * @param QtiRunnerServiceContext $context
     * @param string $itemIdentifier
     * @return boolean
     */
    protected function hasItemHrefIndexFile(QtiRunnerServiceContext $context, $itemIdentifier)
    {
        // In case the context is adaptive, it means that the delivery was compiled in a version
        // we are 100% sure it produced Item Href Index Files.
        if ($context->isAdaptive()) {
            return true;
        } else {
            $indexFile = $this->getItemHrefIndexFile($context, $itemIdentifier);
            return $indexFile->exists();
        }
    }

    /**
     * Gets AssessmentItemRef's Href by AssessmentItemRef Identifier.
     *
     * Returns the AssessmentItemRef href attribute value from a given $identifier.
     *
     * @param QtiRunnerServiceContext $context
     * @param string $itemIdentifier
     * @return boolean|string The href value corresponding to the given $identifier. If no corresponding href is found, false is returned.
     */
    public function getItemHref(QtiRunnerServiceContext $context, $itemIdentifier)
    {
        $href = false;

        $indexFile = $this->getItemHrefIndexFile($context, $itemIdentifier);

        if ($indexFile->exists()) {
            $href = $indexFile->read();
        } else {
            if (!isset($this->itemHrefIndex)) {
                $storage = $this->getServiceLocator()->get(ExtendedStateService::SERVICE_ID);
                $this->itemHrefIndex = $storage->loadItemHrefIndex($context->getTestExecutionUri());
            }

            if (isset($this->itemHrefIndex[$itemIdentifier])) {
                $href = $this->itemHrefIndex[$itemIdentifier];
            }
        }

        return $href;
    }

    /**
     * Builds the map of an assessment test
     * @param RunnerServiceContext $context The test context
     * @param RunnerConfig $config The runner config
     * @return mixed
     * @throws \common_exception_InvalidArgumentType
     */
    public function getMap(RunnerServiceContext $context, RunnerConfig $config)
    {
        return $this->getScopedMap($context, $config, RunnerMap::SCOPE_TEST);
    }

    /**
     * Get the testMap for the current context but limited to the given scope
     * @param RunnerServiceContext $context The test context
     * @param RunnerConfig $config The runner config
     * @param string $scope the target scope, section by default
     * @return mixed
     * @throws \common_exception_InvalidArgumentType
     */
    public function getScopedMap(RunnerServiceContext $context, RunnerConfig $config, $scope = RunnerMap::SCOPE_SECTION)
    {
        if (!($context instanceof QtiRunnerServiceContext)) {
            throw new \common_exception_InvalidArgumentType(
                'QtiRunnerMap',
                'getMap',
                0,
                'oat\taoQtiTest\models\runner\QtiRunnerServiceContext',
                $context
            );
        }

        $map = [
            'scope' => $scope,
            'parts' => []
        ];

        // get config for the sequence number option
        $reviewConfig = $config->getConfigValue('review');
        $checkInformational = $config->getConfigValue('checkInformational');
        $forceTitles = !empty($reviewConfig['forceTitle']);
        $forceInformationalTitles = !empty($reviewConfig['forceInformationalTitle']);
        $useTitle = !empty($reviewConfig['useTitle']);
        $uniqueTitle = isset($reviewConfig['itemTitle']) ? $reviewConfig['itemTitle'] : '%d';
        $uniqueInformationalTitle = isset($reviewConfig['informationalItemTitle']) ? $reviewConfig['informationalItemTitle'] : 'Instructions';
        $displaySubsectionTitle = isset($reviewConfig['displaySubsectionTitle']) ? (bool) $reviewConfig['displaySubsectionTitle'] : true;

        /* @var AssessmentTestSession $session */
        $session = $context->getTestSession();
        $extendedStorage = $this->getServiceLocator()->get(ExtendedStateService::SERVICE_ID);
        if ($session->isRunning() !== false) {
            $route         = $session->getRoute();
            $store         = $session->getAssessmentItemSessionStore();

            switch($scope){
                case RunnerMap::SCOPE_SECTION :
                    $routeItems = $route->getRouteItemsByAssessmentSection($session->getCurrentAssessmentSection());
                    break;
                case RunnerMap::SCOPE_PART :
                    $routeItems = $route->getRouteItemsByTestPart($session->getCurrentTestPart());
                    break;
                case RunnerMap::SCOPE_TEST:
                default:
                    $routeItems = $route->getAllRouteItems();
                    break;
            }

            $offset = $this->getOffsetPosition($context, $routeItems[0]);
            $offsetSection = 0;
            $lastSection   = null;

            // fallback index in case of the delivery was compiled without the index of item href
            $this->itemHrefIndex = [];
            $shouldBuildItemHrefIndex = !$this->hasItemHrefIndexFile($context, $session->getCurrentAssessmentItemRef()->getIdentifier());
            \common_Logger::t('Store index ' . ($shouldBuildItemHrefIndex ? 'must be built' : 'is part of the package'));

            /** @var \qtism\runtime\tests\RouteItem $routeItem */
            foreach ($routeItems as $routeItem) {

                $catSession = false;
                $itemRefs = $this->getRouteItemAssessmentItemRefs($context, $routeItem, $catSession);
                $previouslySeenItems = ($catSession) ? $context->getPreviouslySeenCatItemIds($routeItem) : [];

                foreach ($itemRefs as $itemRef) {
                    $occurrence = ($catSession !== false) ? 0 : $routeItem->getOccurence();

                    // get the jump definition
                    $itemSession = ($catSession !== false) ? false : $store->getAssessmentItemSession($itemRef, $occurrence);

                    // load item infos
                    $isItemInformational = ($itemSession) ? TestRunnerUtils::isItemInformational($routeItem, $itemSession) : false;
                    $testPart = $routeItem->getTestPart();
                    $partId = $testPart->getIdentifier();
                    $navigationMode = $testPart->getNavigationMode();

                    if ($displaySubsectionTitle) {
                        $section = $routeItem->getAssessmentSection();
                    } else {
                        $sections = $routeItem->getAssessmentSections()->getArrayCopy();
                        $section = $sections[0];
                    }
                    $sectionId = $section->getIdentifier();
                    $itemId = $itemRef->getIdentifier();

                    if ($lastSection != $sectionId) {
                        $offsetSection = 0;
                        $lastSection = $sectionId;
                    }

                    if ($forceInformationalTitles && $isItemInformational) {
                        $itemUri = strstr($itemRef->getHref(), '|', true);
                        $label = $uniqueInformationalTitle === false
                            ? $this->getItemLabel($context, $itemUri, $useTitle)
                            : $uniqueInformationalTitle;

                    } elseif ($forceTitles) {
                        $label = __($uniqueTitle, $offsetSection + 1);

                    } else {
                        $itemUri = strstr($itemRef->getHref(), '|', true);
                        $label = $this->getItemLabel($context, $itemUri, $useTitle);
                    }

                    // fallback in case of the delivery was compiled without the index of item href
                    if ($shouldBuildItemHrefIndex) {
                        $this->itemHrefIndex[$itemId] = $itemRef->getHref();
                    }

                    $itemInfos = [
                        'id' => $itemId,
                        'label' => $label,
                        'position' => $offset,
                        'occurrence' => $occurrence,
                        'remainingAttempts' => ($itemSession) ? $itemSession->getRemainingAttempts() : -1,
                        'answered' => ($itemSession) ? TestRunnerUtils::isItemCompleted($routeItem, $itemSession) : in_array($itemId, $previouslySeenItems),
                        'flagged' => $extendedStorage->getItemFlag($session->getSessionId(), $itemId),
                        'viewed' => ($itemSession) ? $itemSession->isPresented() : in_array($itemId, $previouslySeenItems),
                        'categories' => $itemRef->getCategories()->getArrayCopy()
                    ];

                    if ($checkInformational) {
                        $itemInfos['informational'] = $isItemInformational;
                    }

                    if($itemRef->hasTimeLimits()){
                        $itemInfos['timeConstraint'] = $this->getTimeConstraint($session, $itemRef, $navigationMode);
                    }

                    if (!isset($map['parts'][$partId]) && $scope != RunnerMap::SCOPE_SECTION) {
                        $map['parts'][$partId]['id'] = $partId;
                        $map['parts'][$partId]['label'] = $partId;
                        $map['parts'][$partId]['position'] = $offset;
                        $map['parts'][$partId]['isLinear'] = $navigationMode == NavigationMode::LINEAR;

                        if($testPart->hasTimeLimits()){
                            $map['parts'][$partId]['timeConstraint'] =  $this->getTimeConstraint($session, $testPart, $navigationMode);
                        }
                    }

                    if (!isset($map['parts'][$partId]['sections'][$sectionId])) {
                        $map['parts'][$partId]['sections'][$sectionId]['id'] = $sectionId;
                        $map['parts'][$partId]['sections'][$sectionId]['label'] = $section->getTitle();
                        $map['parts'][$partId]['sections'][$sectionId]['isCatAdaptive'] = CatUtils::isAssessmentSectionAdaptive($section);
                        $map['parts'][$partId]['sections'][$sectionId]['position'] = $offset;

                        if($section->hasTimeLimits()){
                            $map['parts'][$partId]['sections'][$sectionId]['timeConstraint'] = $this->getTimeConstraint($session, $section, $navigationMode);
                        }
                    }

                    $map['parts'][$partId]['sections'][$sectionId]['items'][$itemId] = $itemInfos;

                    // update the stats
                    if($scope == RunnerMap::SCOPE_TEST) {
                        $this->updateStats($map, $itemInfos);
                        $this->updateStats($map['parts'][$partId], $itemInfos);
                        $this->updateStats($map['parts'][$partId]['sections'][$sectionId], $itemInfos);
                    }
                    if($scope == RunnerMap::SCOPE_PART) {
                        $this->updateStats($map['parts'][$partId], $itemInfos);
                        $this->updateStats($map['parts'][$partId]['sections'][$sectionId], $itemInfos);
                    }
                    if($scope == RunnerMap::SCOPE_SECTION) {
                        $this->updateStats($map['parts'][$partId]['sections'][$sectionId], $itemInfos);
                    }

                    $offset ++;
                    if (!$forceInformationalTitles || ($forceInformationalTitles && !$isItemInformational)) {
                        $offsetSection++;
                    };
                }
            }
            // fallback in case of the delivery was compiled without the index of item href
            if ($shouldBuildItemHrefIndex) {
                \common_Logger::t('Store index of item href into the test state storage');
                $storage = $this->getServiceLocator()->get(ExtendedStateService::SERVICE_ID);
                $storage->storeItemHrefIndex($context->getTestExecutionUri(), $this->itemHrefIndex);
            }
        }

        return $map;
    }

    /**
     * Update the stats inside the target
     * @param array $target
     * @param array $itemInfos
     */
    protected function updateStats(&$target, $itemInfos)
    {
        if (!isset($target['stats'])) {
            $target['stats'] = [
                'questions' => 0,
                'answered' => 0,
                'flagged' => 0,
                'viewed' => 0,
                'total' => 0,
                'questionsViewed' => 0,
            ];
        }

        if (empty($itemInfos['informational'])) {
            $target['stats']['questions'] ++;

            if (!empty($itemInfos['answered'])) {
                $target['stats']['answered'] ++;
            }

            if (!empty($itemInfos['viewed'])) {
                $target['stats']['questionsViewed'] ++;
            }
        }

        if (!empty($itemInfos['flagged'])) {
            $target['stats']['flagged'] ++;
        }

        if (!empty($itemInfos['viewed'])) {
            $target['stats']['viewed'] ++;
        }

        $target['stats']['total'] ++;
    }

    /**
     * Get AssessmentItemRef objects.
     *
     * Get the AssessmentItemRef objects bound to a RouteItem object. In most of cases, an array of a single
     * AssessmentItemRef object will be returned. But in case of the given $routeItem is a CAT Adaptive Placeholder,
     * multiple AssessmentItemRef objects might be returned.
     *
     * @param RunnerServiceContext $context
     * @param RouteItem $routeItem
     * @param mixed $catSession A reference to a variable that will be fed with the CatSession object related to the $routeItem. In case the $routeItem is not bound to a CatSession object, $catSession will be set with false.
     * @return array An array of AssessmentItemRef objects.
     */
    protected function getRouteItemAssessmentItemRefs(RunnerServiceContext $context, RouteItem $routeItem, &$catSession)
    {
        /* @var CatService */
        $catService = $this->getServiceManager()->get(CatService::SERVICE_ID);
        $compilationDirectory = $context->getCompilationDirectory()['private'];
        $itemRefs = [];
        $catSession = false;

        if ($context->isAdaptive($routeItem->getAssessmentItemRef())) {
            $catSession = $context->getCatSession($routeItem);

            $itemRefs = $catService->getAssessmentItemRefByIdentifiers(
                $compilationDirectory,
                $context->getShadowTest($routeItem)
            );
        } else {
            $itemRefs[] = $routeItem->getAssessmentItemRef();
        }

        return $itemRefs;
    }

     /**
      * Get the relative position of the given RouteItem within the test.
      * The position takes into account adaptive sections (and count items instead of placeholders).
      *
      * @param RunnerServiceContext $context
      * @param RouteItem $routeItem
      * @return int the offset position
      */
     protected function getOffsetPosition(RunnerServiceContext $context, RouteItem $currentRouteItem)
     {
        $session = $context->getTestSession();
        $route = $session->getRoute();
        $routeCount = $route->count();

        $finalPosition = 0;

        for ($i = 0; $i < $routeCount; $i++) {
            $routeItem = $route->getRouteItemAt($i);

            if ($routeItem !== $currentRouteItem) {
                if (!$context->isAdaptive($routeItem->getAssessmentItemRef())) {
                    $finalPosition++;
                } else {
                    $finalPosition += count($context->getShadowTest($routeItem));
                }
            } else {
                break;
            }
        }

        return $finalPosition;
    }

    /**
     * Get the time constraint for the given component
     * @param TestSession  $session the running test session
     * @param QtiComponent $source the component with the time limits (testPart, section, itemRef)
     * @param int          $navigationMode the testPart navigation mode
     * @return QtiTimeConstraint the constraint
     */
    private function getTimeConstraint(TestSession $session, QtiComponent $source, $navigationMode)
    {
        $constraint = new QtiTimeConstraint(
            $source,
            $session->getTimerDuration($source->getIdentifier()),
            $navigationMode,
            true,
            true,
            $session->getTimerTarget()
        );
        $constraint->setTimer($session->getTimer());
        return $constraint;
    }

     /**
      * Get the label of a Map item
      *
      * @param RunnerServiceContext $context
      * @param string $itemUri
      * @param int $useTitle
      * @return string the title
      */
    private function getItemLabel(RunnerServiceContext $context, $itemUri, $useTitle = false)
    {
        $label = '';

        if ($useTitle) {
            $label = $context->getItemIndexValue($itemUri, 'title');
        }

        if (!$label) {
            $label = $context->getItemIndexValue($itemUri, 'label');
        }

        if (!$label) {
            $item = new \core_kernel_classes_Resource($itemUri);
            $label = $item->getLabel();
        }
        return $label;
    }
}
