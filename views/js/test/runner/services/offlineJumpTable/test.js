define([
    'core/promise',
    'taoQtiTest/runner/services/offlineJumpTable',
    'taoQtiTest/runner/proxy/cache/itemStore',
    'json!taoQtiTest/test/runner/services/offlineJumpTable/resources/items.json',
    'json!taoQtiTest/test/runner/services/offlineJumpTable/resources/testMap.json'
], function(
    Promise,
    offlineJumpTableFactory,
    itemStoreFactory,
    itemsJson,
    testMapJson
) {
    'use strict';

    var offlineJumpTable,
        itemStore;

    QUnit.module('offlineJumpTable', {
        beforeEach: function(assert) {
            var done = assert.async();

            itemStore = itemStoreFactory();

            itemStore.setCacheSize(Object.keys(itemsJson.items).length);

            addItemsToItemStore().then(function() {
                offlineJumpTable = offlineJumpTableFactory(itemStore);

                done();
            });
        }
    });

    QUnit.test('it exposes a function', function(assert) {
        assert.expect(1);
        assert.equal(typeof offlineJumpTableFactory, 'function');
    });

    QUnit.test('it has the required methods', function(assert) {
        assert.expect(11);
        assert.equal(typeof offlineJumpTable['setTestMap'], 'function');
        assert.equal(typeof offlineJumpTable['init'], 'function');
        assert.equal(typeof offlineJumpTable['clearJumpTable'], 'function');
        assert.equal(typeof offlineJumpTable['addJump'], 'function');
        assert.equal(typeof offlineJumpTable['jumpTo'], 'function');
        assert.equal(typeof offlineJumpTable['jumpToSkipItem'], 'function');
        assert.equal(typeof offlineJumpTable['jumpToNextItem'], 'function');
        assert.equal(typeof offlineJumpTable['jumpToNextSection'], 'function');
        assert.equal(typeof offlineJumpTable['jumpToPreviousItem'], 'function');
        assert.equal(typeof offlineJumpTable['getJumpTable'], 'function');
        assert.equal(typeof offlineJumpTable['getLastJump'], 'function');
    });

    QUnit.test('it contains the added jump after addJump()', function(assert) {
        var done = assert.async();

        offlineJumpTable.addJump('foo', 'bar', 'baz').then(function() {
            assert.expect(1);
            assert.deepEqual(offlineJumpTable.getJumpTable(), [
                {
                    part: 'foo',
                    section: 'bar',
                    item: 'baz',
                    position: 0
                }
            ]);
            done();
        });
    });

    QUnit.test('clearJumpTable() clears the jump table', function(assert) {
        var done = assert.async();

        offlineJumpTable.addJump('foo', 'bar', 'baz').then(function() {
            offlineJumpTable.clearJumpTable();
            assert.expect(1);
            assert.deepEqual(offlineJumpTable.getJumpTable().length, 0);
            done();
        });
    });

    QUnit
        .cases
        .init([
            { jumpTo: 0, expectedPart: 'foo1', expectedSection: 'bar1', expectedItem: 'baz1' },
            { jumpTo: 1, expectedPart: 'foo2', expectedSection: 'bar2', expectedItem: 'baz2' },
            { jumpTo: 2, expectedPart: 'foo3', expectedSection: 'bar3', expectedItem: 'baz3' }
        ])
        .test('it jumps to a specific position with jumpTo()', function(data,assert) {
            var done = assert.async();

            Promise.all([
                offlineJumpTable.addJump('foo1', 'bar1', 'baz1'),
                offlineJumpTable.addJump('foo2', 'bar2', 'baz2'),
                offlineJumpTable.addJump('foo3', 'bar3', 'baz3')
            ]).then(function() {
                offlineJumpTable.jumpTo(data.jumpTo);
                assert.expect(4);
                assert.equal(offlineJumpTable.getLastJump().part, data.expectedPart);
                assert.equal(offlineJumpTable.getLastJump().section, data.expectedSection);
                assert.equal(offlineJumpTable.getLastJump().item, data.expectedItem);
                assert.equal(offlineJumpTable.getLastJump().position, data.jumpTo);
                done();
            });
        });

    QUnit
        .cases
        .init([
            { addItem: 'Q01', addSection: 'S01', addPart: 'P01', expectedItem: 'Q02', expectedSection: 'S01', expectedPart: 'P01' },
            { addItem: 'Q03-1', addSection: 'S01', addPart: 'P01', expectedItem: 'Q03-2', expectedSection: 'S01', expectedPart: 'P01' }
        ])
        .test('it skips to the next item from the testMap when jumpToSkipItem() called', function(data, assert) {
            var done = assert.async();

            Promise.all([
                offlineJumpTable.setTestMap(testMapJson),
                offlineJumpTable.addJump(data.addPart, data.addSection, data.addItem),
                offlineJumpTable.jumpToSkipItem()
            ]).then(function() {
                assert.expect(3);
                assert.equal(offlineJumpTable.getLastJump().part, data.expectedPart);
                assert.equal(offlineJumpTable.getLastJump().section, data.expectedSection);
                assert.equal(offlineJumpTable.getLastJump().item, data.expectedItem);
                done();
            });
        });

    QUnit
        .cases
        .init([
            { addItem: 'Q01', addSection: 'S01', addPart: 'P01', expectedItem: 'Q02', expectedSection: 'S01', expectedPart: 'P01', navigationParams: {
                itemDefinition: 'Q01',
                itemResponse: {
                    NFER_01_01_01_01: {
                        base: { identifier: 'choice_1' }
                    },
                    NFER_01_01_01_02: {
                        base: { identifier: 'choice_3' }
                    }
                }
            } },
            { addItem: 'Q03-1', addSection: 'S01', addPart: 'P01', expectedItem: 'Q03-2', expectedSection: 'S01', expectedPart: 'P01', navigationParams: {
                itemDefinition: 'Q03-1',
                itemResponse: {
                    NFER_01_03_01_01: {
                        base: { identifier: 'choice_1' }
                    },
                    NFER_01_03_01_02: {
                        base: { identifier: 'choice_3' }
                    },
                    NFER_01_03_01_03: {
                        base: { identifier: 'choice_5' }
                    }
                }
            } },
            { addItem: 'Q03-1', addSection: 'S01', addPart: 'P01', expectedItem: 'Q04-1', expectedSection: 'S01', expectedPart: 'P01', navigationParams: {
                itemDefinition: 'Q03-1',
                itemResponse: {
                    NFER_01_03_01_01: {
                        base: { identifier: 'choice_2' }
                    },
                    NFER_01_03_01_02: {
                        base: { identifier: 'choice_3' }
                    },
                    NFER_01_03_01_03: {
                        base: { identifier: 'choice_5' }
                    }
                }
            } }
        ])
        .test('it jumps to the next item with jumpToNextItem(), considering the branching rules, if there is any', function(data, assert) {
            var done = assert.async();

            offlineJumpTable.setTestMap(testMapJson);
            offlineJumpTable.init();

            Promise.all([
                offlineJumpTable.addJump(data.addPart, data.addSection, data.addItem),
                offlineJumpTable.jumpToNextItem(data.navigationParams)
            ]).then(function() {
                assert.expect(3);
                assert.equal(offlineJumpTable.getLastJump().part, data.expectedPart);
                assert.equal(offlineJumpTable.getLastJump().section, data.expectedSection);
                assert.equal(offlineJumpTable.getLastJump().item, data.expectedItem);
                done();
            });
        });

    QUnit.test('it jumps to the previous item with jumpToPreviousItem()', function(assert) {
        var done = assert.async();

        Promise.all([
            offlineJumpTable.addJump('P01', 'S01', 'I01'),
            offlineJumpTable.addJump('P01', 'S01', 'I02'),
            offlineJumpTable.addJump('P01', 'S01', 'I03')
        ]).then(function() {
            offlineJumpTable.jumpToPreviousItem();

            assert.expect(1);
            assert.deepEqual(offlineJumpTable.getLastJump(), {
                item: 'I02',
                section: 'S01',
                part: 'P01',
                position: 1
            });
            done();
        });
    });

    QUnit.test('it jump to the first item of the next section with jumpToNextSection()', function(assert) {
        var done = assert.async();

        offlineJumpTable.setTestMap(testMapJson);
        offlineJumpTable.init();

        Promise.all([
            offlineJumpTable.addJump('P01', 'S01', 'I01'),
            offlineJumpTable.jumpToNextSection()
        ]).then(function() {
            assert.expect(3);
            assert.equal(offlineJumpTable.getLastJump().part, 'P01');
            assert.equal(offlineJumpTable.getLastJump().section, 'S02');
            assert.equal(offlineJumpTable.getLastJump().item, 'Q13');
            done();
        });
    });

    function addItemsToItemStore() {
        var promises = [];
        Object.keys(itemsJson.items).forEach(function(itemIdentifier) {
            promises.push(itemStore.set(itemIdentifier, itemsJson.items[itemIdentifier]));
        });

        return Promise.all(promises);
    }
});
