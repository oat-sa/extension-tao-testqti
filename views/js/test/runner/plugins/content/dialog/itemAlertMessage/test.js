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
    'taoTests/runner/runner',
    'taoQtiTest/test/runner/mocks/providerMock',
    'taoQtiTest/runner/plugins/content/dialog/itemAlertMessage',
    'taoQtiItem/runner/qtiItemRunner',
    'json!taoQtiItem/test/samples/json/inlineModalFeedback.json'
], function (
    $,
    testRunnerFactory,
    providerMock,
    alertMessage,
    qtiItemRunner,
    itemData) {

    'use strict';

    var runner;
    var containerId = 'item-container';

    module('Item init', {
        teardown : function(){
            if(runner){
                runner.clear();
            }
        }
    });

    QUnit.asyncTest('Item data loading', function(assert){
        QUnit.expect(2);

        runner = qtiItemRunner('qti', itemData)
            .on('init', function(){

                assert.ok(typeof this._item === 'object', 'The item data is loaded and mapped to an object');
                assert.ok(typeof this._item.bdy === 'object', 'The item contains a body object');

                QUnit.start();
            }).init();
    });


    module('Item render', {
        teardown : function(){
            if(runner){
                runner.clear();
            }
        }
    });

    QUnit.asyncTest('Item rendering', function(assert){
        QUnit.expect(3);

        var container = document.getElementById(containerId);

        assert.ok(container instanceof HTMLElement , 'the item container exists');
        assert.equal(container.children.length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function(){

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
        teardown : function(){
            if(runner){
                runner.clear();
            }
        }
    });

    var pluginApi = [
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
            var feedback = alertMessage(runner);
            assert.equal(typeof feedback[data.name], 'function', 'The alertMessage instances expose a "' + data.name + '" function');
        });


    var providerName = 'mock';
    var testRunner;
    testRunnerFactory.registerProvider(providerName, providerMock());

    module('alertMessage', {
        teardown: function setup(){
            if(runner){
                runner.clear();
            }
        }
    });

    QUnit.asyncTest('init', function(assert) {

        var container = document.getElementById(containerId);

        assert.ok(container instanceof HTMLElement , 'the item container exists');
        assert.equal(container.children.length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function(){
                assert.equal(container.children.length, 1, 'the container has children');

                var feedback = alertMessage(testRunner, testRunner.getAreaBroker());

                feedback.init({dom: '<div>text with message for user</div>'})
                    .then(function() {
                        assert.equal(feedback.getState('init'), true, 'The feedback is initialised');
                        assert.equal(feedback.$element.text(), 'text with message for user', 'The feedback is initialised');
                        QUnit.start();
                    })
                    .catch(function(err) {
                        console.log(err);
                        assert.ok(false, 'The init method must not fail');
                        QUnit.start();
                    });
            })
            .init()
            .render(container);

        testRunner = testRunnerFactory(providerName);
        testRunner.itemRunner = runner;
    });

    QUnit.asyncTest('render', function(assert) {

        QUnit.expect(8);

        var mFeedback;
        var container = document.getElementById(containerId);

        assert.ok(container instanceof HTMLElement , 'the item container exists');
        assert.equal(container.children.length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function(){
                assert.equal(container.children.length, 1, 'the container has children');

                mFeedback = alertMessage(testRunner, testRunner.getAreaBroker());

                mFeedback.init({dom: '<div id="qUnitTestMessage">text with message for user</div>'});
                mFeedback
                    .render()
                    .catch(function(err){
                        console.log(err);
                        assert.ok(false, 'The render method must not fail');
                        QUnit.start();
                    });
            })
            .init()
            .render(container);

        testRunner = testRunnerFactory(providerName);
        testRunner.itemRunner = {_item: runner};

        testRunner
            .on('plugin-render.itemAlertMessage', function(feedback) {
                assert.equal(feedback.getState('ready'), true, 'The feedback is rendered');
                assert.equal(feedback.$element.text(), 'text with message for user', 'The content was attached');
                assert.equal($('#qUnitTestMessage', testRunner.itemRunner.container).length, 1, 'The message is created');

                feedback.$element.on('destroyed.modal', function(){
                    assert.ok(true, 'The feedback is deleted');
                });
                feedback.destroy();
            })
            .on('plugin-resume.itemAlertMessage', function() {
                assert.equal($('#qUnitTestMessage', testRunner.getAreaBroker()).length, 0, 'The message is deleted');
                QUnit.start();
            });
    });
});
