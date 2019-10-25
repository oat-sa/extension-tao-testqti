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

import backOfficeUrls from '../urls/backOfficeUrls';
import cleanupSelectors from '../selectors/cleanupSelectors';

/**
 * Cleanup Commands
 */
Cypress.Commands.add('deleteItem', (itemName) => {

    // Visit Tests page
    cy.visit(backOfficeUrls.itemsPageUrl);

    // Wait until page gets loaded and root class gets selected
    cy.wait('@editClassLabel');

    // Select e2e example test subclass
    cy.get(cleanupSelectors.itemsPage.rootItemClass).contains(itemName).click();

    // Delete test
    cy.get(cleanupSelectors.itemsPage.itemDeleteButton).click();

    // Confirm deletion
    cy.get(cleanupSelectors.common.confirmationModalOk).click();

    // Wait until deletion finishes
    cy.wait(['@deleteClass', '@editClassLabel']);
});

Cypress.Commands.add('deleteTest', (testName) => {

    // Visit Tests page
    cy.visit(backOfficeUrls.testsPageUrl);

    // Wait until page gets loaded and root class gets selected
    cy.wait('@editClassLabel');

    // Select e2e example test subcalss
    cy.get(cleanupSelectors.testsPage.rootTestClass).contains(testName).click();

    // Delete test
    cy.get(cleanupSelectors.testsPage.testDeleteButton).click();

    // Confirm deletion
    cy.get(cleanupSelectors.common.confirmationModalOk).click();

    // Wait until deletion finishes
    cy.wait('@delete');
});

Cypress.Commands.add('deleteDelivery', (deliveryName) => {

    // Go to Deliveries page
    cy.visit(backOfficeUrls.deliveriesPageUrl);

    // Wait until page gets loaded and root class gets selected
    cy.wait('@editClassLabel');

    // Select example delivery
    cy.get(cleanupSelectors.deliveriesPage.rootDeliveryClass).contains(deliveryName).click();

    // Delete delivery
    cy.get(cleanupSelectors.deliveriesPage.deliveryDeleteButton).click();

    // Confirm deletion
    cy.get(cleanupSelectors.common.confirmationModalOk).click();

    // Wait until deletion finishes
    cy.wait('@delete');
});
