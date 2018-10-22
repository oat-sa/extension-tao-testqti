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
], function(_, __, pluginFactory, currentItemHelper) {
    'use strict';

    /**
     * Default plugin options
     * @type {Object}
     */
    var defaults = {
        allowPartial: true // whether all interactions must be answered to count an item as answered
    };

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
            this.getTestRunner()
                .before('nav-next move', function () {
                    var self          = this;
                    var testContext   = this.getTestContext();
                    var isInteracting = !this.getItemState(testContext.itemIdentifier, 'disabled');
                    var testData      = this.getTestData() || {};
                    var testConfig    = testData.config || {};
                    var pluginsConfig = testConfig.plugins || {};
                    var config        = _.defaults(pluginsConfig.allowSkipping || {}, defaults);
                    var warning       = config.allowPartial
                        ? __('A response to every question in this item is required.')
                        : __('A response to this item is required.');

                    if ( isInteracting && testContext.enableAllowSkipping && !testContext.allowSkipping ) {

                        return new Promise(function (resolve, reject) {
                            if(_.size(currentItemHelper.getDeclarations(self)) === 0){
                                return resolve();
                            }
                            if (currentItemHelper.isAnswered(self, config.allowPartial)) {
                                return resolve();
                            }

                            if (!self.getState('alerted.notallowed')) { // Only show one alert for itemSessionControl

                                self.setState('alerted.notallowed', true);
                                self.trigger(
                                    'alert.notallowed',
                                    warning,
                                    function () {
                                        self.trigger('resumeitem');
                                        reject();
                                        self.setState('alerted.notallowed', false);
                                    }
                                );
                            }
                        });
                    }
                });
        }
    });
});
