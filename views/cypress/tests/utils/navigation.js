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
 * Base query selector for navigation buttons
 * @param {String} direction
 * @returns {String}
 */
function baseNavSelector(direction) {
    return `[data-control="${direction}"]`;
}

/**
 * Clicks the navigation control button
 * @param {String} selector
 */
function navigate(selector) {
    cy.get(selector).click();
}

/**
 * Query selectors for navigation buttons
 * @type {Object<String, String>}
 */
export const navigationSelectors = {
    goToNextItem: baseNavSelector('move-forward'),
    goToPreviousItem: baseNavSelector('move-backward'),
    skipToNextItem: baseNavSelector('skip'),
    endTest: baseNavSelector('move-end'),
    skipAndEndTest: baseNavSelector('skip-end')
};

/**
 * Navigates to the next item
 */
export function goToNextItem() {
    navigate(navigationSelectors.goToNextItem);
}

/**
 * Navigates to the previous item
 */
export function goToPreviousItem() {
    navigate(navigationSelectors.goToPreviousItem);
}

/**
 * Ends the test from the last item
 */
export function endTest() {
    navigate(navigationSelectors.endTest);
}

/**
 * Skips to the next item
 */
export function skipToNextItem() {
    navigate(navigationSelectors.skipToNextItem);
}

/**
 * Ends the test skipping the last item
 */
export function skipAndEndTest() {
    navigate(navigationSelectors.skipAndEndTest);
}
