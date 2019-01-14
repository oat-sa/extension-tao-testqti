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

namespace oat\taoQtiTest\models\runner\synchronisation\action;

use common_exception_Unauthorized;
use common_Logger;
use oat\taoQtiTest\models\runner\synchronisation\TestRunnerAction;
use stdClass;

/**
 * @package oat\taoQtiTest\models\runner\synchronisation\action
 */
class NextItemData extends TestRunnerAction
{
    /**
     * Get item data by identifier
     *
     * Validate required fields.
     * Get item data by given identifier
     *
     * @return array
     * @throws
     */
    public function process()
    {
        $this->validate();

        $itemIdentifier = $this->hasRequestParameter('itemDefinition')
            ? $this->getRequestParameter('itemDefinition')
            : null;

        if (!is_array($itemIdentifier)) {
            $itemIdentifier = [$itemIdentifier];
        }

        try {
            if (!$this->getRunnerService()->getTestConfig()->getConfigValue('itemCaching.enabled')) {
                common_Logger::w('Attempt to disclose the next items without the configuration');
                throw new common_exception_Unauthorized();
            }

            $response = [];
            foreach ($itemIdentifier as $itemId) {
                //load item data
                $response['items'][] = $this->getItemData($itemId);
            }

            if (isset($response['items'])) {
                $response['success'] = true;
            }
        } catch (\Exception $e) {
            $response = $this->getErrorResponse($e);
        }

        return $response;
    }

    /**
     * Create the item definition response for a given item
     * @param string $itemIdentifier the item id
     * @return array the item data
     * @throws
     */
    protected function getItemData($itemIdentifier)
    {
        $serviceContext = $this->getServiceContext();
        $itemRef = $this->getRunnerService()->getItemHref($serviceContext, $itemIdentifier);
        $itemData = $this->getRunnerService()->getItemData($serviceContext, $itemRef);
        $baseUrl = $this->getRunnerService()->getItemPublicUrl($serviceContext, $itemRef);

        $itemState = $this->getRunnerService()->getItemState($serviceContext, $itemIdentifier);
        if ($itemState === null || !count($itemState)) {
            $itemState = new stdClass();
        }

        return [
            'baseUrl' => $baseUrl,
            'itemData' => $itemData,
            'itemState' => $itemState,
            'itemIdentifier' => $itemIdentifier,
        ];
    }

    /**
     * `itemDefinition` field is required.
     *
     * @return array
     */
    protected function getRequiredFields()
    {
        return array_merge(parent::getRequiredFields(), ['itemDefinition']);
    }
}
