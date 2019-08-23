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

import runnerUrls from '../_urls/runnerUrls';
import cleanupSelectors from './cleanupSelectors';

/**
 * Cleanup Commands
 */

Cypress.Commands.add('deleteImportedItem', () => {
    
    // Visit Tests page
    cy.visit(runnerUrls.itemsPageUrl);

    // Wait until page gets loaded and root class gets selected
    cy.wait('@editClassLabel');

    // Select e2e example test subclass
    cy.get(cleanupSelectors.itemsPage.rootItemClass).contains('e2e example test').click();

    // Delete test
    cy.get(cleanupSelectors.itemsPage.itemDeleteButton).click();  

    // Confirm deletion
    cy.get(cleanupSelectors.common.confirmationModalOk).click();

    // Wait until deletion finishes
    cy.wait(['@deleteClass', '@editClassLabel']);
});

Cypress.Commands.add('deleteImportedTest', () => {
    
    // Visit Tests page
    cy.visit(runnerUrls.testsPageUrl);

    // Wait until page gets loaded and root class gets selected
    cy.wait('@editClassLabel');

    // Select e2e example test subcalss
    cy.get(cleanupSelectors.testsPage.rootTestClass).contains('e2e example test').click();

    // Delete test
    cy.get(cleanupSelectors.testsPage.testDeleteButton).click();

    // Wait until getdata finishes
    cy.wait('@getData');

    // Confirm deletion
    cy.get(cleanupSelectors.common.confirmationModalOk).click();

    // Wait until deletion finishes
    cy.wait('@delete');
});

Cypress.Commands.add('deleteDelivery', () => {
    
    // Go to Deliveries page
    cy.visit(runnerUrls.deliveriesPageUrl);
    
    // Wait until page gets loaded and root class gets selected
    cy.wait('@editClassLabel');

    // Select example delivery
    cy.get(cleanupSelectors.deliveriesPage.rootDeliveryClass).contains('Delivery of e2e example test').click();

    // Delete delivery
    cy.get(cleanupSelectors.deliveriesPage.deliveryDeleteButton).click();  

    // Confirm deletion
    cy.get(cleanupSelectors.common.confirmationModalOk).click();

    // Wait until deletion finishes
    cy.wait('@delete');
});