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
 * Copyright (c) 2021 Open Assessment Technologies SA ;
 */

/**
 * Navigates in the given direction by using one the navigation controls
 * @param {String } direction
 */
export function navigate(direction) {
    cy.get(`[data-control="move-${direction}"]`).click();
}

/**
 * Navigates to the next item
 */
export function goToNextItem() {
    navigate('forward');
}

/**
 * Navigates to the previous item
 */
export function goToPreviousItem() {
    navigate('backward');
}

/**
 * Ends the test from the last item
 */
export function endTest() {
    navigate('end');
}
