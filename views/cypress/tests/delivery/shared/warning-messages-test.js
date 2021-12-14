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

import { goToNextItem, endTest } from '../../utils/navigation.js';
import { interactions, expectInteractions, toggleChoice, expectChoiceChecked } from '../../utils/interactions.js';

/**
 * Check that item is loaded (= navigation was finished successfully)
 * Use item interactions and section title to identify item
 * @param {string} sectionTitle
 * @param {string} interactionType
 */
function expectItemLoaded(sectionTitle, interactionType) {
    cy.get('[data-control="qti-test-position"]').contains(`Section ${sectionTitle}`);
    if (interactionType === 'choice') {
        expectInteractions('choiceInteraction', 2);
    } else {
        expectInteractions('textEntryInteraction', 1);
    }
}

function answerInteraction(interactionType) {
    if (interactionType === 'choice') {
        toggleChoice(0, 1);
        expectChoiceChecked(0, 1, true);
    } else {
        cy.get(interactions.textEntryInteraction).type('This is a text').should('have.value', 'This is a text');
    }
}

/**
 * Check dialog is shown
 * @param {string} title
 * @param {string} text
 * @param {Array<string>} buttons
 */
function expectDialog(title, text, buttons) {
    cy.get('.modal')
        .should('be.visible')
        .within(() => {
            cy.get('.message').should('have.text', `${title}${text}`);
            cy.get('.buttons button').should('have.length', buttons.length);
            buttons.forEach(btnText => {
                cy.get('.buttons button').contains(regexEqualCaseInsensitive(btnText));
            });
        });
}

function expectDialogClosed() {
    cy.get('.modal').should('not.exist');
}

function clickDialogButton(btnText) {
    cy.get('.modal .buttons button').contains(regexEqualCaseInsensitive(btnText)).click();
}

/**
 * Argument for 'cy.contains', to check case insensitive equality
 * @param {*} text
 * @returns {RegExp}
 */
function regexEqualCaseInsensitive(text) {
    return new RegExp(`^${text}$`, 'i');
}

const allowSkippingTitle = '';
const allowSkippingText = 'A response to this item is required.';
const allowSkippingButtons = ['ok'];

