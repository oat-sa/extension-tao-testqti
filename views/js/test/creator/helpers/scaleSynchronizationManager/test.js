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
            syncManager._predefinedScales.clear();
            syncManager._activePredefinedScale = null;
            syncManager._outcomeSelectors.clear();
            syncManager._isUpdating = false;
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

    QUnit.test('init() - initializes predefined scales', function(assert) {
        assert.expect(3);

        const testPresets = [
            {uri: "https://test.com/1", label: "Test Scale 1"},
            {uri: "https://test.com/2", label: "Test Scale 2"},
            {uri: "", label: "Invalid Scale"},
            null
        ];

        syncManager.init(testPresets);

        assert.ok(syncManager.isPredefinedScale("https://test.com/1"), 'First scale recognized as predefined');
        assert.ok(syncManager.isPredefinedScale("https://test.com/2"), 'Second scale recognized as predefined');
        assert.notOk(syncManager.isPredefinedScale(""), 'Empty URI not recognized as predefined');
    });

    QUnit.test('init() - handles invalid input gracefully', function(assert) {
        assert.expect(3);

        syncManager.init(null);
        assert.notOk(syncManager.isPredefinedScale("anything"), 'No scales recognized after null init');

        syncManager.init("not-an-array");
        assert.notOk(syncManager.isPredefinedScale("anything"), 'No scales recognized after string init');

        syncManager.init([]);
        assert.notOk(syncManager.isPredefinedScale("anything"), 'No scales recognized after empty array init');
    });

    QUnit.test('registerSelector() and unregisterSelector()', function(assert) {
        assert.expect(3);

        const mockSelector = createMockSelector();

        assert.equal(syncManager._outcomeSelectors.size, 0, 'No selectors initially registered');

        syncManager.registerSelector('outcome1', mockSelector);
        assert.equal(syncManager._outcomeSelectors.size, 1, 'Selector registered successfully');

        syncManager.unregisterSelector('outcome1');
        assert.equal(syncManager._outcomeSelectors.size, 0, 'Selector unregistered successfully');
    });

    QUnit.test('isPredefinedScale() - correctly identifies predefined scales', function(assert) {
        assert.expect(4);

        var testPresets = [
            { uri: "https://test.com/1", label: "Test Scale 1" }
        ];
        syncManager.init(testPresets);

        assert.ok(syncManager.isPredefinedScale("https://test.com/1"), 'Recognizes predefined scale');
        assert.notOk(syncManager.isPredefinedScale("https://custom.com/1"), 'Does not recognize custom scale');
        assert.notOk(syncManager.isPredefinedScale(null), 'Handles null input');
        assert.notOk(syncManager.isPredefinedScale(""), 'Handles empty string input');
    });

    QUnit.test('getActivePredefinedScale() - returns current active scale', function(assert) {
        assert.expect(2);

        assert.strictEqual(syncManager.getActivePredefinedScale(), null, 'Initially no active scale');

        syncManager._activePredefinedScale = "https://test.com/1";
        assert.equal(syncManager.getActivePredefinedScale(), "https://test.com/1", 'Returns active scale');
    });

    QUnit.test('onScaleChange() - locks to predefined scale', function(assert) {
        assert.expect(3);

        const testPresets = [
            {uri: "https://test.com/1", label: "Test Scale 1"}
        ];
        syncManager.init(testPresets);

        const mockSelector1 = createMockSelector();
        const mockSelector2 = createMockSelector();

        syncManager.registerSelector('outcome1', mockSelector1);
        syncManager.registerSelector('outcome2', mockSelector2);

        syncManager.onScaleChange('outcome1', 'https://test.com/1');

        assert.equal(syncManager.getActivePredefinedScale(), 'https://test.com/1', 'Active scale set correctly');
        assert.equal(mockSelector1.getUpdateCallCount(), 1, 'First selector updated');
        assert.equal(mockSelector2.getUpdateCallCount(), 1, 'Second selector updated');
    });

    QUnit.test('onScaleChange() - ignores custom scales for locking', function(assert) {
        assert.expect(2);

        const testPresets = [
            {uri: "https://test.com/1", label: "Test Scale 1"}
        ];
        syncManager.init(testPresets);

        const mockSelector = createMockSelector();
        syncManager.registerSelector('outcome1', mockSelector);

        mockSelector.resetUpdateCount();

        syncManager.onScaleChange('outcome1', 'https://custom.com/1');

        assert.strictEqual(syncManager.getActivePredefinedScale(), null, 'No active scale for custom scale');
        assert.equal(mockSelector.getUpdateCallCount(), 0, 'No updates triggered for custom scale');
    });

    QUnit.test('onScaleChange() - unlocks when no predefined scales remain', function(assert) {
        assert.expect(4);

        const testPresets = [
            {uri: "https://test.com/1", label: "Test Scale 1"}
        ];
        syncManager.init(testPresets);

        const mockSelector1 = createMockSelector('https://test.com/1');
        const mockSelector2 = createMockSelector('https://test.com/1');

        syncManager.registerSelector('outcome1', mockSelector1);
        syncManager.registerSelector('outcome2', mockSelector2);

        syncManager.onScaleChange('outcome1', 'https://test.com/1');
        assert.equal(syncManager.getActivePredefinedScale(), 'https://test.com/1', 'Scale locked');

        mockSelector1.setCurrentValue('custom1');
        mockSelector2.setCurrentValue('custom2');

        mockSelector1.resetUpdateCount();
        mockSelector2.resetUpdateCount();

        syncManager.onScaleChange('outcome1', 'custom1');

        assert.strictEqual(syncManager.getActivePredefinedScale(), null, 'Scale unlocked when no predefined scales');
        assert.ok(mockSelector1.getUpdateCallCount() >= 1, 'First selector updated');
        assert.ok(mockSelector2.getUpdateCallCount() >= 1, 'Second selector updated');
    });

    QUnit.test('onScaleChange() - prevents circular updates', function(assert) {
        assert.expect(2);

        const testPresets = [
            {uri: "https://test.com/1", label: "Test Scale 1"}
        ];
        syncManager.init(testPresets);

        const mockSelector = createMockSelector();
        syncManager.registerSelector('outcome1', mockSelector);

        syncManager._isUpdating = true;
        const initialCallCount = mockSelector.getUpdateCallCount();

        syncManager.onScaleChange('outcome1', 'https://test.com/1');

        assert.equal(mockSelector.getUpdateCallCount(), initialCallCount, 'No updates when _isUpdating flag is set');
        assert.strictEqual(syncManager.getActivePredefinedScale(), null, 'Active scale not changed during circular update');
    });

    QUnit.test('_updateAllSelectors() - handles selector errors gracefully', function(assert) {
        assert.expect(2);

        var testPresets = [
            { uri: "https://test.com/1", label: "Test Scale 1" }
        ];
        syncManager.init(testPresets);

        var goodSelector = createMockSelector();
        var badSelector = {
            updateAvailableScales: function() {
                throw new Error('Test error');
            }
        };

        syncManager.registerSelector('good', goodSelector);
        syncManager.registerSelector('bad', badSelector);

        syncManager._lockToPredefinedScale('https://test.com/1');

        assert.equal(goodSelector.getUpdateCallCount(), 1, 'Good selector was updated');
        assert.notOk(syncManager._isUpdating, 'Update flag reset despite error');
    });

    QUnit.test('complex scenario - multiple outcomes with mixed scales', function(assert) {
        assert.expect(6);

        var testPresets = [
            { uri: "https://test.com/1", label: "Test Scale 1" },
            { uri: "https://test.com/2", label: "Test Scale 2" }
        ];
        syncManager.init(testPresets);

        const selector1 = createMockSelector();
        const selector2 = createMockSelector();
        const selector3 = createMockSelector();

        syncManager.registerSelector('outcome1', selector1);
        syncManager.registerSelector('outcome2', selector2);
        syncManager.registerSelector('outcome3', selector3);

        // Step 1: Set first predefined scale
        selector1.setCurrentValue('https://test.com/1');
        syncManager.onScaleChange('outcome1', 'https://test.com/1');
        assert.equal(syncManager.getActivePredefinedScale(), 'https://test.com/1', 'Locked to first predefined scale');

        // Step 2: Set custom scale in another outcome
        selector2.setCurrentValue('custom_scale');
        syncManager.onScaleChange('outcome2', 'custom_scale');
        assert.equal(syncManager.getActivePredefinedScale(), 'https://test.com/1', 'Still locked despite custom scale');

        // Step 3: Set same predefined scale in third outcome
        selector3.setCurrentValue('https://test.com/1');
        syncManager.onScaleChange('outcome3', 'https://test.com/1');
        assert.equal(syncManager.getActivePredefinedScale(), 'https://test.com/1', 'Still locked to same scale');

        // Step 4: Clear predefined scale from first outcome
        selector1.setCurrentValue(null);
        syncManager.onScaleChange('outcome1', null);
        assert.equal(syncManager.getActivePredefinedScale(), 'https://test.com/1', 'Still locked - third outcome has predefined scale');

        // Step 5: Clear predefined scale from third outcome
        selector3.setCurrentValue('another_custom');
        syncManager.onScaleChange('outcome3', 'another_custom');
        assert.strictEqual(syncManager.getActivePredefinedScale(), null, 'Unlocked - no predefined scales remain');

        assert.ok(selector1.getUpdateCallCount() > 0 && selector2.getUpdateCallCount() > 0 && selector3.getUpdateCallCount() > 0,
            'All selectors received updates');
    });

    QUnit.test('edge case - same scale change does not trigger unnecessary updates', function(assert) {
        assert.expect(2);

        const testPresets = [
            {uri: "https://test.com/1", label: "Test Scale 1"}
        ];
        syncManager.init(testPresets);

        const mockSelector = createMockSelector();
        syncManager.registerSelector('outcome1', mockSelector);

        syncManager.onScaleChange('outcome1', 'https://test.com/1');
        const firstUpdateCount = mockSelector.getUpdateCallCount();

        syncManager.onScaleChange('outcome1', 'https://test.com/1');
        const secondUpdateCount = mockSelector.getUpdateCallCount();

        assert.ok(firstUpdateCount > 0, 'First change triggered update');
        assert.equal(secondUpdateCount, firstUpdateCount, 'Identical change did not trigger additional update');
    });
});
