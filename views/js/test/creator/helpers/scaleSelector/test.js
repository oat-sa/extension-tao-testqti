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
        assert.expect(3);

        var $container = $('<div><input name="interpretation" /></div>');
        $('#qunit-fixture').append($container);

        var testPresets = [
            { uri: "https://test.com/1", label: "Test Scale 1" },
            { uri: "https://test.com/2", label: "Test Scale 2" }
        ];
        scaleSelectorFactory.setPresets(testPresets);

        var scaleSelector = scaleSelectorFactory($container);
        var currentScale = { uri: "https://test.com/1", label: "Test Scale 1" };

        var select2ValCalled = false;
        var originalSelect2 = $.fn.select2;
        var originalVal = $.fn.val;
        var originalTrigger = $.fn.trigger;
        var originalFind = $.fn.find;
        var originalAppend = $.fn.append;

        $.fn.select2 = function() {
            assert.ok(true, 'select2 was initialized');
            return this;
        };

        $.fn.val = function(value) {
            if (arguments.length > 0) {
                assert.equal(value, currentScale.uri, 'select2 val was set to the current scale URI');
                select2ValCalled = true;
                return this;
            }
            return originalVal.apply(this, arguments);
        };

        $.fn.trigger = function(event) {
            return originalTrigger.apply(this, arguments);
        };

        $.fn.find = function(selector) {
            if (selector.includes('option')) {
                return $();
            }
            return originalFind.apply(this, arguments);
        };

        $.fn.append = function() {
            return this;
        };

        scaleSelector.createForm(currentScale.uri);

        assert.ok(select2ValCalled, 'select2 val was called');

        $.fn.select2 = originalSelect2;
        $.fn.val = originalVal;
        $.fn.trigger = originalTrigger;
        $.fn.find = originalFind;
        $.fn.append = originalAppend;

        ready();
    });

    QUnit.test('updateFormState() - updates the form state', function(assert) {
        var ready = assert.async();
        assert.expect(3);

        var $container = $('<div><input name="interpretation" /></div>');
        $('#qunit-fixture').append($container);

        var testPresets = [
            { uri: "https://test.com/1", label: "Test Scale 1" },
            { uri: "https://test.com/2", label: "Test Scale 2" }
        ];
        scaleSelectorFactory.setPresets(testPresets);

        var scaleSelector = scaleSelectorFactory($container);
        var newScale = { uri: "https://test.com/1", label: "Test Scale 1" };

        var valCallCount = 0;
        var originalSelect2 = $.fn.select2;
        var originalVal = $.fn.val;
        var originalTrigger = $.fn.trigger;
        var originalFind = $.fn.find;
        var originalAppend = $.fn.append;

        $.fn.select2 = function() {
            return this;
        };

        $.fn.val = function(value) {
            if (arguments.length > 0) {
                valCallCount++;
                if (valCallCount <= 2) {
                    assert.equal(value, newScale.uri, 'select2 val was set to the new scale URI');
                }
                return this;
            }
            return originalVal.apply(this, arguments);
        };

        $.fn.trigger = function() {
            return this;
        };

        $.fn.find = function(selector) {
            if (selector.includes('option')) {
                return $();
            }
            return originalFind.apply(this, arguments);
        };

        $.fn.append = function() {
            return this;
        };

        scaleSelector.createForm();

        scaleSelector.updateFormState(newScale.uri);
        scaleSelector.updateFormState("https://test.com/1");

        assert.ok(true, 'updateFormState with string doesn\'t cause errors');

        $.fn.select2 = originalSelect2;
        $.fn.val = originalVal;
        $.fn.trigger = originalTrigger;
        $.fn.find = originalFind;
        $.fn.append = originalAppend;

        ready();
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

        var eventCount = 0;
        var originalTrigger = scaleSelector.trigger;
        var originalVal = $.fn.val;
        var currentReturnValue = "https://test.com/1";

        $.fn.val = function(value) {
            if (arguments.length > 0) {
                return this;
            } else {
                return currentReturnValue;
            }
        };

        scaleSelector.trigger = function(eventName, data) {
            if (eventName === 'interpretation-change') {
                eventCount++;
                if (eventCount === 1) {
                    assert.equal(data, "https://test.com/1", 'interpretation-change event was triggered with the correct URI');

                    currentReturnValue = "https://nonexistent.com";

                    scaleSelector.updateScale();
                } else if (eventCount === 2) {
                    assert.equal(data, "https://nonexistent.com", 'For nonexistent URI, creates a custom scale with URI as label');

                    scaleSelector.trigger = originalTrigger;
                    $.fn.val = originalVal;
                    ready();
                }
            }

            return originalTrigger.apply(this, arguments);
        };

        scaleSelector.createForm();
        scaleSelector.updateScale();
    });

    QUnit.test('updateScale() - triggers interpretation-change with null when no selection', function(assert) {
        var ready = assert.async();
        assert.expect(1);

        var $container = $('<div><input name="interpretation" /></div>');
        $('#qunit-fixture').append($container);

        var scaleSelector = scaleSelectorFactory($container);
        var originalVal = $.fn.val;

        $.fn.val = function(value) {
            if (arguments.length > 0) {
                return this;
            } else {
                return "";
            }
        };

        scaleSelector.createForm();

        scaleSelector.on('interpretation-change', function(scale) {
            assert.strictEqual(scale, null, 'interpretation-change event was triggered with null');

            $.fn.val = originalVal;
            ready();
        });

        scaleSelector.updateScale();
    });
});
