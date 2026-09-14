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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */
define(['require', 'jquery'], function (require, $) {
    'use strict';

    var state = {
        testCommentsInitCalls: [],
        translationShouldFail: false,
        translationViewCalls: 0
    };

    function resetState() {
        state.testCommentsInitCalls = [];
        state.translationShouldFail = false;
        state.translationViewCalls = 0;
    }

    function createFixture() {
        $('#qunit-fixture').html([
            '<div id="test-creator">',
            '  <div class="test-creator-items"><div class="item-selection"></div></div>',
            '  <div class="content-wrap"></div>',
            '</div>',
            '<button id="saver"></button>',
            '<ul class="test-editor-menu"></ul>',
            '<a id="authoringBack" href="#"></a>'
        ].join(''));
    }

    function waitForSettled() {
        return new Promise(function (resolve) {
            setTimeout(function () {
                setTimeout(resolve, 0);
            }, 0);
        });
    }

    define('taoQtiTest/test/controller/creator/feedbackMock', [], function () {
        return function () {
            return {
                error: function () {},
                warning: function () {},
                success: function () {}
            };
        };
    });

    define('taoQtiTest/test/controller/creator/loggerMock', [], function () {
        return function () {
            return {
                error: function () {}
            };
        };
    });

    define('taoQtiTest/test/controller/creator/dataBindControllerMock', [], function () {
        return {
            takeControl: function () {
                return {
                    get: function (callback) {
                        callback({
                            qtiType: 'assessmentTest',
                            testParts: []
                        });
                        return this;
                    },
                    save: function (onSuccess) {
                        if (typeof onSuccess === 'function') {
                            onSuccess();
                        }
                    }
                };
            }
        };
    });

    define('taoQtiTest/test/controller/creator/qtiTestCreatorMock', [], function () {
        return function () {
            var handlers = Object.create(null);
            var modelOverseer = {
                trigger: function () {},
                getModel: function () {
                    return {};
                },
                getConfig: function () {
                    return {};
                }
            };

            return {
                setTestModel: function () {},
                getModelOverseer: function () {
                    return modelOverseer;
                },
                on: function (eventName, handler) {
                    handlers[eventName] = handler;
                },
                trigger: function (eventName) {
                    if (handlers[eventName]) {
                        handlers[eventName]();
                    }
                },
                isTestHasErrors: function () {
                    return false;
                }
            };
        };
    });

    define('taoQtiTest/test/controller/creator/templatesMock', [], function () {
        return {
            menuButton: function () {
                return '<button class="previewer"></button>';
            }
        };
    });

    define('taoQtiTest/test/controller/creator/i18nMock', [], function () {
        return function (text) {
            return text;
        };
    });

    define('taoQtiTest/test/controller/creator/translationHelperMock', [], function () {
        return {
            updateModelFromOrigin: function () {
                if (state.translationShouldFail) {
                    return Promise.reject(new Error('origin load failed'));
                }

                return Promise.resolve({});
            },
            getTranslationConfig: function () {
                return Promise.resolve({});
            },
            getItemsTranslationStatus: function () {
                return Promise.resolve({});
            }
        };
    });

    define('taoQtiTest/test/controller/creator/testModelHelperMock', [], function () {
        return {
            eachItemInTest: function () {}
        };
    });

    define('taoQtiTest/test/controller/creator/testCommentsMock', [], function () {
        return {
            init: function (config) {
                state.testCommentsInitCalls.push(config);
                return {};
            }
        };
    });

    define('taoQtiTest/test/controller/creator/translationViewMock', [], function () {
        return function () {
            state.translationViewCalls += 1;
        };
    });

    define('taoQtiTest/test/controller/creator/viewNoopMock', [], function () {
        return function () {};
    });

    define('taoQtiTest/test/controller/creator/viewNoopWithActionStateMock', [], function () {
        return {
            listenActionState: function () {}
        };
    });

    define('taoQtiTest/test/controller/creator/qtiTestHelperMock', [], function () {
        return {
            filterQtiType: function () {
                return true;
            },
            addMissingQtiType: function () {},
            consolidateModel: function () {}
        };
    });

    define('taoQtiTest/test/controller/creator/validatorsMock', [], function () {
        return {
            registerValidators: function () {},
            validateModel: function () {}
        };
    });

    define('taoQtiTest/test/controller/creator/plainObjectNoopMock', [], function () {
        return {
            init: function () {},
            initialize: function () {},
            setPresets: function () {},
            filterVisiblePresets: function (presets) {
                return presets;
            },
            normalizeModel: function () {},
            refreshOptions: function () {},
            bindSync: function () {},
            serializeModel: function () {},
            triggerScoringChangeIfNeeded: function () {}
        };
    });

    define('taoQtiTest/test/controller/creator/previewerFactoryMock', [], function () {
        return function () {
            return Promise.resolve();
        };
    });

    define('taoQtiTest/test/controller/creator/translationServiceMock', [], function () {
        return {
            translationProgress: {}
        };
    });

    requirejs.config({
        map: {
            'taoQtiTest/controller/creator/creator': {
                i18n: 'taoQtiTest/test/controller/creator/i18nMock',
                'ui/feedback': 'taoQtiTest/test/controller/creator/feedbackMock',
                'core/databindcontroller': 'taoQtiTest/test/controller/creator/dataBindControllerMock',
                'services/translation': 'taoQtiTest/test/controller/creator/translationServiceMock',
                'taoQtiTest/controller/creator/qtiTestCreator': 'taoQtiTest/test/controller/creator/qtiTestCreatorMock',
                'taoQtiTest/controller/creator/views/item': 'taoQtiTest/test/controller/creator/viewNoopMock',
                'taoQtiTest/controller/creator/views/test': 'taoQtiTest/test/controller/creator/viewNoopMock',
                'taoQtiTest/controller/creator/views/testpart': 'taoQtiTest/test/controller/creator/viewNoopWithActionStateMock',
                'taoQtiTest/controller/creator/views/section': 'taoQtiTest/test/controller/creator/viewNoopWithActionStateMock',
                'taoQtiTest/controller/creator/views/itemref': 'taoQtiTest/test/controller/creator/viewNoopWithActionStateMock',
                'taoQtiTest/controller/creator/views/translation': 'taoQtiTest/test/controller/creator/translationViewMock',
                'taoQtiTest/controller/creator/encoders/dom2qti': 'taoQtiTest/test/controller/creator/viewNoopMock',
                'taoQtiTest/controller/creator/templates/index': 'taoQtiTest/test/controller/creator/templatesMock',
                'taoQtiTest/controller/creator/helpers/qtiTest': 'taoQtiTest/test/controller/creator/qtiTestHelperMock',
                'taoQtiTest/controller/creator/helpers/scoring': 'taoQtiTest/test/controller/creator/plainObjectNoopMock',
                'taoQtiTest/controller/creator/helpers/translation': 'taoQtiTest/test/controller/creator/translationHelperMock',
                'taoQtiTest/controller/creator/helpers/testModel': 'taoQtiTest/test/controller/creator/testModelHelperMock',
                'taoQtiTest/controller/creator/helpers/categorySelector': 'taoQtiTest/test/controller/creator/plainObjectNoopMock',
                'taoQtiTest/controller/creator/helpers/validators': 'taoQtiTest/test/controller/creator/validatorsMock',
                'taoQtiTest/controller/creator/helpers/changeTracker': 'taoQtiTest/test/controller/creator/viewNoopMock',
                'taoQtiTest/controller/creator/helpers/featureVisibility': 'taoQtiTest/test/controller/creator/plainObjectNoopMock',
                'taoTests/previewer/factory': 'taoQtiTest/test/controller/creator/previewerFactoryMock',
                'core/logger': 'taoQtiTest/test/controller/creator/loggerMock',
                'taoQtiTest/controller/creator/views/subsection': 'taoQtiTest/test/controller/creator/viewNoopWithActionStateMock',
                'taoQtiTest/controller/creator/helpers/scaleSelector': 'taoQtiTest/test/controller/creator/plainObjectNoopMock',
                'taoQtiTest/controller/creator/helpers/branchRules': 'taoQtiTest/test/controller/creator/plainObjectNoopMock',
                'taoQtiTest/controller/creator/helpers/preConditions': 'taoQtiTest/test/controller/creator/plainObjectNoopMock',
                'taoQtiTest/controller/creator/helpers/saveScoring': 'taoQtiTest/test/controller/creator/plainObjectNoopMock',
                'taoQtiTest/controller/creator/components/testComments': 'taoQtiTest/test/controller/creator/testCommentsMock'
            }
        }
    });

    function loadCreatorController() {
        return new Promise(function (resolve, reject) {
            requirejs.undef('taoQtiTest/controller/creator/creator');
            require(['taoQtiTest/controller/creator/creator'], resolve, reject);
        });
    }

    QUnit.module('controller/creator', {
        beforeEach: function () {
            resetState();
            createFixture();
        }
    });

    QUnit.test('start initializes test comments for non-translation mode', function (assert) {
        var done = assert.async();

        assert.expect(4);

        loadCreatorController()
            .then(function (creatorController) {
                creatorController.start({
                    routes: {
                        save: '/save?uri=' + encodeURIComponent('urn:test:plain')
                    }
                });

                return waitForSettled();
            })
            .then(function () {
                assert.equal(state.testCommentsInitCalls.length, 1, 'test comments are initialized once');
                assert.equal(state.testCommentsInitCalls[0].testUri, 'urn:test:plain', 'test uri is forwarded');
                assert.strictEqual(state.testCommentsInitCalls[0].mentionsEnabled, false, 'mentions disabled by default');
                assert.equal(state.translationViewCalls, 0, 'translation view is not used in non-translation mode');
                done();
            });
    });

    QUnit.test('start initializes test comments even when translation loading fails', function (assert) {
        var done = assert.async();

        state.translationShouldFail = true;
        assert.expect(3);

        loadCreatorController()
            .then(function (creatorController) {
                creatorController.start({
                    translation: true,
                    originResourceUri: 'urn:test:origin',
                    itemCommentsMentionsEnabled: true,
                    routes: {
                        save: '/save?uri=' + encodeURIComponent('urn:test:translated'),
                        getOrigin: '/origin'
                    }
                });

                return waitForSettled();
            })
            .then(function () {
                assert.equal(state.testCommentsInitCalls.length, 1, 'test comments are still initialized');
                assert.equal(state.testCommentsInitCalls[0].testUri, 'urn:test:translated', 'test uri is preserved');
                assert.strictEqual(state.testCommentsInitCalls[0].mentionsEnabled, true, 'mentions flag is forwarded');
                done();
            });
    });
});
