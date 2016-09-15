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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 */

namespace oat\taoQtiTest\models\event;

use oat\taoTests\models\event\TestChangedEvent;
use Zend\ServiceManager\ServiceLocatorAwareTrait;
use oat\taoQtiTest\models\SessionStateService;
use Zend\ServiceManager\ServiceLocatorAwareInterface;
use oat\taoQtiTest\helpers\TestSessionMemento;

/**
 *
 */
class QtiTestChangeEvent extends TestChangedEvent implements ServiceLocatorAwareInterface
{
    use ServiceLocatorAwareTrait;

    /**
     * @var \taoQtiTest_helpers_TestSession
     */
    protected $session;

    /**
     * Object represents test session state before event
     *
     * @var TestSessionMemento
     */
    protected $sessionMemento;

    /**
     * QtiTestChangeEvent constructor.
     * @param \taoQtiTest_helpers_TestSession $testSession
     * @param $sessionMemento TestSessionMemento
     */
    public function __construct(\taoQtiTest_helpers_TestSession $testSession, TestSessionMemento $sessionMemento)
    {
        $this->sessionMemento = $sessionMemento;
        $this->session = $testSession;
    }

    /**
     * @return \taoQtiTest_helpers_TestSession
     */
    public function getSession()
    {
        return $this->session;
    }

    /**
     * @return string
     */
    public function getServiceCallId()
    {
        return $this->session->getSessionId();
    }

    public function getNewStateDescription()
    {
        $sessionService = $this->getServiceLocator()->get(SessionStateService::SERVICE_ID);
        return $sessionService->getSessionDescription($this->session);
    }

    /**
     * @return TestSessionMemento
     */
    public function getSessionMemento()
    {
        return $this->sessionMemento;
    }
}