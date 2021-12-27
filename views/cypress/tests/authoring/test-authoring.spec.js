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
import urlsItems from '../../../../../taoItems/views/cypress/utils/urls';
import selectorsItems from '../../../../../taoItems/views/cypress/utils/selectors';
import pathsItems from '../../../../../taoItems/views/cypress/utils/paths';
import { getRandomNumber } from '../../../../../tao/views/cypress/utils/helpers';

describe('Test authoring', () => {
    const className = `Test E2E class ${getRandomNumber()}`;
    const classNameItems = `Test E2E class ${getRandomNumber()}`;
    const packagesPath = `${pathsItems.baseItemsPath}/fixtures/packages`;

    /**
     * Log in and wait for render
     * After @treeRender click root class
     */
    before(() => {
        // import item on page Items
        cy.log('setup Items page');
        cy.setup(selectorsItems.treeRenderUrl, selectorsItems.editClassLabelUrl, urlsItems.items, selectorsItems.root);
        cy.log('add class in Items page');
        cy.addClassToRoot(
            selectorsItems.root,
            selectorsItems.itemClassForm,
            classNameItems,
            selectorsItems.editClassLabelUrl,
            selectorsItems.treeRenderUrl,
            selectorsItems.addSubClassUrl
        );
        cy.log('select class');
        cy.selectNode(selectorsItems.root, selectorsItems.itemClassForm, classNameItems);
        cy.log('import to class');
        cy.importToSelectedClass(selectorsItems.importItem, `${packagesPath}/e2e_item.zip`, selectorsItems.importItemUrl, classNameItems);
        // go to page Tests
        cy.log('setup Tests page');
        cy.setup(selectors.treeRenderUrl, selectors.editClassLabelUrl, urls.tests, selectors.root);
    });

    /**
     * Visit the page Items
     * Delete test folder
     */ 
    after(() => {
        cy.intercept('POST', '**/edit*').as('edit');
        cy.visit(urlsItems.items);
        cy.wait('@edit');

        cy.deleteClassFromRoot(
            selectorsItems.root,
            selectorsItems.itemClassForm,
            selectorsItems.deleteClass,
            selectorsItems.deleteConfirm,
            classNameItems,
            selectorsItems.deleteClassUrl,
            true
        );
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

        it('Adds new section and test part', function () {
            cy.get(selectors.addSection).click();
            cy.get(selectors.addPart).click();
            cy.get('.section').should('have.length', 3);
            cy.get('.testpart').should('have.length', 2);
        });

        it('Adds item to the fist section', function () {
            cy.get(`.item-selection .class a[title="${classNameItems}"]`).last().click();
            cy.getSettled(`.item-selection .instance a[title="Test E2E item 1"]`).click();
            cy.get('.test-content #assessmentSection-1 .itemref-placeholder').click();
            cy.get('.test-content #assessmentSection-1 .itemrefs').contains('Test E2E item 1').should('exist');
        });

        it('Adds item to the second section', function () {
            cy.getSettled(`.item-selection .instance a[title="Test E2E item 1"]`).click();
            cy.get('.test-content  #assessmentSection-2 .itemref-placeholder').click();
            cy.get('.test-content #assessmentSection-2 .itemrefs').contains('Test E2E item 1').should('exist');
        });

        it('Adds item to the last section', function () {
            cy.getSettled(`.item-selection .instance a[title="Test E2E item 1"]`).click();
            cy.get('.test-content  #assessmentSection-3 .itemref-placeholder').click();
            cy.get('.test-content #assessmentSection-3 .itemrefs').contains('Test E2E item 1').should('exist');
        });

        it('Save test with items', function () {
            cy.intercept('POST', '**/saveTest*').as('saveTest');
            cy.get('[data-testid="save-test"]').click();
            cy.wait('@saveTest').its('response.body').its('saved').should('eq', true);
        });

        it('Deletes test class', function () {
            cy.visit(urls.tests);
            cy.deleteClassFromRoot(
                selectors.root,
                selectors.testClassForm,
                selectors.deleteClass,
                selectors.deleteConfirm,
                className,
                selectors.deleteTestUrl,
                false
            );
        });
    });
});
