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

import {commonInteractionSelectors, orderInteractionSelectors} from '../../_helpers/selectors/interactionSelectors';

import '../../_helpers/commands/setupCommands';
import '../../_helpers/commands/cleanupCommands';
import '../../_helpers/routes/backOfficeRoutes';
import '../../_helpers/routes/runnerRoutes';

import base64Test from './fixtures/base64OrderInteractionTest';

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
        // cy.setupServer();
        // cy.addBackOfficeRoutes();
        // cy.login('admin');
        // cy.importTestPackage(base64Test, 'e2e order interaction test');
        // cy.publishTest('e2e order interaction test');
        // cy.setDeliveryForGuests('Delivery of e2e order interaction test');
        // cy.logout();
    });

    /**
     * Log in & start the test
     */
    beforeEach(() => {
        cy.setupServer();
        cy.addRunnerRoutes();
        cy.guestLogin();
        cy.startTest('e2e order interaction test');
    });

    /**
     * Destroy everything we created during setup, leaving the environment clean for next time.
     */
    after(() => {
        // cy.setupServer();
        // cy.addBackOfficeRoutes();
        // cy.login('admin');
        // cy.deleteItem('e2e order interaction test');
        // cy.deleteTest('e2e order interaction test');
        // cy.deleteDelivery('Delivery of e2e order interaction test');
    });

    /**
     * Interactions tests
     */
    describe('Order interaction', () => {
        it('Loads in proper state', function () {
            cy.get(commonInteractionSelectors.interaction).within(() => {
                // we should see at least 1 choice item in the left square
                cy.get(commonInteractionSelectors.choiceArea).should('exist').and('be.visible');
                cy.get(commonInteractionSelectors.choiceArea).children(commonInteractionSelectors.qtiChoice).should('have.length.gt', 1);

                // we should see the add button
                cy.get(orderInteractionSelectors.addToSelection).should('exist').and('be.visible');

                // we should not see the remove button
                cy.get(orderInteractionSelectors.removeFromSelection).should('exist').and('not.be.visible');

                // we should not see any choice item in the right square
                cy.get(commonInteractionSelectors.resultArea).should('exist').and('be.visible');
                cy.get(commonInteractionSelectors.resultArea).children(commonInteractionSelectors.qtiChoice).should('have.length', 0);

                // the move before and after should not be visible at this time
                cy.get(orderInteractionSelectors.moveBefore).should('exist').and('not.be.visible');
                cy.get(orderInteractionSelectors.moveAfter).should('exist').and('not.be.visible');
            });
        });
    });
});
