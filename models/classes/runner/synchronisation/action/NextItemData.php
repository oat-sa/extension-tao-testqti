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

use oat\taoQtiTest\model\Service\ListItemsQuery;
use oat\taoQtiTest\model\Service\ListItemsService;
use oat\taoQtiTest\models\runner\synchronisation\TestRunnerAction;

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
     */
    public function process()
    {
        $this->validate();

        $itemIdentifiers = $this->hasRequestParameter('itemDefinition')
            ? $this->getRequestParameter('itemDefinition')
            : null;

        if (!is_array($itemIdentifiers)) {
            $itemIdentifiers = [$itemIdentifiers];
        }

        try {
            $query = new ListItemsQuery(
                $this->getServiceContext(),
                $itemIdentifiers
            );

            /** @var ListItemsService $listItems */
            $listItems = $this->getPsrContainer()->get(ListItemsService::class);

            $response = $listItems($query);

            return $response->toArray();
        } catch (\Exception $e) {
            return $this->getErrorResponse($e);
        }
    }

    protected function getRequiredFields(): array
    {
        return array_merge(parent::getRequiredFields(), ['itemDefinition']);
    }
}
