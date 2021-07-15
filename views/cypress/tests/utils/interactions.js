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

/**
 * Toggles the value of a choice in a choiceInteraction
 * @param {Number} interactionIndex - The index of the targeted choiceInteraction
 * @param {Number} choiceIndex - The index of the choice inside the targeted choiceInteraction
 */
export function toggleChoice(interactionIndex, choiceIndex) {
    cy.get('.qti-choiceInteraction')
        .eq(interactionIndex)
        .find('li.qti-choice .label-box')
        .eq(choiceIndex)
        .click();
}

/**
 * Checks the state of choice in a choiceInteraction
 * @param {Number} interactionIndex - The index of the targeted choiceInteraction
 * @param {Number} choiceIndex - The index of the choice inside the targeted choiceInteraction
 * @param {Boolean} isChecked - The expected state
 */
export function expectChoiceChecked(interactionIndex, choiceIndex, isChecked) {
    cy.get('.qti-choiceInteraction')
        .eq(interactionIndex)
        .find('li.qti-choice input')
        .eq(choiceIndex)
        .should(isChecked ? 'be.checked' : 'not.be.checked');
}

/**
 * Toggles the value of a choice in a matchInteraction
 * @param {Number} interactionIndex - The index of the targeted matchInteraction
 * @param {Number} rowIndex - The index of the row inside the targeted matchInteraction
 * @param {Number} columnIndex - The index of the column inside the targeted matchInteraction
 */
export function toggleMatchChoice(interactionIndex, rowIndex, columnIndex) {
    cy.get('.qti-matchInteraction')
        .eq(interactionIndex)
        .find('tbody tr')
        .eq(rowIndex)
        .find('td label')
        .eq(columnIndex)
        .click();
}

/**
 * Checks the state of a choice in a matchInteraction
 * @param {Number} interactionIndex - The index of the targeted matchInteraction
 * @param {Number} rowIndex - The index of the row inside the targeted matchInteraction
 * @param {Number} columnIndex - The index of the column inside the targeted matchInteraction
 * @param {Boolean} isChecked - The expected state
 */
export function expectMatchChoiceChecked(interactionIndex, rowIndex, columnIndex, isChecked) {
    cy.get('.qti-matchInteraction')
        .eq(interactionIndex)
        .find('tbody tr')
        .eq(rowIndex)
        .find('td input')
        .eq(columnIndex)
        .should(isChecked ? 'be.checked' : 'not.be.checked');
}
