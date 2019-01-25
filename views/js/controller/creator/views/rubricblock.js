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
    'i18n',
    'ui/hider',
    'ui/dialog/alert',
    'util/namespace',
    'taoQtiTest/controller/creator/views/actions',
    'helpers',
    'taoQtiTest/controller/creator/encoders/dom2qti',
    'taoQtiTest/controller/creator/helpers/qtiElement',
    'taoQtiTest/controller/creator/qtiContentCreator',
    'ckeditor',
], function ($, _, __, hider, dialogAlert, namespaceHelper, actions, helpers, Dom2QtiEncoder, qtiElementHelper, qtiContentCreator) {
    'use strict';

    /**
     * The rubriclockView setup RB related components and behavior
     *
     * @exports taoQtiTest/controller/creator/views/rubricblock
     */
    return {
        /**
         * Set up a rubric block: init action behaviors. Called for each one.
         *
         * @param {Object} creatorContext
         * @param {Object} rubricModel - the rubric block data
         * @param {jQueryElement} $rubricBlock - the rubric block to set up
         */
        setUp: function setUp(creatorContext, rubricModel, $rubricBlock) {
            var modelOverseer = creatorContext.getModelOverseer();
            var areaBroker = creatorContext.getAreaBroker();
            var $rubricBlockContent = $('.rubricblock-content', $rubricBlock);

            /**
             * Bind a listener only related to this rubric.
             * @param {jQuery} $el
             * @param {String} eventName
             * @param {Function} cb
             * @returns {jQuery}
             */
            function bindEvent($el, eventName, cb) {
                eventName = namespaceHelper.namespaceAll(eventName, rubricModel.uid);
                return $el.off(eventName).on(eventName, cb);
            }

            /**
             * Ensures an html content is wrapped by a container tag.
             * @param {String} html
             * @returns {String}
             */
            function ensureWrap(html) {
                html = (html || '').trim();
                if (html.charAt(0) !== '<' || html.charAt(html.length - 1) !== '>') {
                    html = '<div>' + html + '</div>';
                }
                if ($(html).length > 1) {
                    html = '<div>' + html + '</div>';
                }
                return html;
            }

            /**
             * Forwards the editor content into the model
             */
            function editorToModel(html) {
                var rubric = qtiElementHelper.lookupElement(rubricModel, 'rubricBlock', 'content');
                var wrapper = qtiElementHelper.lookupElement(rubricModel, 'rubricBlock.div.feedbackBlock', 'content');
                var content = Dom2QtiEncoder.decode(ensureWrap(html));

                if (wrapper) {
                    wrapper.content = content;
                } else {
                    rubric.content = content;
                }
            }

            /**
             * Forwards the model content into the editor
             */
            function modelToEditor() {
                var rubric = qtiElementHelper.lookupElement(rubricModel, 'rubricBlock', 'content') || {};
                var wrapper = qtiElementHelper.lookupElement(rubricModel, 'rubricBlock.div.feedbackBlock', 'content');
                var content = wrapper ? wrapper.content : rubric.content;
                var html = ensureWrap(Dom2QtiEncoder.encode(content));

                // Destroy any existing CKEditor instance
                qtiContentCreator.destroy(creatorContext, $rubricBlockContent).then(function() {
                    // update the editor content
                    $rubricBlockContent.html(html);

                    // Re-create the Qti-ckEditor instance
                    qtiContentCreator.create(creatorContext, $rubricBlockContent, {
                        change: function change(editorContent) {
                            editorToModel(editorContent);
                        }
                    });
                });
            }

            /**
             * Wrap/unwrap the rubric block in a feedback according to the user selection
             * @param {Object} feedback
             * @returns {Boolean}
             */
            function updateFeedback(feedback) {
                var activated = feedback && feedback.activated;
                var wrapper = qtiElementHelper.lookupElement(rubricModel, 'rubricBlock.div.feedbackBlock', 'content');

                if (activated) {
                    // wrap the actual content into a feedbackBlock if needed
                    if (!wrapper) {
                        rubricModel.content = [qtiElementHelper.create('div', {
                            content: [qtiElementHelper.create('feedbackBlock', {
                                outcomeIdentifier: feedback.outcome,
                                identifier: feedback.matchValue,
                                content: rubricModel.content
                            })]
                        })];
                    } else {
                        wrapper.outcomeIdentifier = feedback.outcome;
                        wrapper.identifier = feedback.matchValue;
                    }
                    modelToEditor();
                } else {
                    // remove the feedbackBlock wrapper, just keep the actual content
                    if (wrapper) {
                        rubricModel.content = wrapper.content;
                        modelToEditor();
                    }
                }

                return activated;
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
                var $feedbackOutcome = $('[name=feedback-outcome]', $view);
                var $feedbackActivated = $('[name=activated]', $view);

                // toggle the feedback panel
                function changeFeedback(activated) {
                    hider.toggle($feedbackOutcomeLine, activated);
                    hider.toggle($feedbackMatchLine, activated);
                }

                // should be called when the properties panel is removed
                function removePropHandler() {
                    rubricModel.feedback = {};
                    if (propView !== null) {
                        propView.destroy();
                    }
                }

                // take care of changes in the properties view
                function changeHandler(e, changedModel) {
                    if (e.namespace === 'binder' && changedModel['qti-type'] === 'rubricBlock') {
                        changeFeedback(updateFeedback(changedModel.feedback));
                    }
                }

                // update the list of outcomes the feedback can target
                function updateOutcomes() {
                    var activated = rubricModel.feedback && rubricModel.feedback.activated;
                    // build the list of outcomes in a way select2 can understand
                    var outcomes = _.map(modelOverseer.getOutcomesNames(), function(name) {
                        return {
                            id: name,
                            text: name
                        };
                    });

                    // create/update the select field
                    $feedbackOutcome.select2({
                        minimumResultsForSearch: -1,
                        width: '100%',
                        data: outcomes
                    });

                    // update the UI to reflect the data
                    if (!activated) {
                        $feedbackActivated.prop('checked', false);
                    }
                    changeFeedback(activated);
                }

                $('[name=type]', $view).select2({
                    minimumResultsForSearch: -1,
                    width: '100%'
                });

                $view.on('change.binder', changeHandler);
                bindEvent($rubricBlock.parents('.testpart'), 'delete', removePropHandler);
                bindEvent($rubricBlock.parents('.section'), 'delete', removePropHandler);
                bindEvent($rubricBlock, 'delete', removePropHandler);
                bindEvent($rubricBlock, 'outcome-removed', function() {
                    $feedbackOutcome.val('');
                    updateOutcomes();
                });
                bindEvent($rubricBlock, 'outcome-updated', function() {
                    updateFeedback(rubricModel.feedback);
                    updateOutcomes();
                });

                changeFeedback(rubricModel.feedback);
                updateOutcomes();
                rbViews($view);
            }

            /**
             * Set up the views select box
             * @private
             * @param {jQueryElement} $propContainer - the element container
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

            rubricModel.orderIndex = (rubricModel.index || 0) + 1;
            rubricModel.uid = _.uniqueId('rb');
            rubricModel.feedback = {
                activated: !!qtiElementHelper.lookupElement(rubricModel, 'rubricBlock.div.feedbackBlock', 'content'),
                outcome: qtiElementHelper.lookupProperty(rubricModel, 'rubricBlock.div.feedbackBlock.outcomeIdentifier', 'content'),
                matchValue: qtiElementHelper.lookupProperty(rubricModel, 'rubricBlock.div.feedbackBlock.identifier', 'content')
            };

            modelOverseer
                .before('scoring-write.' + rubricModel.uid, function() {
                    var feedbackOutcome = rubricModel.feedback && rubricModel.feedback.outcome;
                    if (feedbackOutcome && _.indexOf(modelOverseer.getOutcomesNames(), feedbackOutcome) < 0) {
                        // the targeted outcome has been removed, so remove the feedback
                        modelOverseer.changedRubricBlock = (modelOverseer.changedRubricBlock || 0) + 1;
                        rubricModel.feedback.activated = false;
                        rubricModel.feedback.outcome = '';
                        updateFeedback(rubricModel.feedback);
                        $rubricBlock.trigger('outcome-removed');
                    } else {
                        // the tageted outcome is still here, just notify the properties panel to update the list
                        $rubricBlock.trigger('outcome-updated');
                    }
                })
                .on('scoring-write.' + rubricModel.uid, function() {
                    // will notify the user of any removed feedbacks
                    if (modelOverseer.changedRubricBlock) {
                        /** @todo: provide a way to cancel changes */
                        dialogAlert(__('Some rubric blocks have been updated to reflect the changes in the list of outcomes.'));
                        modelOverseer.changedRubricBlock = 0;
                    }
                });

            actions.properties($rubricBlock, 'rubricblock', rubricModel, propHandler);

            modelToEditor();

            // destroy CK instance on rubric bloc deletion.
            // todo: find a way to destroy CK upon destroying rubric bloc parent section/part
            bindEvent($rubricBlock, 'delete', function() {
                qtiContentCreator.destroy(creatorContext, $rubricBlockContent);
            });

            $rubricBlockContent.on('editorfocus', function() {
                // close all properties forms and turn off their related button
                areaBroker.getPropertyPanelArea().children('.props').hide().trigger('propclose.propview');
            });

            //change position of CKeditor toolbar on scroll
            areaBroker.getContentCreatorPanelArea().find('.test-content').on('scroll', function () {
                CKEDITOR.document.getWindow().fire('scroll');
            });
        }
    };
});
