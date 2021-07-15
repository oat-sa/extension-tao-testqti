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
    toggleChoice,
    expectChoiceChecked,
    toggleMatchChoice,
    expectMatchChoiceChecked
} from '../../utils/interactions.js'

export function basicLinearTestSpecs() {
    it('displays first item with choices', () => {
        cy.get('.qti-choiceInteraction').should('have.length', 2);
        cy.get('.qti-inlineChoiceInteraction').should('have.length', 2);

        cy.get('[data-identifier="choice_1"]').parents('.qti-choiceInteraction').find('li').should('have.length', 4);
        cy.get('[data-identifier="choice_5"]').parents('.qti-choiceInteraction').find('li').should('have.length', 4);
        cy.get('.qti-choiceInteraction input').should('not.be.checked');
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

    it('can move to the next', () => {
        goToNextItem();
    });

    it('can type a text', () => {
        const fixtureText = 'This is a text';

        cy.get('.qti-extendedTextInteraction .text-container').should('have.length', 1);
        cy.get('.qti-extendedTextInteraction .text-container').type(fixtureText);
        cy.get('.qti-extendedTextInteraction .text-container').should('have.value', fixtureText);

        cy.get('.qti-textEntryInteraction').should('have.length', 1);
        cy.get('.qti-textEntryInteraction').type(fixtureText);
        cy.get('.qti-textEntryInteraction').should('have.value', fixtureText);
    });

    it('can move to the next', () => {
        goToNextItem();
    });

    it('item with gap match', () => {
        cy.get('.qti-matchInteraction').should('have.length', 1);
        cy.get('.qti-matchInteraction').find('input').should('have.length', 8);
        cy.get('.qti-matchInteraction').find('input').should('not.be.checked');
        cy.get('.qti-matchInteraction').find('.instruction-container .feedback-success').should('have.length', 1);
        cy.get('.qti-matchInteraction').find('.instruction-container .feedback-warning').should('have.length', 0);


        toggleMatchChoice(0, 0, 0);
        toggleMatchChoice(0, 1, 1);
        toggleMatchChoice(0, 2, 1);
        toggleMatchChoice(0, 3, 0);

        cy.get('.qti-matchInteraction').find('.instruction-container .feedback-success').should('have.length', 1);

        toggleMatchChoice(0, 2, 0);
        toggleMatchChoice(0, 3, 1);

        cy.get('.qti-matchInteraction').find('.instruction-container .feedback-warning').should('have.length', 1);

        expectMatchChoiceChecked(0, 0, 0, true);
        expectMatchChoiceChecked(0, 0, 1, false);
        expectMatchChoiceChecked(0, 1, 0, false);
        expectMatchChoiceChecked(0, 1, 1, true);
        expectMatchChoiceChecked(0, 2, 0, false);
        expectMatchChoiceChecked(0, 2, 1, true);
        expectMatchChoiceChecked(0, 3, 0, true);
        expectMatchChoiceChecked(0, 3, 1, false);
    });

    it('can move to the next', () => {
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
