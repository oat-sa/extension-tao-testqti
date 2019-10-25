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
 * CSS Selectors for setup cleaning
 */
export default {
    testsPage: {
        testDeleteButton: '#test-delete',
        rootTestClass: 'li[data-uri="http://www.tao.lu/Ontologies/TAOTest.rdf#Test"]'
    },
    deliveriesPage: {
        rootDeliveryClass: 'li[data-uri="http://www.tao.lu/Ontologies/TAODelivery.rdf#AssembledDelivery"]',
        deliveryDeleteButton: '#delivery-delete'
    },
    itemsPage: {
        rootItemClass: 'li[data-uri="http://www.tao.lu/Ontologies/TAOItem.rdf#Item"]',
        itemDeleteButton: '#item-class-delete'
    },
    common: {
        confirmationModalOk: '.preview-modal-feedback button[data-control="ok"]'
    }
};
