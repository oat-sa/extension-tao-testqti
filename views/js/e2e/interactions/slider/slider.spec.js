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

import {commonInteractionSelectors, sliderInteractionSelectors} from '../../_helpers/selectors/interactionSelectors';

import '../../_helpers/commands/setupCommands';
import '../../_helpers/commands/cleanupCommands';
import '../../_helpers/commands/pointerCommands';
import '../../_helpers/commands/navigationCommands';

import '../../_helpers/routes/backOfficeRoutes';
import '../../_helpers/routes/runnerRoutes';

import base64Test from './fixtures/base64SliderInteractionTest';

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
        cy.importTestPackage(base64Test, 'e2e slider interaction test');
        cy.publishTest('e2e slider interaction test');
        cy.setDeliveryForGuests('Delivery of e2e slider interaction test');
        cy.logout();
    });

    /**
     * Log in & start the test
     */
    beforeEach(() => {
        cy.setupServer();
        cy.addRunnerRoutes();
        cy.guestLogin();
        cy.startTest('e2e slider interaction test');
    });

    /**
     * Destroy everything we created during setup, leaving the environment clean for next time.
     */
    after(() => {
        cy.setupServer();
        cy.addBackOfficeRoutes();
        cy.login('admin');
        cy.deleteItem('e2e slider interaction test');
        cy.deleteTest('e2e slider interaction test');
        cy.deleteDelivery('Delivery of e2e slider interaction test');
    });

    /**
     * Interactions tests
     */
    describe('Slider interaction', () => {

        it('Loads in proper state', function () {
            cy.get(commonInteractionSelectors.interaction).within(() => {

                // check for the correct minimum and maximum values
                cy.get(sliderInteractionSelectors.labels).within(() => {
                    cy.get(sliderInteractionSelectors.minLabel).should('have.text', '0');
                    cy.get(sliderInteractionSelectors.maxLabel).should('have.text', '10');
                });

                // current value should be zero
                cy.get(sliderInteractionSelectors.currentValue).should('have.text', '0');
            });
        });

        it('Slides when dragged', function () {
            cy.get(commonInteractionSelectors.interaction).within(() => {
                cy.get(sliderInteractionSelectors.sliderHandle).dragToPoint({x: 500, y: 50});
                cy.get(sliderInteractionSelectors.currentValue).should('have.text', '5');
            });
        });

        it('Slides when clicked', function () {
            cy.get(commonInteractionSelectors.interaction).within(() => {
                cy.get(sliderInteractionSelectors.sliderBar).click('center', { force: true });
                cy.get(sliderInteractionSelectors.currentValue).should('have.text', '5');
            });
        });

        it('Step check', function () {
            cy.get(commonInteractionSelectors.interaction).within(() => {
                for (let step = 1; step < 10; step++) {
                    cy.get(sliderInteractionSelectors.sliderHandle).dragToPoint({x: step * 100, y: 0});
                    cy.get(sliderInteractionSelectors.currentValue).should('have.text', `${step}`);
                }
            });
        });

        it('Interaction keeps state', function () {
            cy.get(commonInteractionSelectors.interaction).within(() => {
                cy.get(sliderInteractionSelectors.sliderBar).click('center', {force: true});
                cy.get(sliderInteractionSelectors.currentValue).should('have.text', '5');
            });

            cy.nextItem();
            cy.previousItem();

            cy.get(commonInteractionSelectors.interaction).find(sliderInteractionSelectors.currentValue).should('have.text', '5');
        });
    });
});
