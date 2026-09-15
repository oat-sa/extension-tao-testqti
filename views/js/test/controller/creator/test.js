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
        testCommentsInitAttempts: 0,
        testCommentsShouldFail: false,
        feedbackErrorCalls: [],
        translationShouldFail: false,
        translationViewCalls: 0
    };

    function resetState() {
        state.testCommentsInitCalls = [];
        state.testCommentsInitAttempts = 0;
        state.testCommentsShouldFail = false;
        state.feedbackErrorCalls = [];
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

    function waitForTestCommentsInit(previousCallsCount) {
        return new Promise(function (resolve, reject) {
            var retriesLeft = 20;

            function check() {
                if (state.testCommentsInitCalls.length > previousCallsCount) {
                    resolve();
                    return;
                }

                if (retriesLeft <= 0) {
                    reject(new Error('Timed out waiting for test comments initialization'));
                    return;
                }

                retriesLeft -= 1;
                setTimeout(check, 0);
            }

            check();
        });
    }

    function waitForFeedbackError(previousCallsCount) {
        return new Promise(function (resolve, reject) {
            var retriesLeft = 20;

            function check() {
                if (state.feedbackErrorCalls.length > previousCallsCount) {
                    resolve();
                    return;
                }

                if (retriesLeft <= 0) {
                    reject(new Error('Timed out waiting for feedback error call'));
                    return;
                }

                retriesLeft -= 1;
                setTimeout(check, 0);
            }

            check();
        });
    }

    define('taoQtiTest/tests/controller/creator/feedbackMock', [], function () {
        return function () {
            return {
                error: function (message) {
                    state.feedbackErrorCalls.push(message);
                },
                warning: function () {},
                success: function () {}
            };
        };
    });

    define('taoQtiTest/tests/controller/creator/loggerMock', [], function () {
        return function () {
            return {
                error: function () {}
            };
        };
    });

    define('taoQtiTest/tests/controller/creator/dataBindControllerMock', [], function () {
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

    define('taoQtiTest/tests/controller/creator/qtiTestCreatorMock', [], function () {
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

    define('taoQtiTest/tests/controller/creator/templatesMock', [], function () {
        return {
            menuButton: function () {
                return '<button class="previewer"></button>';
            }
        };
    });

    define('taoQtiTest/tests/controller/creator/i18nMock', [], function () {
        return function (text) {
            return text;
        };
    });

    define('taoQtiTest/tests/controller/creator/translationHelperMock', [], function () {
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

    define('taoQtiTest/tests/controller/creator/testModelHelperMock', [], function () {
        return {
            eachItemInTest: function () {}
        };
    });

    define('taoQtiTest/tests/controller/creator/testCommentsMock', [], function () {
        return {
            init: function (config) {
                state.testCommentsInitAttempts += 1;
                if (state.testCommentsShouldFail) {
                    throw new Error('test comments init failed');
                }

                state.testCommentsInitCalls.push(config);
                return {};
            }
        };
    });

    define('taoQtiTest/tests/controller/creator/translationViewMock', [], function () {
        return function () {
            state.translationViewCalls += 1;
        };
    });

    define('taoQtiTest/tests/controller/creator/viewNoopMock', [], function () {
        return function () {};
    });

    define('taoQtiTest/tests/controller/creator/viewNoopWithActionStateMock', [], function () {
        return {
            listenActionState: function () {}
        };
    });

    define('taoQtiTest/tests/controller/creator/qtiTestHelperMock', [], function () {
        return {
            filterQtiType: function () {
                return true;
            },
            addMissingQtiType: function () {},
            consolidateModel: function () {}
        };
    });

    define('taoQtiTest/tests/controller/creator/validatorsMock', [], function () {
        return {
            registerValidators: function () {},
            validateModel: function () {}
        };
    });

    define('taoQtiTest/tests/controller/creator/plainObjectNoopMock', [], function () {
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

    define('taoQtiTest/tests/controller/creator/previewerFactoryMock', [], function () {
        return function () {
            return Promise.resolve();
        };
    });

    define('taoQtiTest/tests/controller/creator/translationServiceMock', [], function () {
        return {
            translationProgress: {}
        };
    });

    requirejs.config({
        map: {
            'taoQtiTest/controller/creator/creator': {
                i18n: 'taoQtiTest/tests/controller/creator/i18nMock',
                'ui/feedback': 'taoQtiTest/tests/controller/creator/feedbackMock',
                'core/databindcontroller': 'taoQtiTest/tests/controller/creator/dataBindControllerMock',
                'services/translation': 'taoQtiTest/tests/controller/creator/translationServiceMock',
                'taoQtiTest/controller/creator/qtiTestCreator': 'taoQtiTest/tests/controller/creator/qtiTestCreatorMock',
                'taoQtiTest/controller/creator/views/item': 'taoQtiTest/tests/controller/creator/viewNoopMock',
                'taoQtiTest/controller/creator/views/test': 'taoQtiTest/tests/controller/creator/viewNoopMock',
                'taoQtiTest/controller/creator/views/testpart': 'taoQtiTest/tests/controller/creator/viewNoopWithActionStateMock',
                'taoQtiTest/controller/creator/views/section': 'taoQtiTest/tests/controller/creator/viewNoopWithActionStateMock',
                'taoQtiTest/controller/creator/views/itemref': 'taoQtiTest/tests/controller/creator/viewNoopWithActionStateMock',
                'taoQtiTest/controller/creator/views/translation': 'taoQtiTest/tests/controller/creator/translationViewMock',
                'taoQtiTest/controller/creator/encoders/dom2qti': 'taoQtiTest/tests/controller/creator/viewNoopMock',
                'taoQtiTest/controller/creator/templates/index': 'taoQtiTest/tests/controller/creator/templatesMock',
                'taoQtiTest/controller/creator/helpers/qtiTest': 'taoQtiTest/tests/controller/creator/qtiTestHelperMock',
                'taoQtiTest/controller/creator/helpers/scoring': 'taoQtiTest/tests/controller/creator/plainObjectNoopMock',
                'taoQtiTest/controller/creator/helpers/translation': 'taoQtiTest/tests/controller/creator/translationHelperMock',
                'taoQtiTest/controller/creator/helpers/testModel': 'taoQtiTest/tests/controller/creator/testModelHelperMock',
                'taoQtiTest/controller/creator/helpers/categorySelector': 'taoQtiTest/tests/controller/creator/plainObjectNoopMock',
                'taoQtiTest/controller/creator/helpers/validators': 'taoQtiTest/tests/controller/creator/validatorsMock',
                'taoQtiTest/controller/creator/helpers/changeTracker': 'taoQtiTest/tests/controller/creator/viewNoopMock',
                'taoQtiTest/controller/creator/helpers/featureVisibility': 'taoQtiTest/tests/controller/creator/plainObjectNoopMock',
                'taoTests/previewer/factory': 'taoQtiTest/tests/controller/creator/previewerFactoryMock',
                'core/logger': 'taoQtiTest/tests/controller/creator/loggerMock',
                'taoQtiTest/controller/creator/views/subsection': 'taoQtiTest/tests/controller/creator/viewNoopWithActionStateMock',
                'taoQtiTest/controller/creator/helpers/scaleSelector': 'taoQtiTest/tests/controller/creator/plainObjectNoopMock',
                'taoQtiTest/controller/creator/helpers/branchRules': 'taoQtiTest/tests/controller/creator/plainObjectNoopMock',
                'taoQtiTest/controller/creator/helpers/preConditions': 'taoQtiTest/tests/controller/creator/plainObjectNoopMock',
                'taoQtiTest/controller/creator/helpers/saveScoring': 'taoQtiTest/tests/controller/creator/plainObjectNoopMock',
                'taoQtiTest/controller/creator/components/testComments': 'taoQtiTest/tests/controller/creator/testCommentsMock'
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
        assert.expect(4);

        return loadCreatorController()
            .then(function (creatorController) {
                var initialCalls = state.testCommentsInitCalls.length;
                var startResult = creatorController.start({
                    routes: {
                        save: '/save?uri=' + encodeURIComponent('urn:test:plain')
                    }
                });

                return Promise.resolve(startResult).then(function () {
                    return waitForTestCommentsInit(initialCalls);
                });
            })
            .then(function () {
                assert.equal(state.testCommentsInitCalls.length, 1, 'test comments are initialized once');
                assert.equal(state.testCommentsInitCalls[0].testUri, 'urn:test:plain', 'test uri is forwarded');
                assert.strictEqual(state.testCommentsInitCalls[0].mentionsEnabled, false, 'mentions disabled by default');
                assert.equal(state.translationViewCalls, 0, 'translation view is not used in non-translation mode');
            });
    });

    QUnit.test('start initializes test comments for translation mode', function (assert) {
        assert.expect(4);

        return loadCreatorController()
            .then(function (creatorController) {
                var initialCalls = state.testCommentsInitCalls.length;
                var startResult = creatorController.start({
                    translation: true,
                    originResourceUri: 'urn:test:origin',
                    itemCommentsMentionsEnabled: true,
                    routes: {
                        save: '/save?uri=' + encodeURIComponent('urn:test:translated'),
                        getOrigin: '/origin'
                    }
                });

                return Promise.resolve(startResult).then(function () {
                    return waitForTestCommentsInit(initialCalls);
                });
            })
            .then(function () {
                assert.equal(state.testCommentsInitCalls.length, 1, 'test comments are initialized once for translation mode');
                assert.equal(state.testCommentsInitCalls[0].testUri, 'urn:test:translated', 'test uri is preserved');
                assert.strictEqual(state.testCommentsInitCalls[0].mentionsEnabled, true, 'mentions flag is forwarded');
                assert.equal(state.translationViewCalls, 1, 'translation view is initialized');
            });
    });

    QUnit.test('start initializes test comments even when translation loading fails', function (assert) {
        state.translationShouldFail = true;
        assert.expect(3);

        return loadCreatorController()
            .then(function (creatorController) {
                var initialCalls = state.testCommentsInitCalls.length;
                var startResult = creatorController.start({
                    translation: true,
                    originResourceUri: 'urn:test:origin',
                    itemCommentsMentionsEnabled: true,
                    routes: {
                        save: '/save?uri=' + encodeURIComponent('urn:test:translated'),
                        getOrigin: '/origin'
                    }
                });

                return Promise.resolve(startResult).then(function () {
                    return waitForTestCommentsInit(initialCalls);
                });
            })
            .then(function () {
                assert.equal(state.testCommentsInitCalls.length, 1, 'test comments are still initialized');
                assert.equal(state.testCommentsInitCalls[0].testUri, 'urn:test:translated', 'test uri is preserved');
                assert.strictEqual(state.testCommentsInitCalls[0].mentionsEnabled, true, 'mentions flag is forwarded');
            });
    });

    QUnit.test('start reports feedback error when test comments initialization fails', function (assert) {
        state.testCommentsShouldFail = true;
        assert.expect(2);

        return loadCreatorController()
            .then(function (creatorController) {
                var initialFeedbackErrors = state.feedbackErrorCalls.length;
                var startResult = creatorController.start({
                    routes: {
                        save: '/save?uri=' + encodeURIComponent('urn:test:plain')
                    }
                });

                return Promise.resolve(startResult).then(function () {
                    return waitForFeedbackError(initialFeedbackErrors);
                });
            })
            .then(function () {
                assert.equal(state.testCommentsInitAttempts, 1, 'test comments initialization is attempted once');
                assert.equal(state.feedbackErrorCalls.length, 1, 'feedback error is reported');
            });
    });
});
