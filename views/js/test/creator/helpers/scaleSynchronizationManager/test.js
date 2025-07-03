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
    'taoQtiTest/controller/creator/helpers/scaleSynchronizationManager'
], function(syncManager) {
    'use strict';

    QUnit.module('helpers/scaleSynchronizationManager', {
        beforeEach: function() {
            syncManager.reset();
        }
    });

    function createMockSelector(initialValue) {
        let currentValue = initialValue || null;
        let updateCallCount = 0;

        return {
            getCurrentValue: function() {
                return currentValue;
            },
            setCurrentValue: function(value) {
                currentValue = value;
            },
            updateAvailableScales: function(lockedScale) {
                updateCallCount++;
                this.lastLockedScale = lockedScale;
            },
            getUpdateCallCount: function() {
                return updateCallCount;
            },
            resetUpdateCount: function() {
                updateCallCount = 0;
            }
        };
    }

    QUnit.test('module exports singleton object', function(assert) {
        assert.expect(2);
        assert.equal(typeof syncManager, 'object', 'syncManager is an object');
        assert.ok(syncManager.init, 'syncManager has init method');
    });

    QUnit.test('init() - requires testId', function(assert) {
        assert.expect(2);

        const testPresets = [
            {uri: "https://test.com/1", label: "Test Scale 1"}
        ];

        assert.throws(function() {
            syncManager.init(testPresets);
        }, 'Throws error when testId is missing');

        assert.throws(function() {
            syncManager.init(testPresets, null);
        }, 'Throws error when testId is null');
    });

    QUnit.test('init() - initializes predefined scales with testId', function(assert) {
        assert.expect(4);

        const testPresets = [
            {uri: "https://test.com/1", label: "Test Scale 1"},
            {uri: "https://test.com/2", label: "Test Scale 2"},
            {uri: "", label: "Invalid Scale"},
            null
        ];

        syncManager.init(testPresets, 'test-1');

        assert.ok(syncManager.isPredefinedScale("https://test.com/1"), 'First scale recognized as predefined');
        assert.ok(syncManager.isPredefinedScale("https://test.com/2"), 'Second scale recognized as predefined');
        assert.notOk(syncManager.isPredefinedScale(""), 'Empty URI not recognized as predefined');
        assert.equal(syncManager._currentTestId, 'test-1', 'Test ID stored correctly');
    });

    QUnit.test('testId isolation - different tests have separate state', function(assert) {
        assert.expect(4);

        const presets1 = [{uri: "https://test1.com/1", label: "Test 1 Scale"}];
        const presets2 = [{uri: "https://test2.com/1", label: "Test 2 Scale"}];

        // Initialize test 1
        syncManager.init(presets1, 'test-1');
        assert.ok(syncManager.isPredefinedScale("https://test1.com/1"), 'Test 1 scale recognized');

        // Switch to test 2
        syncManager.init(presets2, 'test-2');
        assert.ok(syncManager.isPredefinedScale("https://test2.com/1"), 'Test 2 scale recognized');
        assert.notOk(syncManager.isPredefinedScale("https://test1.com/1"), 'Test 1 scale not recognized in test 2');

        // Switch back to test 1
        syncManager.init(presets1, 'test-1');
        assert.ok(syncManager.isPredefinedScale("https://test1.com/1"), 'Test 1 scale recognized again');
    });

    QUnit.test('registerSelector() and unregisterSelector()', function(assert) {
        assert.expect(2);

        syncManager.init([], 'test-1');
        const mockSelector = createMockSelector();

        syncManager.registerSelector('outcome1', mockSelector);
        assert.equal(syncManager._testStates.get('test-1').outcomeSelectors.size, 1, 'Selector registered successfully');

        syncManager.unregisterSelector('outcome1');
        assert.equal(syncManager._testStates.get('test-1').outcomeSelectors.size, 0, 'Selector unregistered successfully');
    });

    QUnit.test('onScaleChange() - locks to predefined scale', function(assert) {
        assert.expect(3);

        const testPresets = [
            {uri: "https://test.com/1", label: "Test Scale 1"}
        ];
        syncManager.init(testPresets, 'test-1');

        const mockSelector1 = createMockSelector();
        const mockSelector2 = createMockSelector();

        syncManager.registerSelector('outcome1', mockSelector1);
        syncManager.registerSelector('outcome2', mockSelector2);

        syncManager.onScaleChange('outcome1', 'https://test.com/1');

        assert.equal(syncManager.getActivePredefinedScale(), 'https://test.com/1', 'Active scale set correctly');
        assert.equal(mockSelector1.getUpdateCallCount(), 1, 'First selector updated');
        assert.equal(mockSelector2.getUpdateCallCount(), 1, 'Second selector updated');
    });

    QUnit.test('onScaleChange() - unlocks when no predefined scales remain', function(assert) {
        assert.expect(4);

        const testPresets = [
            {uri: "https://test.com/1", label: "Test Scale 1"}
        ];
        syncManager.init(testPresets, 'test-1');

        const mockSelector1 = createMockSelector('https://test.com/1');
        const mockSelector2 = createMockSelector('https://test.com/1');

        syncManager.registerSelector('outcome1', mockSelector1);
        syncManager.registerSelector('outcome2', mockSelector2);

        // Lock to predefined scale
        syncManager.onScaleChange('outcome1', 'https://test.com/1');
        assert.equal(syncManager.getActivePredefinedScale(), 'https://test.com/1', 'Scale locked');

        // Clear both selectors
        mockSelector1.setCurrentValue(null);
        mockSelector2.setCurrentValue(null);

        mockSelector1.resetUpdateCount();
        mockSelector2.resetUpdateCount();

        // Trigger change with no predefined scales
        syncManager.onScaleChange('outcome1', null);

        assert.strictEqual(syncManager.getActivePredefinedScale(), null, 'Scale unlocked when no predefined scales');
        assert.ok(mockSelector1.getUpdateCallCount() >= 1, 'First selector updated');
        assert.ok(mockSelector2.getUpdateCallCount() >= 1, 'Second selector updated');
    });

    QUnit.test('onScaleChange() - maintains lock when one predefined scale remains', function(assert) {
        assert.expect(2);

        const testPresets = [
            {uri: "https://test.com/1", label: "Test Scale 1"}
        ];
        syncManager.init(testPresets, 'test-1');

        const mockSelector1 = createMockSelector('https://test.com/1');
        const mockSelector2 = createMockSelector('https://test.com/1');

        syncManager.registerSelector('outcome1', mockSelector1);
        syncManager.registerSelector('outcome2', mockSelector2);

        // Lock to predefined scale
        syncManager.onScaleChange('outcome1', 'https://test.com/1');

        // Clear one selector but keep the other
        mockSelector1.setCurrentValue(null);
        syncManager.onScaleChange('outcome1', null);

        assert.equal(syncManager.getActivePredefinedScale(), 'https://test.com/1', 'Scale still locked');
        assert.equal(mockSelector2.getCurrentValue(), 'https://test.com/1', 'Second selector still has predefined scale');
    });

    QUnit.test('reset() - clears all state', function(assert) {
        assert.expect(3);

        syncManager.init([{uri: "https://test.com/1", label: "Test Scale 1"}], 'test-1');
        syncManager.registerSelector('outcome1', createMockSelector());

        syncManager.reset();

        assert.strictEqual(syncManager._currentTestId, null, 'Test ID cleared');
        assert.equal(syncManager._testStates.size, 0, 'All test states cleared');

        // Should throw error when trying to use without init
        assert.throws(function() {
            syncManager.isPredefinedScale("https://test.com/1");
        }, 'Throws error when no active test');
    });

    QUnit.test('reset() - can reset specific test', function(assert) {
        assert.expect(3);

        syncManager.init([{uri: "https://test1.com/1", label: "Test 1 Scale"}], 'test-1');
        syncManager.init([{uri: "https://test2.com/1", label: "Test 2 Scale"}], 'test-2');

        syncManager.reset('test-1');

        // Should still be in test-2
        assert.equal(syncManager._currentTestId, 'test-2', 'Still in test-2');
        assert.ok(syncManager.isPredefinedScale("https://test2.com/1"), 'Test 2 scale still recognized');
        assert.notOk(syncManager._testStates.has('test-1'), 'Test 1 state removed');
    });

    QUnit.test('complex scenario - basic lock/unlock behavior', function(assert) {
        assert.expect(5);

        const testPresets = [
            {uri: "https://test.com/1", label: "Test Scale 1"},
            {uri: "https://test.com/2", label: "Test Scale 2"}
        ];
        syncManager.init(testPresets, 'test-1');

        const selector1 = createMockSelector();
        const selector2 = createMockSelector();

        syncManager.registerSelector('outcome1', selector1);
        syncManager.registerSelector('outcome2', selector2);

        // Initially unlocked
        assert.strictEqual(syncManager.getActivePredefinedScale(), null, 'Initially unlocked');

        // Select predefined scale - should lock
        selector1.setCurrentValue('https://test.com/1');
        syncManager.onScaleChange('outcome1', 'https://test.com/1');
        assert.equal(syncManager.getActivePredefinedScale(), 'https://test.com/1', 'Locked to predefined scale');

        // Select custom scale in other selector - should stay locked
        selector2.setCurrentValue('custom_scale');
        syncManager.onScaleChange('outcome2', 'custom_scale');
        assert.equal(syncManager.getActivePredefinedScale(), 'https://test.com/1', 'Still locked despite custom scale');

        // Clear predefined scale - should unlock
        selector1.setCurrentValue(null);
        syncManager.onScaleChange('outcome1', null);
        assert.strictEqual(syncManager.getActivePredefinedScale(), null, 'Unlocked when no predefined scales');

        // All selectors should receive updates
        assert.ok(selector1.getUpdateCallCount() > 0 && selector2.getUpdateCallCount() > 0, 'All selectors received updates');
    });
});
