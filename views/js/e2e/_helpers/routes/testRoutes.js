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
 * Add routes for test execution
 */
Cypress.Commands.add('addTestRoutes', () => {
    cy.route('POST', '/taoQtiTest/Runner/**').as('testRunnerPost'); // Should be done with a regex -> '/\/taoQtiTest\/Runner\/init\S+/'
    cy.route('GET', '/taoQtiTest/Runner/**').as('testRunnerGet'); // Should be done with a regex -> '/\/taoQtiTest\/Runner\/getItem\S+/'
});
