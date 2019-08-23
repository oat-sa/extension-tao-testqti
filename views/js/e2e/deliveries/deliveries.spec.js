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

 import runnerSelectors from '../_selectors/runnerSelectors';

 import '../_setup/setupCommands';
 import '../_routes/runnerRoutes';
 import '../_cleanup/cleanupCommands';

describe('Deliveries', () => {
   
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
        cy.addRoutes();
        cy.login('admin');
        cy.publishImportedTest();
        cy.setDeliveryForGuests();
        cy.logout();
        cy.guestLogin();
    });

    /**
     * Destroy everything we created during setup, leaving the environment clean for next time.
     */
    afterEach(() => {
        cy.guestLogout();
        cy.login('admin');
        cy.deleteImportedItem();
        cy.deleteImportedTest();
        cy.deleteDelivery();
    });

    /**
     * Delivery tests
     */
    describe('Delivery list', () => {

        it('List contains example e2e delivery', function() {
            cy.get(runnerSelectors.testList).find(runnerSelectors.availableDeliveries).contains('Delivery of e2e example test');
        });
    });
});
