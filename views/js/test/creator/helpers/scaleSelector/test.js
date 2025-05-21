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
    'taoQtiTest/controller/creator/helpers/scaleSelector'
], function($, _, scaleSelectorFactory) {
    'use strict';

    QUnit.module('helpers/scaleSelector');

    QUnit.test('module', function(assert) {
        assert.expect(1);
        assert.equal(typeof scaleSelectorFactory, 'function', 'The scaleSelector helper module exposes a function');
    });

    QUnit.cases.init([
        { title: 'createForm' },
        { title: 'updateFormState' },
        { title: 'updateScale' }
    ]).test('helpers/scaleSelector API ', function(data, assert) {
        var $container = $('<div><input name="interpretation" /></div>');
        var scaleSelector = scaleSelectorFactory($container);

        assert.equal(typeof scaleSelector[data.title], 'function', 'The scaleSelector instance exposes a "' + data.title + '" function');
    });

    QUnit.test('setPresets() - static method', function(assert) {
        assert.expect(1);
        var testPresets = [
            { uri: "https://test.com/1", label: "Test Scale 1" },
            { uri: "https://test.com/2", label: "Test Scale 2" }
        ];

        assert.equal(typeof scaleSelectorFactory.setPresets, 'function', 'The static setPresets method exists');

        scaleSelectorFactory.setPresets(testPresets);
    });

    QUnit.test('createForm() - initializes the form with no scale', function(assert) {
        var ready = assert.async();
        assert.expect(2);

        var $container = $('<div><input name="interpretation" /></div>');
        $('#qunit-fixture').append($container);

        var testPresets = [
            { uri: "https://test.com/1", label: "Test Scale 1" },
            { uri: "https://test.com/2", label: "Test Scale 2" }
        ];
        scaleSelectorFactory.setPresets(testPresets);

        var scaleSelector = scaleSelectorFactory($container);

        var originalSelect2 = $.fn.select2;
        $.fn.select2 = function(options) {
            assert.ok(true, 'select2 was initialized');
            assert.deepEqual(options.data.map(item => ({ id: item.id, text: item.text })),
                testPresets.map(preset => ({ id: preset.uri, text: preset.label })),
                'select2 was initialized with the correct preset data');

            $.fn.select2 = originalSelect2;
            ready();

            return this;
        };

        scaleSelector.createForm();
    });

    QUnit.test('createForm() - initializes the form with existing scale', function(assert) {
        var ready = assert.async();
        assert.expect(2);

        var $container = $('<div><input name="interpretation" /></div>');
        $('#qunit-fixture').append($container);

        var testPresets = [
            { uri: "https://test.com/1", label: "Test Scale 1" },
            { uri: "https://test.com/2", label: "Test Scale 2" }
        ];
        scaleSelectorFactory.setPresets(testPresets);

        var scaleSelector = scaleSelectorFactory($container);
        var currentScale = "https://test.com/1";

        var select2CallCount = 0;
        var originalSelect2 = $.fn.select2;
        $.fn.select2 = function(options) {
            select2CallCount++;
            assert.ok(true, 'select2 was initialized (call ' + select2CallCount + ')');

            this.val = function(val) {
                if (arguments.length === 0) {
                    return currentScale;
                }
                return this;
            };
            this.data = function() { return null; };
            this.off = function() { return this; };
            this.on = function() { return this; };
            this.trigger = function() { return this; };

            return this;
        };

        scaleSelector.createForm(currentScale);

        setTimeout(function() {
            $.fn.select2 = originalSelect2;
            ready();
        }, 10);
    });

    QUnit.test('updateFormState() - updates the form state', function(assert) {
        var ready = assert.async();
        assert.expect(2);

        var $container = $('<div><input name="interpretation" /></div>');
        $('#qunit-fixture').append($container);

        var testPresets = [
            { uri: "https://test.com/1", label: "Test Scale 1" },
            { uri: "https://test.com/2", label: "Test Scale 2" }
        ];
        scaleSelectorFactory.setPresets(testPresets);

        var scaleSelector = scaleSelectorFactory($container);
        var newScale = "https://test.com/1";

        var select2RebuildCalled = false;
        var originalSelect2 = $.fn.select2;
        $.fn.select2 = function(options) {
            if (options && options.data) {
                select2RebuildCalled = true;
            }

            this.val = function(val) {
                if (arguments.length === 0) {
                    return newScale;
                }
                return this;
            };
            this.data = function() { return null; };
            this.off = function() { return this; };
            this.on = function() { return this; };
            this.trigger = function() { return this; };

            return this;
        };

        scaleSelector.createForm();

        scaleSelector.updateFormState(newScale);

        setTimeout(function() {
            assert.ok(select2RebuildCalled, 'select2 was rebuilt when updating form state');
            assert.ok(true, 'updateFormState with string doesn\'t cause errors');
            $.fn.select2 = originalSelect2;
            ready();
        }, 20);
    });

    QUnit.test('updateScale() - triggers interpretation-change event with current selection', function(assert) {
        var ready = assert.async();
        assert.expect(2);

        var $container = $('<div><input name="interpretation" /></div>');
        $('#qunit-fixture').append($container);

        var testPresets = [
            { uri: "https://test.com/1", label: "Test Scale 1" },
            { uri: "https://test.com/2", label: "Test Scale 2" }
        ];
        scaleSelectorFactory.setPresets(testPresets);

        var scaleSelector = scaleSelectorFactory($container);

        var currentInputValue = "https://test.com/1";

        var originalSelect2 = $.fn.select2;
        $.fn.select2 = function() {
            this.val = function(val) {
                if (arguments.length === 0) {
                    return currentInputValue; // Return the current test value
                }
                return this;
            };
            this.data = function() { return null; };
            this.off = function() { return this; };
            this.on = function() { return this; };
            this.trigger = function() { return this; };
            return this;
        };

        scaleSelector.createForm();

        var eventCount = 0;
        scaleSelector.on('interpretation-change', function(data) {
            eventCount++;
            if (eventCount === 1) {
                assert.equal(data, "https://test.com/1", 'interpretation-change event was triggered with the correct URI');

                currentInputValue = "";
                scaleSelector.updateScale();
            } else if (eventCount === 2) {
                assert.strictEqual(data, null, 'interpretation-change event was triggered with null for empty value');
                $.fn.select2 = originalSelect2;
                ready();
            }
        });

        scaleSelector.updateScale();
    });

    QUnit.test('clearSelection() - clears the selection and syncs to other instances', function(assert) {
        var ready = assert.async();
        assert.expect(1);

        var $container = $('<div><input name="interpretation" /></div>');
        $('#qunit-fixture').append($container);

        var scaleSelector = scaleSelectorFactory($container);

        var originalSelect2 = $.fn.select2;
        $.fn.select2 = function() {
            this.val = function(val) {
                if (arguments.length === 0) {
                    return "";
                }
                return this;
            };
            this.data = function() { return null; };
            this.off = function() { return this; };
            this.on = function() { return this; };
            this.trigger = function() { return this; };
            return this;
        };

        scaleSelector.createForm();

        scaleSelector.on('interpretation-change', function(data) {
            assert.strictEqual(data, null, 'clearSelection triggers interpretation-change with null');
            $.fn.select2 = originalSelect2;
            ready();
        });

        scaleSelector.clearSelection();
    });

    QUnit.test('global synchronization - setGlobalScale updates all instances', function(assert) {
        var ready = assert.async();
        assert.expect(1);

        scaleSelectorFactory.on('global-scale-change', function(value) {
            assert.equal(value, 'test-global-value', 'global-scale-change event is triggered with correct value');
            ready();
        });

        scaleSelectorFactory.setGlobalScale('test-global-value');
    });
});
