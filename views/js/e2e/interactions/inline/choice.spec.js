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

import {inlineInteractionSelectors} from '../../_helpers/selectors/interactionSelectors';

import '../../_helpers/commands/setupCommands';
import '../../_helpers/commands/cleanupCommands';
import '../../_helpers/commands/navigationCommands';
import '../../_helpers/routes/backOfficeRoutes';
import '../../_helpers/routes/runnerRoutes';

import base64Test from './fixtures/inlineChoiceInteractionTest';

describe('Inline Choice Interaction', () => {
    const testName = 'E2E Inline Choice Interaction Test';
    const deliveryName = `Delivery of ${testName}`;

    /**
     * Setup to have a proper delivery
     */
    before(() => {
        cy.setupServer();
        cy.addBackOfficeRoutes();
        cy.login('admin');
        cy.importTestPackage(base64Test, testName);
        cy.publishTest(testName);
        cy.setDeliveryForGuests(deliveryName);
        cy.logout();
    });

    /**
     * Log in & start the test
     */
    beforeEach(() => {
        cy.setupServer();
        cy.addRunnerRoutes();
        cy.guestLogin();
        cy.startTest(testName);

        // basic element
        cy.get(inlineInteractionSelectors.choiceDropdown).as('inlineChoice');
    });

    /**
     * Destroy everything we created during setup, leaving the environment clean for next time.
     */
    after(() => {
        cy.setupServer();
        cy.addBackOfficeRoutes();
        cy.login('admin');
        cy.deleteItem(testName);
        cy.deleteTest(testName);
        cy.deleteDelivery(deliveryName);
    });

    it('Interaction options are selectable and save selection', () => {
        cy.get('@inlineChoice').click();

        // options and empty option are visible
        cy.get(inlineInteractionSelectors.choiceOption).should('have.length', 3).and('be.visible')

        // select second option
            .eq(2).click();

        cy.get(inlineInteractionSelectors.choosenOption).contains('that');

        cy.nextItem();
        cy.previousItem();

        cy.get(inlineInteractionSelectors.choosenOption).contains('that');
    });

    it('Required option should show tooltip message', () => {
        cy.nextItem();

        // required option should show tooltip
        cy.get('.tooltip').should('exist');

        cy.get('@inlineChoice').click();

        // options are visible but there is no empty option
        cy.get(inlineInteractionSelectors.choiceOption).should('have.length', 3).and('be.visible');
    });

    it('Random order should show all choices', () => {
        cy.nextItem();

        cy.get('@inlineChoice').click();

        // options are visible
        cy.get(inlineInteractionSelectors.choiceOption).should('have.length', 3).and('be.visible');
    });
});
