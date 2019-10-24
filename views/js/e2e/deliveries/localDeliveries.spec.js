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

import runnerSelectors from '../_helpers/selectors/runnerSelectors';

import '../_helpers/commands/setupCommands';
import '../_helpers/commands/cleanupCommands';
import '../_helpers/routes/backOfficeRoutes';

import base64Test from './fixtures/base64LocalQtiExampleTestPackage';

describe('Local deliveries', () => {

    const testTitle = 'e2e local example test';

    /**
     * Setup to have a proper delivery:
     * - Start server
     * - Add necessary routes
     * - Admin login
     * - Import and publish e2e example test
     * - Set guest access on delivery and save
     * - Logout
     * - Guest login
     */
    beforeEach(() => {
        cy.setupServer();
        cy.addBackOfficeRoutes();
        cy.login('admin');
        cy.importTestPackage(base64Test, testTitle);
        cy.publishTest(testTitle, 'local');
        cy.setDeliveryForGuests(testTitle);
        cy.logout();
        cy.guestLogin();
    });

    /**
     * Destroy everything we created during setup, leaving the environment clean for next time.
     */
    afterEach(() => {
        cy.guestLogout();
        cy.login('admin');
        cy.deleteItem(testTitle);
        cy.deleteTest(testTitle);
        cy.deleteDelivery(`Delivery of ${testTitle}`);
    });

    /**
     * Delivery tests
     */
    describe('Delivery list', () => {

        it('List contains local example e2e delivery', function() {
            cy.get(runnerSelectors.testList).find(runnerSelectors.availableDeliveries).contains(`Delivery of ${testTitle}`);
        });
    });
});
