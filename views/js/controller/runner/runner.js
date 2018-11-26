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
 * Copyright (c) 2016-2017 (original work) Open Assessment Technologies SA ;
 */

/**
 * Test runner controller entry
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
            'jquery',
            'lodash',
            'i18n',
            'context',
            'core/promise',
            'core/communicator',
            'core/communicator/poll',
            'core/communicator/request',
            'core/logger',
            'core/pluginLoader',
            'core/providerLoader',
            'layout/loading-bar',
            'ui/feedback',
            'util/url',
            'taoTests/runner/runner',
            'taoQtiTest/runner/provider/qti',
            'taoQtiTest/runner/proxy/loader',
            'css!taoQtiTestCss/new-test-runner'
        ], function(
            $,
            _,
            __,
            context,
            Promise,
            communicator,
            pollProvider,
            requestProvider,
            loggerFactory,
            pluginLoaderFactory,
            providerLoaderFactory,
            loadingBar,
            feedback,
            urlUtil,
            runner,
            qtiProvider,
            proxyLoader
        ) {
            'use strict';
/*
            var install = {
                "testDefinition": "https://taoce.krampstud.io/tao.rdf#i1542209435719825",
                "testCompilation": "https://taoce.krampstud.io/tao.rdf#i1542209907135037-|https://taoce.krampstud.io/tao.rdf#i1542209907328238+",
                "serviceCallId": "https://taoce.krampstud.io/tao.rdf#i1542209918992959",
                "provider": {
                    "runner": {
                        "id": "qti",
                        "module": "taoQtiTest/runner/provider/qti",
                        "bundle": "taoQtiTest/loader/qtiTestRunner.min"
                    },
                    "proxy": {
                        "id": "service",
                        "module": "taoQtiTest/runner/proxy/qtiServiceProxy",
                        "bundle": "taoQtiTest/loader/qtiTestRunner.min"
                    }
                },
                "plugins": {

                    "taoQtiTest/runner/plugins/content/rubricBlock/rubricBlock": {
                        "id": "rubricBlock",
                        "module": "taoQtiTest/runner/plugins/content/rubricBlock/rubricBlock",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Rubric Block",
                        "description": "Display test rubric blocks",
                        "category": "content",
                        "active": true,
                        "tags": [
                            "core",
                            "qti"
                        ]
                    },
                    "taoQtiTest/runner/plugins/content/overlay/overlay": {
                        "id": "overlay",
                        "module": "taoQtiTest/runner/plugins/content/overlay/overlay",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Overlay",
                        "description": "Add an overlay over items when disabled",
                        "category": "content",
                        "active": true,
                        "tags": [
                            "core",
                            "technical",
                            "required"
                        ]
                    },
                    "taoQtiTest/runner/plugins/content/dialog/dialog": {
                        "id": "dialog",
                        "module": "taoQtiTest/runner/plugins/content/dialog/dialog",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Dialog",
                        "description": "Display popups that require user interactions",
                        "category": "content",
                        "active": true,
                        "tags": [
                            "core",
                            "technical",
                            "required"
                        ]
                    },
                    "taoQtiTest/runner/plugins/content/feedback/feedback": {
                        "id": "feedback",
                        "module": "taoQtiTest/runner/plugins/content/feedback/feedback",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Feedback",
                        "description": "Display notifications into feedback popups",
                        "category": "content",
                        "active": true,
                        "tags": [
                            "core",
                            "technical",
                            "required"
                        ]
                    },
                    "taoQtiTest/runner/plugins/content/dialog/exitMessages": {
                        "id": "exitMessages",
                        "module": "taoQtiTest/runner/plugins/content/dialog/exitMessages",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Exit Messages",
                        "description": "Display messages when a test taker leaves the test",
                        "category": "content",
                        "active": true,
                        "tags": [
                            "core"
                        ]
                    },
                    "taoQtiTest/runner/plugins/content/loading/loading": {
                        "id": "loading",
                        "module": "taoQtiTest/runner/plugins/content/loading/loading",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Loading bar",
                        "description": "Show a loading bar when the test is loading",
                        "category": "content",
                        "active": true,
                        "tags": [
                            "core"
                        ]
                    },
                    "taoQtiTest/runner/plugins/controls/title/title": {
                        "id": "title",
                        "module": "taoQtiTest/runner/plugins/controls/title/title",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Title indicator",
                        "description": "Display the title of current test element",
                        "category": "controls",
                        "active": true,
                        "tags": [
                            "core"
                        ]
                    },
                    "taoQtiTest/runner/plugins/content/modalFeedback/modalFeedback": {
                        "id": "modalFeedback",
                        "module": "taoQtiTest/runner/plugins/content/modalFeedback/modalFeedback",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "QTI modal feedbacks",
                        "description": "Display Qti modalFeedback element",
                        "category": "content",
                        "active": true,
                        "tags": [
                            "core",
                            "qti",
                            "required"
                        ]
                    },
                    "taoQtiTest/runner/plugins/content/accessibility/keyNavigation": {
                        "id": "keyNavigation",
                        "module": "taoQtiTest/runner/plugins/content/accessibility/keyNavigation",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Using key to navigate test runner",
                        "description": "Provide a way to navigate within the test runner with the keyboard",
                        "category": "content",
                        "active": true,
                        "tags": [
                            "core",
                            "qti"
                        ]
                    },
                    "taoQtiTest/runner/plugins/content/responsiveness/collapser": {
                        "id": "collapser",
                        "module": "taoQtiTest/runner/plugins/content/responsiveness/collapser",
                        "bundle": null,
                        "position": null,
                        "name": "Collapser",
                        "description": "Reduce the size of the tools when the available space is not enough",
                        "category": "content",
                        "active": true,
                        "tags": [
                            "core"
                        ]
                    },
                    "taoQtiTest/runner/plugins/content/accessibility/focusOnFirstField": {
                        "id": "focusOnFirstField",
                        "module": "taoQtiTest/runner/plugins/content/accessibility/focusOnFirstField",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Focus on first form field",
                        "description": "Sets focus on first form field",
                        "category": "content",
                        "active": true,
                        "tags": []
                    },
                    "taoQtiTest/runner/plugins/controls/timer/plugin": {
                        "id": "timer",
                        "module": "taoQtiTest/runner/plugins/controls/timer/plugin",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Timer indicator",
                        "description": "Add countdown when remaining time",
                        "category": "controls",
                        "active": true,
                        "tags": [
                            "core",
                            "qti"
                        ]
                    },
                    "taoQtiTest/runner/plugins/controls/progressbar/progressbar": {
                        "id": "progressbar",
                        "module": "taoQtiTest/runner/plugins/controls/progressbar/progressbar",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Progress indicator",
                        "description": "Display the current progression within the test",
                        "category": "controls",
                        "active": true,
                        "tags": [
                            "core"
                        ]
                    },
                    "taoQtiTest/runner/plugins/controls/duration/duration": {
                        "id": "duration",
                        "module": "taoQtiTest/runner/plugins/controls/duration/duration",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Duration record",
                        "description": "Record accurately time spent by the test taker",
                        "category": "controls",
                        "active": true,
                        "tags": [
                            "core",
                            "technical",
                            "required"
                        ]
                    },
                    "taoQtiTest/runner/plugins/controls/connectivity/connectivity": {
                        "id": "connectivity",
                        "module": "taoQtiTest/runner/plugins/controls/connectivity/connectivity",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Connectivity check",
                        "description": "Pause the test when the network loose the connection",
                        "category": "controls",
                        "active": true,
                        "tags": [
                            "core",
                            "technical"
                        ]
                    },
                    "taoQtiTest/runner/plugins/controls/testState/testState": {
                        "id": "testState",
                        "module": "taoQtiTest/runner/plugins/controls/testState/testState",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Test state",
                        "description": "Manage test state",
                        "category": "controls",
                        "active": true,
                        "tags": [
                            "core",
                            "technical",
                            "required"
                        ]
                    },
                    "taoQtiTest/runner/plugins/navigation/review/review": {
                        "id": "review",
                        "module": "taoQtiTest/runner/plugins/navigation/review/review",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Navigation and review panel",
                        "description": "Enable a panel to handle navigation and item reviews",
                        "category": "navigation",
                        "active": true,
                        "tags": [
                            "core"
                        ]
                    },
                    "taoQtiTest/runner/plugins/navigation/previous": {
                        "id": "previous",
                        "module": "taoQtiTest/runner/plugins/navigation/previous",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Previous button",
                        "description": "Enable to move backward",
                        "category": "navigation",
                        "active": true,
                        "tags": [
                            "core",
                            "qti",
                            "required"
                        ]
                    },
                    "taoQtiTest/runner/plugins/navigation/next": {
                        "id": "next",
                        "module": "taoQtiTest/runner/plugins/navigation/next",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Next button",
                        "description": "Enable to move forward",
                        "category": "navigation",
                        "active": true,
                        "tags": [
                            "core",
                            "qti",
                            "required"
                        ]
                    },
                    "taoQtiTest/runner/plugins/navigation/nextSection": {
                        "id": "nextSection",
                        "module": "taoQtiTest/runner/plugins/navigation/nextSection",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Next section button",
                        "description": "Enable to move to the next available section",
                        "category": "navigation",
                        "active": true,
                        "tags": [
                            "core",
                            "qti"
                        ]
                    },
                    "taoQtiTest/runner/plugins/navigation/skip": {
                        "id": "skip",
                        "module": "taoQtiTest/runner/plugins/navigation/skip",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Skip button",
                        "description": "Skip the current item",
                        "category": "navigation",
                        "active": true,
                        "tags": [
                            "core",
                            "qti"
                        ]
                    },
                    "taoQtiTest/runner/plugins/navigation/allowSkipping": {
                        "id": "allowSkipping",
                        "module": "taoQtiTest/runner/plugins/navigation/allowSkipping",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Allow Skipping",
                        "description": "Prevent submission of default/null responses",
                        "category": "navigation",
                        "active": true,
                        "tags": [
                            "core",
                            "qti"
                        ]
                    },
                    "taoQtiTest/runner/plugins/navigation/validateResponses": {
                        "id": "validateResponses",
                        "module": "taoQtiTest/runner/plugins/navigation/validateResponses",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Validate Responses",
                        "description": "Prevent submission of invalid responses",
                        "category": "navigation",
                        "active": true,
                        "tags": [
                            "core",
                            "qti"
                        ]
                    },
                    "taoQtiTest/runner/plugins/tools/comment/comment": {
                        "id": "comment",
                        "module": "taoQtiTest/runner/plugins/tools/comment/comment",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Comment tool",
                        "description": "Allow test taker to comment an item",
                        "category": "tools",
                        "active": true,
                        "tags": [
                            "core",
                            "qti"
                        ]
                    },
                    "taoQtiTest/runner/plugins/tools/calculator": {
                        "id": "calculator",
                        "module": "taoQtiTest/runner/plugins/tools/calculator",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Caculator tool",
                        "description": "Gives the student access to a basic calculator",
                        "category": "tools",
                        "active": true,
                        "tags": [
                            "core"
                        ]
                    },
                    "taoQtiTest/runner/plugins/tools/zoom": {
                        "id": "zoom",
                        "module": "taoQtiTest/runner/plugins/tools/zoom",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Zoom",
                        "description": "Zoom in and out the item content",
                        "category": "tools",
                        "active": true,
                        "tags": [
                            "core"
                        ]
                    },
                    "taoQtiTest/runner/plugins/tools/highlighter/plugin": {
                        "id": "highlighter",
                        "module": "taoQtiTest/runner/plugins/tools/highlighter/plugin",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Text Highlighter",
                        "description": "Allows the test taker to highlight text",
                        "category": "tools",
                        "active": true,
                        "tags": []
                    },
                    "taoQtiTest/runner/plugins/tools/magnifier/magnifier": {
                        "id": "magnifier",
                        "module": "taoQtiTest/runner/plugins/tools/magnifier/magnifier",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Magnifier",
                        "description": "Gives student access to a magnification tool",
                        "category": "tools",
                        "active": true,
                        "tags": []
                    },
                    "taoQtiTest/runner/plugins/tools/lineReader/plugin": {
                        "id": "lineReader",
                        "module": "taoQtiTest/runner/plugins/tools/lineReader/plugin",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Line Reader",
                        "description": "Display a customisable mask with a customisable hole in it!",
                        "category": "tools",
                        "active": true,
                        "tags": []
                    },
                    "taoQtiTest/runner/plugins/tools/answerMasking/plugin": {
                        "id": "answerMasking",
                        "module": "taoQtiTest/runner/plugins/tools/answerMasking/plugin",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Answer Masking",
                        "description": "Hide all answers of a choice interaction and allow revealing them",
                        "category": "tools",
                        "active": true,
                        "tags": []
                    },
                    "taoQtiTest/runner/plugins/tools/answerElimination/eliminator": {
                        "id": "eliminator",
                        "module": "taoQtiTest/runner/plugins/tools/answerElimination/eliminator",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Eliminate choices",
                        "description": "Allows student to eliminate choices",
                        "category": "tools",
                        "active": true,
                        "tags": []
                    },
                    "taoQtiTest/runner/plugins/tools/areaMasking/areaMasking": {
                        "id": "area-masking",
                        "module": "taoQtiTest/runner/plugins/tools/areaMasking/areaMasking",
                        "bundle": "taoQtiTest/loader/testPlugins.min",
                        "position": null,
                        "name": "Area Masking",
                        "description": "Mask areas of the item",
                        "category": "tools",
                        "active": true,
                        "tags": []
                    },
                    "options": {
                        "fullScreen": false,
                        "exitUrl": "https://taoce.krampstud.io/taoDelivery/DeliveryServer/index",
                        "themes": {
                            "items": {
                                "base": "https://taoce.krampstud.io/taoQtiItem/views/css/qti-runner.css?buster=5bebf5594bb0e",
                                "available": [{
                                    "id": "tao",
                                    "name": "TAO",
                                    "path": "https://taoce.krampstud.io/taoQtiItem/views/css/themes/default.css?buster=5bebf5594bb0e"
                                }],
                                "default": "tao"
                            },
                            "timerWarning": {
                                "assessmentItemRef": null,
                                "assessmentSection": null,
                                "testPart": null,
                                "assessmentTest": null
                            },
                            "catEngineWarning": null,
                            "progressIndicator": {
                                "type": "percentage",
                                "renderer": "percentage",
                                "scope": "test",
                                "forced": false,
                                "showLabel": true,
                                "showTotal": true,
                                "categories": []
                            },
                            "review": {
                                "enabled": true,
                                "scope": "test",
                                "useTitle": true,
                                "forceTitle": false,
                                "forceInformationalTitle": false,
                                "showLegend": true,
                                "defaultOpen": true,
                                "itemTitle": "Item %d",
                                "informationalItemTitle": "Instructions",
                                "preventsUnseen": true,
                                "canCollapse": false,
                                "displaySubsectionTitle": true
                            },
                            "exitButton": false,
                            "nextSection": false,
                            "plugins": {
                                "answer-masking": {
                                    "restoreStateOnToggle": true,
                                    "restoreStateOnMove": true
                                },
                                "overlay": {
                                    "full": false
                                },
                                "collapser": {
                                    "collapseTools": true,
                                    "collapseNavigation": false,
                                    "collapseInOrder": false,
                                    "hover": false,
                                    "collapseOrder": []
                                },
                                "magnifier": {
                                    "zoomMin": 2,
                                    "zoomMax": 8,
                                    "zoomStep": 0.5
                                },
                                "calculator": {
                                    "template": ""
                                }
                            },
                            "security": {
                                "csrfToken": true
                            },
                            "timer": {
                                "target": "server",
                                "resetAfterResume": false,
                                "keepUpToTimeout": false,
                                "restoreTimerFromClient": false
                            },
                            "enableAllowSkipping": true,
                            "enableValidateResponses": true,
                            "checkInformational": true,
                            "enableUnansweredItemsWarning": true,
                            "allowShortcuts": true,
                            "shortcuts": {
                                "calculator": {
                                    "toggle": "C"
                                },
                                "zoom": {
                                    "in": "I",
                                    "out": "O"
                                },
                                "comment": {
                                    "toggle": "A"
                                },
                                "itemThemeSwitcher": {
                                    "toggle": "T"
                                },
                                "review": {
                                    "toggle": "R",
                                    "flag": "M"
                                },
                                "keyNavigation": {
                                    "previous": "Shift+Tab",
                                    "next": "Tab"
                                },
                                "next": {
                                    "trigger": "J"
                                },
                                "previous": {
                                    "trigger": "K"
                                },
                                "dialog": [],
                                "magnifier": {
                                    "toggle": "L",
                                    "in": "Shift+I",
                                    "out": "Shift+O",
                                    "close": "esc"
                                },
                                "highlighter": {
                                    "toggle": "Shift+U"
                                },
                                "area-masking": {
                                    "toggle": "Y"
                                },
                                "line-reader": {
                                    "toggle": "G"
                                },
                                "answer-masking": {
                                    "toggle": "D"
                                }
                            },
                            "itemCaching": {
                                "enabled": false,
                                "amount": 3
                            },
                            "guidedNavigation": false
                        }
                    };*/

                    /**
                     * List of options required by the controller
                     * @type {String[]}
                     */
                    var requiredOptions = [
                        'testDefinition',
                        'testCompilation',
                        'serviceCallId',
                        'bootstrap',
                        'exitUrl',
                        'plugins',
                        'providers'
                    ];

                    /**
                     * Some defaults options
                     * @type {Object}
                     */
                    var defaults = {
                        provider: 'qti'
                    };

                    /**
                     * TODO provider registration should be loaded dynamically
                     */
                    runner.registerProvider('qti', qtiProvider);
                    communicator.registerProvider('poll', pollProvider);
                    communicator.registerProvider('request', requestProvider);

                    /**
                     * The runner controller
                     */
                    return {

                        /**
                         * Controller entry point
                         *
                         * @param {Object}   options - the testRunner options
                         * @param {String}   options.testDefinition - the test definition id
                         * @param {String}   options.testCompilation - the test compilation id
                         * @param {String}   options.serviceCallId - the service call id
                         * @param {Object}   options.bootstrap - contains the extension and the controller to call
                         * @param {String}   options.exitUrl - the full URL where to return at the final end of the test
                         * @param {Object[]} options.plugins - the collection of plugins to load
                         * @param {Object[]} options.providers - the collection of providers to load
                         */
                        start: function start(options) {
                            var runnerOptions = _.defaults({}, options, defaults);
                            var exitReason;
                            var $container = $('.runner');
                            var logger = loggerFactory('controller/runner', {
                                runnerOptions: runnerOptions
                            });

                            /**
                             * Does the option exists ?
                             * @param {String} name - the option key
                             * @returns {Boolean}
                             */
                            var hasOption = function hasOption(name) {
                                return typeof runnerOptions[name] !== 'undefined';
                            };

                            /**
                             * Exit the test runner using the configured exitUrl
                             * @param {String} [reason] - to add a warning once left
                             * @param {String} [level] - error level
                             */
                            var exit = function exit(reason, level) {
                                var url = runnerOptions.exitUrl;
                                var params = {};
                                if (reason) {
                                    if (!level) {
                                        level = 'warning';
                                    }
                                    params[level] = reason;
                                    url = urlUtil.build(url, params);
                                }
                                window.location = url;
                            };

                            /**
                             * Handles errors
                             * @param {Error} err - the thrown error
                             * @param {String} [displayMessage] - an alternate message to display
                             */
                            var onError = function onError(err, displayMessage) {
                                displayMessage = displayMessage || err.message;

                                if (!_.isString(displayMessage)) {
                                    displayMessage = JSON.stringify(displayMessage);
                                }
                                loadingBar.stop();


                                logger.error({
                                    displayMessage: displayMessage
                                }, err);

                                if (err.code === 403 || err.code === 500) {
                                    displayMessage = __('An error occurred during the test, please content your administrator.') + " " + displayMessage;
                                    return exit(displayMessage, 'error');
                                }
                                feedback().error(displayMessage, {
                                    timeout: -1
                                });
                            };

                            /**
                             * Load the plugins dynamically
                             * @param {Object[]} plugins - the collection of plugins to load
                             * @returns {Promise} resolves with the list of loaded plugins
                             */
                            var loadPlugins = function loadPlugins(plugins) {

                                return pluginLoaderFactory()
                                    .addList(plugins)
                                    .load(context.bundle);
                            };

                            /**
                             * Load the providers dynamically
                             * @param {Object[]} providers - the collection of providers to load
                             * @returns {Promise} resolves with the list of loaded providers
                             */
                            var loadProviders = function loadProviders(providers) {

                                return providerLoaderFactory()
                                    .addList(_.filter(providers, {
                                        category: 'runner'
                                    }))
                                    .load(context.bundle);
                            };

                            /**
                             * Load the configured proxy provider
                             * @returns {Promise} resolves with the name of the proxy provider
                             */
                            var loadProxy = function loadProxy() {
                                return proxyLoader();
                            };

                            loadingBar.start();

                            // verify required options
                            if (!_.every(requiredOptions, hasOption)) {
                                return onError(new TypeError(__('Missing required option %s', name)));
                            }

                            //load the plugins and the proxy provider
                            Promise
                                .all([
                                    loadPlugins(runnerOptions.plugins),
                                    loadProxy()
                                ])
                                .then(function(results) {

                                    var plugins = results[0];
                                    var proxyProviderName = results[1];

                                    var config = _.omit(runnerOptions, ['plugins', 'providers']);
                                    config.proxyProvider = proxyProviderName;
                                    config.renderTo = $container;

                                    logger.debug({
                                        config: config,
                                        plugins: plugins
                                    }, 'Start test runner');

                                    //instantiate the QtiTestRunner
                                    runner('qti', plugins, config)
                                        .on('error', onError)
                                        .on('ready', function() {
                                            _.defer(function() {
                                                $container.removeClass('hidden');
                                            });
                                        })
                                        .on('pause', function(data) {
                                            if (data && data.reason) {
                                                exitReason = data.reason;
                                            }
                                        })
                                        .after('destroy', function() {
                                            this.removeAllListeners();

                                            // at the end, we are redirected to the exit URL
                                            exit(exitReason);
                                        })
                                        .init();
                                })
                                .catch(function(err) {
                                    onError(err, __('An error occurred during the test initialization!'));
                                });
                        }
                    };
                });

