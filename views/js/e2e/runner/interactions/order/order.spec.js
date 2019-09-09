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

import {commonInteractionSelectors, orderInteractionSelectors} from '../../../_helpers/selectors/interactionSelectors';
import {testNavigation} from '../../../_helpers/selectors/navigationSelectors';

import '../../../_helpers/commands/setupCommands';
import '../../../_helpers/commands/cleanupCommands';
import '../../../_helpers/routes/backOfficeRoutes';
import '../../../_helpers/routes/runnerRoutes';

import base64Test from './fixtures/orderInteractionTest';

describe('Order Interaction', () => {
    const testName = 'E2E Order Interaction Test';
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

    /**
     * Interaction tests
     */
    describe('Order interaction', () => {
        const firstChoiceSelector = '.qti-choice[data-identifier=choice_1]';
        const secondChoiceSelector = '.qti-choice[data-identifier=choice_2]';
        const thirdChoiceSelector = '.qti-choice[data-identifier=choice_3]';

        beforeEach(() => {
            cy.get(commonInteractionSelectors.qtiOrder).as('interaction').within(() => {
                cy.get(orderInteractionSelectors.choiceArea).as('choiceArea');
                cy.get(orderInteractionSelectors.resultArea).as('resultArea');
                cy.get(orderInteractionSelectors.addToSelection).as('addToSelection');
            });
        });

        it('Essential elements exist', () => {
            cy.get('@interaction').should('visible');
            cy.get('@resultArea').should('visible');
            cy.get('@addToSelection').should('visible');
        });

        it('Able to move choice between choice and result area', () => {
            // choice1 is not in result area
            cy.get('@resultArea').within(() => {
                cy.get(firstChoiceSelector).should('not.exist');
            });

            // choice1 is in choice area and after click it is not there anymore
            cy.get('@choiceArea').within(() => {
                cy.get(firstChoiceSelector).should('visible').click();
                cy.get(firstChoiceSelector).should('not.exist');
            });

            // choice1 is in result area
            cy.get('@resultArea').within(() => {
                cy.get(firstChoiceSelector).should('visible').click();
            });
            // choice1 selection activate remove action
            cy.get(orderInteractionSelectors.removeFromSelection).click();

            // choice1 is not in result box anymore
            cy.get('@resultArea').within(() => {
                cy.get(firstChoiceSelector).should('not.exist');
            });

            // choice1 went back to choice area
            cy.get('@choiceArea').within(() => {
                cy.get(firstChoiceSelector).should('visible');
            });
        });

        it('Interaction keep add order in result area', () => {
            cy.get('@choiceArea').within(() => {
                cy.get(secondChoiceSelector).click();
                cy.get(thirdChoiceSelector).click();
                cy.get(firstChoiceSelector).click();
            });

            cy.get('@resultArea').then(resultArea => {                
                const firstChoice = resultArea[0].querySelector(firstChoiceSelector);
                const secondChoice = resultArea[0].querySelector(secondChoiceSelector);
                const thirdChoice = resultArea[0].querySelector(thirdChoiceSelector);

                // second choice is before all of them
                expect(secondChoice.compareDocumentPosition(firstChoice) & Node.DOCUMENT_POSITION_FOLLOWING).to.not.equal(0);
                expect(secondChoice.compareDocumentPosition(thirdChoice) & Node.DOCUMENT_POSITION_FOLLOWING).to.not.equal(0);

                //third choice is before first one
                expect(thirdChoice.compareDocumentPosition(firstChoice) & Node.DOCUMENT_POSITION_FOLLOWING).to.not.equal(0);
            });
        });

        it('Able to reorder choices in result area', () => {
            cy.get('@choiceArea').within(() => {
                cy.get(firstChoiceSelector).click();
                cy.get(secondChoiceSelector).click();
                cy.get(thirdChoiceSelector).click();
            });

            cy.get('@resultArea').then(resultArea => {                
                const firstChoice = resultArea[0].querySelector(firstChoiceSelector);
                const secondChoice = resultArea[0].querySelector(secondChoiceSelector);
                const thirdChoice = resultArea[0].querySelector(thirdChoiceSelector);

                // first choice is before all of them
                expect(firstChoice.compareDocumentPosition(secondChoice) & Node.DOCUMENT_POSITION_FOLLOWING).to.not.equal(0);
                expect(firstChoice.compareDocumentPosition(thirdChoice) & Node.DOCUMENT_POSITION_FOLLOWING).to.not.equal(0);

                //second choice is before third one
                expect(secondChoice.compareDocumentPosition(thirdChoice) & Node.DOCUMENT_POSITION_FOLLOWING).to.not.equal(0);
            });

            // move third choice upper
            cy.get('@resultArea').within(() => {
                cy.get(thirdChoiceSelector).click();
            });
            cy.get(orderInteractionSelectors.moveBefore).click();
            cy.get('@resultArea').then(resultArea => {
                const firstChoice = resultArea[0].querySelector(firstChoiceSelector);
                const secondChoice = resultArea[0].querySelector(secondChoiceSelector);
                const thirdChoice = resultArea[0].querySelector(thirdChoiceSelector);

                // first choice is before all of them
                expect(firstChoice.compareDocumentPosition(secondChoice) & Node.DOCUMENT_POSITION_FOLLOWING).to.not.equal(0);
                expect(firstChoice.compareDocumentPosition(thirdChoice) & Node.DOCUMENT_POSITION_FOLLOWING).to.not.equal(0);

                //second choice is after third one
                expect(secondChoice.compareDocumentPosition(thirdChoice) & Node.DOCUMENT_POSITION_PRECEDING).to.not.equal(0);
            });

            //move first choice downer
            cy.get('@resultArea').within(() => {
                cy.get(firstChoiceSelector).click();
            });
            cy.get(orderInteractionSelectors.moveAfter).click();
            cy.get('@resultArea').then(resultArea => {
                const firstChoice = resultArea[0].querySelector(firstChoiceSelector);
                const secondChoice = resultArea[0].querySelector(secondChoiceSelector);
                const thirdChoice = resultArea[0].querySelector(thirdChoiceSelector);

               // third choice is before all of them
               expect(thirdChoice.compareDocumentPosition(firstChoice) & Node.DOCUMENT_POSITION_FOLLOWING).to.not.equal(0);
               expect(thirdChoice.compareDocumentPosition(secondChoice) & Node.DOCUMENT_POSITION_FOLLOWING).to.not.equal(0);

               // first choice is before second one
               expect(firstChoice.compareDocumentPosition(secondChoice) & Node.DOCUMENT_POSITION_FOLLOWING).to.not.equal(0);
            });

            //move first choice to the bottom
            cy.get(orderInteractionSelectors.moveAfter).click();
            cy.get('@resultArea').then(resultArea => {
                const firstChoice = resultArea[0].querySelector(firstChoiceSelector);
                const secondChoice = resultArea[0].querySelector(secondChoiceSelector);
                const thirdChoice = resultArea[0].querySelector(thirdChoiceSelector);

               // third choice is before all of them
               expect(thirdChoice.compareDocumentPosition(firstChoice) & Node.DOCUMENT_POSITION_FOLLOWING).to.not.equal(0);
               expect(thirdChoice.compareDocumentPosition(secondChoice) & Node.DOCUMENT_POSITION_FOLLOWING).to.not.equal(0);

               // first choice is after second one
               expect(firstChoice.compareDocumentPosition(secondChoice) & Node.DOCUMENT_POSITION_PRECEDING).to.not.equal(0);
            });
        });

        it('Interaction keeps state when move to next question', () => {
            cy.get('@choiceArea').within(() => {
                cy.get(secondChoiceSelector).click();
                cy.get(thirdChoiceSelector).click();
                cy.get(firstChoiceSelector).click();
            });

            // go forward
            cy.get(testNavigation.nextItem).click();
            cy.wait('@testRunnerGetItem');

            // go backward
            cy.get(testNavigation.previousItem).click();
            cy.wait('@testRunnerGetItem');

            // choices are in in the same orders
            cy.get('@resultArea').then(resultArea => {                
                const firstChoice = resultArea[0].querySelector(firstChoiceSelector);
                const secondChoice = resultArea[0].querySelector(secondChoiceSelector);
                const thirdChoice = resultArea[0].querySelector(thirdChoiceSelector);

                // second choice is before all of them
                expect(secondChoice.compareDocumentPosition(firstChoice) & Node.DOCUMENT_POSITION_FOLLOWING).to.not.equal(0);
                expect(secondChoice.compareDocumentPosition(thirdChoice) & Node.DOCUMENT_POSITION_FOLLOWING).to.not.equal(0);

                //third choice is before first one
                expect(thirdChoice.compareDocumentPosition(firstChoice) & Node.DOCUMENT_POSITION_FOLLOWING).to.not.equal(0);
            });
        });
    });
});