export function warningMessagesFirstLaunchSpecs() {
    describe('Display Next Part Warning', () => {
        it('if true, dialog on leaving test part when has unanswered', () => {
            const dialogTitle = 'You are about to submit this test part.';
            const dialogText =
                'There is 1 unanswered question in this part of the test. Click "SUBMIT THIS PART" to continue.';
            const dialogButtons = ['submit this part', 'cancel'];

            //first item in section, do not answer it
            expectItemLoaded('1-1', 'choice');
            goToNextItem();
            //second, last item in section, answer it
            expectItemLoaded('1-1', 'text');
            answerInteraction('text');
            goToNextItem();
            //dialog
            expectDialog(dialogTitle, dialogText, dialogButtons);
            //cancel dialog
            clickDialogButton(dialogButtons[1]);
            expectDialogClosed();
            goToNextItem();
            //dialog is shown again
            expectDialog(dialogTitle, dialogText, dialogButtons);
            //continue in dialog
            clickDialogButton(dialogButtons[0]);
            //first item of next test part is loaded
            expectItemLoaded('5-1', 'choice');
            expectDialogClosed();
        });
    });

    describe('Display Unanswered Warning', () => {
        it('if true, dialog on leaving test part when has unanswered', () => {
            const dialogTitle = 'You are about to submit this test part.';
            const dialogText =
                'There is 1 unanswered question in this part of the test. Click "SUBMIT THIS PART" to continue.';
            const dialogButtons = ['submit this part', 'cancel'];

            //first item in section, do not answer it
            expectItemLoaded('5-1', 'choice');
            goToNextItem();
            //second, last item in section, answer it
            expectItemLoaded('5-1', 'text');
            answerInteraction('text');
            goToNextItem();
            //dialog
            expectDialog(dialogTitle, dialogText, dialogButtons);
            //cancel dialog
            clickDialogButton(dialogButtons[1]);
            expectDialogClosed();
            goToNextItem();
            //dialog is shown again
            expectDialog(dialogTitle, dialogText, dialogButtons);
            //continue in dialog
            clickDialogButton(dialogButtons[0]);
            //first item of next test part is loaded
            expectItemLoaded('2-1', 'text');
            expectDialogClosed();
        });
    });

    describe('Hide Timed Section Warning', () => {
        it('if true, no dialog on leaving section when not timed out', () => {
            //first item in section
            expectItemLoaded('2-1', 'text');
            goToNextItem();
            //no dialog; first item of next test part is loaded
            expectItemLoaded('2-2', 'choice');
            expectDialogClosed();
        });
    });

    describe('Do not show alert on timeout', () => {
        it('if true, no dialog on leaving section when timed out', () => {
            //first item in section
            expectItemLoaded('2-2', 'choice');
            //advance clock to reach timeout, then wait to ensure timer code runs
            cy.clock().tick(60 * 1000);
            //no dialog; first item of next test part is loaded
            expectItemLoaded('3-1', 'text');
            expectDialogClosed();
        });
    });

    describe('Allow Skipping', () => {
        it('no dialog on moving from unanswered item if: item=true [section=false, part=false]', () => {
            expectItemLoaded('3-1', 'text');
            goToNextItem();
            //no dialog; next item is loaded
            expectItemLoaded('3-1', 'choice');
            expectDialogClosed();
        });

        it('dialog on moving from unanswered item if: on item=false [section=false, part=false]', () => {
            expectItemLoaded('3-1', 'choice');
            goToNextItem();
            //dialog
            expectDialog(allowSkippingTitle, allowSkippingText, allowSkippingButtons);
            //close dialog
            clickDialogButton(allowSkippingButtons[0]);
            expectDialogClosed();
            answerInteraction('choice');
            goToNextItem();
            //no dialog, next item is loaded
            expectItemLoaded('3-2', 'text');
            expectDialogClosed();
        });

        it('dialog on moving from unanswered item if: on item=false [section=true, part=false]', () => {
            expectItemLoaded('3-2', 'text');
            goToNextItem();
            //dialog
            expectDialog(allowSkippingTitle, allowSkippingText, allowSkippingButtons);
            //close dialog
            clickDialogButton(allowSkippingButtons[0]);
            expectDialogClosed();
            answerInteraction('text');
            goToNextItem();
            //no dialog, next item is loaded
            expectItemLoaded('4-1', 'choice');
            expectDialogClosed();
        });

        it('dialog on moving from unanswered item if: on item=false [section=true, part=true]', () => {
            expectItemLoaded('4-1', 'choice');
            goToNextItem();
            //dialog
            expectDialog(allowSkippingTitle, allowSkippingText, allowSkippingButtons);
            //close dialog
            clickDialogButton(allowSkippingButtons[0]);
            expectDialogClosed();
            answerInteraction('choice');
            goToNextItem();
            //no dialog, next item is loaded
            expectItemLoaded('4-2', 'text');
            expectDialogClosed();
        });

        it('dialog on moving from unanswered item if: on item=false [section=false, part=true]', () => {
            expectItemLoaded('4-2', 'text');
            endTest();
            //dialog
            expectDialog(allowSkippingTitle, allowSkippingText, allowSkippingButtons);
            //close dialog
            clickDialogButton(allowSkippingButtons[0]);
            expectDialogClosed();
            answerInteraction('text');
        });
    });

    describe('Display End Test Warning', () => {
        it('if true, dialog on ending test when has unanswered', () => {
            const dialogTitle = 'You are about to submit the test.';
            const dialogText =
                'There are 5 unanswered questions. You will not be able to access this test once submitted. ' +
                'Click "SUBMIT THE TEST" to continue and submit the test.';
            const dialogButtons = ['submit the test', 'cancel'];

            //last item in test
            expectItemLoaded('4-2', 'text');
            endTest();
            //dialog
            expectDialog(dialogTitle, dialogText, dialogButtons);
            //cancel dialog
            clickDialogButton(dialogButtons[1]);
            expectDialogClosed();
            endTest();
            //dialog is shown again
            expectDialog(dialogTitle, dialogText, dialogButtons);
            //continue in dialog
            clickDialogButton(dialogButtons[0]);
            //that test was actually ended should be checked afterwards
            expectDialogClosed();
        });
    });
}

