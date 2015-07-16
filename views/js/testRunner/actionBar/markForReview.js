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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'jquery'
], function ($) {
    'use strict';

    /**
     * The local namespace used to isolate events related to this component
     * @type {String}
     * @private
     */
    var _ns = '.markForReview';

    /**
     * The DOM element representing the handled button
     * @type {jQuery}
     * @private
     */
    var $button = null;

    /**
     * Sets the visual state of the flag button
     * @param {Boolean} flagged
     * @private
     */
    var _setFlagButtonState = function(flagged) {
        $button.toggleClass('active', flagged);
    };

    /**
     * Installs the button
     *
     * @param {jQuery|String|HTMLElement} $btn The DOM element representing the button to handle
     * @param {Object} config The button related config
     * @param {Object} testContext The assessment test context object
     * @param {Object} testRunner The test runner instance
     */
    var initFlagButton = function initFlagButton($btn, config, testContext, testRunner) {
        var flagged = !!testContext.itemFlagged;

        $button = $($btn)
            .on('click' + _ns, function() {
                flagged = !flagged;
                testRunner.markForReview(flagged, testContext.itemPosition);
                _setFlagButtonState(flagged);
            });

        _setFlagButtonState(flagged);
    };

    /**
     * Uninstalls the button
     */
    var clearFlagButton = function clearFlagButton() {
        $button && $button.off(_ns);
        $button = null;
    };

    /**
     * Tells whether the button is visible or not
     * @param {Object} config The button related config
     * @param {Object} testContext The assessment test context object
     * @param {Object} testRunner The test runner instance
     * @returns {Boolean}
     */
    var isVisibleFlagButton = function isVisibleFlagButton(config, testContext) {
        return !!testContext.reviewScreen;
    };

    return {
        init : initFlagButton,
        clear : clearFlagButton,
        isVisible : isVisibleFlagButton
    };
});
