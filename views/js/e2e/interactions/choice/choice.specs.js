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
import '../../_helpers/routes/runnerRoutes';

import base64Test from './fixtures/base64ChoiceInteractionTestPackage';

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
        cy.addRoutes();
        cy.login('admin');
        cy.importTestPackage(base64Test, 'Sample choice interaction');
        cy.publishTest('Sample choice interaction');
        cy.setDeliveryForGuests('Sample choice interaction');
        cy.logout();
    });

    /**
     * Log in & start the test
     */
    beforeEach(() => {
        cy.guestLogin();
        // cy.startTest('e2e Tools test'); // TODO:
    });

    /**
     * Log out
     */
    afterEach(() => {
        cy.guestLogout();
    });

    /**
     * Destroy everything we created during setup, leaving the environment clean for next time.
     */
    after(() => {
        cy.guestLogout();
        cy.login('admin');
        cy.deleteItem('Sample choice interaction');
        cy.deleteTest('Sample choice interaction');
        cy.deleteDelivery('Sample choice interaction');
    });

    /**
     * Tools tests
     */
    describe('Sample choice interaction', () => {

        it('item contains at least one choice', function() {
            cy.get(interactionSelectors.choiceArea).contains(interactionSelectors.choice);
        });
    });
});
