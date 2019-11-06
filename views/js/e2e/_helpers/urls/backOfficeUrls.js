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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */

/**
 * Urls for back office
 */
export default {
    itemsPageUrl: 'tao/Main/index?structure=items&ext=taoItems&section=manage_items&uri=http%3A%2F%2Fwww.tao.lu%2FOntologies%2FTAOItem.rdf%23Item',
    testsPageUrl: 'tao/Main/index?structure=tests&ext=taoTests&section=manage_tests&uri=http%3A%2F%2Fwww.tao.lu%2FOntologies%2FTAOTest.rdf%23Test',
    deliveriesPageUrl: 'tao/Main/index?structure=delivery&ext=taoDeliveryRdf&section=manage_delivery_assembly&uri=http%3A%2F%2Fwww.tao.lu%2FOntologies%2FTAODelivery.rdf%23AssembledDelivery',
    taskQueueArchiveUrl: 'tao/TaskQueueWebApi/archive?taskId=all',
    taskQueueGetUrl: 'tao/TaskQueueWebApi/get'
};
