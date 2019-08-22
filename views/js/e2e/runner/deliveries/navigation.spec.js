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

import '../_routes/runnerRoutes';
import '../_setup/setupCommands';
import '../_cleanup/cleanupCommands';
import runnerUrls from '../_urls/runnerUrls';

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
     * - Start Test
     */
    beforeEach(() => {
        cy.setupServer();
        cy.addRoutes();
        cy.login('admin');
        cy.publishImportedTest();
        cy.setDeliveryForGuests();
        cy.logout();
        cy.guestLogin();
        cy.startTest();
    });

    /**
     * Destroy everything we created during setup, leaving the environment clean for next time.
     */
    afterEach(() => {
        cy.endTest();
        cy.guestLogout();
        cy.login('admin');
        cy.deleteImportedItem();
        cy.deleteImportedTest();
        cy.deleteDelivery();
    });

    /**
     * Delivery tests
     */
    describe('Linear Test Navigation', () => {

        describe('First Item', () => {

            it('Has proper navigation buttons', function () {
                cy.get('.navi-box-list').within(() => {
                    // visible navigation buttons
                    cy.get('[data-control="move-forward"]').should('exist').and('be.visible');
                    cy.get('[data-control="skip"]').should('exist').and('be.visible');

                    // not visible navigation buttons
                    cy.get('[data-control="move-backward"]').should('exist').and('not.be.visible');

                    //not existing buttons
                    cy.get('[data-control="move-end"]').should('not.exist');
                    cy.get('[data-control="skip-end"]').should('not.exist');
                });
            });

            it('Move to next item', cy.nextItem);

            it('Skip to next item', cy.skipItem);

        });

        describe('Second Item', () => {

            it('Has proper navigation buttons', function () {
                // go to 2nd item
                cy.nextItem();

                cy.get('.navi-box-list').within(() => {
                    // visible navigation buttons
                    cy.get('[data-control="move-forward"]').should('exist').and('be.visible');
                    cy.get('[data-control="skip"]').should('exist').and('be.visible');

                    // not visible navigation buttons
                    cy.get('[data-control="move-backward"]').should('exist').and('not.be.visible');

                    //not existing buttons
                    cy.get('[data-control="move-end"]').should('not.exist');
                    cy.get('[data-control="skip-end"]').should('not.exist');
                });
            });

            it('Move to next item', () => {
                // go to last item
                cy.nextItem();
                cy.nextItem();
            });

            it('Skip to next item', () => {
                // go to last item
                cy.nextItem();
                cy.nextItem();
            });
        });

        describe('Last Item', () => {
            it('Has proper navigation buttons', function () {

                // go to last item
                cy.nextItem();
                cy.nextItem();

                cy.get('.navi-box-list').within(() => {
                    // visible navigation buttons
                    cy.get('[data-control="move-end"]').should('exist').and('be.visible');
                    cy.get('[data-control="skip-end"]').should('exist').and('be.visible');

                    // not visible navigation buttons
                    cy.get('[data-control="move-backward"]').should('exist').and('not.be.visible');

                    //not existing buttons
                    cy.get('[data-control="skip"]').should('not.exist');
                    cy.get('[data-control="move-forward"]').should('not.exist');
                });
            });

            it('End test', () => {
                // go to last item
                cy.nextItem();
                cy.nextItem();
                cy.endTest();

                //check if the test is really ended
                cy.location().should((loc) => {
                    expect(loc.pathname).to.eq(runnerUrls.availableDeliveriesPageUrl);
                });
            });

            it('Skip and end test', () => {
                // go to last item
                cy.nextItem();
                cy.nextItem();
                cy.skipAndEndTest();

                //check if the test is really ended
                cy.location().should((loc) => {
                    expect(loc.pathname).to.eq(runnerUrls.availableDeliveriesPageUrl);
                });
            });

        });

    });

});
