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
 * Add extra routes
 */
Cypress.Commands.add('addRoutes', () => {

    // Register routes for test actions
    cy.route('POST', '**/editTest').as('editTest');
    cy.route('POST', '/taoTests/TestImport/index').as('testImportIndex');
    cy.route('GET', '/tao/TaskQueueWebApi/**').as('taskQueueWebApi');

    // Register routes for delivery actions
    cy.route('POST', '**/editDelivery').as('editDelivery');

    // Register routes for common actions
    cy.route('POST', '**/editClassLabel').as('editClassLabel');
    cy.route('POST', '**/delete').as('delete');
    cy.route('POST', '**/deleteClass').as('deleteClass');
    cy.route('POST', '/tao/GenerisTree/getData').as('getData');

    // Register test runner routes
    cy.route('POST', /\/taoQtiTest\/Runner\/init\?\S+/).as('testRunnerInit');
    cy.route('GET', /\/taoQtiTest\/Runner\/getItem\?\S+/).as('testRunnerGetItem');

});
