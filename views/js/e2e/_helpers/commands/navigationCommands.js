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

import navigationSelectors from "../selectors/navigationSelectors";

/**
 * Navigation Commands
 */
Cypress.Commands.add('nextItem', () => {
    cy.log('COMMAND: nextItem');
    cy.get(navigationSelectors.testNavigation.nextItem).click();
    cy.wait(['@testRunnerMove', '@testRunnerGetItem']);
});

Cypress.Commands.add('previousItem', () => {
    cy.log('COMMAND: previousItem');
    cy.get(navigationSelectors.testNavigation.previousItem).click();
    cy.wait(['@testRunnerMove', '@testRunnerGetItem']);
});

Cypress.Commands.add('skipItem', () => {
    cy.log('COMMAND: skipItem');
    cy.get(navigationSelectors.testNavigation.skipItem).click();
    cy.wait(['@testRunnerSkip', '@testRunnerGetItem']);
});

Cypress.Commands.add('endTest', () => {
    cy.log('COMMAND: endTest');
    cy.get(navigationSelectors.testNavigation.endTest).click();
    cy.wait('@testRunnerMove');
});

Cypress.Commands.add('skipAndEndTest', () => {
    cy.log('COMMAND: skipAndEndTest');
    cy.get(navigationSelectors.testNavigation.skipAndEndTest).click();
    cy.wait('@testRunnerSkip');
});

