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
 * Copyright (c) 2016  (original work) Open Assessment Technologies SA;
 *
 * @author Alexander Zagovorichev <zagovorichev@1pt.com>
 */

/**
 * @see http://www.imsglobal.org/question/qtiv2p1/imsqti_implv2p1.html#section10008 modalFeedback
 */

define([
    'jquery',
    'lodash',
    'module',
    'taoTests/runner/plugin',
    'taoQtiTest/runner/plugins/content/dialog/itemInlineMessage',
    'taoQtiTest/runner/plugins/content/dialog/itemAlertMessage',
    'ui/autoscroll'
], function ($, _, module, pluginFactory, inlineMessage, alertMessage, autoscroll) {
    'use strict';

    /**
     * Modal or inline type of the messages
     */
    var inlineMode;

    /**
     * Form of the feedback
     * by default dialog (modal) form
     */
    var messagePlugin;

    /**
     * All feedback messages
     */
    var renderedFeedbacks;

    /**
     * modalFeedback was resolved and all components were destroyed
     */
    var isDestroyed;

    /**
     * Method which should be halted after modalFeedbacks confirmation action
     */
    var nextStep;

    function destroyFeedback(feedback) {

        var removed = false;
        _.remove(renderedFeedbacks, function (storedFeedback) {

            var found = storedFeedback === feedback;
            if (found) {
                removed = true;
            }
            return found;
        });

        if (removed) {
            feedback.destroy();

            if (!renderedFeedbacks.length) {
                nextStep();
            }
        }
    }

    function defineMode(inline) {
        inlineMode = inline;
        messagePlugin = inlineMode ? inlineMessage : alertMessage;
    }

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name: 'QtiModalFeedback',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            nextStep = function(){};

            defineMode(!!module.config().inlineModalFeedback);
        },

        /**
         * Called during the runner's render phase
         */
        render: function render() {
            var self = this;
            var testRunner = this.getTestRunner();

            var createMessages = function createMessages(renderingQueue, inline){

                var bInlineMode = inlineMode;

                isDestroyed = false;
                renderedFeedbacks = [];

                if (_.isBoolean(inline)) {
                    defineMode(inline);
                }

                if (renderingQueue.length) {

                    _.forEach(renderingQueue, function (renderingToken) {

                        var feedback = messagePlugin(testRunner, testRunner.getAreaBroker());
                        feedback.init({
                            dom: renderingToken.feedback.render({
                                inline: inlineMode
                            }),
                            // for alerts will be used #modalMessages container
                            $container: inlineMode ? renderingToken.$container : null
                        });
                        feedback.render();

                        renderedFeedbacks.push(feedback);
                    });

                    // auto scroll to the first feedback, only for the "inline" mode
                    if (inlineMode && renderedFeedbacks) {
                        autoscroll($('.qti-modalFeedback', testRunner.getAreaBroker().getContentArea()).first(), testRunner.getAreaBroker().getContentArea().parents('.content-wrapper'));
                    }
                } else {
                    nextStep();
                }

                // restore global feedback mode
                defineMode(bInlineMode);
            };

            if (inlineMode) {
                testRunner
                    .off('plugin-resume.itemInlineMessage')
                    .on('plugin-resume.itemInlineMessage', function () {
                        self.destroy();
                    });
            } else {
                testRunner
                    .off('plugin-resume.itemAlertMessage')
                    .on('plugin-resume.itemAlertMessage', function (feedback) {
                        destroyFeedback(feedback);
                    });
            }

            testRunner.on('modalFeedbacks', function(renderingQueue, done, inline) {
                nextStep = done;
                createMessages(renderingQueue, inline);
            });
        },

        /**
         * Called during the runner's destroy phase
         * allow to run that function only once
         */
        destroy: function destroy() {
            var tFeedbacks, i;
            if (!isDestroyed) {
                isDestroyed = true;

                if (!renderedFeedbacks) {
                    nextStep();
                } else {
                    tFeedbacks = renderedFeedbacks.slice(0);
                    for (i in tFeedbacks) {
                        destroyFeedback(tFeedbacks[i]);
                    }
                }
            }
        }
    });
});
