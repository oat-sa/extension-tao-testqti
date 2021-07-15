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
 * Launch a test from the index page
 * @param {String} deliveryKey
 */
export function launchDelivery(deliveryKey) {
    const deliveryName = Cypress.env('deliveryIds')[deliveryKey];

    cy.get('.entry-point-all-deliveries').contains(deliveryName).within($el => {
        const launchUrl = $el.parents('.entry-point-all-deliveries').data('launch_url');
        cy.visit(launchUrl);
    });

    cy.location().should(location => {
        expect(`${location.origin}${location.pathname}`).to.equal(getFullUrl(urls.execution));
    });
}

/**
 * Checks the return page at the end of the LTI session
 */
export function checkReturnPage() {
    cy.location().should(location => {
        expect(`${location.origin}${location.pathname}`).to.equal(getFullUrl(urls.index));
    });
}