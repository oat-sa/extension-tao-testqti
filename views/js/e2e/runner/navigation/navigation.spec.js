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

import '../../_helpers/routes/runnerRoutes';

import '../../_helpers/commands/setupCommands';
import '../../_helpers/commands/cleanupCommands';
import '../../_helpers/commands/navigationCommands';

import runnerUrls from '../../_helpers/urls/runnerUrls';

import base64LinearTest from './fixtures/base64NavigationLinearTestPackage';
import base64NonLinearTest from './fixtures/base64NavigationNonLinearTestPackage';
import setupSelectors from "../../_helpers/selectors/setupSelectors";

describe('Navigation', () => {

    /**
     * Linear test Navigation
     */
    describe('Linear Test Navigation', () => {

        /**
         * Setup to have a proper delivery:
         * - Start server
         * - Add necessary routes
         * - Admin login
         * - Import and publish e2e example test
         * - Set guest access on delivery and save
         * - Logout
         */
        before(() => {
            cy.setupServer();
            cy.addRoutes();
            cy.login('admin');
            cy.importTestPackage(base64LinearTest, 'e2e navigation linear test');
            cy.publishTest('e2e navigation linear test');
            cy.setDeliveryForGuests('e2e navigation linear test');
            cy.logout();
        });

        /**
         * Setup to have a proper delivery:
         * - Start server
         * - Add necessary routes
         * - Guest login
         * - Start test
         */
        beforeEach(() => {
            cy.setupServer();
            cy.addRoutes();
            cy.guestLogin();
            cy.startTest('e2e navigation linear test');
        });

        /**
         * Destroy everything we created during setup, leaving the environment clean for next time.
         */
        after(() => {
            cy.setupServer();
            cy.addRoutes();
            cy.login('admin');
            cy.deleteItem('e2e navigation linear test');
            cy.deleteTest('e2e navigation linear test');
            cy.deleteDelivery('e2e navigation linear test');
        });

        describe('First Item', () => {

            it('Has proper navigation buttons', function () {
                cy.get('.navi-box-list').within(() => {
                    // visible navigation buttons
                    cy.get(setupSelectors.testNavigation.nextItem).should('exist').and('be.visible');
                    cy.get(setupSelectors.testNavigation.skipItem).should('exist').and('be.visible');

                    // not visible navigation buttons
                    cy.get(setupSelectors.testNavigation.previousItem).should('exist').and('not.be.visible');

                    //not existing buttons
                    cy.get(setupSelectors.testNavigation.endTest).should('not.exist');
                    cy.get(setupSelectors.testNavigation.skipAndEndTest).should('not.exist');
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
                    cy.get(setupSelectors.testNavigation.nextItem).should('exist').and('be.visible');
                    cy.get(setupSelectors.testNavigation.skipItem).should('exist').and('be.visible');

                    // not visible navigation buttons
                    cy.get(setupSelectors.testNavigation.previousItem).should('exist').and('not.be.visible');

                    //not existing buttons
                    cy.get(setupSelectors.testNavigation.endTest).should('not.exist');
                    cy.get(setupSelectors.testNavigation.skipAndEndTest).should('not.exist');
                });
            });

            it('Move to next item', () => {
                // go to 2nd item
                cy.nextItem();

                // go to next item
                cy.nextItem();
            });

            it('Skip to next item', () => {
                // go to 2nd item
                cy.nextItem();

                // skip item
                cy.skipItem();
            });

            it('Move to previous item', () => {
                // go to 2nd item
                cy.nextItem();

                // go to previous item
                cy.previousItem();
            });

        });

        describe('Last Item', () => {
            it('Has proper navigation buttons', function () {

                // go to last item
                cy.nextItem();
                cy.nextItem();

                cy.get('.navi-box-list').within(() => {
                    // visible navigation buttons
                    cy.get(setupSelectors.testNavigation.endTest).should('exist').and('be.visible');
                    cy.get(setupSelectors.testNavigation.skipAndEndTest).should('exist').and('be.visible');

                    // not visible navigation buttons
                    cy.get(setupSelectors.testNavigation.previousItem).should('exist').and('not.be.visible');

                    //not existing buttons
                    cy.get(setupSelectors.testNavigation.skipItem).should('not.exist');
                    cy.get(setupSelectors.testNavigation.nextItem).should('not.exist');
                });
            });

            it('End test', () => {
                // go to last item
                cy.nextItem();
                cy.nextItem();

                // end test
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

                // skip and end test
                cy.skipAndEndTest();

                //check if the test is really ended
                cy.location().should((loc) => {
                    expect(loc.pathname).to.eq(runnerUrls.availableDeliveriesPageUrl);
                });
            });

        });

    });

    describe('Non Linear Test Navigation', () => {

        /**
         * Setup to have a proper delivery:
         * - Start server
         * - Add necessary routes
         * - Admin login
         * - Import and publish e2e example test
         * - Set guest access on delivery and save
         * - Logout
         */
        before(() => {
            cy.setupServer();
            cy.addRoutes();
            cy.login('admin');
            cy.importTestPackage(base64NonLinearTest, 'e2e navigation non linear test');
            cy.publishTest('e2e navigation non linear test');
            cy.setDeliveryForGuests('e2e navigation non linear test');
            cy.logout();
        });

        /**
         * Setup to have a proper delivery:
         * - Start server
         * - Add necessary routes
         * - Guest login
         * - Start test
         */
        beforeEach(() => {
            cy.setupServer();
            cy.addRoutes();
            cy.guestLogin();
            cy.startTest('e2e navigation non linear test');
        });

        /**
         * Destroy everything we created during setup, leaving the environment clean for next time.
         */
        after(() => {
            cy.setupServer();
            cy.addRoutes();
            cy.login('admin');
            cy.deleteItem('e2e navigation non linear test');
            cy.deleteTest('e2e navigation non linear test');
            cy.deleteDelivery('e2e navigation non linear test');
        });

        describe('First Item', () => {

            it('Has proper navigation buttons', function () {
                cy.get('.navi-box-list').within(() => {
                    // visible navigation buttons
                    cy.get(setupSelectors.testNavigation.nextItem).should('exist').and('be.visible');
                    cy.get(setupSelectors.testNavigation.skipItem).should('exist').and('be.visible');

                    // not visible navigation buttons
                    cy.get(setupSelectors.testNavigation.previousItem).should('exist').and('not.be.visible');

                    //not existing buttons
                    cy.get(setupSelectors.testNavigation.endTest).should('not.exist');
                    cy.get(setupSelectors.testNavigation.skipAndEndTest).should('not.exist');
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
                    cy.get(setupSelectors.testNavigation.nextItem).should('exist').and('be.visible');
                    cy.get(setupSelectors.testNavigation.skipItem).should('exist').and('be.visible');
                    cy.get(setupSelectors.testNavigation.previousItem).should('exist').and('be.visible');

                    //not existing buttons
                    cy.get(setupSelectors.testNavigation.endTest).should('not.exist');
                    cy.get(setupSelectors.testNavigation.skipAndEndTest).should('not.exist');
                });
            });

            it('Move to next item', () => {
                // go to 2nd item
                cy.nextItem();

                // go to next item
                cy.nextItem();
            });

            it('Skip to next item', () => {
                // go to 2nd item
                cy.nextItem();

                // skip item
                cy.skipItem();
            });

            it('Move to previous item', () => {
                // go to 2nd item
                cy.nextItem();

                // go to previous item
                cy.previousItem();
            });

        });

        describe('Last Item', () => {
            it('Has proper navigation buttons', function () {

                // go to last item
                cy.nextItem();
                cy.nextItem();

                cy.get('.navi-box-list').within(() => {
                    // visible navigation buttons
                    cy.get(setupSelectors.testNavigation.endTest).should('exist').and('be.visible');
                    cy.get(setupSelectors.testNavigation.skipAndEndTest).should('exist').and('be.visible');
                    cy.get(setupSelectors.testNavigation.previousItem).should('exist').and('be.visible');

                    //not existing buttons
                    cy.get(setupSelectors.testNavigation.skipItem).should('not.exist');
                    cy.get(setupSelectors.testNavigation.nextItem).should('not.exist');
                });
            });

            it('Move to previous item', () => {
                // go to last item
                cy.nextItem();
                cy.nextItem();

                // go to previous item
                cy.previousItem();
            });

            it('End test', () => {
                // go to last item
                cy.nextItem();
                cy.nextItem();

                // end test
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

                // skip and end test
                cy.skipAndEndTest();

                //check if the test is really ended
                cy.location().should((loc) => {
                    expect(loc.pathname).to.eq(runnerUrls.availableDeliveriesPageUrl);
                });
            });

        });

    });

});
