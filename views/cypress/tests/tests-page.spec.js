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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA ;
 */
import urls from '../utils/urls';

describe('Tests Page', () => {
    /**
     * Log in
     * Visit the page
     */
    before(() => {
        cy.loginAsAdmin();
        cy.server();
        cy.route('POST', '**/edit*').as('edit');
        cy.visit(urls.tests);
        cy.wait('@edit', {
            requestTimeout: 10000
        });
    });

    describe('tests page', () => {
        it('should be Tests menu button', function () {
            cy.get('nav ul.main-menu li.active a span.icon-test').should('have.length', 1);
        });

        it('should be left panel with tests tree', function () {
            cy.get('div.taotree-test').find('ul').children().should('not.to.have.length', 0);
        });

        it('should be panel with action buttons', function () {
            cy.get('div.tree-action-bar-box').find('ul.action-bar').children().should('not.to.have.length', 0);
        });

        it('should be form with properties', function () {
            cy.get('section.content-container').find('form').should('have.length', 1);
        });

    });
});
