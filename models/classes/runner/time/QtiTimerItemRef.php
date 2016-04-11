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

namespace oat\taoQtiTest\models\runner\time;

use oat\taoQtiTest\models\runner\session\TestSession;
use oat\taoTests\models\runner\time\TimerItemRef;
use qtism\runtime\tests\RouteItem;

/**
 * Class QtiTimerItemRef
 * @package oat\taoQtiTest\models\runner\time
 */
class QtiTimerItemRef implements TimerItemRef
{
    /**
     * @var RouteItem
     */
    protected $routeItem;

    /**
     * @var TestSession
     */
    protected $testSession;

    /**
     * QtiTimerItemRef constructor.
     * @param TestSession $testSession
     * @param RouteItem $routeItem
     */
    public function __construct(TestSession $testSession, RouteItem $routeItem = null)
    {
        $this->setTestSession($testSession);
        $this->setRouteItem($routeItem);
    }

    /**
     * @return RouteItem
     */
    public function getRouteItem()
    {
        if (!$this->routeItem) {
            $testSession = $this->getTestSession();
            if ($testSession->isRunning() === true) {
                return $testSession->getRoute()->current();
            };
        }
        return $this->routeItem;
    }

    /**
     * @param RouteItem $routeItem
     * @return QtiTimerItemRef
     */
    public function setRouteItem($routeItem)
    {
        $this->routeItem = $routeItem;
        return $this;
    }

    /**
     * @return TestSession
     */
    public function getTestSession()
    {
        return $this->testSession;
    }

    /**
     * @param TestSession $testSession
     * @return QtiTimerItemRef
     */
    public function setTestSession($testSession)
    {
        $this->testSession = $testSession;
        return $this;
    }

    /**
     * Gets the tags describing a particular item with an assessment test
     * @return array
     */
    public function getItemTags()
    {
        $routeItem = $this->getRouteItem();
        $test = $routeItem->getAssessmentTest();
        $testPart = $routeItem->getTestPart();
        $sections = $routeItem->getAssessmentSections();
        $sectionId = key(current($sections));
        $itemRef = $routeItem->getAssessmentItemRef();
        $itemId = $itemRef->getIdentifier();
        $occurrence = $routeItem->getOccurence();

        $tags = [
            $itemId,
            $itemId . '#' . $occurrence,
            $sectionId,
            $testPart->getIdentifier(),
            $test->getIdentifier(),
            $itemRef->getHref(),
        ];

        $testSession = $this->getTestSession();
        if ($testSession && $testSession->isRunning() === true) {
            $itemSession = $testSession->getAssessmentItemSessionStore()->getAssessmentItemSession($itemRef, $occurrence);
            $tags[] = $itemId . '#' . $occurrence . '-' . $itemSession['numAttempts']->getValue();
        }

        return $tags;
    }
}