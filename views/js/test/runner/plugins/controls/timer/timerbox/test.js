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
 * Test the timer's plugin timerbox component
 */
define([
    'jquery',
    'taoQtiTest/runner/plugins/controls/timer/component/timerbox'
], function($, timerboxFactory) {
    'use strict';


    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(3);

        assert.equal(typeof timerboxFactory, 'function', "The timerboxFactory module exposes a function");
        assert.equal(typeof timerboxFactory(), 'object', "The timerboxFactory factory produces an object");
        assert.notStrictEqual(timerboxFactory(), timerboxFactory(), "The timerboxFactory factory provides a different object on each call");
    });

    QUnit.cases([
        { title : 'init' },
        { title : 'destroy' },
        { title : 'render' },
        { title : 'show' },
        { title : 'hide' },
        { title : 'enable' },
        { title : 'disable' },
        { title : 'is' },
        { title : 'setState' },
        { title : 'getContainer' },
        { title : 'getElement' },
        { title : 'getTemplate' },
        { title : 'setTemplate' },
    ]).test('Component API ', function(data, assert) {
        var instance = timerboxFactory();
        assert.equal(typeof instance[data.title], 'function', 'The timerboxFactory exposes the component method "' + data.title);
    });

    QUnit.cases([
        { title : 'on' },
        { title : 'off' },
        { title : 'trigger' },
        { title : 'before' },
        { title : 'after' },
    ]).test('Eventifier API ', function(data, assert) {
        var instance = timerboxFactory();
        assert.equal(typeof instance[data.title], 'function', 'The timerboxFactory exposes the eventifier method "' + data.title);
    });

    QUnit.cases([
        { title : 'update' },
        { title : 'start' },
        { title : 'stop' },
        { title : 'getTimers' },
        { title : 'addTimer' },
        { title : 'removeTimer' },
        { title : 'updateTimer' }
    ]).test('Instance API ', function(data, assert) {
        var instance = timerboxFactory();
        assert.equal(typeof instance[data.title], 'function', 'The timerboxFactory exposes the method "' + data.title);
    });


    QUnit.module('Behavior');

    QUnit.asyncTest('Lifecycle', function(assert) {
        var $container = $('#qunit-fixture');

        QUnit.expect(2);

        timerboxFactory({})
        .on('init', function(){
            assert.ok( !this.is('rendered'), 'The component is not rendered');
            this.render($container);
        })
        .on('render', function(){

            assert.ok(this.is('rendered'), 'The component is now rendered');

            this.destroy();
        })
        .on('destroy', function(){

            QUnit.start();
        });
    });

    QUnit.asyncTest('Rendering', function(assert) {
        var $container = $('#qunit-fixture');

        QUnit.expect(7);

        assert.equal($('.timer-box', $container).length, 0, 'The component does not exists yet');

        timerboxFactory({
            timers : {
                'timer-1' : {
                    id : 'timer-1',
                    label : 'Timer 01',
                    remainingTime: 10000
                },
                'timer-2' : {
                    id : 'timer-2',
                    label : 'Timer 02',
                    remainingTime: 5000
                }
            }
        })
        .on('init', function(){
            this.render($container);
        })
        .on('update', function(){

            var $element = this.getElement();

            assert.equal($('.timer-box', $container).length, 1, 'The component has been inserted');
            assert.equal($('.timer-box', $container)[0], $element[0], 'The component element is correct');

            assert.equal($('.timer-toggler', $element).length, 1, 'The time toggler is rendered');
            assert.equal($('.countdown', $element).length, 2, '2 timers are rendered');
            assert.equal($('.countdown[data-control="timer-1"]', $element).length, 1, 'The correct timer is added');
            assert.equal($('.countdown[data-control="timer-2"]', $element).length, 1, 'The correct timer is added');

            this.destroy();
        })
        .on('destroy', function(){

            QUnit.start();
        });
    });

    QUnit.asyncTest('start/stop timers', function(assert) {
        var $container = $('#qunit-fixture');
        var startCount = 0;
        var stopCount = 0;

        QUnit.expect(12);

        timerboxFactory({
            timers : {
                'timer-1' : {
                    id : 'timer-1',
                    label : 'Timer 01',
                    remainingTime: 5000
                },
                'timer-2' : {
                    id : 'timer-2',
                    label : 'Timer 02',
                    remainingTime: 5000
                }
            }
        })
        .on('init', function(){
            this.render($container);
        })
        .on('update', function(){

            this.start();
        })
        .on('timerstart', function(timer){
            var self = this;

            assert.equal(typeof timer, 'object', 'The give timer is an object');
            assert.equal(typeof timer.id, 'string', 'The give timer has an id');
            assert.equal(timer.remainingTime, 5000, 'Timers just get started');
            startCount++;

            if(startCount >= 2){
                setTimeout(function(){
                    self.stop();
                }, 2000);
            }
        })
        .on('timerstop', function(timer){
            assert.equal(typeof timer, 'object', 'The give timer is an object');
            assert.equal(typeof timer.id, 'string', 'The give timer has an id');
            assert.ok(timer.remainingTime < 5000, 'Some time elasped');
            stopCount++;

            if(stopCount >= 2){
                this.destroy();
            }
        })
        .on('destroy', function(){

            QUnit.start();
        });
    });


    QUnit.asyncTest('Update timers', function(assert) {
        var $container = $('#qunit-fixture');

        QUnit.expect(11);

        assert.equal($('.timer-box', $container).length, 0, 'The component does not exists yet');

        timerboxFactory({
            timers : {
                'timer-1' : {
                    id : 'timer-1',
                    label : 'Timer 01',
                    remainingTime: 10000
                },
                'timer-2' : {
                    id : 'timer-2',
                    label : 'Timer 02',
                    remainingTime: 5000
                }
            }
        })
        .on('init', function(){
            this.render($container);
        })
        .on('update.first', function(){

            var $element = this.getElement();
            this.off('update.first');

            assert.equal($('.countdown', $element).length, 2, '2 timers are rendered');
            assert.equal($('.countdown[data-control="timer-1"]', $element).length, 1, 'The correct timer is added');
            assert.equal($('.countdown[data-control="timer-2"]', $element).length, 1, 'The correct timer is added');

            this.on('timeradd', function(timer){
                assert.equal(timer.id, 'timer-3');
            });
            this.on('timerupdate', function(timer){
                assert.equal(timer.id, 'timer-2');
            });
            this.on('timerremove', function(timer){
                assert.equal(timer.id, 'timer-1');
            });
            this.on('update.second', function(){
                assert.equal($('.countdown', $element).length, 2, '2 timers are rendered');
                assert.equal($('.countdown[data-control="timer-1"]', $element).length, 0, 'The 1st timer has been removed');
                assert.equal($('.countdown[data-control="timer-2"]', $element).length, 1, 'The 2nd timer keeps in place');
                assert.equal($('.countdown[data-control="timer-3"]', $element).length, 1, 'The 3rd timer is added');

                this.destroy();
            });
            this.update({
                'timer-2' : {
                    id : 'timer-2',
                    label : 'Timer 02',
                    remainingTime: 5000
                },
                'timer-3' : {
                    id : 'timer-3',
                    label : 'Timer 03',
                    remainingTime: 50000
                }
            });
        })
        .on('destroy', function(){

            QUnit.start();
        });
    });


    QUnit.module('Visual test');

    QUnit.asyncTest('Countdow', function(assert) {
        var container = document.querySelector('#visual');

        QUnit.expect(1);

        timerboxFactory()
        .on('init', function(){
            this.render(container);
        })
        .on('render', function(){
            var self = this;
            this.update({
                'timer-1' : {
                    id : 'timer-1',
                    label : 'Timer 01',
                    remainingTime: 3000,
                    warnings : [{
                        level : 'success',
                        message : 'be green',
                        threshold : 2000
                    }, {
                        level : 'danger',
                        message : 'be orange',
                        threshold : 1000
                    }]
                },
                'timer-2' : {
                    id : 'timer-2',
                    label : 'Timer 02',
                    remainingTime: 1500
                }
            }).then(function(){
                self.start();
            });
        })
        .on('timerend', function(timer){
            if(timer.id === 'timer-1'){
                assert.ok(true);
                QUnit.start();
            }
        })
        .on('error', function(err){
            assert.ok(false, err.message);
            QUnit.start();
        });
    });

});