export function warningMessagesSecondLaunchSpecs() {
    describe('Display Next Part Warning', () => {
        it('if true, dialog on leaving test part when all answered', () => {
            const dialogTitle = 'You are about to submit this test part. ';
            const dialogText = 'Click "SUBMIT THIS PART" to continue.';
            const dialogButtons = ['submit this part', 'cancel'];

            //first item in section, answer it
            expectItemLoaded('1-1', 'choice');
            answerInteraction('choice');
            goToNextItem();
            //second, last item in section, answer it
            expectItemLoaded('1-1', 'text');
            answerInteraction('text');
            goToNextItem();
            //dialog
            expectDialog(dialogTitle, dialogText, dialogButtons);
            //cancel dialog
            clickDialogButton(dialogButtons[1]);
            expectDialogClosed();
            goToNextItem();
            //dialog is shown again
            expectDialog(dialogTitle, dialogText, dialogButtons);
            //continue in dialog
            clickDialogButton(dialogButtons[0]);
            //first item of next test part is loaded
            expectItemLoaded('5-1', 'choice');
            expectDialogClosed();
        });
    });

    describe('Display Unanswered Warning', () => {
        it('if true, no dialog on leaving test part when all answered', () => {
            //first item in section, answer it
            expectItemLoaded('5-1', 'choice');
            answerInteraction('choice');
            goToNextItem();
            //second, last item in section, answer it
            expectItemLoaded('5-1', 'text');
            answerInteraction('text');
            goToNextItem();
            //no dialog; first item of next test part is loaded
            expectItemLoaded('2-1', 'text');
            expectDialogClosed();
        });
    });

    describe('Do not show alert on timeout', () => {
        it('if false, dialog on leaving section when timed out', () => {
            const dialogTitle = '';
            const dialogText = 'The time limit has been reached for this part of the test.';
            const dialogButtons = ['ok'];

            //first item in section
            expectItemLoaded('2-1', 'text');
            answerInteraction('text');
            //advance clock to reach timeout, then wait to ensure timer code runs
            cy.clock().tick(60 * 1000);
            //dialog
            expectDialog(dialogTitle, dialogText, dialogButtons);
            //continue in dialog
            clickDialogButton(dialogButtons[0]);
            //first item of next section is loaded
            expectItemLoaded('2-2', 'choice');
            expectDialogClosed();
        });
    });

    describe('Hide Timed Section Warning', () => {
        it('if false, dialog on leaving section when not timed out', () => {
            const dialogTitle = 'You are about to leave this section.';
            const dialogText =
                'You answered 1 of 1 question(s) for this section of the test. Click "Close this Section" to continue.' +
                'Once you close this section, you cannot return to it or change your answers.';
            const dialogButtons = ['close this section', 'review my answers'];

            //first item in section
            expectItemLoaded('2-2', 'choice');
            answerInteraction('choice');
            goToNextItem();
            //dialog
            expectDialog(dialogTitle, dialogText, dialogButtons);
            //cancel dialog
            clickDialogButton(dialogButtons[1]);
            expectDialogClosed();
            goToNextItem();
            //dialog is shown again
            expectDialog(dialogTitle, dialogText, dialogButtons);
            //continue in dialog
            clickDialogButton(dialogButtons[0]);
            //first item of next section is loaded
            expectItemLoaded('3-1', 'text');
            expectDialogClosed();
        });
    });

    describe('Display End Test Warning', () => {
        it('[chore] continue until last item', () => {
            expectItemLoaded('3-1', 'text');
            answerInteraction('text');
            goToNextItem();
            expectItemLoaded('3-1', 'choice');
            answerInteraction('choice');
            goToNextItem();
            expectItemLoaded('3-2', 'text');
            answerInteraction('text');
            goToNextItem();
            expectItemLoaded('4-1', 'choice');
            answerInteraction('choice');
            goToNextItem();
            expectItemLoaded('4-2', 'text');
        });

        it('if true, dialog on ending test when all answered', () => {
            const dialogTitle = 'You are about to submit the test. ';
            const dialogText =
                'You will not be able to access this test once submitted. Click "SUBMIT THE TEST" to continue and submit the test.';
            const dialogButtons = ['submit the test', 'cancel'];

            //last item in test
            expectItemLoaded('4-2', 'text');
            answerInteraction('text');
            endTest();
            //dialog
            expectDialog(dialogTitle, dialogText, dialogButtons);
            //cancel dialog
            clickDialogButton(dialogButtons[1]);
            expectDialogClosed();
            endTest();
            //dialog is shown again
            expectDialog(dialogTitle, dialogText, dialogButtons);
            //continue in dialog
            clickDialogButton(dialogButtons[0]);
            //that test was actually ended should be checked afterwards
            expectDialogClosed();
        });
    });
}
