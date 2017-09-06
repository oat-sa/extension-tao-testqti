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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiTest\scripts\install;

use common_report_Report as Report;
use oat\oatbox\extension\AbstractAction;
use oat\taoQtiTest\models\creator\CreatorItems;
use oat\taoQtiTest\models\creator\ListItemLookup;
use oat\taoQtiTest\models\creator\TreeItemLookup;

/**
 * Registers the Test Creators services
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
class RegisterCreatorServices extends AbstractAction
{
    public function __invoke($params)
    {
        $this->getServiceManager()->register(
            CreatorItems::SERVICE_ID,
            new CreatorItems([
                CreatorItems::ITEM_MODEL_SEARCH_OPTION => CreatorItems::ITEM_MODEL_QTI_URI,
                CreatorItems::ITEM_CONTENT_SEARCH_OPTION => '*'
            ])
        );
        $this->getServiceManager()->register(ListItemLookup::SERVICE_ID, new ListItemLookup());
        $this->getServiceManager()->register(TreeItemLookup::SERVICE_ID, new TreeItemLookup());
        return new Report(Report::TYPE_SUCCESS, 'Creator services resgistered');
    }
}
