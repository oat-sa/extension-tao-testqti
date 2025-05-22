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
            syncManager._predefinedScales.clear();
            syncManager._activePredefinedScale = null;
            syncManager._outcomeSelectors.clear();
            syncManager._isUpdating = false;
        }
    });

    function createMockContainer() {
        const $input = $('<input name="interpretation" />');
        const $container = $('<div></div>').append($input);

        $input.val = function(value) {
            if (arguments.length > 0) {
                this._testValue = value;
                return this;
            }
            return this._testValue || '';
        };

        $input.trigger = function() { return this; };
        $input.find = function() { return $(); };
        $input.append = function() { return this; };
        $input.select2 = function() { return this; };
        $input.hasClass = function() { return false; };
        $input.removeClass = function() { return this; };
        $input.next = function() { return $(); };
        $input.off = function() { return this; };
        $input.on = function() { return this; };

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

    QUnit.test('setPresets() - static method initializes sync manager', function(assert) {
        assert.expect(3);

        const testPresets = [
            {uri: "https://test.com/1", label: "Test Scale 1"},
            {uri: "https://test.com/2", label: "Test Scale 2"}
        ];

        assert.equal(typeof scaleSelectorFactory.setPresets, 'function', 'setPresets method exists');

        scaleSelectorFactory.setPresets(testPresets);

        assert.ok(syncManager.isPredefinedScale("https://test.com/1"), 'Sync manager recognizes first preset');
        assert.ok(syncManager.isPredefinedScale("https://test.com/2"), 'Sync manager recognizes second preset');
    });

    QUnit.test('getCurrentValue() - returns current selection', function(assert) {
        assert.expect(2);

        const $container = createMockContainer();
        const scaleSelector = scaleSelectorFactory($container, 'test-outcome-1');

        assert.equal(scaleSelector.getCurrentValue(), null, 'Returns null when no value set');

        $container.find('input').val('test-value');
        assert.equal(scaleSelector.getCurrentValue(), 'test-value', 'Returns current value');
    });

    QUnit.test('createForm() - registers with sync manager', function(assert) {
        assert.expect(2);

        const testPresets = [
            {uri: "https://test.com/1", label: "Test Scale 1"}
        ];
        scaleSelectorFactory.setPresets(testPresets);

        const $container = createMockContainer();
        const outcomeId = 'test-outcome-1';
        const scaleSelector = scaleSelectorFactory($container, outcomeId);

        assert.equal(syncManager._outcomeSelectors.size, 0, 'Sync manager empty before createForm');

        scaleSelector.createForm();

        assert.equal(syncManager._outcomeSelectors.size, 1, 'Selector registered with sync manager');
    });

    QUnit.test('updateScale() - notifies sync manager of changes', function(assert) {
        const done = assert.async();
        assert.expect(2);

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
        $container.find('input').val('https://test.com/1');
        scaleSelector.updateScale();
    });

    QUnit.test('destroy() - unregisters from sync manager', function(assert) {
        assert.expect(2);

        const $container = createMockContainer();
        const scaleSelector = scaleSelectorFactory($container, 'test-outcome-1');

        scaleSelector.createForm();
        assert.equal(syncManager._outcomeSelectors.size, 1, 'Selector registered');

        scaleSelector.destroy();
        assert.equal(syncManager._outcomeSelectors.size, 0, 'Selector unregistered after destroy');
    });

    QUnit.test('updateAvailableScales() - handles locked state', function(assert) {
        const done = assert.async();
        assert.expect(1);

        const $container = createMockContainer();
        const scaleSelector = scaleSelectorFactory($container, 'test-outcome-1');

        scaleSelector.createForm();

        scaleSelector.updateAvailableScales('https://test.com/1');

        setTimeout(function() {
            assert.ok(true, 'updateAvailableScales completed without errors');
            done();
        }, 10);
    });

    QUnit.test('clearSelection() - clears value and updates sync manager', function(assert) {
        const done = assert.async();
        assert.expect(2);

        const testPresets = [
            {uri: "https://test.com/1", label: "Test Scale 1"}
        ];
        scaleSelectorFactory.setPresets(testPresets);

        const $container = createMockContainer();
        const scaleSelector = scaleSelectorFactory($container, 'test-outcome-1');

        $container.find('input').val('https://test.com/1');
        scaleSelector.createForm();

        const originalOnScaleChange = syncManager.onScaleChange;
        syncManager.onScaleChange = function(outcomeId, newScale) {
            assert.equal(outcomeId, 'test-outcome-1', 'Correct outcome ID passed');
            assert.strictEqual(newScale, null, 'Scale cleared to null');

            syncManager.onScaleChange = originalOnScaleChange;
            done();
        };

        scaleSelector.clearSelection();
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
});
