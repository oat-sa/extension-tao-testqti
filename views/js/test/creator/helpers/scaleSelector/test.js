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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */
define([
    'jquery',
    'lodash',
    'taoQtiTest/controller/creator/helpers/scaleSelector',
    'taoQtiTest/controller/creator/helpers/scaleSynchronizationManager'
], function($, _, scaleSelectorFactory, syncManager) {
    'use strict';

    QUnit.module('helpers/scaleSelector', {
        beforeEach: function() {
            syncManager.reset();
        }
    });

    function createMockContainer() {
        const $input = $('<input name="scale" />');
        const $container = $('<div></div>').append($input);

        let testValue = '';
        let changeHandlers = [];

        $input.val = function(value) {
            if (arguments.length > 0) {
                testValue = value === '' ? '' : value;
                return this;
            }
            return testValue;
        };

        $input.trigger = function(eventName) {
            if (eventName === 'change' || eventName === 'change.scaleSync') {
                changeHandlers.forEach(function(handler) {
                    handler.call($input[0]);
                });
            }
            return this;
        };

        $input.find = function() { return $(); };
        $input.append = function() { return this; };
        $input.select2 = function() { return this; };
        $input.hasClass = function() { return false; };
        $input.removeClass = function() { return this; };
        $input.next = function() { return $(); };
        $input.off = function(eventName) {
            if (eventName === 'change.scaleSync') {
                changeHandlers = [];
            }
            return this;
        };
        $input.on = function(eventName, handler) {
            if (eventName === 'change.scaleSync') {
                changeHandlers.push(handler);
            }
            return this;
        };
        $input.empty = function() { return this; };
        $input.data = function() { return null; };
        $input.length = 1;

        return $container;
    }

    QUnit.test('module', function(assert) {
        assert.expect(1);
        assert.equal(typeof scaleSelectorFactory, 'function', 'The scaleSelector helper module exposes a function');
    });

    QUnit.test('API methods exist', function(assert) {
        const $container = createMockContainer();
        const scaleSelector = scaleSelectorFactory($container, 'test-outcome-1');

        const expectedMethods = [
            'createForm', 'updateFormState', 'updateScale',
            'getCurrentValue', 'updateAvailableScales',
            'clearSelection', 'destroy'
        ];

        assert.expect(expectedMethods.length);

        expectedMethods.forEach(function(method) {
            assert.equal(typeof scaleSelector[method], 'function',
                'The scaleSelector instance exposes a "' + method + '" function');
        });
    });

    QUnit.test('setTestId() - sets test ID', function(assert) {
        assert.expect(2);

        assert.equal(typeof scaleSelectorFactory.setTestId, 'function', 'setTestId method exists');

        scaleSelectorFactory.setTestId('test-123');
        assert.equal(scaleSelectorFactory.getTestId(), 'test-123', 'Test ID set correctly');
    });

    QUnit.test('setTestId() - requires testId parameter', function(assert) {
        assert.expect(2);

        assert.throws(function() {
            scaleSelectorFactory.setTestId();
        }, 'Throws error when testId is missing');

        assert.throws(function() {
            scaleSelectorFactory.setTestId(null);
        }, 'Throws error when testId is null');
    });

    QUnit.test('initialize() - sets both presets and testId', function(assert) {
        assert.expect(3);

        const testPresets = [
            {uri: "https://test.com/1", label: "Test Scale 1"},
            {uri: "https://test.com/2", label: "Test Scale 2"}
        ];

        scaleSelectorFactory.initialize(testPresets, 'test-123');

        assert.equal(scaleSelectorFactory.getTestId(), 'test-123', 'Test ID set correctly');
        assert.ok(syncManager.isPredefinedScale("https://test.com/1"), 'Sync manager recognizes first preset');
        assert.ok(syncManager.isPredefinedScale("https://test.com/2"), 'Sync manager recognizes second preset');
    });

    QUnit.test('setPresets() - works with existing testId', function(assert) {
        assert.expect(2);

        scaleSelectorFactory.setTestId('test-123');

        const testPresets = [
            {uri: "https://test.com/1", label: "Test Scale 1"}
        ];

        scaleSelectorFactory.setPresets(testPresets);

        assert.ok(syncManager.isPredefinedScale("https://test.com/1"), 'Sync manager recognizes preset');
        assert.equal(syncManager._currentTestId, 'test-123', 'Sync manager has correct test ID');
    });

    QUnit.test('getCurrentValue() - returns current selection', function(assert) {
        assert.expect(2);

        const $container = createMockContainer();
        const scaleSelector = scaleSelectorFactory($container, 'test-outcome-1');

        assert.equal(scaleSelector.getCurrentValue(), null, 'Returns null when no value set');

        $container.find('[name="scale"]').val('test-value');
        assert.equal(scaleSelector.getCurrentValue(), 'test-value', 'Returns current value');
    });

    QUnit.test('createForm() - registers with sync manager when testId set', function(assert) {
        assert.expect(3);

        scaleSelectorFactory.setTestId('test-123');

        const testPresets = [
            {uri: "https://test.com/1", label: "Test Scale 1"}
        ];
        scaleSelectorFactory.setPresets(testPresets);

        const $container = createMockContainer();
        const outcomeId = 'test-outcome-1';
        const scaleSelector = scaleSelectorFactory($container, outcomeId);

        assert.equal(syncManager._testStates.get('test-123').outcomeSelectors.size, 0, 'Sync manager empty before createForm');

        scaleSelector.createForm();

        assert.equal(syncManager._testStates.get('test-123').outcomeSelectors.size, 1, 'Selector registered with sync manager');
        assert.equal(syncManager._currentTestId, 'test-123', 'Sync manager has correct test ID');
    });

    QUnit.test('updateScale() - notifies sync manager of changes', function(assert) {
        const done = assert.async();
        assert.expect(2);

        scaleSelectorFactory.setTestId('test-123');

        const testPresets = [
            {uri: "https://test.com/1", label: "Test Scale 1"}
        ];
        scaleSelectorFactory.setPresets(testPresets);

        const $container = createMockContainer();
        const scaleSelector = scaleSelectorFactory($container, 'test-outcome-1');

        const originalOnScaleChange = syncManager.onScaleChange;
        let changeCallCount = 0;

        syncManager.onScaleChange = function(outcomeId, newScale) {
            changeCallCount++;
            if (changeCallCount === 1) {
                assert.equal(outcomeId, 'test-outcome-1', 'Correct outcome ID passed');
                assert.equal(newScale, 'https://test.com/1', 'Correct scale value passed');

                syncManager.onScaleChange = originalOnScaleChange;
                done();
            }
        };

        scaleSelector.createForm();

        // Use setTimeout to ensure form is initialized
        setTimeout(function() {
            const $scaleInput = $container.find('[name="scale"]');
            $scaleInput.val('https://test.com/1');

            // Trigger change event to simulate user interaction
            $scaleInput.trigger('change.scaleSync');
        }, 50);
    });

    QUnit.test('destroy() - unregisters from sync manager', function(assert) {
        assert.expect(2);

        scaleSelectorFactory.setTestId('test-123');
        scaleSelectorFactory.setPresets([]);

        const $container = createMockContainer();
        const scaleSelector = scaleSelectorFactory($container, 'test-outcome-1');

        scaleSelector.createForm();
        assert.equal(syncManager._testStates.get('test-123').outcomeSelectors.size, 1, 'Selector registered');

        scaleSelector.destroy();
        assert.equal(syncManager._testStates.get('test-123').outcomeSelectors.size, 0, 'Selector unregistered after destroy');
    });

    QUnit.test('clearSelection() - clears value and updates sync manager', function(assert) {
        assert.expect(3);

        scaleSelectorFactory.setTestId('test-123');

        const testPresets = [
            {uri: "https://test.com/1", label: "Test Scale 1"}
        ];
        scaleSelectorFactory.setPresets(testPresets);

        const $container = createMockContainer();
        const scaleSelector = scaleSelectorFactory($container, 'test-outcome-1');

        scaleSelector.createForm();

        // Set initial value
        const $scaleInput = $container.find('[name="scale"]');
        $scaleInput.val('https://test.com/1');

        // Trigger change to set lastKnownValue
        $scaleInput.trigger('change.scaleSync');

        const originalOnScaleChange = syncManager.onScaleChange;
        let clearCalled = false;

        syncManager.onScaleChange = function(outcomeId, newScale) {
            if (!clearCalled) {
                clearCalled = true;
                assert.equal(outcomeId, 'test-outcome-1', 'Correct outcome ID passed on clear');
                assert.strictEqual(newScale, null, 'Scale value is null after clear');
            }
        };

        // Clear selection
        scaleSelector.clearSelection();

        // Verify value is cleared
        assert.equal($scaleInput.val(), '', 'Input value is cleared');

        syncManager.onScaleChange = originalOnScaleChange;
    });

    QUnit.test('reset() - clears factory state', function(assert) {
        assert.expect(2);

        scaleSelectorFactory.setTestId('test-123');
        scaleSelectorFactory.setPresets([{uri: "https://test.com/1", label: "Test Scale 1"}]);

        scaleSelectorFactory.reset();

        assert.strictEqual(scaleSelectorFactory.getTestId(), null, 'Test ID cleared');
        assert.strictEqual(syncManager._currentTestId, null, 'Sync manager also reset');
    });

    QUnit.test('reset() - can reset specific test', function(assert) {
        assert.expect(2);

        scaleSelectorFactory.setTestId('test-123');
        scaleSelectorFactory.setPresets([{uri: "https://test.com/1", label: "Test Scale 1"}]);

        scaleSelectorFactory.reset('test-456'); // Reset different test

        // Should still have our test
        assert.equal(scaleSelectorFactory.getTestId(), 'test-123', 'Our test ID still exists');
        assert.equal(syncManager._currentTestId, 'test-123', 'Sync manager still has our test');
    });

    QUnit.test('error handling - getCurrentValue with invalid DOM', function(assert) {
        assert.expect(1);

        const $container = $('<div></div>');
        const scaleSelector = scaleSelectorFactory($container, 'test-outcome-1');

        const result = scaleSelector.getCurrentValue();
        assert.strictEqual(result, null, 'Returns null when DOM is invalid');
    });

    QUnit.test('internal update flag prevents circular calls', function(assert) {
        assert.expect(1);

        const $container = createMockContainer();
        const scaleSelector = scaleSelectorFactory($container, 'test-outcome-1');

        scaleSelector._isInternalUpdate = true;

        const originalOnScaleChange = syncManager.onScaleChange;
        let callCount = 0;

        syncManager.onScaleChange = function() {
            callCount++;
        };

        scaleSelector.updateScale();

        assert.equal(callCount, 0, 'updateScale skipped when _isInternalUpdate is true');

        syncManager.onScaleChange = originalOnScaleChange;
    });

    QUnit.test('test isolation - different tests maintain separate state', function(assert) {
        assert.expect(3);

        // Setup test 1
        scaleSelectorFactory.setTestId('test-1');
        scaleSelectorFactory.setPresets([{uri: "https://test1.com/1", label: "Test 1 Scale"}]);

        const $container1 = createMockContainer();
        const scaleSelector1 = scaleSelectorFactory($container1, 'outcome1');
        scaleSelector1.createForm();

        // Setup test 2
        scaleSelectorFactory.setTestId('test-2');
        scaleSelectorFactory.setPresets([{uri: "https://test2.com/1", label: "Test 2 Scale"}]);

        const $container2 = createMockContainer();
        const scaleSelector2 = scaleSelectorFactory($container2, 'outcome2');
        scaleSelector2.createForm();

        // Verify isolation
        assert.equal(syncManager._currentTestId, 'test-2', 'Currently in test-2');
        assert.ok(syncManager.isPredefinedScale("https://test2.com/1"), 'Test 2 scale recognized');
        assert.notOk(syncManager.isPredefinedScale("https://test1.com/1"), 'Test 1 scale not recognized in test 2');
    });
});
