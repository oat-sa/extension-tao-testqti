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

    // mock the item we will get (informational or not)
    mapHelper.getItemAt = function(map, isInfo) {
        return {
            informational: isInfo
        };
    };

    /**
     * The following tests applies to all plugins
     */
    QUnit.module('pluginFactory');

    QUnit.test('module', 3, function(assert) {
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
        .cases(pluginApi)
        .test('plugin API ', 1, function(data, assert) {
            var runner = runnerFactory(providerName);
            var timer = pluginFactory(runner);
            assert.equal(typeof timer[data.name], 'function', 'The pluginFactory instances expose a "' + data.name + '" function');
        });


    /**
     * Specific tests for this plugin
     */
    QUnit.module('Behavior');

    QUnit.cases([
        {
            title: 'when the next part warning is set',
            context: {
                enableAllowSkipping: false,
                allowSkipping: false,
                options: {
                    nextPartWarning: true,
                    nextSectionWarning: false
                }
            }
        },
        {
            title: 'when the next section warning is set',
            context: {
                isLinear: true,
                options: {
                    nextPartWarning: false,
                    nextSectionWarning: true
                }
            },
            scope: 'section'
        },
        {
            title: 'when the item is informational',
            context: {
                isLinear: true,
                options: {
                    nextPartWarning: false,
                    nextSectionWarning: false
                },
                position: true
            }
        },
        {
            title: 'when the item is the last item',
            context: {
                isLinear: true,
                options: {
                    nextPartWarning: false,
                    nextSectionWarning: false
                },
                isLast: true
            }
        },
        {
            title: 'when the config setting is undefined',
            context: {
                options: {
                    nextPartWarning: false,
                    nextSectionWarning: false
                },
                isLinear: true
            }
        },
        {
            title: 'when the config setting is explicitly false',
            context: {
                options: {
                    nextPartWarning: false,
                    nextSectionWarning: false
                },
                isLinear: true
            },
            testConfig: {
                forceEnableLinearNextItemWarning: false
            }
        },
        {
            title: 'when the test is not linear',
            context: {
                options: {
                    nextPartWarning: false,
                    nextSectionWarning: false
                },
                isLinear: false
            }
        }
    ])
    .asyncTest('No dialog is triggered ', function(caseData, assert) {
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


        QUnit.expect(1);

        plugin
            .init()
            .then(function() {
                runner.setTestContext(caseData.context);

                // dialog would be instantiated *before* move occurs
                runner.on('move', function() {
                    assert.ok(true, 'The move took place without interruption');
                    runner.destroy();
                    QUnit.start();
                    return Promise.reject();
                });
                runner.trigger('move', 'next', caseData.scope);
            })
            .catch(function(err) {
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.cases([
        {
            title: 'when a next warning is needed',
            event: 'next',
            context: {
                isLinear: true,
                options: {
                    nextPartWarning: false,
                    nextSectionWarning: false
                },
                isLast: false
            },
            testConfig: {
                forceEnableLinearNextItemWarning: true
            }
        },
        {
            title: 'when a skip warning is needed',
            event: 'skip',
            context: {
                isLinear: true,
                options: {
                    nextPartWarning: false,
                    nextSectionWarning: false
                },
                isLast: false
            },
            testConfig: {
                forceEnableLinearNextItemWarning: true
            }
        }
    ])
    .asyncTest('Dialog will be triggered ', function(caseData, assert) {
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

        QUnit.expect(1);

        plugin
            .init()
            .then(function() {
                runner.setTestContext(caseData.context);

                runner.on('disablenav', function() {
                    assert.ok(true, 'The dialog interrupted the move');
                    runner.destroy();
                    QUnit.start();
                });
                runner.trigger('move', caseData.event);

            })
            .catch(function(err) {
                assert.ok(false, err.message);
                QUnit.start();
            });
    });
});
