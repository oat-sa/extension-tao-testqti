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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */

/**
 */
define([
    'jquery',
    'taoTests/runner/runner',
    'taoQtiTest/test/runner/mocks/providerMock',
    'taoQtiTest/runner/plugins/content/rubricBlock/rubricBlock'
], function($, runnerFactory, providerMock, pluginFactory) {
    'use strict';

    var pluginApi;
    var providerName = 'mock';
    runnerFactory.registerProvider(providerName, providerMock());

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


    pluginApi = [
        { name : 'init', title : 'init' },
        { name : 'render', title : 'render' },
        { name : 'finish', title : 'finish' },
        { name : 'destroy', title : 'destroy' },
        { name : 'trigger', title : 'trigger' },
        { name : 'getTestRunner', title : 'getTestRunner' },
        { name : 'getAreaBroker', title : 'getAreaBroker' },
        { name : 'getConfig', title : 'getConfig' },
        { name : 'setConfig', title : 'setConfig' },
        { name : 'getState', title : 'getState' },
        { name : 'setState', title : 'setState' },
        { name : 'show', title : 'show' },
        { name : 'hide', title : 'hide' },
        { name : 'enable', title : 'enable' },
        { name : 'disable', title : 'disable' }
    ];

    QUnit
        .cases(pluginApi)
        .test('plugin API ', 1, function(data, assert) {
            var runner = runnerFactory(providerName);
            var timer = pluginFactory(runner);
            assert.equal(typeof timer[data.name], 'function', 'The pluginFactory instances expose a "' + data.name + '" function');
        });


    QUnit.module('load rubric blocks');

    QUnit.asyncTest('render a rubric block', function(assert) {
        var runner        = runnerFactory(providerName);
        var plugin        = pluginFactory(runner, runner.getAreaBroker());

        QUnit.expect(2);

        runner.on('rubricblock', function(){
            var $container = runner.getAreaBroker().getContainer();

            assert.equal($('#qti-rubrics', $container).length, 1, 'The rubric blocks element is created');
            assert.equal($('#qti-rubrics', $container).html(), '<p>foo</p>', 'The rubric blocks content is loaded');
            QUnit.start();
        });

        plugin
            .init()
            .then(plugin.render())
            .then(function() {

                runner.trigger('loaditem', 'foo', {
                    rubrics : '<p>foo</p>'
                });
                runner.trigger('renderitem');
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('load / unload a rubric block', function(assert) {
        var runner        = runnerFactory(providerName);
        var plugin        = pluginFactory(runner, runner.getAreaBroker());

        QUnit.expect(4);

        runner
            .after('renderitem', function(){
                var $container = runner.getAreaBroker().getContainer();

                assert.equal($('#qti-rubrics', $container).length, 1, 'The rubric block element is created');
                assert.equal($('#qti-rubrics', $container).children().length, 1, 'The rubric block element contains an child');
            })
            .after('unloaditem', function(){
                var $container = runner.getAreaBroker().getContainer();

                assert.equal($('#qti-rubrics', $container).length, 1, 'The rubric block element is created');
                assert.equal($('#qti-rubrics', $container).children().length, 0, 'The rubric block element is empty');

                QUnit.start();
            });

        plugin
            .init()
            .then(plugin.render())
            .then(function() {
                runner.trigger('loaditem', 'foo', {
                    rubrics : '<p>foo</p>'
                });

                runner.trigger('renderitem');

                setTimeout(function(){
                    runner.trigger('unloaditem');
                }, 10);
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('render a rubric block with links', function(assert) {
        var runner        = runnerFactory(providerName);
        var plugin        = pluginFactory(runner, runner.getAreaBroker());

        QUnit.expect(3);

        runner.on('rubricblock', function(){
            var $container = runner.getAreaBroker().getContainer();

            assert.equal($('#qti-rubrics', $container).length, 1, 'The rubric blocks element is created');
            assert.equal($('#qti-rubrics a', $container).length, 1, 'The link is in the rubric block');
            assert.equal($('#qti-rubrics a', $container).attr('target'), '_blank', 'The link has now a _blank target');
            QUnit.start();
        });

        plugin
            .init()
            .then(plugin.render())
            .then(function() {

                runner.trigger('loaditem', 'foo', {
                    rubrics : '<p><a href="http//taotesting.com">foo</a></p>'
                });
                runner.trigger('renderitem');
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('render a rubric block with math', function(assert) {
        var runner        = runnerFactory(providerName);
        var plugin        = pluginFactory(runner, runner.getAreaBroker());

        QUnit.expect(2);

        runner.on('rubricblock', function(){
            var $container = runner.getAreaBroker().getContainer();

            assert.equal($('#qti-rubrics', $container).length, 1, 'The rubric blocks element is created');

            //unfortunately we cannot assert the math content has been rendered correctly since mathjax is probaly not
            //installed on the test runtime. We just assert the rubric block is loaded
            assert.equal($('#qti-rubrics', $container).find('math').length, 1, 'The rubric blocks element contains a math element');

            QUnit.start();
        });

        plugin
            .init()
            .then(plugin.render())
            .then(function() {
                runner.trigger('loaditem', 'foo', {
                    rubrics : '<div><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mrow><mi>Δ</mi><mo>=</mo><msup><mi>b</mi><mn>2</mn></msup><mo>-</mo><mrow><mn>4</mn><mo>⁢</mo<mi>a</mi<mo>⁢</mo<mi>c</mi></mrow></mro</math></div>'
                });
                runner.trigger('renderitem');
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });
});
