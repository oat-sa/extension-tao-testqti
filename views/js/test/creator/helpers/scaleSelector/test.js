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
        var $container = $('<div><input name="scale-custom" /></div>');
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

        var $container = $('<div><input name="scale-custom" /></div>');
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

        var $container = $('<div><input name="scale-custom" /></div>');
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
        $.fn.select2 = function(options) {
            assert.ok(true, 'select2 was initialized');
            this.select2 = function(method, value) {
                if (method === 'val') {
                    assert.equal(value, currentScale.uri, 'select2 val was set to the current scale URI');
                    select2ValCalled = true;
                }
                return this;
            };
            return this;
        };

        scaleSelector.createForm(currentScale);

        setTimeout(function() {
            assert.ok(select2ValCalled, 'select2 val was called');
            $.fn.select2 = originalSelect2;
            ready();
        }, 10);
    });

    QUnit.test('updateFormState() - updates the form state', function(assert) {
        var ready = assert.async();
        assert.expect(3);

        var $container = $('<div><input name="scale-custom" /></div>');
        $('#qunit-fixture').append($container);

        var testPresets = [
            { uri: "https://test.com/1", label: "Test Scale 1" },
            { uri: "https://test.com/2", label: "Test Scale 2" }
        ];
        scaleSelectorFactory.setPresets(testPresets);

        var scaleSelector = scaleSelectorFactory($container);
        var newScale = { uri: "https://test.com/1", label: "Test Scale 1" };

        var originalSelect2 = $.fn.select2;
        $.fn.select2 = function() {
            this.select2 = function(method, value) {
                if (method === 'val') {
                    // Make sure the assertion matches the newScale.uri value
                    assert.equal(value, newScale.uri, 'select2 val was set to the new scale URI');
                }
                return this;
            };
            return this;
        };

        scaleSelector.createForm();

        scaleSelector.updateFormState(newScale);

        scaleSelector.updateFormState("https://test.com/1");
        assert.ok(true, 'updateFormState with string doesn\'t cause errors');

        $.fn.select2 = originalSelect2;
        ready();
    });

    QUnit.test('updateScale() - triggers scale-change event with current selection', function(assert) {
        var ready = assert.async();
        assert.expect(2);

        var $container = $('<div><input name="scale-custom" /></div>');
        $('#qunit-fixture').append($container);

        var testPresets = [
            { uri: "https://test.com/1", label: "Test Scale 1" },
            { uri: "https://test.com/2", label: "Test Scale 2" }
        ];
        scaleSelectorFactory.setPresets(testPresets);

        var scaleSelector = scaleSelectorFactory($container);

        var originalTrigger = scaleSelector.trigger;
        scaleSelector.trigger = function(eventName, data) {
            if (eventName === 'scale-change') {
                if (data && data.uri === "https://test.com/1") {
                    assert.deepEqual(data, testPresets[0], 'scale-change event was triggered with the correct scale');

                    $container.find('[name=scale-custom]').val = function() {
                        return "https://nonexistent.com";
                    };

                    scaleSelector.trigger = function(eventName, data) {
                        if (eventName === 'scale-change') {
                            assert.deepEqual(
                                data,
                                { uri: "https://nonexistent.com", label: "https://nonexistent.com" },
                                'For nonexistent URI, creates a custom scale with URI as label'
                            );

                            scaleSelector.trigger = originalTrigger;
                            ready();
                        }
                    };

                    scaleSelector.updateScale();
                }
            }

            return originalTrigger.apply(this, arguments);
        };

        $container.find('[name=scale-custom]').val = function() {
            return "https://test.com/1";
        };

        scaleSelector.createForm();

        scaleSelector.updateScale();
    });

    QUnit.test('updateScale() - triggers scale-change with null when no selection', function(assert) {
        var ready = assert.async();
        assert.expect(1);

        var $container = $('<div><input name="scale-custom" /></div>');
        $('#qunit-fixture').append($container);

        var scaleSelector = scaleSelectorFactory($container);

        scaleSelector.createForm();

        $container.find('[name=scale-custom]').val = function() {
            return "";
        };

        scaleSelector.on('scale-change', function(scale) {
            assert.strictEqual(scale, null, 'scale-change event was triggered with null');
            ready();
        });

        scaleSelector.updateScale();
    });
});
