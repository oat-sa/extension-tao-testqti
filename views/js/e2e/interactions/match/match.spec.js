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

import interactionSelectors, {
    commonInteractionSelectors,
    hotTextInteractionSelectors,
    matchInteractionSelectors
} from '../../_helpers/selectors/interactionSelectors';

import '../../_helpers/commands/setupCommands';
import '../../_helpers/commands/cleanupCommands';
import '../../_helpers/commands/navigationCommands';

import '../../_helpers/routes/backOfficeRoutes';
import '../../_helpers/routes/runnerRoutes';

import base64Test from './fixtures/base64ChoiceInteractionTestPackage';

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
        cy.importTestPackage(base64Test, 'e2e match interaction test');
        cy.publishTest('e2e match interaction test');
        cy.setDeliveryForGuests('Delivery of e2e match interaction test');
        cy.logout();
    });

    /**
     * Log in & start the test
     */
    beforeEach(() => {
        cy.setupServer();
        cy.addRunnerRoutes();
        cy.guestLogin();
        cy.startTest('e2e match interaction test');
    });

    /**
     * Destroy everything we created during setup, leaving the environment clean for next time.
     */
    after(() => {
        cy.setupServer();
        cy.addBackOfficeRoutes();
        cy.login('admin');
        cy.deleteItem('e2e match interaction test');
        cy.deleteTest('e2e match interaction test');
        cy.deleteDelivery('Delivery of e2e match interaction test');
    });

    /**
     * Interaction tests
     */
    describe('Match interaction', () => {
        it('Loads in proper state', () => {
            cy.get(commonInteractionSelectors.interaction).within(() => {
                cy.get(commonInteractionSelectors.qtiChoice).should('exist');
                cy.get(matchInteractionSelectors.interactionArea).find(commonInteractionSelectors.checkboxIcon).should('exist');
                cy.get(commonInteractionSelectors.itemInstruction).should('exist').and('be.visible').and('have.class', commonInteractionSelectors.itemInstructionFeedback.info);
            });
        });

        it('Can interact with checkbox', () => {
            cy.get(matchInteractionSelectors.interactionArea).within(() => {
                cy.get(commonInteractionSelectors.checkboxIcon).first().click();
                cy.get(commonInteractionSelectors.checkboxChecked).should('have.length', 1);
            });
            cy.get(commonInteractionSelectors.itemInstruction).should('have.class', commonInteractionSelectors.itemInstructionFeedback.info);
        });

        it('Cannot choose because max reached', function () {
            cy.get(matchInteractionSelectors.interactionArea).within(() => {
                cy.get(commonInteractionSelectors.checkboxIcon).eq(0).click();
                cy.get(commonInteractionSelectors.checkboxIcon).eq(1).click();
                cy.get(commonInteractionSelectors.checkboxIcon).eq(2).click();
                cy.get(commonInteractionSelectors.checkboxIcon).eq(3).click();
                cy.get(commonInteractionSelectors.checkboxChecked).should('have.length', 3);
            });

            cy.get(commonInteractionSelectors.itemInstruction).should('have.class', commonInteractionSelectors.itemInstructionFeedback.warning);
            cy.wait(1000);
            cy.get(commonInteractionSelectors.itemInstruction).should('have.class', commonInteractionSelectors.itemInstructionFeedback.success);
        });

        it('Interaction keeps state', function () {
            cy.get(matchInteractionSelectors.interactionArea).within(() => {
                cy.get(commonInteractionSelectors.checkboxIcon).eq(0).click();
                cy.get(commonInteractionSelectors.checkboxIcon).eq(1).click();
            });
            cy.get(commonInteractionSelectors.itemInstruction).should('have.class', commonInteractionSelectors.itemInstructionFeedback.success);

            cy.nextItem();
            cy.previousItem();

            cy.get(matchInteractionSelectors.interactionArea).find(commonInteractionSelectors.checkboxChecked).should('have.length', 2);
            cy.get(commonInteractionSelectors.itemInstruction).should('have.class', commonInteractionSelectors.itemInstructionFeedback.success);
        });

    });
});
