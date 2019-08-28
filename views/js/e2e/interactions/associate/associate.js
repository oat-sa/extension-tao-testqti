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

import interactionSelectors from '../../_helpers/selectors/interactionSelectors';

import '../../_helpers/commands/setupCommands';
import '../../_helpers/commands/cleanupCommands';
import '../../_helpers/routes/backOfficeRoutes';
import '../../_helpers/routes/runnerRoutes';

import base64Test from './fixtures/base64AssociateInteractionTestPackage';

describe('Tools', () => {

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
        cy.importTestPackage(base64Test, 'associate');
        cy.publishTest('associate');
        cy.setDeliveryForGuests('Delivery of associate');
        cy.logout();
    });

    /**
     * Log in & start the test
     */
    beforeEach(() => {
        cy.setupServer();
        cy.addRunnerRoutes();
        cy.guestLogin();
        cy.startTest('associate');
    });

    /**
     * Destroy everything we created during setup, leaving the environment clean for next time.
     */
    after(() => {
        cy.setupServer();
        cy.addBackOfficeRoutes();
        cy.login('admin');
        cy.deleteItem('associate');
        cy.deleteTest('associate');
        cy.deleteDelivery('Delivery of associate');
    });

    /**
     * Tools tests
     */
    describe('Sample associate interaction)', () => {
        it('item gets selected on click', function() {
            cy.get(interactionSelectors.associateArea).within(() => {
                cy.get(interactionSelectors.associate).first().click();
                cy.get(interactionSelectors.associate).first().should('have.class', 'user-selected');

            });
        });

        it('Should not allow multiple selection if disabled', function() {
            cy.get(interactionSelectors.interaction).contains('single selection').parents(interactionSelectors.interaction).within(() => {
                cy.get(interactionSelectors.associate).first().click();
                cy.get(interactionSelectors.associate).first().next().click();
                cy.get(interactionSelectors.associate).first().should('not.have.class', 'user-selected');
                cy.get(interactionSelectors.associate).first().next().should('have.class', 'user-selected');

            });
        });

        it('Should allow multiple selection if enabled', function() {
            cy.get(interactionSelectors.interaction).contains('multiple selection').parents(interactionSelectors.interaction).within(() => {
                cy.get(interactionSelectors.associate).first().click();
                cy.get(interactionSelectors.associate).first().next().click();
                cy.get(interactionSelectors.associate).first().should('have.class', 'user-selected');
                cy.get(interactionSelectors.associate).first().next().should('have.class', 'user-selected');

            });
        });
    });
});
