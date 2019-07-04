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

import _ from 'lodash';
import __ from 'i18n';
import pluginFactory from 'taoTests/runner/plugin';
import currentItemHelper from 'taoQtiTest/runner/helpers/currentItem';

var pluginName = 'validateResponses';

/**
 * Plugin
 * @returns {Object}
 */
export default pluginFactory({
    /**
     * Plugin name
     * @type {String}
     */
    name: pluginName,

    /**
     * Initialize plugin (called during runner's initialization)
     * @returns {this}
     */
    init: function init() {
        this.getTestRunner().before('move', function(e, direction) {
            var self = this;
            var testContext = this.getTestContext();
            var isInteracting = !this.getItemState(testContext.itemIdentifier, 'disabled');

            var testData = this.getTestData() || {};
            var testConfig = testData.config || {};
            var pluginConfig = _.defaults((testConfig.plugins || {})[pluginName] || {});

            if (!pluginConfig.validateOnPreviousMove && direction === 'previous') {
                return Promise.resolve();
            }

            if (isInteracting && testContext.enableValidateResponses && testContext.validateResponses) {
                return new Promise(function(resolve, reject) {
                    if (_.size(currentItemHelper.getDeclarations(self)) === 0) {
                        return resolve();
                    }
                    if (currentItemHelper.isAnswered(self, false)) {
                        return resolve();
                    }
                    if (!self.getState('alerted.notallowed')) {
                        // Only show one alert for itemSessionControl
                        self.setState('alerted.notallowed', true);
                        self.trigger('alert.notallowed', __('A valid response to this item is required.'), function() {
                            self.trigger('resumeitem');
                            reject();
                            self.setState('alerted.notallowed', false);
                        });
                    }
                });
            }
        });

        return this;
    }
});
