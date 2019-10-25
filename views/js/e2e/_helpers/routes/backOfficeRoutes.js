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
 * Add routes for back office
 */
Cypress.Commands.add('addBackOfficeRoutes', () => {

    // Register routes for test actions
    cy.route('POST', '**/editTest').as('editTest');
    cy.route('POST', 'taoTests/TestImport/index').as('testImportIndex');
    cy.route('POST', 'tao/File/upload').as('fileUpload');
    cy.route('GET', /tao\/TaskQueueWebApi\/get\?/).as('taskQueueWebApi');
    cy.route('GET', /tao\/TaskQueueWebApi\/getAll\?/).as('taskQueueWebApiGetAll');
    cy.route('POST', 'taoDeliveryRdf/Publish/publish').as('publishDeliveryRdf');
    cy.route('POST', 'taoDeliverConnect/PublishDelivery/submitFromTests').as('publishDeliverConnect');

    // Register routes for delivery actions
    cy.route('POST', '**/editDelivery').as('editDelivery');

    // Register routes for common actions
    cy.route('POST', '**/editClassLabel').as('editClassLabel');
    cy.route('POST', '**/delete').as('delete');
    cy.route('POST', '**/deleteClass').as('deleteClass');
    cy.route('POST', '/tao/GenerisTree/getData').as('getData');
});
