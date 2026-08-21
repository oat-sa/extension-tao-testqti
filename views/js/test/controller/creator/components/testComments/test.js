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
 * Foundation, Inc., 31 Milk St # 960789 Boston, MA 02196 USA
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */
define([
    'jquery',
    'taoQtiTest/controller/creator/components/testComments'
], function ($, testComments) {
    'use strict';

    function createContainer() {
        const $container = $([
            '<div id="test-creator">',
            '  <div class="test-creator-props">',
            '    <ul id="test-creator-mode-tabs">',
            '      <li id="test-creator-tab-properties" role="tab" data-tab="properties" aria-controls="test-creator-panel-properties" tabindex="0"><span class="tab-label">Properties</span></li>',
            '      <li id="test-creator-tab-comments" role="tab" data-tab="comments" data-label="Comments" aria-controls="test-creator-panel-comments" tabindex="-1"><span class="tab-label"></span></li>',
            '    </ul>',
            '    <section id="test-creator-panel-properties" data-mode-panel="properties" aria-labelledby="test-creator-tab-properties"></section>',
            '    <section id="test-creator-panel-comments" data-mode-panel="comments" aria-labelledby="test-creator-tab-comments">',
            '      <div class="test-comments-content-panel"></div>',
            '    </section>',
            '    <div class="props"></div>',
            '  </div>',
            '</div>'
        ].join(''));

        $('#qunit-fixture').append($container);

        return $container;
    }

    function createStoreStub(overrides) {
        return Object.assign(
            {
                on: function () {
                    return this;
                },
                off: function () {
                    return this;
                },
                load: function () {
                    return Promise.resolve(this);
                }
            },
            overrides || {}
        );
    }

    function createPanelStub(overrides) {
        return Object.assign(
            {
                refresh: function () {},
                destroy: function () {}
            },
            overrides || {}
        );
    }

    QUnit.module('API');

    QUnit.test('module exposes init', function (assert) {
        assert.expect(2);
        assert.equal(typeof testComments, 'object', 'module is an object');
        assert.equal(typeof testComments.init, 'function', 'init is a function');
    });

    QUnit.test('init returns null without testUri', function (assert) {
        assert.expect(1);
        assert.strictEqual(testComments.init({}), null, 'requires testUri');
    });

    QUnit.test('init wires store and panel on valid setup', function (assert) {
        const $container = createContainer();
        let storeFactoryConfig = null;
        let panelFactoryConfig = null;
        let loadCalled = false;

        const store = createStoreStub({
            load: function () {
                loadCalled = true;
                return Promise.resolve(this);
            }
        });
        const panel = createPanelStub();

        const component = testComments.init({
            testUri: 'urn:test:123',
            $container: $container,
            storeFactory: function (config) {
                storeFactoryConfig = config;
                return store;
            },
            panelFactory: function (config) {
                panelFactoryConfig = config;
                return panel;
            }
        });

        assert.expect(9);
        assert.ok(component, 'returns component API');
        assert.strictEqual(component.store, store, 'returns created store');
        assert.strictEqual(component.panel, panel, 'returns created panel');
        assert.strictEqual(storeFactoryConfig.resourceUri, 'urn:test:123', 'passes test uri to store');
        assert.strictEqual(storeFactoryConfig.resourceType, 'test', 'passes TEST resource type');
        assert.strictEqual(panelFactoryConfig.store, store, 'passes store to panel factory');
        assert.ok(loadCalled, 'starts store load during init');
        assert.strictEqual($container.find('[data-tab="properties"]').attr('tabindex'), '0', 'active tab gets tabindex 0');
        assert.strictEqual($container.find('[data-tab="comments"]').attr('tabindex'), '-1', 'inactive tab gets tabindex -1');
    });

    QUnit.test('init tolerates failing store load and still returns api', function (assert) {
        const done = assert.async();
        const $container = createContainer();
        const panel = createPanelStub();
        const store = createStoreStub({
            load: function () {
                return Promise.reject(new Error('load failed'));
            }
        });

        const component = testComments.init({
            testUri: 'urn:test:456',
            $container: $container,
            storeFactory: function () {
                return store;
            },
            panelFactory: function () {
                return panel;
            }
        });

        assert.expect(3);
        assert.ok(component, 'returns component API even if load fails');
        assert.strictEqual(component.store, store, 'returns store instance');

        setTimeout(function () {
            assert.ok(true, 'no synchronous crash when load rejects');
            done();
        }, 0);
    });

    QUnit.test('keyboard switches mode and supports tab focus navigation', function (assert) {
        const $container = createContainer();
        const store = createStoreStub();
        let refreshCalls = 0;
        const panel = createPanelStub({
            refresh: function () {
                refreshCalls += 1;
            }
        });

        const component = testComments.init({
            testUri: 'urn:test:789',
            $container: $container,
            storeFactory: function () {
                return store;
            },
            panelFactory: function () {
                return panel;
            }
        });

        const $propertiesTab = $container.find('[data-tab="properties"]');
        const $commentsTab = $container.find('[data-tab="comments"]');

        assert.expect(8);

        $propertiesTab.trigger($.Event('keydown', { key: 'ArrowRight' }));
        assert.strictEqual(document.activeElement, $commentsTab.get(0), 'ArrowRight moves focus to next tab');

        $commentsTab.trigger($.Event('keydown', { key: 'Enter' }));
        assert.strictEqual($commentsTab.attr('aria-selected'), 'true', 'Enter activates focused tab');
        assert.strictEqual($commentsTab.attr('tabindex'), '0', 'active comments tab gets tabindex 0');
        assert.strictEqual($propertiesTab.attr('tabindex'), '-1', 'inactive properties tab gets tabindex -1');
        assert.ok(refreshCalls > 0, 'activating comments refreshes panel');

        $commentsTab.trigger($.Event('keydown', { key: 'Home' }));
        assert.strictEqual(document.activeElement, $propertiesTab.get(0), 'Home focuses first tab');

        $propertiesTab.trigger($.Event('keydown', { key: 'End' }));
        assert.strictEqual(document.activeElement, $commentsTab.get(0), 'End focuses last tab');

        assert.ok(component, 'component initialized');
    });
});
