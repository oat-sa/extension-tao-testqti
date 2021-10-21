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
import selectors from '../utils/selectors';

describe('Test authoring', () => {
    const className = 'Test E2E class';

    /**
     * Log in and wait for render
     * After @treeRender click root class
     */
    before(() => {
        cy.setup(selectors.treeRenderUrl, selectors.editClassLabelUrl, urls.tests, selectors.root);
    });

    /**
     * Tests
     */
    describe('Add test section', () => {
        it('Creates a new test class', function () {
            cy.addClassToRoot(
                selectors.root,
                selectors.testClassForm,
                className,
                selectors.editClassLabelUrl,
                selectors.treeRenderUrl,
                selectors.addSubClassUrl
            );
        });

        it('Creates and rename a new test', function () {
            cy.selectNode(selectors.root, selectors.testClassForm, className)
                .addNode(selectors.testForm, selectors.addTest)
                .renameSelectedNode(selectors.testForm, selectors.editTestUrl, 'Test E2E test 1');
        });

        it('Authors the test', function () {
            cy.get(selectors.authoring).click();
            cy.location().should(loc => {
                expect(`${loc.pathname}${loc.search}`).to.eq(urls.testAuthoring);
            });
        });

        it('Adds new section and part', function () {
            cy.get(selectors.addSection).click();
            cy.get(selectors.addPart).click();
            cy.get('.section').should('have.length', 3);
            cy.get('.testpart').should('have.length', 2);
        });

        it('Deletes test class', function () {
            cy.visit(urls.tests);
            cy.deleteClassFromRoot(
                selectors.root,
                selectors.testClassForm,
                selectors.deleteClass,
                selectors.deleteConfirm,
                className,
                selectors.deleteTestUrl
            );
        });
    });
});
