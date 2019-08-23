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

import runnerUrls from '../urls/runnerUrls';
import setupSelectors from '../selectors/setupSelectors';
import runnerSelectors from "../selectors/runnerSelectors";

/**
 * Setup Commands
 */
Cypress.Commands.add('importTestPackage', (testContent) => {
    cy.log('COMMAND: importTestPackage', testContent);

    // Visit Tests page
    cy.visit(runnerUrls.testsPageUrl);

    // Wait until page gets loaded and root class gets selected
    cy.wait('@editClassLabel');

    // Select test import
    cy.get(setupSelectors.testsPage.testImportbutton).click();

    // Wait until test import request finishes
    cy.wait('@testImportIndex');

    // Upload example qti test file to file input
    // force:true needed because of a known issue (https://github.com/abramenal/cypress-file-upload/issues/34)
    cy.get(setupSelectors.testsPage.fileInput).upload(
        {
            fileContent: testContent,
            fileName: 'e2eExampleTest.zip',
            mimeType: 'application/zip'
        },
        {
            subjectType: 'input',
            force: true
        }
    );

    // windows workaround
    cy.wait(1000);

    // Import selected example test file
    cy.get(setupSelectors.testsPage.fileImportButton).click();

    // Wait until test import request finishes
    cy.wait(['@testImportIndex', '@taskQueueWebApi', '@taskQueueWebApi'], { timeout: 15000 });

    // Continue
    cy.get(setupSelectors.testsPage.feedbackContinueButton).click();

    // Wait until publish button appears again
    cy.wait('@editTest');
});

Cypress.Commands.add('publishTest', (testName) => {
    cy.log('COMMAND: publishTest', testName);

    // Visit Tests page
    cy.visit(runnerUrls.testsPageUrl);

    // Wait until page gets loaded and root class gets selected
    cy.wait('@editClassLabel');

    // Select tree node
    cy.get(setupSelectors.testsTree).within(() => {
        cy.contains(testName).click({ force: true });
    });

    // Publish example test
    cy.get(setupSelectors.testsPage.testPublishButton).click();

    // Select Assembled Delivery as root class for publishing
    cy.get(setupSelectors.testsPage.destinationSelector).contains('Assembled Delivery').click();

    // Clicking on publish
    cy.get(setupSelectors.testsPage.destinationSelectorActions).contains('Publish').click();
});

Cypress.Commands.add('setDeliveryForGuests', (deliveryName) => {
    cy.log('COMMAND: setDeliveryForGuests', deliveryName);

    // Go to Deliveries page
    cy.visit(runnerUrls.deliveriesPageUrl);

    // Wait until page gets loaded and root class gets selected
    cy.wait('@editClassLabel');

    // Select example delivery
    cy.get(setupSelectors.deliveriesPage.rootDeliveryClass).contains(deliveryName).click();

    //windows workaround
    cy.wait(1000);

    // Set guest access on the delivery
    cy.get(setupSelectors.deliveriesPage.formContainer).contains('Guest Access').click();

    // Save delivery
    cy.get(setupSelectors.deliveriesPage.formContainer).contains('Save').click();

    // Wait until save happened properly
    // Not ideal but these requests have to be waited in this order upon delivery save
    cy.wait(['@editDelivery', '@getData', '@editDelivery', '@getData', '@editDelivery', '@getData']);
});

Cypress.Commands.add('startTest', (testName) => {
    cy.log('COMMAND: startTest', testName);

    //windows workaround
    cy.wait(1000);

    cy.get(runnerSelectors.testList)
        .find(runnerSelectors.availableDeliveries)
        .contains(testName)
        .click();

    cy.wait(['@testRunnerGet', '@testRunnerPost']);
});
