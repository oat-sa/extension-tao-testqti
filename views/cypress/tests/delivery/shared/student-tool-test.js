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

import { endTest, goToNextItem } from '../../utils/navigation.js';
import {
    expectInteractions,
    expectChoices,
    toggleChoice,
    expectChoiceChecked,
} from '../../utils/interactions.js';

const toolName = Object.freeze({
    calculator: 'calculator',
    mask: 'answer-masking',
    eliminator: 'eliminator',
    areaMask: 'area-masking',
    lineReader: 'line-reader',
    magnifier: 'magnify',
});

export function studentToolTest () {
    function openTool (name) {
        cy.get(`.tools-box-list [data-control=${name}]:not(.active) a`).first().should('have.length', 1).and('be.visible').click();
    }

    function closeTool (name) {
        cy.get(`.tools-box-list [data-control=${name}].active a`).first().should('have.length', 1).and('be.visible').click();
    }

    function createCalculatorAlias () {
        cy.get('.test-runner-scope .widget-calculator').and('not.be.visible').as('calcContainer');
        cy.get('@calcContainer').find('.dynamic-component-container').as('calc');
        cy.get('@calc').find('a[title="Close"]').as('closer');
    }

    after(() => {
        //only clicks end button: successful completion must be checked by the following test cases
        endTest();
    });

    describe('Calculator/Answer masking/Answer elimination', () => {
        before(() => {
            expectInteractions('choiceInteraction', 1);
            expectChoices(0, 4);
        });

        after(() => {
            goToNextItem();
        });

        describe('Calculator tool', () => {
            after(() => {
                closeTool(toolName.calculator);
            });

            it('opens/closes', function() {
                openTool(toolName.calculator);
                createCalculatorAlias();
                cy.get('@calc').find('.calcDisplay').as('display');
                cy.get('@calc').should('be.visible');
                closeTool(toolName.calculator);
                cy.get('@calc').should('not.be.visible');
                openTool(toolName.calculator);
                cy.get('@calc').should('be.visible');
                // click close => hide
                cy.get('@closer').click();
                cy.get('@calc').should('not.be.visible');
            });

            it('calculates', function() {
                openTool(toolName.calculator);
                createCalculatorAlias();
                cy.get('@calc').find('.calcDisplay').as('display');
                // 2 + 2 => 4
                cy.get('@calc').find('[data-key="2"]').click();
                cy.get('@calc').find('[data-key="+"]').click();
                cy.get('@calc').find('[data-key="2"]').click();
                cy.get('@calc').find('[data-key="="]').click();
                cy.get('@display').should('have.value', '4');
                // clear
                cy.get('@calc').find('[data-key="C"]').click();
                cy.get('@display').should('have.value', '0');
            });
        });

        describe('Answer masking tool', function() {
            after(() => {
                closeTool(toolName.mask);
            });

            it('turns on/off', function() {
                expectInteractions('choiceInteraction', 1);
                expectChoices(0, 4);
                openTool(toolName.mask);
                cy.get('.qti-choice.masked').should('have.length', 4);
                cy.get('.qti-choice.masked .answer-mask.masked').should('have.length', 4);
                closeTool(toolName.mask);
                cy.get('.qti-choice.masked').should('have.length', 0);
                cy.get('.qti-choice.masked .answer-mask.masked').should('have.length', 0);
            });

            it('controls single choice mask', function() {
                openTool(toolName.mask);
                // unmask first choice
                cy.get('.qti-choice.masked:eq(0) .answer-mask-toggle').as('toggle1');
                cy.get('@toggle1').click();
                cy.get('.qti-choice.masked').should('have.length', 3);
                cy.get('.qti-choice.masked .answer-mask.masked').should('have.length', 3);
                // remask first choice
                cy.get('@toggle1').click();
                cy.get('.qti-choice.masked').should('have.length', 4);
                cy.get('.qti-choice.masked .answer-mask.masked').should('have.length', 4);
                // see if choice is really covered (not clickable)
                cy.get('.pseudo-label-box').then(($el1) => {
                    cy.get('.answer-mask.masked').should(($el2) => {
                        expect($el2.width()).to.be.closeTo($el1.width(), 20);
                    });
                });
            });
        });

        describe('Answer elimination tool', function() {
            it('turns on/off', function() {
                openTool(toolName.eliminator);
                cy.get('.qti-choice [data-eliminable="container"]').should('have.length', 4).and('be.visible');
                closeTool(toolName.eliminator);
                expectChoices(0, 4);
                cy.get('.qti-choice [data-eliminable="container"]').should('have.length', 4).and('not.be.visible');
            });

            it('eliminates single choice', function() {
                openTool(toolName.eliminator);
                cy.get('.qti-choice').its(0).within(() => {
                    cy.get('[data-eliminable="trigger"]').as('firstTrigger');
                    // eliminate first choice
                    cy.get('@firstTrigger').click();
                    cy.get('.pseudo-label-box input:disabled').should('exist');
                    // un-eliminate first choice
                    cy.get('@firstTrigger').click();
                    cy.get('.pseudo-label-box input:disabled').should('not.exist');
                });
                toggleChoice(0, 0);
                expectChoiceChecked(0, 0, true);
            });
        });
    });

    describe('Calculator BODMAS/Area masking/Highlighter/Line reader', () => {
        after(() => {
            cy.get('.qti-extendedTextInteraction textarea').type('x');
            goToNextItem();
        });
        before(() => {
            expectInteractions('extendedTextInteraction', 1);
            expectInteractions('textEntryInteraction', 1);
        });
        describe('Calculator BODMAS tool', () => {
            after(() => {
                closeTool(toolName.calculator);
            });

            it('calculates', function() {
                openTool(toolName.calculator);
                createCalculatorAlias();
                cy.get('@calc').find('.calculator-screen').as('display');
                cy.get('@calc').should('be.visible');
                cy.get('@display').find('.term[data-value=0]').should('be.visible');

                // (1 + 2) * 3 => 9
                cy.get('@calc').find('[data-param="LPAR"]').click();
                cy.get('@calc').find('[data-param="NUM1"]').click();
                cy.get('@calc').find('[data-param="ADD"]').click();
                cy.get('@calc').find('[data-param="NUM2"]').click();
                cy.get('@calc').find('[data-param="RPAR"]').click();
                cy.get('@calc').find('[data-param="MUL"]').click();
                cy.get('@calc').find('[data-param="NUM3"]').click();
                cy.get('@calc').find('[data-command="execute"]').click();
                cy.get('@display').find('.term[data-value=9]').should('be.visible');
                // clear
                cy.get('@calc').find('[data-command="clear"]').click();
                cy.get('@display').find('.term[data-value=0]').should('be.visible');
            });
        });

        describe('Area mask tool', function() {
            function openMaskTool () {
                cy.get('.tools-box-list [data-control=area-masking] a').click();
            }

            function closeAreaMaskTool () {
                cy.get('@areaMask').last().find('.controls .close').click();
            }

            function createAliases () {
                cy.get('.test-runner-scope .mask-container').as('areaMaskContainer');
                cy.get('@areaMaskContainer').find('.mask').as('areaMask');
                cy.get('@areaMask').should('be.visible');
                cy.get('@areaMask').find('.inner').as('inner');
                cy.get('@areaMask').find('.controls .view').as('viewer');
            }

            it('launches/destroys', function() {
                openMaskTool();
                createAliases();
                cy.get('@areaMaskContainer').should('exist');
                closeAreaMaskTool();
                cy.get('@areaMaskContainer').should('not.exist');
            });

            it('unhides content', function() {
                openMaskTool();
                createAliases();
                // look through
                cy.get('@viewer').click();
                cy.get('@areaMaskContainer').should('have.class', 'previewing');
                cy.get('@inner').should('have.css', 'opacity', '0.15');
                // un-look through
                // the component uses a default delay of 3000ms before restoring the mask
                cy.wait(3000);
                cy.get('@areaMaskContainer').should('not.have.class', 'previewing');
                cy.get('@inner').should('have.css', 'opacity', '1');
                closeAreaMaskTool();
            });

            it('can have multiple instances', function() {
                // add multiple instances (max 5)
                for (let i = 0; i < 6; i++) {
                    openMaskTool();
                }
                createAliases();
                cy.get('@areaMask').should('have.length', 5);
                // clean up
                for (let i = 0; i < 5; i++) {
                    closeAreaMaskTool();
                }
                cy.get('.mask-container').should('not.exist');
            });
        });

        describe('Highlighter tool', () => {
            function highlight () {
                cy.get('.tools-box-list [data-control=highlight-trigger] a').click();
            }

            function clearHighlights () {
                cy.get('.tools-box-list [data-control=highlight-clear] a').click();
            }

            function selectRange (subject) {
                cy.wrap(subject).find('p').its(0).trigger('mousedown').then(($el) => {
                    const el = $el[0];
                    const document = el.ownerDocument;
                    const range = document.createRange();
                    range.selectNodeContents(el);
                    document.getSelection().removeAllRanges(range);
                    document.getSelection().addRange(range);
                }).trigger('mouseup');

                cy.document().trigger('selectionchange');
            }

            it('highlights (selection first)', function() {
                cy.get('.qti-item').within(($item) => {
                    selectRange($item);
                });
                highlight();
                cy.get('.qti-itemBody .txt-user-highlight').contains('lorem').and('has.css', 'background-color', 'rgb(255, 255, 0)');
                clearHighlights();
                cy.get('.qti-itemBody').should('not.contain', 'span.txt-user-highlight');
            });

            it('highlights (tool first)', function() {
                highlight();
                //selectText
                cy.get('.qti-item').within(($item) => {
                    selectRange($item);
                });
                cy.get('.qti-itemBody .txt-user-highlight').contains('Lorem').and('has.css', 'background-color', 'rgb(255, 255, 0)');
                clearHighlights();
                cy.get('.qti-itemBody').should('not.contain', 'span.txt-user-highlight');
            });
        });

        describe('Line reader tool', () => {
            function createAliases () {
                cy.get('.line-reader-mask').as('maskParts').should('have.length', 8).and('be.visible');
                cy.get('.line-reader-overlay').as('overlay').should('be.visible');
                cy.get('.line-reader-overlay .icon').as('outerDrag').should('be.visible');
                cy.get('.line-reader-inner-drag').as('innerDrag').should('be.visible');
                cy.get('.line-reader-closer').as('closer').should('be.visible');
            }

            it('opens/closes', function() {
                openTool(toolName.lineReader);
                createAliases();
                cy.get('@maskParts').should('be.visible');
                closeTool(toolName.lineReader);
                cy.get('@maskParts').should('not.be.visible');
                openTool(toolName.lineReader);
                cy.get('@maskParts').should('be.visible');
                cy.get('@closer').click();
                cy.get('@maskParts').should('not.be.visible');
            });
        });
    });

    describe('Scientific calculator/Zoom/Magnifier', () => {
        before(() => {
            expectInteractions('extendedTextInteraction', 1);
            expectInteractions('textEntryInteraction', 1);
        });

        describe('Scientific calculator tool', () => {
            function createAliases () {
                cy.get('.test-runner-scope .widget-calculator').and('not.be.visible').as('calcContainer');
                cy.get('@calcContainer').find('.dynamic-component-container').as('calc');
                cy.get('@calc').find('a[title="Close"]').as('closer');
                cy.get('@calc').find('.calculator-screen').as('display');
            }

            after(() => {
                closeTool(toolName.calculator);
            });

            it('opens/closes', function() {
                expectInteractions('extendedTextInteraction', 1);
                expectInteractions('textEntryInteraction', 1);
                openTool(toolName.calculator);
                createAliases();
                cy.get('@calc').should('be.visible');
                closeTool(toolName.calculator);
                cy.get('@calc').should('not.be.visible');
                openTool(toolName.calculator);
                cy.get('@calc').should('be.visible');
                cy.get('@closer').click();
                cy.get('@calc').should('not.be.visible');
            });

            it('calculates', function() {
                openTool(toolName.calculator);
                createAliases();
                cy.get('@calc').should('be.visible');
                cy.get('@display').should('have.value', '');
                // 3 to the 3 power => 27
                cy.get('@calc').find('[data-param="NUM3"]').click();
                cy.get('@calc').find('[data-param="POW NUM3"]').click();
                cy.get('@calc').find('[data-command="execute"]').click();
                cy.get('@display').contains('27');
                // clear
                cy.get('@calc').find('[data-command="clear"]').click();
                cy.get('@display').should('have.value', '');
            });
        });

        describe('Zoom tool', () => {
            function zoomIn () {
                cy.get('[data-control=zoomIn] a').should('have.length', 1).and('be.visible').click();
            }

            function zoomOut () {
                cy.get('[data-control=zoomOut] a').should('have.length', 1).and('be.visible').click();
            }

            function checkZoomValue (zoomValue) {
                cy.get('.qti-item').first().should('have.class', 'transform-scale').and('have.attr', 'style').and('contain', `scaleX(${zoomValue})`).and('contain', `scaleY(${zoomValue})`);
            }

            it('zooms in/out', function() {
                zoomOut();
                checkZoomValue(0.9);
                zoomOut();
                checkZoomValue(0.8);
                // reset
                zoomIn();
                zoomIn();
                // zoom in
                zoomIn();
                checkZoomValue(1.1);
                zoomIn();
                checkZoomValue(1.2);
                // beyond the max! (2.0)
                for (let i = 0; i < 10; i++) {
                    zoomIn();
                }
                checkZoomValue(2);
                // reset
                for (let i = 0; i < 10; i++) {
                    zoomOut();
                }
                cy.get('.qti-item').first().should('not.have.class', 'transform-scale').should('have.css', 'transform', 'none');
            });
        });

        //Note: the magnifier is tested last, because it duplicates the DOM and can break other tests
        describe('Magnifier tool', function() {
            function creatAliases () {
                cy.get('.runner > .magnifier-container').as('magnifierContainer');
                cy.get('@magnifierContainer').find('.magnifier').first().as('magnifier');
                cy.get('@magnifier').should('be.visible');
                cy.get('@magnifier').find('[data-control="closeMagnifier"]').first().as('closer');
                cy.get('@magnifier').find('.inner').first().as('inner');
            }

            function checkMagnifying (expectedMultiplicity) {
                cy.get('@inner').should('exist').and('be.visible').and('have.attr', 'style').and('contain', `scale(${expectedMultiplicity})`);
            }

            function zoomOut () {
                cy.get('@magnifier').find(':not(.inner) .control[data-control="zoomOut"]').click();
            }

            function zoomIn () {
                cy.get('@magnifier').find(':not(.inner) .control[data-control="zoomIn"]').click();
            }

            it('opens/closes', function() {
                openTool(toolName.magnifier);
                creatAliases();
                cy.get('@magnifier').should('be.visible');
                closeTool(toolName.magnifier);
                cy.get('@magnifier').should('not.be.visible');
                openTool(toolName.magnifier);
                cy.get('@magnifier').should('be.visible');
                // click close => hide
                cy.get('@closer').click();
                cy.get('@magnifier').should('not.be.visible');
            });

            it('zooms in/out', function() {
                openTool(toolName.magnifier);
                creatAliases();
                // initial transform scale applied (2x)
                checkMagnifying(2);
                // zoom out (min zoom 2x)
                zoomOut();
                checkMagnifying(2);
                // zoom in (scales in 0.5 incrs)
                zoomIn();
                checkMagnifying(2.5);
                zoomIn();
                checkMagnifying(3);
                // zoom out
                zoomOut();
                checkMagnifying(2.5);
                // zoom in (max zoom 8x)
                for (let i = 0; i < 12; i++) {
                    zoomIn();
                }
                // now 8.5x
                checkMagnifying(8);
                closeTool(toolName.magnifier);
            });
        });
    });
}
