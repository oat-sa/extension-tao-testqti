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

describe('Test', () => {
    const testDirectoryName = 'Lorem ipsum dolar sit amet dir';
    const testName = 'Lorem ipsum dolar sit amet name';

    beforeEach(() => {
        cy.fixture('urls').as('urls');

        cy.login();
    });

    it('should reach the tests page', function () {
        cy.visit(this.urls.root);

        cy.contains('Tests').click();
        cy.url().should('include', this.urls.tests);
    });

    it('should create class', function () {
        cy.visit(this.urls.tests);
        cy.contains('New class').click();

        cy.contains('Edit class');
        cy.contains('label', 'Label')
            .parent()
            .within(() => {
                cy.get('input').clear().type(testDirectoryName);
            });
        cy.get('form button[type="submit"]').click();

        cy.get('#tree-manage_tests')
            .within(() => {
                cy.contains(testDirectoryName);
            });
    });

    it('should create test', function () {
        cy.visit(this.urls.tests);

        cy.contains(testDirectoryName).click();
        cy.contains('Edit class');

        cy.contains('New test').click();

        cy.contains('Test properties').should('not.exist');
        cy.contains('Test properties');

        cy.contains('label', 'Label')
            .parent()
            .within(() => {
                cy.get('input').clear().type(testName);
            });
        cy.get('form button[type="submit"]').click();

        cy.get('#tree-manage_tests')
            .within(() => {
                cy.contains(testName).click();
            });

        cy.contains(testDirectoryName)
            .parent()
            .within(() => {
                cy.contains(testName);
            });
    });

    it('should update test', function() {
        cy.get('#tree-manage_tests')
            .within(() => {
                cy.contains(testName).click();
            });

        cy.contains('Authoring').click();

        cy.contains('h1', `${testDirectoryName} 1`)
            .within(() => {
                cy.get('[title="Manage test properties"]').click();
            });

        cy.get('input[name="test-identifier"]').clear().type('Test1234567890');
        cy.get('input[name="test-title"]').clear().type('Lorem ipsum');

        cy.contains('span', 'Save').click();
        cy.contains('span', 'Manage Tests').click();
        cy.contains('Test properties');
        cy.contains('Test properties').should('not.exist');
        cy.contains('Test properties');
        cy.contains('Test Saved');

        cy.contains(testName).click();
        cy.contains('Test properties').should('not.exist');
        cy.contains('Test properties');

        cy.contains('Test Saved').should('not.exist');
        cy.get('ul.content-action-bar')
            .within(() => {
                cy.contains('Authoring').click();
            });

        cy.contains('h1', 'Lorem ipsum')
            .within(() => {
                cy.get('[title="Manage test properties"]').click();
            });
        
        cy.get('input[name="test-identifier"]').invoke('val').should('eq', 'Test1234567890');
        cy.get('input[name="test-title"]').invoke('val').should('eq', 'Lorem ipsum');
    });

    it('should remove class', function () {
        cy.visit(this.urls.tests);

        cy.get('#tree-manage_tests')
            .within(() => {
                cy.contains(testDirectoryName).click();
            });

        cy.contains('Delete').click();
        cy.get('.preview-modal-feedback.opened')
            .within(() => {
                cy.contains('Ok').click();
            });

        cy.contains(testDirectoryName).should('not.exist');
    });

    afterEach(() => {
        cy.logout();
    });
});
