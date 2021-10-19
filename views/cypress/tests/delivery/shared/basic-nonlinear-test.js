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
 * Copyright (c) 2021 Open Assessment Technologies SA ;
 */

import {
    goToNextItem,
    goToPreviousItem,
    endTest,
    skipToNextItem,
    skipAndEndTest,
    navigationSelectors
} from '../../utils/navigation.js';
import {
    interactions,
    expectInteractions,
    expectChoices,
    toggleChoice,
    expectChoiceChecked
} from '../../utils/interactions.js';

function expectNavigationButton(selector, exists) {
    cy.get('.navi-box-list').within(() => {
        if (exists) {
            cy.get(selector).should('exist').and('be.visible');
        } else {
            if (selector === navigationSelectors.goToPreviousItem) {
                cy.get(selector).should('not.be.visible');
            } else {
                cy.get(selector).should('not.exist');
            }
        }
    });
}

export function basicNonLinearFirstLaunchSpecs() {
    it('displays the first item, with next/skip buttons', () => {
        //check that first item is loaded
        cy.get('.qti-item').within(() => {
            expectInteractions('choiceInteraction', 2);
            expectChoices(0, 4);
            expectChoiceChecked(0, 0, false);
            expectChoiceChecked(0, 1, false);
            expectChoiceChecked(0, 2, false);
            expectChoiceChecked(0, 3, false);
        });

        //existing buttons
        expectNavigationButton(navigationSelectors.goToNextItem, true);
        expectNavigationButton(navigationSelectors.skipToNextItem, true);

        //not existing buttons
        expectNavigationButton(navigationSelectors.goToPreviousItem, false);
        expectNavigationButton(navigationSelectors.endTest, false);
        expectNavigationButton(navigationSelectors.skipAndEndTest, false);
    });

    it('select an answer in the first item', () => {
        //later we will check if answer is restored or not
        toggleChoice(0, 1);
        toggleChoice(0, 2);

        expectChoiceChecked(0, 0, false);
        expectChoiceChecked(0, 1, true);
        expectChoiceChecked(0, 2, true);
        expectChoiceChecked(0, 3, false);
    });

    it('moves to the next item', () => {
        goToNextItem();
    });

    it('displays the second item, with previous/next/skip buttons', () => {
        //check that second item is loaded
        cy.get('.qti-item').within(() => {
            expectInteractions('textEntryInteraction', 1);
            cy.get(interactions.textEntryInteraction).should('have.value', '');
        });

        //existing buttons
        expectNavigationButton(navigationSelectors.goToNextItem, true);
        expectNavigationButton(navigationSelectors.skipToNextItem, true);
        expectNavigationButton(navigationSelectors.goToPreviousItem, true);

        //not existing buttons
        expectNavigationButton(navigationSelectors.endTest, false);
        expectNavigationButton(navigationSelectors.skipAndEndTest, false);
    });

    it('select an answer in the second item', () => {
        //later we will check if answer is restored or not
        cy.get(interactions.textEntryInteraction).type('This is a text');
        cy.get(interactions.textEntryInteraction).should('have.value', 'This is a text');
    });

    it('moves to the previous item', () => {
        goToPreviousItem();
    });

    it('answer in the first item is restored', () => {
        //we left first item with 'next' button, then returned to it
        expectInteractions('choiceInteraction', 2);
        expectChoiceChecked(0, 0, false);
        expectChoiceChecked(0, 1, true);
        expectChoiceChecked(0, 2, true);
        expectChoiceChecked(0, 3, false);
    });

    it('moves to the next item', () => {
        goToNextItem();
    });

    it('answer in the second item is restored', () => {
        //we left second item with 'previous' button, then returned to it
        expectInteractions('textEntryInteraction', 1);
        cy.get(interactions.textEntryInteraction).should('have.value', 'This is a text');
    });

    it('move to the last item', () => {
        //repeat until the last item
        goToNextItem();
        //check that third item is loaded
        cy.get('.qti-item').within(() => {
            expectInteractions('matchInteraction', 1);
        });
        goToNextItem();
    });

    it('displays the last item, with end/skip-end buttons', () => {
        //check that last item is loaded
        cy.get('.qti-item').should('exist').should('contain', 'This is the last item of the test');

        //existing buttons
        expectNavigationButton(navigationSelectors.endTest, true);
        expectNavigationButton(navigationSelectors.skipAndEndTest, true);
        expectNavigationButton(navigationSelectors.goToPreviousItem, true);

        //not existing buttons
        expectNavigationButton(navigationSelectors.goToNextItem, false);
        expectNavigationButton(navigationSelectors.skipToNextItem, false);
    });

    it('ends the test', () => {
        //only clicks end button: successful completion must be checked by the following test cases
        endTest();
    });
}

export function basicNonLinearSecondLaunchSpecs() {
    it('displays the first item', () => {
        //check that first item is loaded
        cy.get('.qti-item').within(() => {
            expectInteractions('choiceInteraction', 2);
            expectChoices(0, 4);
            expectChoiceChecked(0, 0, false);
            expectChoiceChecked(0, 1, false);
            expectChoiceChecked(0, 2, false);
            expectChoiceChecked(0, 3, false);
        });
        expectNavigationButton(navigationSelectors.skipToNextItem, true);
    });

    it('select an answer in the first item', () => {
        //later we will check if answer is restored or not
        toggleChoice(0, 1);
        toggleChoice(0, 2);

        expectChoiceChecked(0, 0, false);
        expectChoiceChecked(0, 1, true);
        expectChoiceChecked(0, 2, true);
        expectChoiceChecked(0, 3, false);
    });

    it('skips to the next item', () => {
        skipToNextItem();
    });

    it('displays the second item', () => {
        //check that second item is loaded
        cy.get('.qti-item').within(() => {
            expectInteractions('textEntryInteraction', 1);
        });
        expectNavigationButton(navigationSelectors.goToPreviousItem, true);
        //go back
        goToPreviousItem();
    });

    it('answer in the first item is discarded', () => {
        //we left first item with 'skip' button, then returned to it
        expectInteractions('choiceInteraction', 2);
        expectChoiceChecked(0, 0, false);
        expectChoiceChecked(0, 1, false);
        expectChoiceChecked(0, 2, false);
        expectChoiceChecked(0, 3, false);
    });

    it('move to the last item', () => {
        //repeat until the last item
        skipToNextItem();
        //check that second item is loaded
        cy.get('.qti-item').within(() => {
            expectInteractions('textEntryInteraction', 1);
        });
        skipToNextItem();
        //check that third item is loaded
        cy.get('.qti-item').within(() => {
            expectInteractions('matchInteraction', 1);
        });
        skipToNextItem();
    });

    it('displays the last item', () => {
        //check that last item is loaded
        cy.get('.qti-item').should('exist').should('contain', 'This is the last item of the test');
        expectNavigationButton(navigationSelectors.skipAndEndTest, true);
    });

    it('skips last item and ends the test', () => {
        //only clicks skip-end button: successful completion must be checked by the following test cases
        skipAndEndTest();
    });
}
