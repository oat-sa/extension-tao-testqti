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

namespace oat\taoQtiTest\models\runner\offline\action;

use oat\oatbox\event\EventManager;
use oat\taoQtiTest\models\event\TraceVariableStored;
use oat\taoQtiTest\models\runner\offline\TestRunnerAction;

/**
 * Class StoreTraceData
 *
 * @package oat\taoQtiTest\models\runner\offline\action
 */
class StoreTraceData extends TestRunnerAction
{
    /**
     * traceData field is required.
     *
     * @return array
     */
    public function getRequiredFields()
    {
        return array_merge(parent::getRequiredFields(), ['traceData']);
    }

    /**
     * Process the storeTraceData action.
     *
     * Validate required fields.
     * Store trace data through runner service.
     * Trigger TraceVariableStored event.
     *
     * @return array
     */
    public function process()
    {
        $this->validate();

        $itemRef = ($this->hasRequestParameter('itemDefinition'))
            ? $this->getItemRef($this->getRequestParameter('itemDefinition'))
            : null;

        $traceData = json_decode(html_entity_decode($this->getRequestParameter('traceData')), true);

        try {
            $serviceContext = $this->getServiceContext(false);
            $stored = 0;
            $size   = count($traceData);

            foreach ($traceData  as $variableIdentifier => $variableValue){
                if ($this->getRunnerService()->storeTraceVariable(
                        $serviceContext,
                        $itemRef,
                        $variableIdentifier,
                        $variableValue,
                        $this->getTimestamp()
                    )
                ) {
                    $stored++;
                }
            }

            $response = [
                'success' => $stored == $size
            ];

            \common_Logger::d('Stored "' . $stored . '/' . $size . '" trace variables');
            /** @var EventManager $eventManager */
            $eventManager = $this->getServiceLocator()->get(EventManager::SERVICE_ID);
            $event = new TraceVariableStored($serviceContext->getTestSession()->getSessionId(), $traceData);
            $eventManager->trigger($event);

        } catch (\Exception $e) {
            $response = $this->getErrorResponse($e);
        }

        return $response;
    }

}