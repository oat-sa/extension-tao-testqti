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

import '../../../_helpers/commands/setupCommands';
import '../../../_helpers/commands/cleanupCommands';
import '../../../_helpers/commands/navigationCommands';
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

        // basic elements
        cy.get(commonInteractionSelectors.qtiOrder).as('interaction').within(() => {
            cy.get(orderInteractionSelectors.choiceArea).as('choiceArea');
            cy.get(orderInteractionSelectors.resultArea).as('resultArea');
            cy.get(orderInteractionSelectors.addToSelection).as('addToSelection');
        });
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

    const firstChoiceSelector = '.qti-choice[data-identifier=choice_1]';
    const secondChoiceSelector = '.qti-choice[data-identifier=choice_2]';
    const thirdChoiceSelector = '.qti-choice[data-identifier=choice_3]';

    it.only('Interaction keeps adding order in result area', () => {
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
        cy.nextItem();

        // go backward
        cy.previousItem();

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

    it('Horizontal orientation basic features are working', () => {
        // go to horizontal orientation
        cy.nextItem();

        cy.get('@choiceArea').within(() => {
            cy.get(secondChoiceSelector).click();
            cy.get(thirdChoiceSelector).click();
            cy.get(firstChoiceSelector).click();
        });

        cy.get('@resultArea').within(() => {
            cy.get(firstChoiceSelector).should('visible').click();
            cy.get(secondChoiceSelector).should('visible');
            cy.get(thirdChoiceSelector).should('visible');
        });

        // choice1 selection activate remove action
        cy.get(orderInteractionSelectors.removeFromSelection).click();

        // choice1 is back again in choice area
        cy.get('@choiceArea').within(() => {
            cy.get(firstChoiceSelector).should('visible');
        });

        // select choice2
        cy.get('@resultArea').within(() => {
            cy.get(secondChoiceSelector).click();
        });

        cy.get(orderInteractionSelectors.moveAfter).click();

        cy.get('@resultArea').then(resultArea => {
            const secondChoice = resultArea[0].querySelector(secondChoiceSelector);
            const thirdChoice = resultArea[0].querySelector(thirdChoiceSelector);

            // second choice is after third choice
            expect(secondChoice.compareDocumentPosition(thirdChoice) & Node.DOCUMENT_POSITION_PRECEDING).to.not.equal(0);
        });
    });

    it('Random order list all choices', () => {
        // go to random choices test
        cy.nextItem();
        cy.nextItem();

        cy.get('@choiceArea').within(() => {
            for (let i = 1; i <= 7; i++) {
                cy.get(`.qti-choice[data-identifier=choice_${i}]`).should('visible');
            }
        });
    });

    it('Minimun and maximum selection instruction', () => {
        // go to random choices test
        cy.nextItem();
        cy.nextItem();

        cy.get('.instruction-container').children().first().should('have.class', 'feedback-info');
        
        // add two item to reach min requirement
        cy.get(firstChoiceSelector).click();
        cy.get(secondChoiceSelector).click();

        // min requirement should be success
        cy.get('.instruction-container').children().first().should('have.class', 'feedback-success');


        // cannot add more element
        cy.get(thirdChoiceSelector).click();

        cy.get('@choiceArea').within(() => {
            cy.get(thirdChoiceSelector).should('exist');
        });

        // max requirement should be warning
        cy.get('.instruction-container').children().first().next().should('have.class', 'feedback-warning');
    });
});