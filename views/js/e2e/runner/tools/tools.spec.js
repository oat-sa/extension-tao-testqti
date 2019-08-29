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

import '../../_helpers/commands/setupCommands';
import '../../_helpers/commands/pointerCommands';
import '../../_helpers/commands/cleanupCommands';
import '../../_helpers/routes/backOfficeRoutes';
import '../../_helpers/routes/runnerRoutes';

import base64Test from './fixtures/base64TestTakerToolsTestPackage';

/**
 * Re-login as guest and enter the test
 * Intended for the before hook of each tool's describe() block
 */
Cypress.Commands.add('resetAndEnterTest', function() {
    cy.setupServer();
    cy.addRunnerRoutes();
    cy.guestLogin();
    cy.startTest('e2e Tools test');
});

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
        cy.addBackOfficeRoutes();
        cy.login('admin');
        cy.importTestPackage(base64Test, 'e2e Tools test');
        cy.publishTest('e2e Tools test');
        cy.setDeliveryForGuests('e2e Tools test');
        cy.logout();
    });

    /**
     * Destroy everything we created during setup, leaving the environment clean for next time.
     */
    after(() => {
        cy.setupServer();
        cy.addBackOfficeRoutes();
        cy.guestLogout();
        cy.login('admin');
        cy.deleteItem('e2e Tools test');
        cy.deleteTest('e2e Tools test');
        cy.deleteDelivery('Delivery of e2e Tools test');
    });

    /**
     * Tools tests
     */
    describe('Test-Taker Tools', () => {

        describe('Comments tool', () => {

            before(() => {
                cy.resetAndEnterTest();
            });

            beforeEach(() => {
                // server & routes needed here for comment submission test
                cy.setupServer();
                cy.addRunnerRoutes();

                cy.get('.tools-box-list [data-control=comment] a').as('toolBtn');
                cy.get('[data-control=qti-comment]').as('popup');
                cy.get('[data-control=qti-comment-text]').as('textarea');
                cy.get('[data-control=qti-comment-send]').as('submitBtn');
                cy.get('[data-control=qti-comment-cancel]').as('cancelBtn');
            });

            it('loads', function() {
                cy.get('@toolBtn').should('have.length', 1).and('be.visible');
            });

            it('opens/closes', () => {
                // click tool => textarea visible
                cy.get('@toolBtn').click();
                cy.get('@popup').should('be.visible');
                // click tool => textarea closes
                cy.get('@toolBtn').click();
                cy.get('@popup').should('not.be.visible');
                // click tool => textarea visible
                cy.get('@toolBtn').click();
                // cancel => textarea closes
                cy.get('@cancelBtn').click();
                cy.get('@popup').should('not.be.visible');
            });

            it('submits', () => {
                // open it
                cy.get('@toolBtn').click();
                cy.get('@popup').should('be.visible');
                cy.get('@textarea').should('have.attr', 'placeholder', 'Your comment…');

                // empty => cannot submit
                cy.get('@submitBtn').click();
                cy.get('@popup').should('be.visible');
                // type text => can submit & close
                cy.get('@textarea').type('Blah blah blah');
                cy.get('@submitBtn').click();
                cy.get('@popup').should('not.be.visible');

                // xhr
                cy.wait('@comment').then((xhr) => {
                    assert.ok(xhr.response.body.success, 'comment response success true');
                });
            });
        });

        describe('Calculator tool', () => {

            before(() => {
                cy.resetAndEnterTest();
            });

            beforeEach(() => {
                cy.get('.tools-box-list [data-control=calculator] a').as('toolBtn');
                cy.get('.test-runner-scope .widget-calculator').as('calcContainer');
            });

            it('loads', function() {
                cy.get('@toolBtn').should('have.length', 1).and('be.visible');
                cy.get('@calcContainer').should('have.length', 1).and('be.empty').and('not.be.visible');
            });

            it('opens/closes', function() {
                // click tool => calc renders
                cy.get('@toolBtn').click();
                cy.get('@calcContainer').find('.dynamic-component-container').as('calc');
                cy.get('@calc').should('be.visible');
                cy.get('@calc').find('a[title="Close"]').as('closer');

                // click tool => hide
                cy.get('@toolBtn').click();
                cy.get('@calc').should('not.be.visible');
                // click tool => calc visible
                cy.get('@toolBtn').click();
                cy.get('@calc').should('be.visible');
                // click close => hide
                cy.get('@closer').click();
                cy.get('@calc').should('not.be.visible');
            });

            it('calculates', function() {
                // click tool => calc renders
                cy.get('@toolBtn').click();
                cy.get('@calcContainer').find('.dynamic-component-container').as('calc');
                cy.get('@calc').should('be.visible');
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

                // close it
                cy.get('@toolBtn').click();
            });

            it.skip('is dynamic (drag/resize)', function() {
                // open it
                cy.get('@toolBtn').click();
                cy.get('@calcContainer').find('.dynamic-component-container').as('calc');

                cy.get('@calc').within(() => {
                    // draggable
                    cy.get('.dynamic-component-title-bar').dragToPoint({x: 400, y: 250}, 'left');
                    // using approximate position values because pointer can't get right into corner of title bar
                    cy.root().invoke('data', 'x').should('be.gt', 385);
                    cy.root().invoke('data', 'y').should('be.gt', 75);

                    // resizable (to its minimum size)
                    cy.get('.dynamic-component-resize-wrapper').dragToPoint({x: 0, y: 0});
                    cy.root().invoke('width').should('equal', 148);
                    cy.root().invoke('height').should('equal', 218);
                });

                // close it
                cy.get('@toolBtn').click();
            });
        });

        describe('Zoom tool', () => {

            before(() => {
                cy.resetAndEnterTest();
            });

            beforeEach(() => {
                cy.get('.tools-box-list').within(() => {
                    cy.get('[data-control=zoomOut] a').as('zoomOut');
                    cy.get('[data-control=zoomIn] a').as('zoomIn');
                });
                cy.get('.test-runner-scope .qti-item').as('item');
            });

            it('loads', function() {
                cy.get('@zoomOut').should('have.length', 1).and('be.visible');
                cy.get('@zoomIn').should('have.length', 1).and('be.visible');
            });

            it('zooms in/out', function() {
                // zoom out
                cy.get('@zoomOut').click();
                cy.get('@item')
                    .should('have.class', 'transform-scale')
                    .and('have.attr', 'style').and('contain', 'scaleX(0.9)').and('contain', 'scaleY(0.9)');
                cy.get('@zoomOut').click();
                cy.get('@item')
                    .should('have.class', 'transform-scale')
                    .and('have.attr', 'style').and('contain', 'scaleX(0.8)').and('contain', 'scaleY(0.8)');

                // reset
                cy.get('@zoomIn').click();
                cy.get('@zoomIn').click();

                // zoom in
                cy.get('@zoomIn').click();
                cy.get('@item')
                    .should('have.class', 'transform-scale')
                    .and('have.attr', 'style').and('contain', 'scaleX(1.1)').and('contain', 'scaleY(1.1)');
                cy.get('@zoomIn').click();
                cy.get('@item')
                    .should('have.class', 'transform-scale')
                    .and('have.attr', 'style').and('contain', 'scaleX(1.2)').and('contain', 'scaleY(1.2)');

                // beyond the max! (2.0)
                for (let i = 0; i < 10; i++) {
                    cy.get('@zoomIn').click();
                }
                cy.get('@item')
                    .should('have.class', 'transform-scale')
                    .and('have.attr', 'style').and('contain', 'scaleX(2)').and('contain', 'scaleY(2)');

                // reset
                for (let i = 0; i < 10; i++) {
                    cy.get('@zoomOut').click();
                }
                cy.get('@item')
                    .should('not.have.class', 'transform-scale')
                    .should('have.css', 'transform', 'none');
            });
        });

        describe('Highlighter tool', () => {

            before(() => {
                cy.resetAndEnterTest();
            });

            beforeEach(() => {
                cy.get('.tools-box-list').within(() => {
                    cy.get('[data-control=highlight-trigger] a').as('trigger');
                    cy.get('[data-control=highlight-clear] a').as('clear');
                });
            });

            it('loads', function() {
                cy.get('@trigger').should('have.length', 1).and('be.visible');
                cy.get('@clear').should('have.length', 1).and('be.visible');
            });

            it('highlights (tool first)', function() {
                cy.get('.test-runner-scope .qti-item').within(() => {
                    // tool first mode
                    cy.get('@trigger').click();
                    cy.get('h1').selectText();
                    cy.get('h1').find('span.txt-user-highlight')
                        .contains('Tools')
                        .and('has.css', 'background-color', 'rgb(255, 255, 0)');

                    // clear
                    cy.get('@clear').click();
                    cy.get('.qti-itemBody').should('not.contain', 'span.txt-user-highlight');
                });
            });

            it('highlights (selection first)', function() {
                cy.get('.test-runner-scope .qti-item').within(() => {
                    // selection first mode
                    cy.get('.qti-prompt').selectText();
                    cy.get('@trigger').click();
                    cy.get('.qti-prompt').find('span.txt-user-highlight')
                        .contains('Here is the test for Answer Elimination and Answer Masking')
                        .and('has.css', 'background-color', 'rgb(255, 255, 0)');

                    // clear
                    cy.get('@clear').click();
                    cy.get('.qti-itemBody').should('not.contain', 'span.txt-user-highlight');
                });
            });

            it('turns off', function() {
                // turn on, off
                cy.get('@trigger').click();
                cy.get('@trigger').click();
                cy.get('.test-runner-scope .qti-item h1').selectText()
                    .should('not.contain', 'span.txt-user-highlight');
            });
        });

        describe('Line reader tool', () => {

            before(() => {
                cy.resetAndEnterTest();
            });

            beforeEach(() => {
                cy.get('.tools-box-list [data-control=line-reader] a').as('toolBtn');
            });

            it('loads', function() {
                cy.get('@toolBtn').should('have.length', 1).and('be.visible');
            });

            it('opens/closes', function() {
                cy.get('.test-runner-scope').within(() => {
                    // open/close toolBtn
                    cy.get('@toolBtn').click();
                    cy.get('.line-reader-mask').as('maskParts').should('have.length', 8).and('be.visible');
                    cy.get('.line-reader-overlay').as('overlay').should('be.visible');
                    cy.get('.line-reader-overlay .icon').as('outerDrag').should('be.visible');
                    cy.get('.line-reader-inner-drag').as('innerDrag').should('be.visible');
                    cy.get('.line-reader-closer').as('closer').should('be.visible');
                    cy.get('@maskParts').should('be.visible');
                    cy.get('@toolBtn').click();
                    cy.get('@maskParts').should('not.be.visible');

                    // open + closer
                    cy.get('@toolBtn').click();
                    cy.get('@maskParts').should('be.visible');
                    cy.get('@closer').click();
                    cy.get('@maskParts').should('not.be.visible');
                });
            });

            it.skip('is dynamic (drag/resize)', function() {
                // open it
                cy.get('@toolBtn').click();

                cy.get('.test-runner-scope').within(() => {
                    cy.get('.line-reader-overlay').as('overlay');
                    cy.get('.line-reader-inner-drag').as('innerDrag');

                    // draggable
                    cy.get('@overlay')
                        .dragToPoint({x: 500, y: 200})
                        .invoke('position').then(pos => {
                            cy.wrap(pos).its('left').should('equal', 0);
                            cy.wrap(pos).its('top').should('be.gt', 75);
                        });

                    // movable slot
                    cy.get('@innerDrag')
                        .dragToPoint({x: 600, y: 400})
                        .invoke('position').then(pos => {
                            cy.wrap(pos).its('left').should('be.gt', 40);
                            cy.wrap(pos).its('top').should('be.gt', 200);
                        });

                    // resizable (taller)
                    cy.get('.line-reader-mask.se .resize-control').dragToPoint({x: 1000, y: 600});
                    cy.get('@overlay').invoke('width').should('be.gt', 800);
                    // inner window height only knowable by sum:
                    cy.get('.line-reader-mask.ne').then($top => {
                        cy.get('.line-reader-mask.e').then($middle => {
                            cy.get('.line-reader-mask.se').then($bottom => {
                                expect($top.height() + $middle.height() + $bottom.height()).to.be.greaterThan(400);
                            });
                        });
                    });

                    // resizable inner (tall and thin)
                    cy.get('.line-reader-mask.e .resize-control').dragToPoint({x: 750, y: 500});
                    cy.get('.line-reader-mask.n').invoke('width').should('be.lt', 800);
                    cy.get('.line-reader-mask.e').invoke('height').should('be.gt', 200);
                });

                // close it
                cy.get('@toolBtn').click();
            });
        });

        describe('Answer masking tool', function() {

            before(() => {
                cy.resetAndEnterTest();
            });

            beforeEach(() => {
                cy.get('.tools-box-list [data-control=answer-masking] a').as('toolBtn');
            });

            after(() => {
                // close tool after final test
                cy.get('@toolBtn').click({ force: true });
            });

            it('loads', function() {
                cy.get('@toolBtn').should('have.length', 1).and('be.visible');
                cy.get('.qti-choice').as('choices').should('have.length', 4);
            });

            it('turns on/off', function() {
                // click tool => masks visible
                cy.get('@toolBtn').click();
                cy.get('.qti-choice.masked').should('have.length', 4);
                cy.get('.qti-choice.masked .answer-mask.masked').should('have.length', 4);
                // click tool => masks hidden
                cy.get('@toolBtn').click();
                cy.get('.qti-choice.masked').should('have.length', 0);
                cy.get('.qti-choice.masked .answer-mask.masked').should('have.length', 0);
            });

            it('controls single choice mask', function() {
                // click tool => masks visible
                cy.get('@toolBtn').click();

                // unmask first choice
                cy.get('.qti-choice.masked:eq(0) .answer-mask-toggle').as('toggle1');
                cy.get('@toggle1').click();
                cy.get('.qti-choice.masked').should('have.length', 3);
                cy.get('.qti-choice.masked .answer-mask.masked').should('have.length', 3);
                cy.get('.qti-choice:eq(0) .answer-mask').invoke('width').should('be.lt', 40);

                // remask first choice
                cy.get('@toggle1').click();
                cy.get('.qti-choice.masked').should('have.length', 4);
                cy.get('.qti-choice.masked .answer-mask.masked').should('have.length', 4);
                cy.get('.qti-choice:eq(0) .answer-mask').invoke('width').should('be.gt', 40);

                // see if choice is really covered (not clickable)
                // must be the last line in the test, further code will not be reached
                cy.get('.qti-choice:eq(0) .pseudo-label-box').isNotActionable();
            });
        });

        describe('Answer elimination tool', function() {

            before(() => {
                cy.resetAndEnterTest();
            });

            beforeEach(() => {
                cy.get('.tools-box-list [data-control=eliminator] a').as('toolBtn');
            });

            after(() => {
                // close tool after final test
                cy.get('@toolBtn').click({ force: true });
            });

            it('loads', function() {
                cy.get('@toolBtn').should('have.length', 1).and('be.visible');
            });

            it('turns on/off', function() {
                cy.get('.qti-itemBody').within(() => {
                    // turn on
                    cy.get('@toolBtn').click();
                    cy.get('.qti-choice [data-eliminable="container"]').should('have.length', 4).and('be.visible');
                    cy.get('.qti-choice [data-eliminable="trigger"]').should('have.length', 4).and('be.visible');

                    // turn off
                    cy.get('@toolBtn').click();
                    cy.get('.qti-choice [data-eliminable="container"]').should('have.length', 4).and('not.be.visible');
                    cy.get('.qti-choice [data-eliminable="trigger"]').should('have.length', 4).and('not.be.visible');
                });
            });

            it('eliminates single choice', function() {
                cy.get('.qti-itemBody').within(() => {
                    cy.get('.qti-choice:eq(0) [data-eliminable="trigger"]').as('firstTrigger');
                    cy.get('.qti-choice:eq(0) .label-box').as('firstLabel');

                    // turn on
                    cy.get('@toolBtn').click();

                    // eliminate first choice
                    cy.get('@firstTrigger').click();
                    cy.get('.qti-choice:eq(0)').should('have.class', 'eliminated');

                    // un-eliminate first choice
                    cy.get('@firstTrigger').click();
                    cy.get('.qti-choice:eq(0)').should('not.have.class', 'eliminated');
                    cy.get('@firstLabel').click();

                    // eliminate first choice again
                    cy.get('@firstTrigger').click();
                    cy.get('.qti-choice:eq(0)').should('have.class', 'eliminated');
                    // see if choice is really covered (not clickable)
                    // must be the last line in the test, further code will not be reached
                    cy.get('@firstLabel').isNotActionable()
                        .then(() => {
                            cy.log('yay');
                            cy.get('@firstTrigger').click();
                        });
                });
            });
        });

        describe('Area mask tool', function() {

            before(() => {
                cy.resetAndEnterTest();
            });

            beforeEach(() => {
                cy.get('.tools-box-list [data-control=area-masking] a').as('toolBtn');
            });

            it('loads', function() {
                cy.get('@toolBtn').should('have.length', 1).and('be.visible');
            });

            it('launches/destroys', function() {
                // click tool => areaMask renders
                cy.get('@toolBtn').click();
                cy.get('.test-runner-scope .mask-container').as('areaMaskContainer');
                cy.get('@areaMaskContainer').find('.mask').as('areaMask');
                cy.get('@areaMask').should('be.visible');
                cy.get('@areaMask').find('.inner').as('inner');
                cy.get('@areaMask').find('.controls .close').as('closer');
                cy.get('@areaMask').find('.controls .view').as('viewer');

                // click close => destroy
                cy.get('@closer').click();
                cy.get('@areaMaskContainer').should('not.exist');
            });

            it('unhides content', function() {
                // click tool => areaMask renders
                cy.get('@toolBtn').click();
                cy.get('.test-runner-scope .mask-container').as('areaMaskContainer');
                cy.get('@areaMaskContainer').find('.mask').as('areaMask');
                cy.get('@areaMask').find('.inner').as('inner');
                cy.get('@areaMask').find('.controls .close').as('closer');
                cy.get('@areaMask').find('.controls .view').as('viewer');

                // look through
                cy.get('@viewer').click();
                cy.get('@areaMaskContainer').should('have.class', 'previewing');
                cy.get('@inner').should('have.css', 'opacity', '0.15');
                // un-look through
                // the component uses a default delay of 3000ms before restoring the mask
                cy.wait(3000);
                cy.get('@areaMaskContainer').should('not.have.class', 'previewing');
                cy.get('@inner').should('have.css', 'opacity', '1');

                // click close => destroy
                cy.get('@closer').click();
            });

            it.skip('is dynamic (drag/resize)', function() {
                // open it
                cy.get('@toolBtn').click();

                cy.get('.test-runner-scope .mask-container').within(() => {
                    // draggable
                    cy.get('.dynamic-component-title-bar').dragToPoint({x: 400, y: 250}, 'left');
                    // using approximate position values because pointer can't get right into corner of title bar
                    cy.root().invoke('data', 'x').should('be.gt', '385');
                    cy.root().invoke('data', 'y').should('be.gt', '75');

                    // resizable
                    cy.get('.dynamic-component-resize-wrapper').dragToPoint({x: 700, y: 450});
                    cy.root().invoke('width').should('be.gt', '250');
                    cy.root().invoke('height').should('be.gt', '100');
                });

                // close it
                cy.get('@toolBtn').click();
            });

            it('can have multiple instances', function() {
                // add multiple instances (max 5)
                for (let i = 0; i < 6; i++) {
                    cy.get('@toolBtn').click();
                }
                cy.get('.test-runner-scope .mask-container').as('areaMaskContainer');
                cy.get('@areaMaskContainer').find('.mask').as('areaMask').should('have.length', 5);
                cy.get('@areaMask').find('.controls .close').as('closer');

                // clean up
                cy.get('@closer').should('have.length', 5);
                for (let i = 0; i < 5; i++) {
                    cy.get('@closer').first().click({ force: true });
                }
                cy.get('@areaMaskContainer').should('not.exist');
            });
        });

        //Note: the magnifier is tested last, because it duplicates the DOM and can break other tests
        describe('Magnifier tool', function() {

            before(() => {
                cy.resetAndEnterTest();
            });

            beforeEach(() => {
                // Even the toolBtn will be duplicated, when the magnifier is opened!
                cy.get('.tools-box-list [data-control=magnify] a').first().as('toolBtn');
            });

            it('loads', function() {
                cy.get('@toolBtn').should('have.length', 1).and('be.visible');
            });

            it('opens/closes', function() {
                // click tool => magnifier renders
                cy.get('@toolBtn').click();
                cy.get('.runner > .magnifier-container').as('magnifierContainer');
                cy.get('@magnifierContainer').find('.magnifier').first().as('magnifier');
                cy.get('@magnifier').should('be.visible');
                cy.get('@magnifier').find('[data-control="closeMagnifier"]').first().as('closer');

                // click tool => hide
                cy.get('@toolBtn').click();
                cy.get('@magnifier').should('not.be.visible');
                // click tool => magnifier visible
                cy.get('@toolBtn').click();
                cy.get('@magnifier').should('be.visible');
                // click close => hide
                cy.get('@closer').click();
                cy.get('@magnifier').should('not.be.visible');
            });

            it('zooms in/out', function() {
                // click tool => magnifier renders
                cy.get('@toolBtn').click();
                cy.get('.runner > .magnifier-container').as('magnifierContainer');
                cy.get('@magnifierContainer').find('.magnifier').first().as('magnifier');
                cy.get('@magnifier').find('.inner').first().as('inner');
                cy.get('@magnifier').find(':not(.inner) .control[data-control="zoomIn"]').as('magZoomIn');
                cy.get('@magnifier').find(':not(.inner) .control[data-control="zoomOut"]').as('magZoomOut');

                // contains inner item
                cy.get('@inner').find('.qti-itemBody').should('exist').and('be.visible');

                // initial transform scale applied (2x)
                cy.get('@inner').should('have.attr', 'style').and('contain', 'scale(2)');
                // zoom out (min zoom 2x)
                cy.get('@magZoomOut').click();
                cy.get('@inner').should('have.attr', 'style').and('contain', 'scale(2)');
                // zoom in (scales in 0.5 incrs)
                cy.get('@magZoomIn').click();
                cy.get('@inner').should('have.attr', 'style').and('contain', 'scale(2.5)');
                cy.get('@magZoomIn').click();
                cy.get('@inner').should('have.attr', 'style').and('contain', 'scale(3)');
                // zoom out
                cy.get('@magZoomOut').click();
                cy.get('@inner').should('have.attr', 'style').and('contain', 'scale(2.5)');
                // zoom in (max zoom 8x)
                for (let i = 0; i < 12; i++) {
                    cy.get('@magZoomIn').click();
                }
                // now 8.5x
                cy.get('@inner').should('have.attr', 'style').and('contain', 'scale(8)');

                // close it
                cy.get('@toolBtn').click();
            });

            it.skip('is dynamic (drag/resize)', function() {
                // open it
                cy.get('@toolBtn').click();

                cy.get('.runner > .magnifier-container').within(() => {
                    // draggable
                    cy.root().children('.dynamic-component-title-bar').dragToPoint({x: 400, y: 250}, 'left');
                    // using approximate position values because pointer can't get right into corner of title bar
                    cy.root().invoke('data', 'x').should('be.gt', '385');
                    cy.root().invoke('data', 'y').should('be.gt', '75');

                    // resizable
                    cy.root().children().children('.dynamic-component-resize-wrapper').dragToPoint({x: 700, y: 450});
                    cy.root().invoke('width').should('be.gt', '250');
                    cy.root().invoke('height').should('be.gt', '100');
                });

                // close it
                cy.get('@toolBtn').click();
            });
        });
    });
});
