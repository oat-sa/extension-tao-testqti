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
    'i18n',
    'core/promise',
    'taoQtiItem/qtiItem/helper/pci',
    'taoTests/runner/plugin',
    'taoQtiItem/qtiItem/helper/container',
    'taoQtiTest/runner/plugins/content/dialog/itemInlineMessage',
    'taoQtiTest/runner/plugins/content/dialog/itemAlertMessage',
    'ui/autoscroll'
], function ($, _, __, Promise, pci, pluginFactory, containerHelper, inlineMessage, alertMessage, autoscroll) {
    'use strict';

    /**
     * Form of the feedback
     * by default dialog (modal) form
     */
    var messagePlugin;

    /**
     * Feedbacks to be displayed
     */
    var renderingQueue;

    var renderedFeedbacks;

    var isDestroyed;

    /**
     * Provide the feedbackMessage signature to check if the feedback contents should be considered equals
     *
     * @param {type} feedback
     * @returns {String}
     */
    var getFeedbackMessageSignature = function getFeedbackMessageSignature(feedback) {
        return ('' + feedback.body() + feedback.attr('title')).toLowerCase().trim().replace(/x-tao-[a-zA-Z0-9\-._\s]*/g, '');
    };

    /**
     * Extract the display information for an interaction-related feedback
     *
     * @private
     * @param {Object} interaction - a qti interaction object
     * @returns {Object} Object containing useful display information
     */
    function extractDisplayInfo(interaction) {

        var $interactionContainer = interaction.getContainer();
        var responseIdentifier = interaction.attr('responseIdentifier');
        var messageGroupId, $displayContainer;

        if (interaction.is('inlineInteraction')) {
            $displayContainer = $interactionContainer.closest('[class*=" col-"], [class^="col-"]');
            messageGroupId = $displayContainer.attr('data-messageGroupId');
            if (!messageGroupId) {
                //generate a messageFromId
                messageGroupId = _.uniqueId('inline_message_group_');
                $displayContainer.attr('data-messageGroupId', messageGroupId);
            }
        } else {
            messageGroupId = responseIdentifier;
            $displayContainer = $interactionContainer;
        }

        return {
            responseIdentifier: responseIdentifier,
            interactionContainer: $interactionContainer,
            displayContainer: $displayContainer,
            messageGroupId: messageGroupId,
            order: -1
        };
    }

    /**
     * Get interaction display information sorted in the order of appearance within the item
     *
     * @param {Object} item
     * @returns {Array}
     */
    function getInteractionsDisplayInfo(item) {

        var interactionsDisplayInfo = [];
        var $itemContainer = item.getContainer();
        var interactionOrder = 0;

        //extract all interaction related information needed to display their
        _.each(item.getComposingElements(), function (element) {
            if (element.is('interaction')) {
                interactionsDisplayInfo.push(extractDisplayInfo(element));
            }
        });

        //sort interactionsDisplayInfo on the item level
        $itemContainer.find('.qti-interaction').each(function () {
            var self = this;
            _.each(interactionsDisplayInfo, function (_interactionInfo) {
                if (_interactionInfo.interactionContainer[0] === self) {
                    _interactionInfo.order = interactionOrder;
                    return false;
                }
            });
            interactionOrder++;
        });
        interactionsDisplayInfo = _.sortBy(interactionsDisplayInfo, 'order');

        return interactionsDisplayInfo;
    }

    function getFeedbacks(item, itemSession) {

        var messages = {};
        var $itemContainer = item.getContainer();
        var $itemBody = $('.qti-itemBody', $itemContainer);
        var interactionsDisplayInfo = getInteractionsDisplayInfo(item);

        _.each(item.modalFeedbacks, function (feedback) {

            var feedbackIds, message, $container, comparedOutcome, _currentMessageGroupId, interactionInfo;
            var outcomeIdentifier = feedback.attr('outcomeIdentifier');
            var order = -1;

            //verify if the feedback should be displayed
            if (itemSession[outcomeIdentifier]) {

                //is the feedback in the list of feedbacks to be displayed ?
                feedbackIds = pci.getRawValues(itemSession[outcomeIdentifier]);
                if (_.indexOf(feedbackIds, feedback.id()) === -1) {
                    return true;//continue with next feedback
                }

                //which group of feedbacks (interaction related) the feedback belongs to ?
                message = getFeedbackMessageSignature(feedback);
                comparedOutcome = containerHelper.getEncodedData(feedback, 'relatedOutcome');
                interactionInfo = _.find(interactionsDisplayInfo, {responseIdentifier: comparedOutcome});
                if (comparedOutcome && interactionInfo) {
                    $container = interactionInfo.displayContainer;
                    _currentMessageGroupId = interactionInfo.messageGroupId;
                    order = interactionInfo.order;
                } else {
                    $container = $itemBody;
                    _currentMessageGroupId = '__item__';
                }
                //is this message already displayed ?
                if (!messages[_currentMessageGroupId]) {
                    messages[_currentMessageGroupId] = [];
                }
                if (_.indexOf(messages[_currentMessageGroupId], message) >= 0) {
                    return true; //continue
                } else {
                    messages[_currentMessageGroupId].push(message);
                }

                //ok, display feedback
                renderingQueue.push({
                    feedback: feedback,
                    $container: $container,
                    order: order
                });
            }
        });

        renderingQueue = _.sortBy(renderingQueue, 'order');

        return renderingQueue;
    }


    function destroyFeedback(selfPlugin, feedback) {

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
                selfPlugin.trigger('resume');
            }
        }
    }

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name: 'QtiModalFeedback',

        /**
         * Initialize the plugin (called during runner's init)
         *
         * @param content
         */
        init: function init(content) {
            var self = this;
            var testRunner = this.getTestRunner();

            isDestroyed = false;
            messagePlugin = content.inlineMessage ? inlineMessage : alertMessage;
            renderingQueue = [];
            renderedFeedbacks = [];

            renderingQueue = getFeedbacks(testRunner.itemRunner._item, content.itemSession);

            if (!renderingQueue.length) {
                self.trigger('resume');
            }

            if (content.inlineMessage) {

                testRunner
                    .off('plugin-resume.itemInlineMessage')
                    .on('plugin-resume.itemInlineMessage', function () {
                        self.destroy();
                    });
            } else {
                testRunner
                    .off('plugin-resume.itemAlertMessage')
                    .on('plugin-resume.itemAlertMessage', function (feedback) {
                        destroyFeedback(self, feedback);
                    });
            }
        },

        /**
         * Called during the runner's render phase
         */
        render: function render() {
            var self = this;
            var testRunner = this.getTestRunner();

            if (renderingQueue.length) {

                _.each(renderingQueue, function (renderingToken) {

                    var feedback = messagePlugin(testRunner, testRunner.getAreaBroker());
                    feedback.init({
                        dom: renderingToken.feedback.render({
                            inline: self.getContent().inlineMessage
                        }),
                        // for alerts will be used #modalMessages container
                        $container: self.getContent().inlineMessage ? renderingToken.$container : null
                    });
                    feedback.render();

                    renderedFeedbacks.push(feedback);
                });

                // auto scroll to the first feedback, only for the "inline" mode
                if (self.getContent().inlineMessage && renderedFeedbacks) {
                    autoscroll($('.qti-modalFeedback', testRunner.itemRunner._item.getContainer()).first(), this.getAreaBroker().getContentArea().parents('.content-wrapper'));
                }
            }
        },

        /**
         * Called during the runner's destroy phase
         * allow to run that function only once
         */
        destroy: function destroy() {
            var tFeedbacks, i;
            if (!isDestroyed) {
                isDestroyed = true;
                tFeedbacks = renderedFeedbacks.slice(0);
                for (i in tFeedbacks) {
                    destroyFeedback(this, tFeedbacks[i]);
                }
            }
        }
    });

});
