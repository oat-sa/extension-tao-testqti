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

import setupSelectors from "../selectors/setupSelectors";

Cypress.Commands.add('nextItem', () => {
    cy.log('COMMAND: nextItem');
    cy.get(setupSelectors.testNavigation.nextItem).click();
    cy.wait(['@testRunnerGet', '@testRunnerPost']);
});

Cypress.Commands.add('previousItem', () => {
    cy.log('COMMAND: previousItem');
    cy.get(setupSelectors.testNavigation.previousItem).click();
    cy.wait(['@testRunnerGet', '@testRunnerPost']);
});

Cypress.Commands.add('skipItem', () => {
    cy.log('COMMAND: skipItem');
    cy.get(setupSelectors.testNavigation.skipItem).click();
    cy.wait(['@testRunnerGet', '@testRunnerPost']);
});

Cypress.Commands.add('endTest', () => {
    cy.log('COMMAND: endTest');
    cy.get(setupSelectors.testNavigation.endTest).click();
    cy.wait('@testRunnerPost');
});

Cypress.Commands.add('skipAndEndTest', () => {
    cy.log('COMMAND: skipAndEndTest');
    cy.get(setupSelectors.testNavigation.skipAndEndTest).click();
    cy.wait('@testRunnerPost');
});

