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

import '../../_helpers/_routes/runnerRoutes';
import '../../_helpers/_routes/testExecutionRoutes';

import '../../_helpers/_setup/setupCommands';
import '../../_helpers/_cleanup/cleanupCommands';

import setupSelectors from '../../_helpers/_setup/setupSelectors';

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
        cy.addRoutes();
        cy.addExecutionRoutes();
        // cy.login('admin');
        // cy.importTestPackage('./fixtures/e2e_tools_test.zip');
        // cy.publishTest('e2e Tools test');
        // cy.setDeliveryForGuests('e2e Tools test');
        // cy.logout();
        cy.guestLogin();
        cy.startTest('e2e Tools test');
    });

    /**
     * Log in & start the test
     */
    beforeEach(() => {
        cy.setupServer();
        cy.addRoutes();
        cy.addExecutionRoutes();
        // cy.guestLogin();
        // cy.startTest('e2e Tools test');
    });

    /**
     * Log out
     */
    afterEach(() => {
        // cy.guestLogout();
    });

    /**
     * Destroy everything we created during setup, leaving the environment clean for next time.
     */
    after(() => {
        // cy.login('admin');
        // cy.deleteItem('e2e Tools test');
        // cy.deleteTest('e2e Tools test');
        // cy.deleteDelivery('Delivery of e2e Tools test');
    });

    /**
     * Tools tests
     */
    describe('Test-Taker Tools', () => {

        it('Has end test button', function() {
            cy.get('.navi-box-list').within(() => {
                // visible navigation buttons
                cy.get(setupSelectors.testNavigation.endTest).should('exist').and('be.visible');
            });
        });

        it('Has comments tool', function() {
            cy.get('.tools-box-list [data-control=comment]').within(() => {
                cy.get('a').as('toolBtn');
                cy.get('[data-control=qti-comment]').as('popup');
                cy.get('[data-control=qti-comment-text]').as('textarea');
                cy.get('[data-control=qti-comment-cancel]').as('cancelBtn');
                cy.get('[data-control=qti-comment-send]').as('submitBtn');

                // loaded?
                cy.get('@toolBtn').should('be.visible');
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
                // click tool => textarea visible
                cy.get('@toolBtn').click();
                cy.get('@popup').should('be.visible');
                cy.get('@textarea').should('have.attr', 'placeholder', 'Your comment…');
                // empty => cannot submit
                cy.get('@submitBtn').click();
                cy.get('@popup').should('be.visible');
                // type text => can submit
                cy.get('@textarea').type('Blah blah blah');
                // submit => textarea closes
                cy.get('@submitBtn').click();
                cy.get('@popup').should('not.be.visible');
                // xhr
                cy.wait('@comment').then((xhr) => {
                    assert.ok(xhr.response.body.success, 'comment response success true');
                });
            });
        });

        it('Has calculator tool', function() {
            cy.get('.tools-box-list').within(() => {
                cy.get('[data-control=calculator]').should('exist').and('be.visible');
            });
        });

        it('Has zoom tool', function() {
            cy.get('.tools-box-list').within(() => {
                cy.get('[data-control=zoomOut]').should('exist').and('be.visible');
                cy.get('[data-control=zoomIn]').should('exist').and('be.visible');
            });
        });

        it('Has highlighter tool', function() {
            cy.get('.tools-box-list').within(() => {
                cy.get('[data-control=highlight-trigger]').should('exist').and('be.visible');
                cy.get('[data-control=highlight-clear]').should('exist').and('be.visible');
            });
        });

        it('Has calculator tool', function() {
            cy.get('.tools-box-list').within(() => {
                cy.get('[data-control=calculator]').should('exist').and('be.visible');
            });
        });

        it('Has magnifier tool', function() {
            cy.get('.tools-box-list').within(() => {
                cy.get('[data-control=magnify]').should('exist').and('be.visible');
            });
        });

        it('Has line reader tool', function() {
            cy.get('.tools-box-list').within(() => {
                cy.get('[data-control=line-reader]').should('exist').and('be.visible');
            });
        });

        it('Has answer masking tool', function() {
            cy.get('.tools-box-list').within(() => {
                cy.get('[data-control=answer-masking]').should('exist').and('be.visible');
            });
        });

        it('Has answer elimination tool', function() {
            cy.get('.tools-box-list').within(() => {
                cy.get('[data-control=eliminator]').should('exist').and('be.visible');
            });
        });

        it('Has area mask tool', function() {
            cy.get('.tools-box-list').within(() => {
                cy.get('[data-control=area-masking]').should('exist').and('be.visible');
            });
        });
    });
});
