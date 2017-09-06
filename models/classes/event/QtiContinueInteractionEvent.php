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

use oat\taoQtiTest\models\runner\RunnerService;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\tests\RouteItem;
use oat\oatbox\event\Event;

/**
 *
 */
class QtiContinueInteractionEvent implements Event
{
    private $context;

    private $runnerService;

    /**
     * @return string
     */
    public function getName()
    {
        return __CLASS__;
    }

    /**
     * QtiMoveEvent constructor.
     * @param string $context
     * @param RunnerService $runnerService
     */
    public function __construct($context, $runnerService)
    {
        $this->context = $context;
        $this->runnerService = $runnerService;
    }

    /**
     * @return string
     */
    public function getContext()
    {
        return $this->context;
    }

    public function getRunnerService()
    {
        return $this->runnerService;
    }


}