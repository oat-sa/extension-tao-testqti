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

import {inlineInteractionSelectors} from '../../../_helpers/selectors/interactionSelectors';

import '../../../_helpers/commands/setupCommands';
import '../../../_helpers/commands/cleanupCommands';
import '../../../_helpers/commands/navigationCommands';
import '../../../_helpers/routes/backOfficeRoutes';
import '../../../_helpers/routes/runnerRoutes';

import base64Test from './fixtures/inlineTextEntryInteractionTest';

describe('Inline Choice Interaction', () => {
    const testName = 'E2E Inline Text Entry Interaction Test';
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

    it('Basic behaviour', () => {
        cy.get(inlineInteractionSelectors.textEntry).eq(0)
        // have placeholder
        .should('have.attr', 'placeholder', 'what?')
        
        .type('question')

        // can type in it
        .should('have.value', 'question');
    });

    it('Max length', () => {
        cy.get(inlineInteractionSelectors.textEntry).eq(1).focus();

        // max length should be notified
        cy.get('.tooltip').contains('4 characters allowed');

        cy.get(inlineInteractionSelectors.textEntry).eq(1).type('100');
        
        cy.get('.tooltip').contains('3/4');

        // cannot type more if length is reached
        cy.get(inlineInteractionSelectors.textEntry).eq(1).type('00')
        .should('have.value', '1000');
    });

    it('Saves value if go to next question', () => {
        cy.get(inlineInteractionSelectors.textEntry).eq(0).type('question');

        cy.nextItem();
        cy.previousItem();

        // have previously set value
        cy.get(inlineInteractionSelectors.textEntry).eq(0).should('have.value', 'question');
    });

    it('Regular expression validator', () => {
        cy.nextItem();
        cy.get(inlineInteractionSelectors.textEntry).eq(0).type('foo');

        // invalid format should be notified
        cy.get('.tooltip').contains('This is not a valid answer');
        
        cy.get(inlineInteractionSelectors.textEntry).eq(0).clear().type('31');

        cy.get('.tooltip').should('be.not.visible');
    });
});