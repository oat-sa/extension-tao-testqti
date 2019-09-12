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

import {
    commonInteractionSelectors,
    extendedTextInteractionSelectors
} from '../../_helpers/selectors/interactionSelectors';

import '../../_helpers/commands/setupCommands';
import '../../_helpers/commands/cleanupCommands';
import '../../_helpers/commands/pointerCommands';
import '../../_helpers/commands/navigationCommands';

import '../../_helpers/routes/backOfficeRoutes';
import '../../_helpers/routes/runnerRoutes';

import base64Test from './fixtures/base64ExtendedTextInteractionTest';

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
        cy.importTestPackage(base64Test, 'e2e extendedtext interaction test');
        cy.publishTest('e2e extendedtext interaction test');
        cy.setDeliveryForGuests('Delivery of e2e extendedtext interaction test');
        cy.logout();
    });

    /**
     * Log in & start the test
     */
    beforeEach(() => {
        cy.setupServer();
        cy.addRunnerRoutes();
        cy.guestLogin();
        cy.startTest('e2e extendedtext interaction test');
    });

    /**
     * Destroy everything we created during setup, leaving the environment clean for next time.
     */
    after(() => {
        cy.setupServer();
        cy.addBackOfficeRoutes();
        cy.login('admin');
        cy.deleteItem('e2e extendedtext interaction test');
        cy.deleteTest('e2e extendedtext interaction test');
        cy.deleteDelivery('Delivery of e2e extendedtext interaction test');
    });

    /**
     * Interactions tests
     */
    describe('Extended text interaction', () => {

        it('Loads in proper state', function () {
            cy.get(commonInteractionSelectors.interaction).eq(0).within(() => {
                cy.get(extendedTextInteractionSelectors.textContainer).should('exist').and('be.visible');
                cy.get(extendedTextInteractionSelectors.countChars).should('exist').and('be.visible').and('have.text', '00');
            });
        });

        it('Counter increase when text is added', function () {
            cy.get(commonInteractionSelectors.interaction).eq(0).within(() => {
                cy.get(extendedTextInteractionSelectors.textContainer).type('Hello, World!');

                cy.get(extendedTextInteractionSelectors.countChars).eq(0).should('have.text', 'Hello, Wor'.length.toString());
                cy.get(extendedTextInteractionSelectors.countChars).eq(1).should('have.text', 'Hello, Wor'.length.toString());
            });
        });

        it('Counter decrease when text is deleted', function () {
            cy.get(commonInteractionSelectors.interaction).eq(0).within(() => {
                cy.get(extendedTextInteractionSelectors.textContainer).type('Hello, World!');
                cy.get(extendedTextInteractionSelectors.textContainer).type('{backspace}').type('{backspace}').type('{backspace}');

                cy.get(extendedTextInteractionSelectors.countChars).eq(0).should('have.text', 'Hello, Wor'.slice(0, -3).length.toString());
                cy.get(extendedTextInteractionSelectors.countChars).eq(1).should('have.text', 'Hello, Wor'.slice(0, -3).length.toString());
            });
        });

        it('Character limit reached', function () {
            cy.get(commonInteractionSelectors.interaction).eq(0).within(() => {
                cy.get(extendedTextInteractionSelectors.textContainer).type('Hello, World! Hello, World! Hello, World! Hello, World!');
                cy.get(extendedTextInteractionSelectors.textContainer).should('have.value', 'Hello, Wor');
            });
        });

        it('Word limit reached', function () {
            cy.get(commonInteractionSelectors.interaction).eq(1).within(() => {
                cy.get(extendedTextInteractionSelectors.textContainer).type('Hello, World! Hello, World! Hello, World! Hello, World!');
                cy.get(extendedTextInteractionSelectors.textContainer).should('have.value', 'Hello, World!Hello,World!Hello,World!Hello,World!');
            });
        });

        it('Interaction keeps state', function () {
            cy.get(commonInteractionSelectors.interaction).within(() => {
                cy.get(extendedTextInteractionSelectors.textContainer).eq(0).type('Hello Wor');
                cy.get(extendedTextInteractionSelectors.textContainer).eq(1).type('World Hello');
            });

            cy.nextItem();
            cy.previousItem();

            cy.get(commonInteractionSelectors.interaction).within(() => {
                cy.get(extendedTextInteractionSelectors.textContainer).eq(0).should('have.value', 'Hello Wor');
                cy.get(extendedTextInteractionSelectors.textContainer).eq(1).should('have.value', 'World Hello');
            });
        });
    });
});
