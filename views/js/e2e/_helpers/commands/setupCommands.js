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
import setupSelectors from '../selectors/setupSelectors';
import runnerSelectors from '../selectors/runnerSelectors';


/**
 * Listen to TaskQueue polling until a response matches
 * @example
 * pollTaskQueue({ category: 'import', status: 'completed' }, 3);
 *
 * @param {Object} criteria - response data parameters we are waiting for
 * @param {String} [criteria.category] - category value we are waiting for
 * @param {String} [criteria.status] - status value we are waiting for
 * @param {Integer} [retries=5] - max number of `getAll` requests to look at before timing out
 */
const pollTaskQueue = (criteria, retries = 5) => {
    // Recursive fn with a limit on depth
    const awaitTaskQueue = (retries) => {
        cy.wait('@taskQueueWebApiGetAll', { timeout: 20000 }).then((xhr) => {
            if (xhr.response.body && xhr.response.body.data && xhr.response.body.data.length) {
                cy.log(JSON.stringify(xhr.response.body.data[0])); //
                if (Object.keys(criteria).every((key) => {
                    return criteria[key] === xhr.response.body.data[0][key];
                })) {
                    // Task Queue entry contains what we're looking for, woohoo
                    cy.log(`${JSON.stringify(criteria)} : OK`);
                }
                else if (retries > 0) {
                    awaitTaskQueue(retries - 1);
                }
            }
            else if (retries > 0) {
                awaitTaskQueue(retries - 1);
            }
        });
    }
    // begin:
    awaitTaskQueue(retries);
};

/**
 * Archive taoTaskQueue tasks
 * @returns {Promise}
 */
const archiveTasks = () => {
    return cy.request({
        url: backOfficeUrls.taskQueueArchiveUrl,
        headers: {
            'X-Requested-With': 'XmlHttpRequest'
        }
    });
};

/**
 * Ping taoTaskQueue via XHR
 * Alias the result so it is available on this.
 * @exposes {Cypress alias<Boolean>} isTaskQueueWorking
 */
Cypress.Commands.add('queryTaskQueue', () => {
    cy.log('COMMAND: queryTaskQueue');

    cy.request({
        url: backOfficeUrls.taskQueueGetUrl,
        headers: {
            'X-Requested-With': 'XmlHttpRequest'
        },
        failOnStatusCode: false // we want to process 4xx and 5xx responses too
    })
    .then(xhr => {
        // Set status on Cypress context
        cy.wrap(xhr.status === 200).as('isTaskQueueWorking');
    });
});


/**
 * Setup Commands
 */
Cypress.Commands.add('importTestPackage', function(fileContent, fileName) {
    cy.log('COMMAND: importTestPackage', fileName);

    // Check if Task Queue worker is alive (stores isTaskQueueWorking property on context)
    cy.queryTaskQueue();

    // Visit Tests page
    cy.visit(backOfficeUrls.testsPageUrl);

    // Wait until page gets loaded and root class gets selected
    cy.wait('@editClassLabel');

    // Select test import
    cy.get(setupSelectors.testsPage.testImportButton).click();

    // Wait until test import form is loaded
    cy.get('@isTaskQueueWorking').then(working => {
        if (working) {
            archiveTasks();
            cy.wait('@taskQueueWebApiGetAll');
        }
    });
    // If Task Queue is turned off, or is on but isn't working, we fall back to the synchronous import request:
    cy.wait('@testImportIndex');

    // Upload example qti test file to file input
    // force:true needed because of a known issue (https://github.com/abramenal/cypress-file-upload/issues/34)
    cy.get(setupSelectors.testsPage.fileInput).upload(
        {
            fileContent,
            fileName: `${fileName}.zip`,
            mimeType: 'application/zip',
            encoding: 'base64'
        },
        {
            subjectType: 'input',
            force: true
        }
    );
    cy.wait('@fileUpload');

    // Import selected test file
    cy.get(setupSelectors.testsPage.fileImportButton).click();

    /*
     * Two different processes to handle different UX
     * for taoTaskQueue enabled or disabled
     */
    cy.get('@isTaskQueueWorking').then(working => {
        if (working) {
            cy.wait(Array(4).fill('@taskQueueWebApi'), { timeout: 20000 });

            pollTaskQueue({ category: 'import', status: 'completed' });

            archiveTasks();
        }
        else {
            // Wait until test import request finishes
            cy.wait(['@testImportIndex', '@taskQueueWebApi', '@taskQueueWebApi'], { timeout: 20000 });

            // Continue
            cy.get(setupSelectors.testsPage.feedbackContinueButton).click();

            // Wait until publish button appears again
            cy.wait('@editTest');
        }
        })
});

