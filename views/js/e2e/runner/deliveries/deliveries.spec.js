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

 import runnerSelectors from '../runnerSelectors';
 import '../_setup/setupCommands';

describe('Deliveries', () => {
   
    /**
     * Setup to have a proper delivery:
     * - Admin login
     * - Import and publish example tests
     * - Set guest access on delivery and save
     * - Logout
     * - Guest login
     */
    beforeEach(() => {
        cy.login('admin');
        cy.publishImportedTest();
        cy.setDeliveryForGuests();
        cy.logout();
        cy.guestLogin();
    });

    /**
     * Delivery tests
     */
    describe('Delivery list is not empty', () => {

        it('At least one delivery is available to start', function() {
            cy.get(runnerSelectors.testList).find(runnerSelectors.availableDeliveries).contains('Delivery of e2e example test');
        });
    });
});
