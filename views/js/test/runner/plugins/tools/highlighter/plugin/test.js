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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'ui/hider',
    'core/promise',
    'taoTests/runner/runner',
    'taoQtiTest/runner/helpers/currentItem',
    'taoQtiTest/test/runner/mocks/providerMock',
    'taoQtiTest/runner/plugins/tools/highlighter/plugin'
], function(
    $,
    _,
    hider,
    Promise,
    runnerFactory,
    itemHelper,
    providerMock,
    pluginFactory
) {
    'use strict';

    var pluginApi;
    var providerName = 'mock';
    runnerFactory.registerProvider(providerName, providerMock());

    function selectText(id){
        var sel, range;
        var el = document.getElementById(id); //get element id
        sel = window.getSelection();
        range = document.createRange(); //range object
        range.selectNodeContents(el); //sets Range
        sel.removeAllRanges(); //remove all ranges from selection
        sel.addRange(range); //add Range to a Selection.
    }


    /**
     * The following tests applies to all plugins
     */
    QUnit.module('pluginFactory');

    QUnit.test('module', function(assert) {
        var runner = runnerFactory(providerName);

        assert.equal(typeof pluginFactory, 'function', 'The pluginFactory module exposes a function');
        assert.equal(typeof pluginFactory(runner), 'object', 'The plugin factory produces an instance');
        assert.notStrictEqual(pluginFactory(runner), pluginFactory(runner), 'The plugin factory provides a different instance on each call');
    });

    pluginApi = [
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
        .cases.init(pluginApi)
        .test('plugin API ', function(data, assert) {
            var runner = runnerFactory(providerName);
            var timer = pluginFactory(runner);
            assert.equal(typeof timer[data.name], 'function', 'The pluginFactory instances expose a "' + data.name + '" function');
        });

    QUnit.test('pluginFactory.init', function(assert) {
        var ready = assert.async();
        var runner = runnerFactory(providerName);
        var plugin = pluginFactory(runner, runner.getAreaBroker());

        plugin.init()
            .then(function() {
                assert.equal(plugin.getState('init'), true, 'The plugin is initialised');

                ready();
            })
            .catch(function(err) {
                assert.ok(false, 'The init failed: ' + err);
                ready();
            });
    });

    /**
     * The following tests applies to buttons-type plugins
     */
    QUnit.module('plugin button');

    function getButtonContainer(runner) {
        return runner.getAreaBroker().getToolboxArea();
    }

    QUnit.test('render/destroy button', function(assert) {
        var ready = assert.async();
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = pluginFactory(runner, runner.getAreaBroker());

        assert.expect(6);

        plugin.init()
            .then(function() {
                var $container = getButtonContainer(runner),
                    $buttonMain, $buttonRemove;

                areaBroker.getToolbox().render($container);

                $buttonMain = $container.find('[data-control="highlight-trigger"]');
                $buttonRemove = $container.find('[data-control="highlight-clear"]');

                assert.equal($buttonMain.length, 1, 'The trigger button has been inserted');
                assert.equal($buttonMain.hasClass('disabled'), true, 'The trigger button has been rendered disabled');
                assert.equal($buttonRemove.length, 1, 'The remove button has been inserted');
                assert.equal($buttonMain.hasClass('disabled'), true, 'The remove button has been rendered disabled');

                areaBroker.getToolbox().destroy();

                $buttonMain = $container.find('[data-control="highlight-trigger"]');
                $buttonRemove = $container.find('[data-control="highlight-clear"]');

                assert.equal($buttonMain.length, 0, 'The trigger button has been removed');
                assert.equal($buttonRemove.length, 0, 'The remove button has been removed');
                ready();

            })
            .catch(function(err) {
                assert.ok(false, 'Error in init method: ' + err);
                ready();
            });
    });

    QUnit.test('enable/disable button', function(assert) {
        var ready = assert.async();
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = pluginFactory(runner, runner.getAreaBroker());

        assert.expect(4);

        plugin.init()
            .then(function() {
                var $container = getButtonContainer(runner),
                    $buttonMain, $buttonRemove;

                areaBroker.getToolbox().render($container);

                plugin.enable()
                    .then(function() {
                        $buttonMain = $container.find('[data-control="highlight-trigger"]');
                        $buttonRemove = $container.find('[data-control="highlight-clear"]');

                        assert.equal($buttonMain.hasClass('disabled'), false, 'The trigger button has been enabled');
                        assert.equal($buttonRemove.hasClass('disabled'), false, 'The remove button has been enabled');

                        plugin.disable()
                            .then(function() {
                                assert.equal($buttonMain.hasClass('disabled'), true, 'The trigger button has been disabled');
                                assert.equal($buttonRemove.hasClass('disabled'), true, 'The remove button has been disabled');

                                ready();
                            })
                            .catch(function(err) {
                                assert.ok(false, 'error in disable method: ' + err);
                                ready();
                            });
                    })
                    .catch(function(err) {
                        assert.ok(false, 'error in enable method: ' + err);
                        ready();
                    });
            })
            .catch(function(err) {
                assert.ok(false, 'Error in init method: ' + err);
                ready();
            });
    });

    QUnit.test('show/hide button', function(assert) {
        var ready = assert.async();
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = pluginFactory(runner, runner.getAreaBroker());

        assert.expect(4);

        plugin.init()
            .then(function() {
                var $container = getButtonContainer(runner),
                    $buttonMain, $buttonRemove;

                areaBroker.getToolbox().render($container);

                plugin.hide()
                    .then(function() {
                        $buttonMain = $container.find('[data-control="highlight-trigger"]');
                        $buttonRemove = $container.find('[data-control="highlight-clear"]');

                        assert.ok(hider.isHidden($buttonMain), 'The trigger button has been hidden');
                        assert.ok(hider.isHidden($buttonRemove), 'The remove button has been hidden');

                        plugin.show()
                            .then(function() {
                                assert.ok(!hider.isHidden($buttonMain), 'The trigger button is visible');
                                assert.ok(!hider.isHidden($buttonRemove), 'The remove button is visible');

                                ready();
                            })
                            .catch(function(err) {
                                assert.ok(false, 'error in disable method: ' + err);
                                ready();
                            });
                    })
                    .catch(function(err) {
                        assert.ok(false, 'error in enable method: ' + err);
                        ready();
                    });
            })
            .catch(function(err) {
                assert.ok(false, 'Error in init method: ' + err);
                ready();
            });
    });

    /**
     * The following tests applies to this plugin specfically
     */
    QUnit.test('runner events: loaditem / unloaditem', function(assert) {
        var ready = assert.async();
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = pluginFactory(runner, runner.getAreaBroker());

        assert.expect(6);

        runner.setTestContext({
            options: {
                highlighter: true
            }
        });

        plugin.init()
            .then(function() {
                var $container = getButtonContainer(runner),
                    $buttonMain, $buttonRemove;

                areaBroker.getToolbox().render($container);

                $buttonMain = $container.find('[data-control="highlight-trigger"]');
                $buttonRemove = $container.find('[data-control="highlight-clear"]');

                runner.trigger('loaditem');

                assert.ok(!hider.isHidden($buttonMain), 'The trigger button is visible');
                assert.ok(!hider.isHidden($buttonRemove), 'The remove button is visible');

                runner.trigger('unloaditem');

                assert.ok(!hider.isHidden($buttonMain), 'The trigger button is still visible');
                assert.ok(!hider.isHidden($buttonRemove), 'The remove button is still visible');

                assert.equal($buttonMain.hasClass('disabled'), true, 'The trigger button has been disabled');
                assert.equal($buttonRemove.hasClass('disabled'), true, 'The remove button has been disabled');

                ready();
            })
            .catch(function(err) {
                assert.ok(false, 'Error in init method: ' + err);
                ready();
            });
    });

    QUnit.test('runner events: renderitem', function(assert) {
        var ready = assert.async();
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = pluginFactory(runner, runner.getAreaBroker());

        assert.expect(4);

        plugin.init()
            .then(function() {
                var $container = getButtonContainer(runner),
                    $buttonMain, $buttonRemove;

                areaBroker.getToolbox().render($container);

                $buttonMain = $container.find('[data-control="highlight-trigger"]');
                $buttonRemove = $container.find('[data-control="highlight-clear"]');

                runner.trigger('renderitem');

                assert.ok(!hider.isHidden($buttonMain), 'The trigger button is visible');
                assert.ok(!hider.isHidden($buttonRemove), 'The remove button is visible');

                assert.equal($buttonMain.hasClass('disabled'), false, 'The trigger button is not disabled');
                assert.equal($buttonRemove.hasClass('disabled'), false, 'The remove button is not disabled');

                ready();
            })
            .catch(function(err) {
                assert.ok(false, 'Error in init method: ' + err);
                ready();
            });
    });

    QUnit.test('actions: select item & stimulus texts, unload, reload', function(assert) {
        var ready = assert.async();
        var runner = runnerFactory(providerName);
        var areaBroker = runner.getAreaBroker();
        var plugin = pluginFactory(runner, runner.getAreaBroker());
        var $container,
            $buttonMain,
            $buttonRemove;
        var cleanItemHtml = $('#qunit-item').html();

        // mock context
        runner.getTestContext = function() {
            return {
                itemIdentifier: 'item-1',
                options: {
                    highlighter: true
                }
            };
        };

        // mock stimulus helper
        itemHelper.getStimuliHrefs = function() {
            return ['http://include1.xml', 'http://include2.xml'];
        };

        assert.expect(11);

        plugin.init()
            .then(function() {
                $container = getButtonContainer(runner),
                areaBroker.getToolbox().render($container);
                $buttonMain = $container.find('[data-control="highlight-trigger"]');
                $buttonRemove = $container.find('[data-control="highlight-clear"]');

                runner.trigger('loaditem');
                runner.trigger('renderitem');

                // wait for highlighters to be loaded (async)
                return new Promise (function(resolve) {
                    setTimeout(resolve, 1000);
                });
            })
            .then(function() {
                // do some highlighting
                selectText('para1');
                $buttonMain.trigger('mousedown');
                assert.equal($('#para1 span').length, 1, 'Para 1 was highlighted');

                selectText('para2');
                $buttonMain.trigger('mousedown');
                assert.equal($('#para2 span').length, 1, 'Para 2 was highlighted');

                selectText('stim1');
                $buttonMain.trigger('mousedown');
                assert.equal($('#stim1 span').length, 1, 'Stim 1 was highlighted');

                selectText('stim2');
                $buttonMain.trigger('mousedown');
                assert.equal($('#stim2 span').length, 1, 'Stim 2 was highlighted');

                assert.equal($('.qti-itemBody').find('span').length, 4, '4 highlights exist');

                // unload the item, reset DOM
                runner.trigger('unloaditem'); // saves
                $('#qunit-item').empty();

                // wait for highlighters to be saved (async)
                return new Promise (function(resolve) {
                    setTimeout(resolve, 1000);
                });
            })
            .then(function() {
                $('#qunit-item').html(cleanItemHtml);

                // load item again
                runner.trigger('loaditem');
                runner.trigger('renderitem'); // loads

                // wait for highlighters to be loaded (async)
                return new Promise (function(resolve) {
                    setTimeout(resolve, 1000);
                });

            })
            .then(function() {
                // test loaded highlights
                assert.equal($('#para1 span').length, 1, 'Para 1 was highlighted');
                assert.equal($('#para2 span').length, 1, 'Para 2 was highlighted');
                assert.equal($('#stim1 span').length, 1, 'Stim 1 was highlighted');
                assert.equal($('#stim2 span').length, 1, 'Stim 2 was highlighted');
                assert.equal($('.qti-itemBody').find('span').length, 4, '4 highlights exist');

                $buttonRemove.trigger('click');
                assert.equal($('.qti-itemBody').find('span').length, 0, 'No highlights remain after clear');
                ready();

            })
            .catch(function(err) {
                assert.ok(false, 'Error in init method: ' + err);
                ready();
            });

    });

});