Cypress.Commands.add('publishTest', function(testName, deliveryType = 'local') {
    cy.log('COMMAND: publishTest', testName, deliveryType);

    // Check if Task Queue worker is alive (stores isTaskQueueWorking property on context)
    cy.queryTaskQueue();

    // Visit Tests page
    cy.visit(backOfficeUrls.testsPageUrl);

    // Wait until page gets loaded and root class gets selected
    cy.wait('@editClassLabel');

    // Select tree node
    cy.get(setupSelectors.testsPage.rootTestClass).within(() => {
        // using 'force: true' because the list item can be off screen
        cy.contains(testName).click({ force: true });
    });

    cy.wait('@editTest');

    // Publish selected test
    cy.get(setupSelectors.testsPage.testPublishButton).click();

    const tenantLabel = Cypress.env('deliverTenantLabel');

    if (deliveryType === 'remote' && tenantLabel && tenantLabel.length) {
        // Select TAO Remote tab
        cy.get(setupSelectors.testsPage.deliveryTypeTabs).contains('TAO Remote').click();
        // Select suitable tenant
        cy.get('.deliver-tenant-list').select(tenantLabel);
    }

    // Select Assembled Delivery as root class for publishing
    cy.get(setupSelectors.testsPage.destinationSelector).contains('Assembled Delivery').click();

    // Clicking on publish
    cy.get(setupSelectors.testsPage.destinationSelectorActions).contains('Publish').click();

    // Wait until test is published
    if (deliveryType === 'remote') {
        cy.wait('@publishDeliverConnect');
    }
    else {
        cy.wait('@publishDeliveryRdf');
    }
    /*
     * Two different processes to handle different UX
     * for taoTaskQueue enabled or disabled
     */
    cy.get('@isTaskQueueWorking').then(working => {
        if (working) {
            cy.wait('@taskQueueWebApi', { timeout: 20000 }); // can be 1-4 of them :(

            if (deliveryType === 'remote') {
                pollTaskQueue({ taskLabel: 'Remote Publication Lookup', status: 'completed' });
            }
            archiveTasks();
        }
        else {
            cy.wait('@editTest');
        }
    });
});

Cypress.Commands.add('setDeliveryForGuests', (testName) => {
    cy.log('COMMAND: setDeliveryForGuests', testName);

    // Go to Deliveries page
    cy.visit(backOfficeUrls.deliveriesPageUrl);

    // Wait until page gets loaded and root class gets selected
    cy.wait('@editClassLabel');

    // Select example delivery
    cy.get(setupSelectors.deliveriesPage.rootDeliveryClass).contains(testName).click();

    // Set guest access on the delivery (if not yet enabled)
    cy.get(setupSelectors.deliveriesPage.guestAccessCheckbox).check();

    // Save delivery
    cy.get(setupSelectors.deliveriesPage.formContainer).contains('Save').click();

    // Wait until save happened properly
    // Not ideal but these requests have to be waited in this order upon delivery save
    cy.wait(['@editDelivery', '@getData','@editDelivery', '@getData', '@editDelivery' ]);
});

Cypress.Commands.add('startTest', (testName) => {
    cy.log('COMMAND: startTest', testName);

    // Wait for attachment of event listeners to links
    cy.wait(2000);

    cy.get(runnerSelectors.testList)
        .find(runnerSelectors.availableDeliveries)
        .contains(`Delivery of ${testName}`)
        .click();

    // The test should be launching now, but it can take several seconds
    cy.wait(['@testRunnerInit', '@testRunnerGetItem'], {timeout: 10000});
});
