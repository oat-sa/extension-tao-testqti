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
 * http://www.imsglobal.org/question/qtiv2p2p1/QTIv2p2p1-ASI-InformationModelv1p0/imsqtiv2p2p1_asi_v1p0_InfoModelv1p0.html#DerivedCharacteristic_ItemSessionControl.Attr_validateResponses
 *
 * This attribute controls the behaviour of delivery engines when the candidate
 * submits an invalid response. An invalid response is defined to be a response
 * which does not satisfy the constraints imposed by the interaction with which
 * it is associated (see interaction for more information). When
 * validateResponses is turned on (true) then the candidates are not allowed to
 * submit the item until they have provided valid responses for all
 * interactions. When turned off (false) invalid responses may be accepted by
 * the system. The value of this attribute is only applicable when the item is
 * in a testPart with individual submission mode (see Navigation and
 * Submission).
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
     * Plugin
     * @returns {Object}
     */
    return pluginFactory({

        /**
         * Plugin name
         * @type {String}
         */
        name: 'validateResponses',

        /**
         * Initialize plugin (called during runner's initialization)
         * @returns {this}
         */
        init: function init() {
            var testRunner = this.getTestRunner();

            testRunner
            .before('move', function () {
                var testContext = testRunner.getTestContext();
                if (testContext.enableValidateResponses &&  testContext.validateResponses) {
                    this.trigger('disablenav disabletools');

                    return new Promise(function (resolve, reject) {
                        if(_.size(currentItemHelper.getDeclarations(testRunner)) === 0){
                            return resolve();
                        }
                        if (currentItemHelper.isAnswered(testRunner, false)) {
                            return resolve();
                        }
                        if (!testRunner.getState('alerted.notallowed')) { // Only show one alert for itemSessionControl
                            testRunner.setState('alerted.notallowed', true);
                            testRunner.trigger(
                                'alert.notallowed',
                                __('A valid response to this item is required.'),
                                function () {
                                    testRunner.trigger('resumeitem');
                                    reject();
                                    testRunner.setState('alerted.notallowed', false);
                                }
                            );
                        }
                    });
                }

            });

            return this;
        }
    });

});
