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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */
/**
 * Test the timer's plugin strategyHandler
 */
define([
    'core/eventifier',
    'taoQtiTest/runner/plugins/controls/timer/strategy/strategyHandler'
], function(eventifier, strategyHandler) {
    'use strict';

    var testRunnerMock = eventifier({
        getTestContext : function getTestContext(){ }
    });


    var strategyFoo = function strategyFoo(testRunner, timer){
        if(timer.type === 'foo'){
            return {
                name : 'foo',
                setUp : function setUp(){
                    testRunner.trigger('setup', timer.id);
                },
                start : function start(){
                    testRunner.trigger('start', timer.id);
                },
                stop : function stop(){
                    testRunner.trigger('stop', timer.id);
                },
                complete : function complete(){
                    testRunner.trigger('complete', timer.id);
                },
                tearDown : function tearDown(){
                    testRunner.trigger('tearDown', timer.id);
                }
            };
        }
        return false;
    };
    var strategyBar = function strategyBar(testRunner, timer){
        if(timer.type === 'bar'){
            return {
                name : 'bar',
                setUp : function setUp(){
                    testRunner.trigger('setup', timer.id);
                },
                tearDown : function tearDown(){
                    testRunner.trigger('tearDown', timer.id);
                }
            };
        }
        return false;
    };


    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(3);

        assert.equal(typeof strategyHandler, 'function', "The strategyHandler module exposes a function");
        assert.equal(typeof strategyHandler(testRunnerMock), 'object', "The strategyHandler factory produces an object");
        assert.notStrictEqual(strategyHandler(testRunnerMock), strategyHandler(testRunnerMock), "The strategyHandler factory provides a different object on each call");
    });

    QUnit.cases([
        { title : 'setUp' },
        { title : 'getActives' },
        { title : 'start' },
        { title : 'stop' },
        { title : 'complete' },
        { title : 'tearDown' }
    ]).test('Instance API ', function(data, assert) {
        var instance = strategyHandler(testRunnerMock);
        assert.equal(typeof instance[data.title], 'function', 'The strategyHandler exposes the method "' + data.title);
    });


    QUnit.test('factory', function(assert) {
        QUnit.expect(4);

        assert.throws(function(){
            strategyHandler();
        }, TypeError, 'No test runner given throws');
        assert.throws(function(){
            strategyHandler({ });
        }, TypeError, 'No valid test runner given throws');
        assert.throws(function(){
            strategyHandler({
                on : function(){},
                trigger : function() {}
            });
        }, TypeError, 'No valid test runner given throws');
        assert.equal(typeof strategyHandler(testRunnerMock), 'object', "The strategyHandler factory produces an object");
    });


    QUnit.module('Behavior');

    QUnit.asyncTest('activate one strategy for on timer', function(assert) {

        var handler = strategyHandler(testRunnerMock, [strategyFoo, strategyBar]);

        var timer = {
            id: 'timer1',
            type : 'foo'
        };

        QUnit.expect(4);

        assert.deepEqual(handler.getActives(timer), [], 'No active strategy yet');
        handler.setUp(timer)
            .then(function(){
                assert.equal(handler.getActives(timer).length, 1, 'A strategy has been activated');
                assert.equal(handler.getActives(timer) [0].name , 'foo', 'The foo strategy has been activated');
            })
            .then(function(){
                return handler.tearDown(timer);
            })
            .then(function(){
                assert.deepEqual(handler.getActives(timer), [], 'The foo strategy is not active anymore');
            })
            .then(function(){
                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('active strategy multiple timers', function(assert) {

        var handler = strategyHandler(testRunnerMock, [strategyFoo, strategyBar]);

        var timer = {
            id: 'timer1',
            type : 'foo'
        };
        var witnessTimer = {
            id: 'timerX',
            type : 'xxx'
        };

        QUnit.expect(7);

        assert.deepEqual(handler.getActives(timer), [], 'No active strategy yet');
        assert.deepEqual(handler.getActives(witnessTimer), [], 'No active strategy yet');

        handler.setUp(timer)
            .then(function(){
                assert.equal(handler.getActives(timer).length, 1, 'A strategy has been activated');
                assert.equal(handler.getActives(timer) [0].name , 'foo', 'The foo strategy has been activated');

                return handler.setUp(witnessTimer);
            })
            .then(function(){
                assert.equal(handler.getActives(witnessTimer).length, 0, 'No strategy activated');

                return handler.tearDown(timer);
            })
            .then(function(){
                return handler.tearDown(witnessTimer);
            })
            .then(function(){
                assert.equal(handler.getActives(timer).length, 0, 'Strategy removed');
                assert.equal(handler.getActives(witnessTimer).length, 0, 'No strategy activated');

                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('call active strategy entry points', function(assert) {

        var handler = strategyHandler(testRunnerMock, [strategyFoo, strategyBar]);

        var timer = {
            id: 'timer1',
            type : 'foo'
        };
        var witnessTimer = {
            id: 'timerX',
            type : 'xxx'
        };

        QUnit.expect(5);

        testRunnerMock
            .on('setup', function(id){
                assert.equal(id, timer.id, 'The setup entrypoint is called wit the correct timer');
            })
            .on('start', function(id){
                assert.equal(id, timer.id, 'The start entrypoint is called wit the correct timer');
            })
            .on('stop', function(id){
                assert.equal(id, timer.id, 'The stop entrypoint is called wit the correct timer');
            })
            .on('complete', function(id){
                assert.equal(id, timer.id, 'The complete entrypoint is called wit the correct timer');
            })
            .on('tearDown', function(id){
                assert.equal(id, timer.id, 'The tearDown entrypoint is called wit the correct timer');
            });

        handler.setUp(timer)
            .then(function(){
                return handler.setUp(witnessTimer);
            })
            .then(function(){
                return handler.start(timer);
            })
            .then(function(){
                return handler.start(witnessTimer);
            })
            .then(function(){
                return handler.stop(witnessTimer);
            })
            .then(function(){
                return handler.stop(timer);
            })
            .then(function(){
                return handler.complete(witnessTimer);
            })
            .then(function(){
                return handler.complete(timer);
            })
            .then(function(){
                return handler.tearDown(timer);
            })
            .then(function(){
                return handler.tearDown(witnessTimer);
            })
            .then(function(){
                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });
});
