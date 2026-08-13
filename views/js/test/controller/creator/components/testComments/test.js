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
            '      <li role="tab" data-tab="properties"><span class="tab-label">Properties</span></li>',
            '      <li role="tab" data-tab="comments" data-label="Comments"><span class="tab-label"></span></li>',
            '    </ul>',
            '    <section data-mode-panel="properties"></section>',
            '    <section data-mode-panel="comments">',
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

        assert.expect(7);
        assert.ok(component, 'returns component API');
        assert.strictEqual(component.store, store, 'returns created store');
        assert.strictEqual(component.panel, panel, 'returns created panel');
        assert.strictEqual(storeFactoryConfig.resourceUri, 'urn:test:123', 'passes test uri to store');
        assert.strictEqual(storeFactoryConfig.resourceType, 'test', 'passes TEST resource type');
        assert.strictEqual(panelFactoryConfig.store, store, 'passes store to panel factory');
        assert.ok(loadCalled, 'starts store load during init');
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
});
