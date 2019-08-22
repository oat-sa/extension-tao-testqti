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
import setupSelectors from './setupSelectors';
import base64Test from './base64QtiExampleTestPackage';
import runnerSelectors from "../_selectors/runnerSelectors";

/**
 * Setup Commands
 */
Cypress.Commands.add('publishImportedTest', () => {
    
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
            fileContent: base64Test, 
            fileName: 'e2eExampleTest.zip', 
            mimeType: 'application/zip'
        }, 
        { 
            subjectType: 'input',
            force: true 
        }
    );

    cy.wait(200);

    // Import selected example test file
    cy.get(setupSelectors.testsPage.fileImportButton).click();

    // Wait until test import request finishes
    cy.wait(['@testImportIndex', '@taskQueueWebApi', '@taskQueueWebApi'], { timeout: 10000 });

    // Continue
    cy.get(setupSelectors.testsPage.feedbackContinueButton).click();

    // Wait until publish button appears again
    cy.wait('@editTest');

    // Publish example test
    cy.get(setupSelectors.testsPage.testPublishButton).click();

    // Select Assembled Delivery as root class for publishing
    cy.get(setupSelectors.testsPage.destinationSelector).contains('Assembled Delivery').click();

    // Clicking on publish
    cy.get(setupSelectors.testsPage.destinationSelectorActions).contains('Publish').click();
});

Cypress.Commands.add('setDeliveryForGuests', () => {
    
    // Go to Deliveries page
    cy.visit(runnerUrls.deliveriesPageUrl);

    // Wait until page gets loaded and root class gets selected
    cy.wait('@editClassLabel');

    // Select example delivery
    cy.get(setupSelectors.deliveriesPage.rootDeliveryClass).contains('Delivery of e2e example test').click();

    // Set guest access on the delivery
    cy.get(setupSelectors.deliveriesPage.formContainer).contains('Guest Access').click();

    // Save delivery
    cy.get(setupSelectors.deliveriesPage.formContainer).contains('Save').click();

    // Wait until save happened properly
    // Not ideal but these requests have to be waited in this order upon delivery save
    cy.wait(['@editDelivery', '@getData','@editDelivery', '@getData', '@editDelivery', '@getData' ]);
});

Cypress.Commands.add('startDeliveryExecution', () => {
    // some windows workaround
    cy.wait(500);

    cy.get(runnerSelectors.testList)
        .find(runnerSelectors.availableDeliveries)
        .contains('Delivery of e2e example test')
        .click();

    cy.wait(['@testRunnerGet', '@testRunnerPost']);
});

Cypress.Commands.add('nextItem', () => {
    cy.get(setupSelectors.testNavigation.nextItem).click();
    cy.wait(['@testRunnerGet', '@testRunnerPost']);
});

Cypress.Commands.add('previousItem', () => {
    cy.get(setupSelectors.testNavigation.previousItem).click();
    cy.wait(['@testRunnerGet', '@testRunnerPost']);
});

Cypress.Commands.add('skipItem', () => {
    cy.get(setupSelectors.testNavigation.skipItem).click();
    cy.wait(['@testRunnerGet', '@testRunnerPost']);
});

Cypress.Commands.add('endTest', () => {
    cy.get(setupSelectors.testNavigation.endTest).click();
    cy.wait('@testRunnerPost');
});

Cypress.Commands.add('skipAndEndTest', () => {
    cy.get(setupSelectors.testNavigation.skipAndEndTest).click();
    cy.wait('@testRunnerPost');
});

