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

import '../../_helpers/commands/setupCommands';
import '../../_helpers/commands/cleanupCommands';
import '../../_helpers/commands/navigationCommands';

import '../../_helpers/routes/backOfficeRoutes';
import '../../_helpers/routes/runnerRoutes';

import {commonInteractionSelectors, hotTextInteractionSelectors} from '../../_helpers/selectors/interactionSelectors';

import base64Test from './fixtures/base64HottextInteractionTestPackage';

describe('Interactions', () => {

    /**
     * Setup to have a proper delivery:
     * - Start server
     * - Add necessary routes
     * - Admin login
     * - Import test package
     * - Publish imported test as a delivery
     * - Set guest access on delivery and save
     * - Logout
     */
    before(() => {
        cy.setupServer();
        cy.addBackOfficeRoutes();
        cy.login('admin');
        cy.importTestPackage(base64Test, 'e2e hottext interaction test');
        cy.publishTest('e2e hottext interaction test');
        cy.setDeliveryForGuests('Delivery of e2e hottext interaction test');
        cy.logout();
    });

    /**
     * Log in & start the test
     */
    beforeEach(() => {
        cy.setupServer();
        cy.addRunnerRoutes();
        cy.guestLogin();
        cy.startTest('e2e hottext interaction test');
    });

    /**
     * Destroy everything we created during setup, leaving the environment clean for next time.
     */
    after(() => {
        cy.setupServer();
        cy.addBackOfficeRoutes();
        cy.login('admin');
        cy.deleteItem('e2e hottext interaction test');
        cy.deleteTest('e2e hottext interaction test');
        cy.deleteDelivery('Delivery of e2e hottext interaction test');
    });

    /**
     * Interactions tests
     */
    describe('Hottext interaction', () => {

        it('Loads in proper state', function () {
            cy.get(commonInteractionSelectors.interaction).within(() => {
                cy.get(commonInteractionSelectors.itemInstruction).should('exist').and('be.visible').and('have.class', 'feedback-info');
                cy.get(commonInteractionSelectors.qtiChoice).should('exist').and('be.visible').and('have.length', 4);
            });
        });

        it('Click 1 choice and get info feedback', function () {
            cy.get(commonInteractionSelectors.interaction).within(() => {
                cy.get(commonInteractionSelectors.qtiChoice).first().click();
                cy.get(commonInteractionSelectors.itemInstruction).should('exist').and('be.visible').and('have.class', 'feedback-info');
                cy.get(commonInteractionSelectors.checkboxChecked).should('have.length', 1);
            });
        });

        it('Click 2 choices and get success feedback', function () {
            cy.get(commonInteractionSelectors.interaction).within(() => {
                cy.get(commonInteractionSelectors.qtiChoice).eq(0).click();
                cy.get(commonInteractionSelectors.qtiChoice).eq(1).click();
                cy.get(commonInteractionSelectors.itemInstruction).should('exist').and('be.visible').and('have.class', 'feedback-success');
                cy.get(commonInteractionSelectors.checkboxChecked).should('have.length', 2);
            });
        });

        it('Click 3 choices and get warning feedback', function () {
            cy.get(commonInteractionSelectors.interaction).within(() => {
                cy.get(commonInteractionSelectors.qtiChoice).eq(0).click();
                cy.get(commonInteractionSelectors.qtiChoice).eq(1).click();
                cy.get(commonInteractionSelectors.qtiChoice).eq(2).click();
                cy.get(commonInteractionSelectors.itemInstruction).should('exist').and('be.visible').and('have.class', 'feedback-warning');
                cy.get(commonInteractionSelectors.checkboxChecked).should('have.length', 2);
            });
        });

        it('Interaction keeps state', function () {
            cy.get(commonInteractionSelectors.interaction).within(() => {
                cy.get(commonInteractionSelectors.qtiChoice).eq(0).click();
                cy.get(commonInteractionSelectors.qtiChoice).eq(1).click();
            });

            cy.nextItem();
            cy.previousItem();

            cy.get(commonInteractionSelectors.interaction).within(() => {
                cy.get(commonInteractionSelectors.itemInstruction).should('exist').and('be.visible').and('have.class', 'feedback-success');
                cy.get(commonInteractionSelectors.checkboxChecked).should('have.length', 2);
            });
        });

    });
});
