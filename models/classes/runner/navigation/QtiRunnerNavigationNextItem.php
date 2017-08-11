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

namespace oat\taoQtiTest\models\runner\navigation;

use oat\taoQtiTest\models\runner\RunnerServiceContext;

/**
 * Class QtiRunnerNextItem
 * @package oat\taoQtiTest\models\runner\navigation
 */
class QtiRunnerNavigationNextItem implements RunnerNavigation
{
    /**
     * Do the move
     * @param RunnerServiceContext $context
     * @param mixed $ref
     * @return boolean
     * @throws \common_Exception
     */
    public function move(RunnerServiceContext $context, $ref)
    {
        /* @var AssessmentTestSession $session */
        $session = $context->getTestSession();
        $nextPosition = $session->getRoute()->getPosition() + 1;
        QtiRunnerNavigation::checkTimedSectionExit($context, $nextPosition);
        
        if ($context->isAdaptive()) {
            if ($context->selectAdaptiveNextItem() === null) {
                $session->moveNext();
            }
        } else {
            $session->moveNext();
            
            // In case of we are now in an adaptive context, let's initialize the CAT session
            // and ask for a new item dynamically.
            if ($context->isAdaptive()) {
                $context->initCatSession();
                $context->selectAdaptiveNextItem();
            }
        }
        
        return true;
    }
}
