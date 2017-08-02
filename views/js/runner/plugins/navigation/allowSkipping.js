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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */

/**
 * http://www.imsglobal.org/question/qtiv2p2p1/QTIv2p2p1-ASI-InformationModelv1p0/imsqtiv2p2p1_asi_v1p0_InfoModelv1p0.html#DerivedCharacteristic_ItemSessionControl.Attr_allowSkipping
 *
 * An item is defined to be skipped if the candidate has not provided any
 * response. In other words, all response variables are submitted with their
 * default value or are NULL. This definition is consistent with the
 * numberResponded operator available in outcomeProcessing. If 'false',
 * candidates are not allowed to skip the item, or in other words, they are not
 * allowed to submit the item until they have provided a non-default value for
 * at least one of the response variables. By definition, an item with no
 * response variables cannot be skipped. The value of this attribute is only
 * applicable when the item is in a testPart with individual submission mode.
 * Note that if allowSkipping is 'true' delivery engines must ensure that the
 * candidate can choose to submit no response, for example, through the
 * provision of a "skip" button.
 */

define([
    'lodash',
    'i18n',
    'taoTests/runner/plugin',
    'taoQtiTest/runner/helpers/currentItem'
], function(
    _,
    __,
    pluginFactory,
    currentItemHelper
) {
    'use strict';

    /**
     * Plugin factory
     * @returns {Object}
     */
    return pluginFactory({

        /**
         * Plugin name
         * @type {String}
         */
        name: 'allowSkipping',

        /**
         * Initialize plugin (called during runner's initialization)
         * @returns {this}
         */
        init: function init() {
            var self = this;
            var testRunner = this.getTestRunner();
            var toggle = toggleAllowSkipping.bind(this);

            toggle();

            testRunner
            .before('move', function () {
                if (!self.getState('enabled')) {
                    this.trigger('disablenav disabletools');

                    return new Promise(function (resolve, reject) {
                        if (currentItemHelper.isAnswered(testRunner, true)) {
                            return resolve();
                        }

                        if (!testRunner.getState('alerted.notallowed')) { // Only show one alert for itemSessionControl
                            testRunner.setState('alerted.notallowed', true);
                            testRunner.trigger(
                                'alert.notallowed',
                                __('A response to this item is required.'),
                                function () {
                                    testRunner.trigger('resumeitem');
                                    reject();
                                    testRunner.setState('alerted.notallowed', false);
                                }
                            );
                        }
                    });
                }
            })
            .after('move skip', function () {
                toggle();
            });

            return this;
        }
    });

    /**
     * Enables/disables plugin
     * @returns {this}
     */
    function toggleAllowSkipping() {
        var itemContext, testContext, testRunner;

        testRunner = this.getTestRunner();
        testContext = testRunner.getTestContext();

        // TODO: Get itemSessionControl qti variables from the current item -
        // which is where an individual item is determined to allow skipping.
        itemContext = { allowSkipping: true };

        if (testContext.allowSkipping && itemContext.allowSkipping) {
            return this.enable();
        }

        return this.disable();
    }
});