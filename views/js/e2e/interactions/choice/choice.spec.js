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

import {commonInteractionSelectors} from '../../_helpers/selectors/interactionSelectors';

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
        cy.importTestPackage(base64Test, 'e2e choice interaction test');
        cy.publishTest('e2e extendedtext interaction test');
        cy.setDeliveryForGuests('Delivery of e2e choice interaction test');
        cy.logout();
    });

    /**
     * Log in & start the test
     */
    beforeEach(() => {
        cy.setupServer();
        cy.addRunnerRoutes();
        cy.guestLogin();
        cy.startTest('e2e choice interaction test');
    });

    /**
     * Destroy everything we created during setup, leaving the environment clean for next time.
     */
    after(() => {
        cy.setupServer();
        cy.addBackOfficeRoutes();
        cy.login('admin');
        cy.deleteItem('e2e choice interaction test');
        cy.deleteTest('e2e choice interaction test');
        cy.deleteDelivery('Delivery of e2e choice interaction test');
    });

    /**
     * Tools tests
     */
    describe('Choice  interaction', () => {
        it('Choice item gets selected on click', function () {
            cy.get(commonInteractionSelectors.choiceArea).within(() => {
                cy.get(commonInteractionSelectors.qtiChoice).first().click();
                cy.get(commonInteractionSelectors.qtiChoice).first().should('have.class', 'user-selected');
            });
        });

        it('Should not allow multiple selection if disabled', function () {
            cy.get(commonInteractionSelectors.interaction).first().within(() => {
                cy.get(commonInteractionSelectors.qtiChoice).first().click();
                cy.get(commonInteractionSelectors.qtiChoice).first().next().click();
                cy.get(commonInteractionSelectors.qtiChoice).first().should('not.have.class', 'user-selected');
                cy.get(commonInteractionSelectors.qtiChoice).first().next().should('have.class', 'user-selected');

            });
        });

        it('Should allow multiple selection if enabled', function () {
            cy.get(commonInteractionSelectors.interaction).eq(1).within(() => {
                cy.get(commonInteractionSelectors.qtiChoice).first().click();
                cy.get(commonInteractionSelectors.qtiChoice).first().next().click();
                cy.get(commonInteractionSelectors.qtiChoice).first().should('have.class', 'user-selected');
                cy.get(commonInteractionSelectors.qtiChoice).first().next().should('have.class', 'user-selected');

            });
        });

        it('Interaction keeps state', function () {
            cy.get(commonInteractionSelectors.interaction).first().within(() => {
                cy.get(commonInteractionSelectors.qtiChoice).first().click();
            });

            cy.get(commonInteractionSelectors.interaction).eq(1).within(() => {
                cy.get(commonInteractionSelectors.qtiChoice).first().click();
                cy.get(commonInteractionSelectors.qtiChoice).first().next().click();
            });

            cy.nextItem();
            cy.previousItem();

            cy.get(commonInteractionSelectors.interaction).first().within(() => {
                cy.get(commonInteractionSelectors.qtiChoice).first().should('have.class', 'user-selected');
            });

            cy.get(commonInteractionSelectors.interaction).eq(1).within(() => {
                cy.get(commonInteractionSelectors.qtiChoice).first().should('have.class', 'user-selected');
                cy.get(commonInteractionSelectors.qtiChoice).first().next().should('have.class', 'user-selected');
            });

        });
    });
});
