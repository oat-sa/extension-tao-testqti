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
 * Copyright (c) 2020-2025 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Hanna Dzmitryieva <hanna@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'core/eventifier',
    'taoQtiTest/controller/creator/helpers/changeTracker',
    'json!taoQtiTest/test/samples/json/testModel.json'
], function ($, _, eventifier, changeTrackerFactory, testModel) {
    'use strict';

    function testCreatorFactory(data = null) {
        const model = _.defaults(data || _.cloneDeep(testModel), {
            toArray() {
                return this;
            }
        });
        return eventifier({
            getModelOverseer() {
                return {
                    getModel () {
                        return model;
                    }
                };
            },
            isTestHasErrors() {
                return false;
            }
        });
    }

    QUnit.module('API');

    QUnit.test('module', assert => {
        const fixture = document.getElementById('fixture-api');
        const testCreator = testCreatorFactory();
        const instance1 = changeTrackerFactory(fixture, testCreator);
        const instance2 = changeTrackerFactory(fixture, testCreator);
        assert.expect(3);
        assert.equal(typeof changeTrackerFactory, 'function', 'The module exposes a function');
        assert.equal(typeof instance1, 'object', 'The factory produces an object');
        assert.notStrictEqual(instance1, instance2, 'The factory provides a different object on each call');
        instance1.uninstall();
        instance2.uninstall();
    });

    QUnit.cases.init([
        {title: 'on'},
        {title: 'off'},
        {title: 'before'},
        {title: 'after'},
        {title: 'trigger'},
        {title: 'spread'}
    ]).test('event API ', (data, assert) => {
        const fixture = document.getElementById('fixture-api');
        const testCreator = testCreatorFactory();
        const instance = changeTrackerFactory(fixture, testCreator);
        assert.expect(1);
        assert.equal(typeof instance[data.title], 'function', `The instance exposes a "${data.title}" function`);
        instance.uninstall();
    });

    QUnit.cases.init([
        {title: 'init'},
        {title: 'install'},
        {title: 'uninstall'},
        {title: 'confirmBefore'},
        {title: 'hasChanged'},
        {title: 'getSerializedTest'}
    ]).test('helper API ', (data, assert) => {
        const fixture = document.getElementById('fixture-api');
        const testCreator = testCreatorFactory();
        const instance = changeTrackerFactory(fixture, testCreator);
        assert.expect(1);
        assert.equal(typeof instance[data.title], 'function', `The instance exposes a "${data.title}" function`);
        instance.uninstall();
    });

    QUnit.module('Behavior');

    QUnit.cases.init([{
        title: 'not modified',
        change: {},
        expected: false
    }, {
        title: 'modified',
        change: {
            foo: 'bar'
        },
        expected: true
    }]).test('hasChanged ', (data, assert) => {
        const fixture = document.getElementById('fixture-hasChanged');
        const testCreator = testCreatorFactory();
        const instance = changeTrackerFactory(fixture, testCreator);

        Object.assign(testCreator.getModelOverseer().getModel(), data.change);

        assert.expect(1);
        assert.equal(instance.hasChanged(), data.expected, 'The changes in item are properly detected');
        instance.uninstall();
    });

    QUnit.cases.init([{
        title: 'simple',
        model: {
            "qti-type": "assessmentTest",
            "identifier": "Test-4",
            "testParts": [
                {
                    "qti-type": "testPart",
                    "identifier": "testPart-1"
                }
            ]
        },
        expected: '{"qti-type":"assessmentTest","identifier":"Test-4","testParts":[{"qti-type":"testPart","identifier":"testPart-1"}]}'
    }]).test('getSerializedTest ', (data, assert) => {
        const fixture = document.getElementById('fixture-getSerializedTest');
        const testCreator = testCreatorFactory(data.model);
        const instance = changeTrackerFactory(fixture, testCreator);

        assert.expect(1);
        assert.equal(instance.getSerializedTest(), data.expected, 'The model is serialized');
        instance.uninstall();
    });

    QUnit.test('change detection', assert => {
        const fixture = document.getElementById('fixture-change-detection');
        const testCreator = testCreatorFactory();
        const instance = changeTrackerFactory(fixture, testCreator);

        assert.expect(5);

        assert.equal(instance.hasChanged(), false, 'No changes initially');

        Object.assign(testCreator.getModelOverseer().getModel(), {test: 'value'});
        assert.equal(instance.hasChanged(), true, 'Changes detected after model update');

        testCreator.trigger('saved');
        assert.equal(instance.hasChanged(), false, 'Changes reset after save event');

        Object.assign(testCreator.getModelOverseer().getModel(), {test2: 'value2'});
        assert.equal(instance.hasChanged(), true, 'Changes detected again');

        testCreator.trigger('ready');
        assert.equal(instance.hasChanged(), false, 'Changes reset after ready event');

        instance.uninstall();
    });

    QUnit.test('confirmBefore with no changes', assert => {
        const fixture = document.getElementById('fixture-confirm-nochanges');
        const testCreator = testCreatorFactory();
        const instance = changeTrackerFactory(fixture, testCreator);

        assert.expect(2);

        const promise = instance.confirmBefore('exit');
        assert.ok(promise instanceof Promise, 'confirmBefore returns a promise');

        const done = assert.async();
        promise.then(() => {
            assert.ok(true, 'Promise resolves immediately when no changes');
            instance.uninstall();
            done();
        }).catch(() => {
            assert.ok(false, 'Promise should not reject when no changes');
            instance.uninstall();
            done();
        });
    });

    QUnit.test('confirmBefore with changes', assert => {
        const fixture = document.getElementById('fixture-confirm-changes');
        const testCreator = testCreatorFactory();
        const instance = changeTrackerFactory(fixture, testCreator);

        assert.expect(2);

        Object.assign(testCreator.getModelOverseer().getModel(), {test: 'value'});
        assert.equal(instance.hasChanged(), true, 'Model has changes');

        assert.ok(typeof instance.confirmBefore === 'function', 'confirmBefore method exists and is callable');

        instance.uninstall();
    });

    QUnit.test('serialization', assert => {
        const fixture = document.getElementById('fixture-serialization');

        assert.expect(3);

        const testCreator = testCreatorFactory();
        const instance = changeTrackerFactory(fixture, testCreator);
        const serialized = instance.getSerializedTest();
        assert.ok(typeof serialized === 'string', 'Serialization returns string');
        instance.uninstall();

        const brokenCreator = eventifier({
            getModelOverseer() {
                return {
                    getModel() {
                        const obj = { test: 'value' };
                        obj.self = obj;
                        return obj;
                    }
                };
            },
            isTestHasErrors() {
                return false;
            }
        });

        const instance2 = changeTrackerFactory(fixture, brokenCreator);
        assert.equal(instance2.getSerializedTest(), null, 'Returns null for broken serialization');
        instance2.uninstall();

        const spaceCreator = eventifier({
            getModelOverseer() {
                return {
                    getModel() {
                        return { content: 'test  with   multiple    spaces' };
                    }
                };
            },
            isTestHasErrors() {
                return false;
            }
        });

        const instance3 = changeTrackerFactory(fixture, spaceCreator);
        const spaceSerialized = instance3.getSerializedTest();
        assert.ok(!spaceSerialized.includes('  '), 'Multiple spaces are normalized');
        instance3.uninstall();
    });

    QUnit.test('install and uninstall', assert => {
        const fixture = document.getElementById('fixture-install');
        const testCreator = testCreatorFactory();

        assert.expect(4);

        const instance = changeTrackerFactory(fixture, testCreator);
        assert.ok(instance, 'Instance created and installed');

        const result = instance.init();
        assert.equal(result, instance, 'init returns instance');

        const uninstallResult = instance.uninstall();
        assert.equal(uninstallResult, instance, 'uninstall returns instance');

        const reinstallResult = instance.install();
        assert.equal(reinstallResult, instance, 'install returns instance');

        instance.uninstall();
    });
});
