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
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */
define(['require', 'jquery'], function(require, $) {
    'use strict';

    var ITEM_URI = 'http://www.tao.lu/Ontologies/TAOItem.rdf#Item';
    var testState = {
        classChildrenByUri: Object.create(null),
        classPropertiesByUri: Object.create(null),
        itemsByClassUri: Object.create(null),
        calls: {
            children: [],
            properties: [],
            items: []
        },
        latestResourceSelector: null
    };

    function resetState() {
        testState.classChildrenByUri = Object.create(null);
        testState.classPropertiesByUri = Object.create(null);
        testState.itemsByClassUri = Object.create(null);
        testState.calls.children = [];
        testState.calls.properties = [];
        testState.calls.items = [];
        testState.latestResourceSelector = null;
    }

    function waitForSettled() {
        return new Promise(function(resolve) {
            setTimeout(function() {
                setTimeout(resolve, 0);
            }, 0);
        });
    }

    define('taoQtiTest/test/creator/views/item/providerMock', [], function() {
        return function providerFactoryMock() {
            return {
                getItemClassChildren: function(classUri) {
                    testState.calls.children.push(classUri);
                    return Promise.resolve(testState.classChildrenByUri[classUri] || []);
                },
                getItemClassProperties: function(classUri) {
                    testState.calls.properties.push(classUri);
                    return Promise.resolve(testState.classPropertiesByUri[classUri] || []);
                },
                getItems: function(params) {
                    var classUri = params && params.classUri;
                    testState.calls.items.push(params || {});
                    return Promise.resolve(testState.itemsByClassUri[classUri] || []);
                }
            };
        };
    });

    define('taoQtiTest/test/creator/views/item/resourceSelectorMock', ['jquery'], function($) {
        function findOrCreateRoot($container, classUri) {
            var $root = $container.find('.class-selector .options > ul > li');
            if ($root.length) {
                return $root;
            }

            $container.append(
                '<div class="class-selector">' +
                    '<div class="options">' +
                        '<ul>' +
                            '<li class="closed">' +
                                '<a data-uri="' + classUri + '">Item</a>' +
                                '<ul></ul>' +
                            '</li>' +
                        '</ul>' +
                    '</div>' +
                '</div>'
            );

            return $container.find('.class-selector .options > ul > li');
        }

        function createSelectorApi($container, selectorConfig) {
            var handlers = Object.create(null);
            var api = {
                on: function(eventName, handler) {
                    handlers[eventName] = handler;
                    if (eventName === 'render') {
                        handler.call(api);
                    }
                    return api;
                },
                addClassNode: function(node, parentUri) {
                    var $parentLink = $container.find('.class-selector a[data-uri="' + parentUri + '"]').first();
                    var $parentNode = $parentLink.closest('li');
                    var $childrenList;
                    var $existing;

                    if (!$parentNode.length) {
                        $parentNode = findOrCreateRoot($container, selectorConfig.classUri);
                    }

                    $childrenList = $parentNode.children('ul');
                    if (!$childrenList.length) {
                        $childrenList = $('<ul></ul>').appendTo($parentNode);
                    }

                    $existing = $childrenList.find('> li > a[data-uri="' + node.uri + '"]');
                    if ($existing.length) {
                        return;
                    }

                    $childrenList.append(
                        '<li class="closed">' +
                            '<a data-uri="' + node.uri + '">' + (node.label || node.uri) + '</a>' +
                            '<ul></ul>' +
                        '</li>'
                    );

                    if (handlers.update) {
                        handlers.update.call(api);
                    }
                },
                updateFilters: function(filters) {
                    api._filters = filters;
                },
                update: function(items, params) {
                    api._items = items;
                    api._params = params;
                    if (handlers.update) {
                        handlers.update.call(api);
                    }
                },
                clearSelection: function() {
                    api._selectionCleared = true;
                },
                trigger: function(eventName, payload) {
                    if (handlers[eventName]) {
                        handlers[eventName].call(api, payload);
                    }
                }
            };

            findOrCreateRoot($container, selectorConfig.classUri);
            testState.latestResourceSelector = api;

            return api;
        }

        createSelectorApi.selectionModes = {
            multiple: 'multiple'
        };
        createSelectorApi.selectAllPolicies = {
            visible: 'visible'
        };

        return createSelectorApi;
    });

    define('taoQtiTest/test/creator/views/item/loggerMock', [], function() {
        return function loggerFactoryMock() {
            return {
                error: function() {}
            };
        };
    });

    define('taoQtiTest/test/creator/views/item/feedbackMock', [], function() {
        return function feedbackMock() {
            return {
                error: function() {}
            };
        };
    });

    define('taoQtiTest/test/creator/views/item/i18nMock', [], function() {
        return function translate(msg) {
            return msg;
        };
    });

    requirejs.config({
        map: {
            'taoQtiTest/controller/creator/views/item': {
                i18n: 'taoQtiTest/test/creator/views/item/i18nMock',
                'core/logger': 'taoQtiTest/test/creator/views/item/loggerMock',
                'taoQtiTest/provider/testItems': 'taoQtiTest/test/creator/views/item/providerMock',
                'ui/resource/selector': 'taoQtiTest/test/creator/views/item/resourceSelectorMock',
                'ui/feedback': 'taoQtiTest/test/creator/views/item/feedbackMock'
            }
        },
        config: {
            'taoQtiTest/controller/creator/views/item': {
                BRS: false
            }
        }
    });

    function loadItemViewFactory() {
        return new Promise(function(resolve, reject) {
            requirejs.undef('taoQtiTest/controller/creator/views/item');
            require(['taoQtiTest/controller/creator/views/item'], resolve, reject);
        });
    }

    QUnit.module('creator/views/item', {
        beforeEach: function() {
            resetState();
            $('#qunit-fixture').empty();
        }
    });

    QUnit.test('module exposes a function', function(assert) {
        var done = assert.async();

        assert.expect(1);
        loadItemViewFactory().then(function(itemViewFactory) {
            assert.equal(typeof itemViewFactory, 'function', 'The item view module exposes a factory function');
            done();
        });
    });

    QUnit.test('leaf class nodes are marked as non-expandable', function(assert) {
        var done = assert.async();
        var leafClassUri = 'http://example.com/class-leaf';
        var $container = $('<div></div>').appendTo('#qunit-fixture');

        testState.classChildrenByUri[ITEM_URI] = [
            {
                uri: leafClassUri,
                label: 'Leaf',
                hasChildren: false
            }
        ];
        testState.classPropertiesByUri[ITEM_URI] = [];

        assert.expect(5);

        loadItemViewFactory()
            .then(function(itemViewFactory) {
                itemViewFactory($container);
                return waitForSettled();
            })
            .then(function() {
                var $leafNode = $container.find('.class-selector .options a[data-uri="' + leafClassUri + '"]').closest('li');
                var $leafToggler = $leafNode.children('.class-selector-toggler');

                assert.ok($leafNode.length, 'Leaf node is rendered');
                assert.ok($leafToggler.length, 'Leaf node receives a toggler element');
                assert.equal($leafToggler.attr('aria-hidden'), 'true', 'Leaf toggler is hidden from interaction');
                assert.notOk($leafToggler.attr('tabindex'), 'Leaf toggler is removed from keyboard navigation');
                assert.deepEqual(testState.calls.children, [ITEM_URI], 'Only root children are loaded initially');
                done();
            });
    });

    QUnit.test('expandable node hides toggler when loaded children are empty', function(assert) {
        var done = assert.async();
        var branchClassUri = 'http://example.com/class-branch';
        var $container = $('<div></div>').appendTo('#qunit-fixture');

        testState.classChildrenByUri[ITEM_URI] = [
            {
                uri: branchClassUri,
                label: 'Branch',
                hasChildren: true
            }
        ];
        testState.classChildrenByUri[branchClassUri] = [];
        testState.classPropertiesByUri[ITEM_URI] = [];

        assert.expect(5);

        loadItemViewFactory()
            .then(function(itemViewFactory) {
                itemViewFactory($container);
                return waitForSettled();
            })
            .then(function() {
                var $branchNode = $container.find('.class-selector .options a[data-uri="' + branchClassUri + '"]').closest('li');
                var $branchToggler = $branchNode.children('.class-selector-toggler');

                assert.equal($branchToggler.attr('aria-hidden'), 'false', 'Branch starts as expandable');
                $branchToggler.trigger('click');

                return waitForSettled();
            })
            .then(function() {
                var $branchNode = $container.find('.class-selector .options a[data-uri="' + branchClassUri + '"]').closest('li');
                var $branchToggler = $branchNode.children('.class-selector-toggler');

                assert.deepEqual(
                    testState.calls.children,
                    [ITEM_URI, branchClassUri],
                    'Children are loaded lazily for expanded branch'
                );
                assert.equal($branchToggler.attr('aria-hidden'), 'true', 'Branch toggler is hidden after empty children load');
                assert.ok($branchNode.hasClass('closed'), 'Branch node is kept in closed state');
                assert.notOk($branchToggler.attr('tabindex'), 'Hidden toggler is not keyboard-focusable');
                done();
            });
    });
});
