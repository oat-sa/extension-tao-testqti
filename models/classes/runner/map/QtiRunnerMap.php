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

use oat\taoQtiTest\models\runner\RunnerServiceContext;
use qtism\data\NavigationMode;
use qtism\runtime\tests\AssessmentItemSession;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\tests\RouteItem;

/**
 * Class QtiRunnerMap
 * @package oat\taoQtiTest\models\runner\map
 */
class QtiRunnerMap implements RunnerMap
{
    /**
     * Builds the map of an assessment test
     * @param RunnerServiceContext $context
     * @return mixed
     */
    public function getMap(RunnerServiceContext $context)
    {
        $map = [
            'parts' => [],
            'jumps' => []
        ];
        
        /* @var AssessmentTestSession $session */
        $session = $context->getTestSession();

        if ($session->isRunning() !== false) {
            $route = $session->getRoute();
            $routeItems = $route->getAllRouteItems();
            $offset = $route->getRouteItemPosition($routeItems[0]);
            $offsetPart = 0;
            $offsetSection = 0;
            $lastPart = null;
            $lastSection = null;
            foreach ($routeItems as $routeItem) {
                // access the item reference
                $itemRef = $routeItem->getAssessmentItemRef();
                $occurrence = $routeItem->getOccurence();

                // get the jump definition
                $store = $session->getAssessmentItemSessionStore();
                $itemSession = $store->getAssessmentItemSession($itemRef, $occurrence);

                // load item infos
                $partId = $routeItem->getTestPart()->getIdentifier();
                $sections = $routeItem->getAssessmentSections();
                $sectionId = key(current($sections));
                $section = $sections[$sectionId];
                $itemId = $itemRef->getIdentifier();
                $itemUri = strstr($itemRef->getHref(), '|', true);
                $item = new \core_kernel_classes_Resource($itemUri);
                if ($lastPart != $partId) {
                    $offsetPart = 0;
                    $lastPart = $partId;
                }
                if ($lastSection != $sectionId) {
                    $offsetSection = 0;
                    $lastSection = $sectionId;
                }
                
                $itemInfos = [
                    'uri' => $itemUri,
                    'title' => $item->getLabel(),
                    'position' => $offset,
                    'positionInPart' => $offsetPart,
                    'positionInSection' => $offsetSection,
                    'occurrence' => $occurrence,
                    'remainingAttempts' => $itemSession->getRemainingAttempts(),
                    'answered' => $this->isItemCompleted($routeItem, $itemSession),
                    'viewed' => $itemSession->isPresented(),
                ];
                
                // update the map
                $map['jumps'][] = [
                    'identifier' => $itemId,
                    'section' => $sectionId,
                    'part' => $partId,
                    'position' => $offset,
                    'uri' => $itemUri,
                ];
                if (!isset($map['parts'][$partId])) {
                    $map['parts'][$partId]['title'] = $partId;
                    $map['parts'][$partId]['position'] = $offset;
                }
                if (!isset($map['parts'][$partId]['sections'][$sectionId])) {
                    $map['parts'][$partId]['sections'][$sectionId]['title'] = $section->getTitle();
                    $map['parts'][$partId]['sections'][$sectionId]['position'] = $offset;
                }
                $map['parts'][$partId]['sections'][$sectionId]['items'][$itemId] = $itemInfos;
                
                // update the stats
                $this->updateStats($map, $itemInfos);
                $this->updateStats($map['parts'][$partId], $itemInfos);
                $this->updateStats($map['parts'][$partId]['sections'][$sectionId], $itemInfos);
                
                $offset ++;
                $offsetPart ++;
                $offsetSection ++;
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
                'answered' => 0,
                'viewed' => 0,
            ];
        }
        
        if (!empty($itemInfos['answered'])) {
            $target['stats']['answered'] ++;
        }
        
        if (!empty($itemInfos['viewed'])) {
            $target['stats']['viewed'] ++;
        }
    }

    /**
     * Checks if an item has been completed
     * @param RouteItem $routeItem
     * @param AssessmentItemSession $itemSession
     * @return bool
     */
    protected function isItemCompleted(RouteItem $routeItem, AssessmentItemSession $itemSession) {
        $completed = false;
        if ($routeItem->getTestPart()->getNavigationMode() === NavigationMode::LINEAR) {
            // In linear mode, we consider the item completed if it was presented.
            if ($itemSession->isPresented() === true) {
                $completed = true;
            }
        }
        else {
            // In nonlinear mode we consider: 
            // - an adaptive item completed if it's completion status is 'completed'.
            // - a non-adaptive item to be completed if it is responded.
            $isAdaptive = $itemSession->getAssessmentItem()->isAdaptive();

            if ($isAdaptive === true && $itemSession['completionStatus']->getValue() === AssessmentItemSession::COMPLETION_STATUS_COMPLETED) {
                $completed = true;
            }
            else if ($isAdaptive === false && $itemSession->isResponded() === true) {
                $completed = true;
            }
        }

        return $completed;
    }
}
