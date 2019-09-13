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

/**
 * Add routes for the runner
 */
Cypress.Commands.add('addRunnerRoutes', () => {
    // Register test runner routes
    cy.route('POST', /\/taoQtiTest\/Runner\/init\?\S+/).as('testRunnerInit');
    cy.route('POST', /\/taoQtiTest\/Runner\/move\?\S+/).as('testRunnerMove');
    cy.route('POST', /\/taoQtiTest\/Runner\/skip\?\S+/).as('testRunnerSkip');
    cy.route('GET',  /\/taoQtiTest\/Runner\/getItem\?\S+/).as('testRunnerGetItem');
    cy.route('POST', /\/taoQtiTest\/Runner\/comment\?\S+/).as('comment');
});
