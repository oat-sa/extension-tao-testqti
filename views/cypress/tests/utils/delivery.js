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
 * Copyright (c) 2021 Open Assessment Technologies SA ;
 */

import { getFullUrl } from '../../../../../tao/views/cypress/utils/helpers.js';
import urls from "./urls";

/**
 * Logs in as a test taker
 */
export function loginAsTestTaker() {
    const username = Cypress.env('testTakerUser');
    const password = Cypress.env('testTakerPass');

    cy.loginAsUser(username, password);
}

/**
 * Redirects to the index page
 */
export function goToIndexPage() {
    cy.visit(urls.index);
}

/**
 * Redirects to the index page by clicking the home button
 */
export function goToHome() {
    cy.get('.loading-bar').should('not.be.visible');

    cy.get('[data-control="home"] a').click();

    cy.location().should(location => {
        expect(`${location.origin}${location.pathname}`).to.equal(getFullUrl(urls.index));
    });
}

/**
 * Launches a test from the index page, with respect to the given selector
 * @param {String} selector - The DOM Selector targeting the entry points
 * @param {String} deliveryKey - The name of the delivery to start, as displayed in the list
 */
function startDelivery(selector, deliveryKey) {
    const deliveryName = Cypress.env('deliveryIds')[deliveryKey];

    cy.get(selector).contains(deliveryName).within($el => {
        const launchUrl = $el.parents(selector).data('launch_url');
        cy.visit(launchUrl);
    });

    cy.location().should(location => {
        expect(`${location.origin}${location.pathname}`).to.equal(getFullUrl(urls.execution));
    });
}

/**
 * Launches a test from the index page
 * @param {String} deliveryKey - The name of the delivery to start, as displayed in the list
 */
export function launchDelivery(deliveryKey) {
    startDelivery('.entry-point-all-deliveries', deliveryKey);
}

/**
 * Resumes a test from the index page
 * @param {String} deliveryKey - The name of the delivery to start, as displayed in the list
 */
export function resumeDelivery(deliveryKey) {
    startDelivery('.entry-point-started-deliveries', deliveryKey);
}

/**
 * Checks the return page at the end of the LTI session
 */
export function checkReturnPage() {
    cy.location().should(location => {
        expect(`${location.origin}${location.pathname}`).to.equal(getFullUrl(urls.index));
    });
}

/**
 * Logs in as a test taker and launches a test from the index page
 * @param {String} deliveryKey - The name of the delivery to start, as displayed in the list
 */
export function loginAndLaunchDelivery(deliveryKey) {
    loginAsTestTaker();
    goToIndexPage();
    launchDelivery(deliveryKey);
}
