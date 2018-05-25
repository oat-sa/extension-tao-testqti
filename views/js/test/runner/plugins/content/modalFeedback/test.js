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

define([
    'jquery',
    'lodash',
    'module',
    'taoTests/runner/runner',
    'taoQtiTest/test/runner/mocks/providerMock',
    'taoQtiTest/runner/plugins/content/modalFeedback/modalFeedback',
    'taoQtiItem/runner/qtiItemRunner',
    'json!taoQtiItem/test/samples/json/inlineModalFeedback.json',
    'taoQtiItem/qtiItem/core/Loader',
    'taoQtiItem/qtiCommonRenderer/renderers/Renderer',
    'taoQtiItem/qtiItem/helper/modalFeedback'
], function ($,
             _,
             taoModule,
             testRunnerFactory,
             providerMock,
             modalFeedback,
             qtiItemRunner,
             itemData,
             QtiLoader,
             QtiRenderer,
             modalFeedbackHelper) {

    'use strict';

    var runner;
    var containerId = 'item-container';

    module('Item init', {
        teardown: function () {
            if (runner) {
                runner.clear();
            }
        }
    });

    QUnit.asyncTest('Item data loading', function (assert) {
        QUnit.expect(2);

        runner = qtiItemRunner('qti', itemData)
            .on('init', function () {

                assert.ok(typeof this._item === 'object', 'The item data is loaded and mapped to an object');
                assert.ok(typeof this._item.bdy === 'object', 'The item contains a body object');

                QUnit.start();
            }).init();
    });


    module('Item render', {
        teardown: function () {
            if (runner) {
                runner.clear();
            }
        }
    });

    QUnit.asyncTest('Item rendering', function (assert) {
        QUnit.expect(3);

        var container = document.getElementById(containerId);

        assert.ok(container instanceof HTMLElement, 'the item container exists');
        assert.equal(container.children.length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function () {

                assert.equal(container.children.length, 1, 'the container has children');

                QUnit.start();
            })
            .init()
            .render(container);
    });

    module('API', {
        setup: function setup() {
            runner = qtiItemRunner('qti', itemData).init();
        },
        teardown: function () {
            if (runner) {
                runner.clear();
            }
        }
    });

    var pluginApi = [
        {name: 'init', title: 'init'},
        {name: 'render', title: 'render'},
        {name: 'finish', title: 'finish'},
        {name: 'destroy', title: 'destroy'},
        {name: 'trigger', title: 'trigger'},
        {name: 'getTestRunner', title: 'getTestRunner'},
        {name: 'getAreaBroker', title: 'getAreaBroker'},
        {name: 'getConfig', title: 'getConfig'},
        {name: 'setConfig', title: 'setConfig'},
        {name: 'getState', title: 'getState'},
        {name: 'setState', title: 'setState'},
        {name: 'show', title: 'show'},
        {name: 'hide', title: 'hide'},
        {name: 'enable', title: 'enable'},
        {name: 'disable', title: 'disable'}
    ];

    QUnit
        .cases(pluginApi)
        .test('plugin API ', 1, function (data, assert) {
            var feedback = modalFeedback(runner);
            assert.equal(typeof feedback[data.name], 'function', 'The modalDialogFeedback instances expose a "' + data.name + '" function');
        });

    var providerName = 'mock';
    var testRunner;
    testRunnerFactory.registerProvider(providerName, providerMock());

    module('modalFeedback', {
        teardown: function setup() {
            if (runner) {
                runner.clear();
            }
        }
    });

    var item;
    var testCases = [
        {
            title: 'choice interaction',
            itemSession: {
                FEEDBACK_1: {base: {identifier: 'feedbackModal_1'}},
                FEEDBACK_3: {base: {identifier: 'feedbackModal_3'}}
            },
            feedbacks: {
                choice: [
                    {
                        identifier: 'feedbackModal_1',
                        title: 'modal feedback title',
                        text: 'right',
                        style: 'positive'
                    },
                    {
                        identifier: 'feedbackModal_3',
                        title: '',
                        text: 'thiss is right',
                        style: ''
                    }
                ],
                order: [],
                inline: []
            }
        },
        {
            title: 'choice & order interactions',
            itemSession: {
                FEEDBACK_2: {base: {identifier: 'feedbackModal_2'}},
                FEEDBACK_4: {base: {identifier: 'feedbackModal_4'}},
                FEEDBACK_5: {base: {identifier: 'feedbackModal_5'}}//feedbackModal_5 has the same content as the feedbackModal_4 so it won't be displayed
            },
            feedbacks: {
                choice: [
                    {
                        identifier: 'feedbackModal_2',
                        title: 'modal feedback title',
                        text: 'wrong',
                        style: 'negative'
                    }
                ],
                order: [
                    {
                        identifier: 'feedbackModal_4',
                        title: '',
                        text: 'Correct',
                        style: 'positive'
                    }
                ],
                inline: []
            }
        },
        {
            title: 'choice & inline interactions',
            itemSession: {
                FEEDBACK_1: {base: {identifier: 'feedbackModal_1'}},
                FEEDBACK_3: {base: {identifier: 'feedbackModal_3'}},
                FEEDBACK_6: {base: {identifier: 'feedbackModal_6'}},
                FEEDBACK_7: {base: {identifier: 'feedbackModal_7'}},//feedback #6 and #7 have the same title and text but even with different style, only the first one shall be displayed
                FEEDBACK_8: {base: {identifier: 'feedbackModal_8'}},
                FEEDBACK_9: {base: {identifier: 'feedbackModal_9'}}//feedback #9 and #7 have the same title, text and style. The are related to inline iteractions that are both in the same block so contaier, so only the first one #7 will be displayed
            },
            feedbacks: {
                choice: [
                    {
                        identifier: 'feedbackModal_1',
                        title: 'modal feedback title',
                        text: 'right',
                        style: 'positive'
                    },
                    {
                        identifier: 'feedbackModal_3',
                        title: '',
                        text: 'thiss is right',
                        style: ''
                    }
                ],
                order: [],
                inline: [
                    {
                        identifier: 'feedbackModal_6',
                        title: '',
                        text: 'correct',
                        style: 'positive'
                    },
                    {
                        identifier: 'feedbackModal_8',
                        title: 'modal feedback title',
                        text: 'Some feedback text.',
                        style: ''
                    }
                ]
            }
        }
    ];

    QUnit.cases(testCases)
        .asyncTest('render feedbacks as alertMessage', function (testCase, assert) {
            var renderer;

            renderer = new QtiRenderer({baseUrl: './'});
            new QtiLoader().loadItemData(itemData, function (_item) {
                var self = this;
                renderer.load(function () {

                    var result, $result, mFeedback;
                    var $choiceInteraction, $orderInteraction, $textEntryInteraction, $inlineChoiceInteraction, $inlineInteractionContainer;
                    var renderingQueue;

                    item = _item;
                    item.setRenderer(this);

                    testRunner = testRunnerFactory(providerName);
                    testRunner.itemRunner = {_item : item};

                    result = item.render({});

                    assert.ok(typeof result === 'string', 'The renderer creates a string');
                    assert.ok(result.length > 0, 'The renderer create some output');

                    $result = $(result);

                    $choiceInteraction = $('.qti-choiceInteraction', $result);
                    $orderInteraction = $('.qti-orderInteraction', $result);
                    $textEntryInteraction = $('.qti-textEntryInteraction', $result);
                    $inlineChoiceInteraction = $('.qti-inlineChoiceInteraction', $result);
                    $inlineInteractionContainer = $inlineChoiceInteraction.parent('.col-12');

                    assert.ok($result.hasClass('qti-item'), 'The result is a qti item');
                    assert.equal($('.qti-itemBody', $result).length, 1, 'The result contains an item body');
                    assert.equal($choiceInteraction.length, 1, 'The result contains a choice interaction');
                    assert.equal($orderInteraction.length, 1, 'The result contains an order interaction');
                    assert.equal($textEntryInteraction.length, 1, 'The result contains a text enry interaction');
                    assert.equal($inlineChoiceInteraction.length, 1, 'The result contains an inline choice interaction');
                    assert.equal($inlineInteractionContainer.length, 1, 'Inline interaction container found');
                    assert.equal($('.qti-modalFeedback', $result).length, 0, 'no modal feedback yet');

                    //render in dom
                    $('#' + containerId).append($result);

                    testRunner
                        .on('plugin-render.QtiModalFeedback', function (feedback) {

                            var feedbacks;
                            var $modalsBlock = $('#modalFeedbacks', $result);
                            var countFeedbacks = testCase.feedbacks.choice.length + testCase.feedbacks.inline.length + testCase.feedbacks.order.length;
                            assert.equal(feedback.getState('ready'), true, 'The feedback is rendered');
                            assert.equal($('.qti-modalFeedback', $modalsBlock).length, countFeedbacks, 'modal feedbacks in the special dom element');

                            feedbacks = testCase.feedbacks.choice.concat(testCase.feedbacks.order, testCase.feedbacks.inline);
                            _.each(feedbacks, function (fb) {

                                var $feedback = $result.find('[data-identifier=' + fb.identifier + ']');
                                assert.equal($feedback.length, 1, 'found feedback dom element for ' + fb.identifier);

                                if ($feedback.length) {
                                    if (fb.style) {
                                        assert.ok($feedback.hasClass(fb.style), 'style class correctly set');
                                    } else {

                                        if ($feedback[0].hasAttribute("class")) {
                                            assert.equal($feedback.attr('class').trim(), 'modal qti-modalFeedback', 'the unique css class must be qti-modalFeedback');
                                        } else {
                                            assert.ok(false, 'the feedback must have class attribute');
                                        }
                                    }

                                    if (fb.title) {
                                        assert.equal($feedback.children('.qti-title').length, 1, 'title found');
                                        assert.equal($feedback.children('.qti-title').text(), fb.title, 'title text ok');
                                    } else {
                                        assert.equal($feedback.children('.qti-title').length, 0, 'no title');
                                    }
                                    assert.equal($feedback.find('.modal-body').length, 1, 'feedback body found');
                                    assert.equal($feedback.find('.modal-body').text().trim(), fb.text, 'feedback body correct');
                                }
                            });

                            feedback.destroy();
                        });

                    mFeedback = modalFeedback(testRunner, testRunner.getAreaBroker());
                    mFeedback.init();
                    mFeedback.render();
                    renderingQueue = modalFeedbackHelper.getFeedbacks(item, testCase.itemSession);
                    testRunner.trigger('modalFeedbacks', renderingQueue, function () {
                        assert.ok(true, 'testRunner was resumed');
                        QUnit.start();
                    }, false);

                }, self.getLoadedClasses());
            });
        });
});
