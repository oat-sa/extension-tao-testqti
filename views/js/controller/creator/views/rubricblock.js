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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'ui/hider',
    'util/namespace',
    'taoQtiTest/controller/creator/views/actions',
    'helpers',
    'ckeditor',
    'taoQtiTest/controller/creator/encoders/dom2qti',
    'taoQtiTest/controller/creator/helpers/ckConfigurator',
    'taoQtiTest/controller/creator/helpers/qtiElement'
], function ($, _, hider, namespaceHelper, actions, helpers, ckeditor, Dom2QtiEncoder, ckConfigurator, qtiElementHelper) { // qtiClasses, creatorRenderer, XmlRenderer, simpleParser){
    'use strict';

    //compute ckeditor config only once
    var ckConfig = ckConfigurator.getConfig(ckeditor, 'qtiBlock');

    function filterPlugin(plugin) {
        return _.contains(['taoqtiimage', 'taoqtimedia', 'taoqtimaths', 'taoqtiinclude'], plugin);
    }

    ckConfig.plugins = _.reject(ckConfig.plugins.split(','), filterPlugin).join(',');
    ckConfig.extraPlugins = _.reject(ckConfig.extraPlugins.split(','), filterPlugin).join(',');

    /**
     * The rubriclockView setup RB related components and behavior
     *
     * @exports taoQtiTest/controller/creator/views/rubricblock
     */
    return {
        /**
         * Set up a rubric block: init action behaviors. Called for each one.
         *
         * @param {jQueryElement} $rubricBlock - the rubric block to set up
         * @param {Object} model - the rubric block data
         */
        setUp: function setUp($rubricBlock, model) {
            //we need to synchronize the ck elt with an hidden elt that has data-binding
            var $rubricBlockBinding = $('.rubricblock-binding', $rubricBlock);
            var $rubricBlockContent = $('.rubricblock-content', $rubricBlock);
            var syncRubricBlockContent = _.throttle(function () {
                $rubricBlockBinding
                    .html($rubricBlockContent.html())
                    .trigger('change');
            }, 100);
            var editor;

            /**
             * Bind a listener only related to this rubric.
             * @param {jQuery} $el
             * @param {String} eventName
             * @param {Function} cb
             * @returns {jQuery}
             */
            function bindEvent($el, eventName, cb) {
                eventName = namespaceHelper.namespaceAll(eventName, model.uid);
                return $el.off(eventName).on(eventName, cb);
            }

            function updateContent() {
                $rubricBlockContent.html(Dom2QtiEncoder.encode(model.content));
                syncRubricBlockContent();
            }

            /**
             * Perform some binding once the property view is created
             * @private
             * @param {propView} propView - the view object
             */
            function propHandler(propView) {
                var $view = propView.getView();
                var $feedbackOutcomeLine = $('.rubric-feedback-outcome', $view);
                var $feedbackMatchLine = $('.rubric-feedback-match-value', $view);

                function changeFeedback(feedback) {
                    var activated = feedback && feedback.activated;
                    var wrapper = qtiElementHelper.lookupElement(model, 'rubricBlock.div.feedbackBlock', 'content');
                    hider.toggle($feedbackOutcomeLine, activated);
                    hider.toggle($feedbackMatchLine, activated);

                    if (activated) {
                        // wrap the actual content into a feedbackBlock if needed
                        if (!wrapper) {
                            model.content = [qtiElementHelper.create('div', {
                                content: [qtiElementHelper.create('feedbackBlock', {
                                    outcomeIdentifier: feedback.outcome,
                                    identifier: feedback.matchValue,
                                    content: model.content
                                })]
                            })];
                        } else {
                            wrapper.outcomeIdentifier = feedback.outcome;
                            wrapper.identifier = feedback.matchValue;
                        }
                        updateContent();
                        // $('[name="feedback-outcome"]', $view).val(feedback.outcome);
                        // $('[name="feedback-match-value"]', $view).val(feedback.matchValue);
                    } else {
                        // remove the feedbackBlock wrapper, just keep the actual content
                        if (wrapper) {
                            model.content = wrapper.content;
                            updateContent();
                        }
                    }
                }

                function removePropHandler() {
                    model.feedback = {};
                    if (propView !== null) {
                        propView.destroy();
                    }
                }

                function changeHandler(e, changedModel) {
                    if (e.namespace === 'binder' && changedModel['qti-type'] === 'rubricBlock') {
                        changeFeedback(changedModel.feedback);
                    }
                }

                $('[name=type]', $view).select2({
                    minimumResultsForSearch: -1,
                    width: '100%'
                });

                $view.on('change.binder', changeHandler);
                bindEvent($rubricBlock.parents('.testpart'), 'delete', removePropHandler);
                bindEvent($rubricBlock.parents('.section'), 'delete', removePropHandler);
                bindEvent($rubricBlock, 'delete', removePropHandler);

                changeFeedback(model.feedback);
                rbViews($view);
            }

            /**
             * Set up the views select box
             * @private
             * @param {jQuerElement} $propContainer - the element container
             */
            function rbViews($propContainer) {
                var $select = $('[name=view]', $propContainer);

                bindEvent($select.select2({'width': '100%'}), "select2-removed", function () {
                    if ($select.select2('val').length === 0) {
                        $select.select2('val', [1]);
                    }
                });

                if ($select.select2('val').length === 0) {
                    $select.select2('val', [1]);
                }
            }

            model.orderIndex = model.index + 1;
            model.uid = _.uniqueId('rb');
            model.feedback = {
                activated: !!qtiElementHelper.lookupElement(model, 'rubricBlock.div.feedbackBlock', 'content'),
                outcome: qtiElementHelper.lookupProperty(model, 'rubricBlock.div.feedbackBlock.outcomeIdentifier', 'content'),
                matchValue: qtiElementHelper.lookupProperty(model, 'rubricBlock.div.feedbackBlock.identifier', 'content')
            };

            actions.properties($rubricBlock, 'rubricblock', model, propHandler);

            $rubricBlockContent.empty().html($rubricBlockBinding.html());

            editor = ckeditor.inline($rubricBlockContent[0], ckConfig);
            editor.on('change', function () {
                syncRubricBlockContent();
            });
        }
    };
});
