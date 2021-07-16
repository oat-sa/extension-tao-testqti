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

import { goToNextItem, endTest } from '../../utils/navigation.js'
import {
    interactions,
    expectInteractions,
    expectChoices,
    toggleChoice,
    expectChoiceChecked,
    toggleMatchChoice,
    expectMatchChoiceChecked
} from '../../utils/interactions.js'

export function basicLinearTestSpecs() {
    it('displays the first item with choices', () => {
        cy.get('.qti-item').within(() => {
            expectInteractions('choiceInteraction', 2);
            expectInteractions('inlineChoiceInteraction', 1);

            expectChoices(0, 4);
            expectChoices(1, 4);

            cy.get(interactions.choiceInteraction).find('input').should('not.be.checked');
        });
    });

    it('can select multiple choices', () => {
        toggleChoice(0, 1);
        toggleChoice(0, 2);

        expectChoiceChecked(0, 0, false);
        expectChoiceChecked(0, 1, true);
        expectChoiceChecked(0, 2, true);
        expectChoiceChecked(0, 3, false);
    });

    it('can only select one choice', () => {
        toggleChoice(1, 1);
        toggleChoice(1, 2);

        expectChoiceChecked(1, 0, false);
        expectChoiceChecked(1, 1, false);
        expectChoiceChecked(1, 2, true);
        expectChoiceChecked(1, 3, false);
    });

    it('can select an inline choice', () => {
        cy.get('select.qti-inlineChoiceInteraction').should('not.have.value');
        cy.get('.qti-inlineChoiceInteraction-dropdown').should('not.be.visible');

        cy.get('div.qti-inlineChoiceInteraction').click();
        cy.get('.qti-inlineChoiceInteraction-dropdown').should('be.visible');

        cy.get('.qti-inlineChoiceInteraction-dropdown li').eq(2).click();
        cy.get('select.qti-inlineChoiceInteraction').should('have.value', 'choice_10');
        cy.get('.qti-inlineChoiceInteraction-dropdown').should('not.be.visible');
    });

    it('can move to the next item', () => {
        goToNextItem();
    });

    it('displays the second item with text entries', () => {
        cy.get('.qti-item').within(() => {
            expectInteractions('extendedTextInteraction', 1);
            expectInteractions('textEntryInteraction', 1);

            cy.get(interactions.extendedTextInteraction).find('.text-container').should('have.value', '');
            cy.get(interactions.textEntryInteraction).should('have.value', '');
        });
    });

    it('can type a text', () => {
        const fixtureText = 'This is a text';

        cy.get(interactions.extendedTextInteraction).within(() => {
            cy.get('.text-container').type(fixtureText);
            cy.get('.text-container').should('have.value', fixtureText);
        });

        cy.get(interactions.textEntryInteraction).type(fixtureText);
        cy.get(interactions.textEntryInteraction).should('have.value', fixtureText);
    });

    it('can move to the next item', () => {
        goToNextItem();
    });

    it('displays the third item with match choices', () => {
        cy.get('.qti-item').within(() => {
            expectInteractions('matchInteraction', 1);

            cy.get(interactions.matchInteraction).within(() => {
                cy.get('input').should('have.length', 8);
                cy.get('input').should('not.be.checked');
                cy.get('.instruction-container .feedback-success').should('have.length', 1);
                cy.get('.instruction-container .feedback-warning').should('have.length', 0);
            });
        });
    });

    it('can select match choices', () => {
        toggleMatchChoice(0, 0, 0);
        toggleMatchChoice(0, 1, 1);
        toggleMatchChoice(0, 2, 1);
        toggleMatchChoice(0, 3, 0);

        cy.get(interactions.matchInteraction).find('.instruction-container .feedback-success').should('have.length', 1);

        toggleMatchChoice(0, 2, 0);
        toggleMatchChoice(0, 3, 1);

        cy.get(interactions.matchInteraction).find('.instruction-container .feedback-warning').should('have.length', 1);

        expectMatchChoiceChecked(0, 0, 0, true);
        expectMatchChoiceChecked(0, 0, 1, false);
        expectMatchChoiceChecked(0, 1, 0, false);
        expectMatchChoiceChecked(0, 1, 1, true);
        expectMatchChoiceChecked(0, 2, 0, false);
        expectMatchChoiceChecked(0, 2, 1, true);
        expectMatchChoiceChecked(0, 3, 0, true);
        expectMatchChoiceChecked(0, 3, 1, false);
    });

    it('can move to the next item', () => {
        goToNextItem();
    });

    it('displays the last item', () => {
        const fixtureText = 'This is the last item of the test';
        cy.get('.qti-item').should('have.length', 1);
        cy.get('.qti-item').should('contain', fixtureText);
    });

    it('finishes the test', () => {
        endTest();
    });
}
