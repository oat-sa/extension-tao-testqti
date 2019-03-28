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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */

define([
    'core/promise',
    'taoTests/runner/runner',
    'taoQtiTest/test/runner/mocks/providerMock',
    'taoQtiTest/runner/plugins/navigation/next/linearNextItemWarning',
    'taoQtiTest/runner/helpers/map'
], function(Promise, runnerFactory, providerMock, pluginFactory, mapHelper) {
    'use strict';

    var pluginApi;
    var providerName = 'mock';
    runnerFactory.registerProvider(providerName, providerMock());


    /**
     * The following tests applies to all plugins
     */
    QUnit.module('pluginFactory');

    QUnit.test('module', function(assert) {
        assert.expect(3);
        var runner = runnerFactory(providerName);
        assert.equal(typeof pluginFactory, 'function', "The pluginFactory module exposes a function");
        assert.equal(typeof pluginFactory(runner), 'object', "The plugin factory produces an instance");
        assert.notStrictEqual(pluginFactory(runner), pluginFactory(runner), "The plugin factory provides a different instance on each call");
    });


    pluginApi = [{
        name: 'init',
        title: 'init'
    }, {
        name: 'render',
        title: 'render'
    }, {
        name: 'finish',
        title: 'finish'
    }, {
        name: 'destroy',
        title: 'destroy'
    }, {
        name: 'trigger',
        title: 'trigger'
    }, {
        name: 'getTestRunner',
        title: 'getTestRunner'
    }, {
        name: 'getAreaBroker',
        title: 'getAreaBroker'
    }, {
        name: 'getConfig',
        title: 'getConfig'
    }, {
        name: 'setConfig',
        title: 'setConfig'
    }, {
        name: 'getState',
        title: 'getState'
    }, {
        name: 'setState',
        title: 'setState'
    }, {
        name: 'show',
        title: 'show'
    }, {
        name: 'hide',
        title: 'hide'
    }, {
        name: 'enable',
        title: 'enable'
    }, {
        name: 'disable',
        title: 'disable'
    }];

    QUnit
        .cases.init(pluginApi)
        .test('plugin API ', function(data, assert) {
            assert.expect(1);
            var runner = runnerFactory(providerName);
            var timer = pluginFactory(runner);
            assert.equal(typeof timer[data.name], 'function', 'The pluginFactory instances expose a "' + data.name + '" function');
        });


    /**
     * Specific tests for this plugin
     */
    QUnit.module('Behavior');

    // No dialog expected
    QUnit.cases.init([
        {
            title: 'when the next part warning is set',
            testContext: {
                enableAllowSkipping: false,
                allowSkipping: false,
                options: {
                    nextPartWarning: true,
                    nextSectionWarning: false
                }
            },
            item: {
                informational: false
            }
        },
        {
            title: 'when the next section warning is set',
            testContext: {
                isLinear: true,
                options: {
                    nextPartWarning: false,
                    nextSectionWarning: true
                }
            },
            scope: 'section',
            item: {
                informational: false
            }
        },
        {
            title: 'when the item is informational',
            testContext: {
                isLinear: true,
                options: {
                    nextPartWarning: false,
                    nextSectionWarning: false
                }
            },
            item: {
                informational: true
            }
        },
        {
            title: 'when the item is the last item',
            testContext: {
                isLinear: true,
                options: {
                    nextPartWarning: false,
                    nextSectionWarning: false
                },
                isLast: true
            },
            item: {
                informational: false
            }
        },
        {
            title: 'when the config setting is undefined',
            testContext: {
                options: {
                    nextPartWarning: false,
                    nextSectionWarning: false
                },
                isLinear: true
            },
            item: {
                informational: false
            }
        },
        {
            title: 'when the config setting is explicitly false',
            testContext: {
                options: {
                    nextPartWarning: false,
                    nextSectionWarning: false
                },
                isLinear: true
            },
            testConfig: {
                forceEnableLinearNextItemWarning: false
            },
            item: {
                informational: false
            }
        },
        {
            title: 'when the test is not linear',
            testContext: {
                options: {
                    nextPartWarning: false,
                    nextSectionWarning: false
                },
                isLinear: false
            },
            item: {
                informational: false
            }
        }
    ])
    .test('No dialog is triggered ', function(caseData, assert) {
        var ready = assert.async();
        var runner = runnerFactory(providerName);
        var plugin = pluginFactory(runner, runner.getAreaBroker());

        // mock test store init
        runner.getTestStore = function() {
            return {
                setVolatile: function() {}
            };
        };
        // mock config
        runner.getTestData = function() {
            return {
                config: caseData.testConfig
            };
        };
        // mock the item we will get (informational or not)
        mapHelper.getItemAt = function() {
            return caseData.item;
        };

        assert.expect(1);

        plugin
            .init()
            .then(function() {
                runner.setTestContext(caseData.testContext);

                // dialog would be instantiated *before* move occurs
                runner.on('move', function() {
                    assert.ok(true, 'The move took place without interruption');
                    runner.destroy();
                    ready();
                    return Promise.reject();
                });
                runner.trigger('move', 'next', caseData.scope);
            })
            .catch(function(err) {
                assert.ok(false, err.message);
                ready();
            });
    });

    // Dialog expected
    QUnit.cases.init([
        {
            title: 'when a next warning is needed',
            event: 'next',
            testContext: {
                isLinear: true,
                options: {
                    nextPartWarning: false,
                    nextSectionWarning: false
                },
                isLast: false
            },
            testConfig: {
                forceEnableLinearNextItemWarning: true
            },
            item: {
                informational: false
            }
        },
        {
            title: 'when a skip warning is needed',
            event: 'skip',
            testContext: {
                isLinear: true,
                options: {
                    nextPartWarning: false,
                    nextSectionWarning: false
                },
                isLast: false
            },
            testConfig: {
                forceEnableLinearNextItemWarning: true
            },
            item: {
                informational: false
            }
        }
    ])
    .test('Dialog will be triggered ', function(caseData, assert) {
        var ready = assert.async();

        var runner = runnerFactory(providerName);
        var plugin = pluginFactory(runner, runner.getAreaBroker());

        // mock test store init
        runner.getTestStore = function() {
            return {
                getStore: function() {
                    return Promise.reject();
                },
                setVolatile: function() {}
            };
        };
        // mock config
        runner.getTestData = function() {
            return {
                config: caseData.testConfig
            };
        };

        assert.expect(1);

        plugin
            .init()
            .then(function() {
                runner.setTestContext(caseData.testContext);

                runner.on('disablenav', function() {
                    assert.ok(true, 'The dialog interrupted the move');
                    runner.destroy();
                    ready();
                });
                runner.trigger('move', caseData.event);

            })
            .catch(function(err) {
                assert.ok(false, err.message);
                ready();
            });
    });
});
