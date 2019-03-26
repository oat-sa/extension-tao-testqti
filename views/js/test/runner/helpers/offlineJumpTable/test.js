define([
    'lodash',
    'taoQtiTest/runner/helpers/offlineJumpTable',
    'taoQtiTest/test/runner/helpers/offlineJumpTable/mocks/itemStoreMock',
    'json!taoQtiTest/test/runner/helpers/offlineJumpTable/testMap.json',
], function(
    _,
    OfflineJumpTableHelper,
    itemStoreMock,
    testMapJson
) {
    'use strict';

    QUnit.module('cleanJumpTable');
    QUnit.asyncTest('cleanJumpTable()', function(assert) {
        QUnit.expect(1);

        itemStoreMock.then(function(itemStore) {
            var offlineJumpTableHelper = new OfflineJumpTableHelper(itemStore);

            offlineJumpTableHelper.setTestMap(testMapJson);

            QUnit.start();
            assert.deepEqual(offlineJumpTableHelper.clearJumpTable().getJumpTable(), []);
        });
    });

    QUnit.module('addJump');
    QUnit.asyncTest('addJump() - when jumpTable is empty', function(assert) {
        QUnit.expect(1);

        itemStoreMock.then(function(itemStore) {
            var offlineJumpTableHelper = new OfflineJumpTableHelper(itemStore);

            offlineJumpTableHelper
                .setTestMap(testMapJson)
                .addJump('P01', 'S01', 'I01').then(function() {
                    QUnit.start();
                    assert.deepEqual(offlineJumpTableHelper.getJumpTable(), [
                        {
                            item: 'I01',
                            part: 'P01',
                            section: 'S01',
                            position: 0,
                        }
                    ]);
                });
        });
    });

    QUnit.asyncTest('addJump() - multiple entries', function(assert) {
        QUnit.expect(2);

        itemStoreMock.then(function(itemStore) {
            var offlineJumpTableHelper = new OfflineJumpTableHelper(itemStore);

            offlineJumpTableHelper.setTestMap(testMapJson);

            Promise.all([
                offlineJumpTableHelper.addJump('P01', 'S01', 'I01'),
                offlineJumpTableHelper.addJump('P01', 'S01', 'I02'),
            ]).then(function() {
                QUnit.start();
                assert.deepEqual(offlineJumpTableHelper.getLastJump(), {
                    item: 'I02',
                    part: 'P01',
                    section: 'S01',
                    position: 1,
                });
                assert.deepEqual(offlineJumpTableHelper.getJumpTable(), [
                    {
                        item: 'I01',
                        part: 'P01',
                        section: 'S01',
                        position: 0,
                    },
                    {
                        item: 'I02',
                        part: 'P01',
                        section: 'S01',
                        position: 1,
                    }
                ]);
            });
        });
    });

    QUnit.module('jumpTo');
    QUnit.asyncTest('jumpTo() - to non-existing position', function(assert) {
        QUnit.expect(2);

        itemStoreMock.then(function(itemStore) {
            var offlineJumpTableHelper = new OfflineJumpTableHelper(itemStore);

            offlineJumpTableHelper.setTestMap(testMapJson);

            QUnit.start();
            assert.deepEqual(offlineJumpTableHelper.jumpTo(1).getJumpTable(), []);
            assert.deepEqual(offlineJumpTableHelper.jumpTo(1).getLastJump(), {});
        });
    });

    QUnit.asyncTest('jumpTo() - to an existing previous position', function(assert) {
        QUnit.expect(2);

        itemStoreMock.then(function(itemStore) {
            var offlineJumpTableHelper = new OfflineJumpTableHelper(itemStore);

            offlineJumpTableHelper.setTestMap(testMapJson);

            Promise.all([
                offlineJumpTableHelper.addJump('P01', 'S01', 'I01'),
                offlineJumpTableHelper.addJump('P01', 'S01', 'I02'),
                offlineJumpTableHelper.addJump('P01', 'S01', 'I03'),
            ]).then(function() {
                QUnit.start();

                assert.deepEqual(offlineJumpTableHelper.jumpTo(0).getJumpTable(), [
                    {
                        item: 'I01',
                        part: 'P01',
                        section: 'S01',
                        position: 0,
                    },
                ]);
                assert.deepEqual(offlineJumpTableHelper.jumpTo(0).getLastJump(), {
                    item: 'I01',
                    part: 'P01',
                    section: 'S01',
                    position: 0,
                });
            });
        });
    });

    QUnit.module('jumpToNextItem');
    QUnit.asyncTest('jumpToNextItem() - when there are no previous jumps', function(assert) {
        QUnit.expect(2);

        itemStoreMock.then(function(itemStore) {
            var offlineJumpTableHelper = new OfflineJumpTableHelper(itemStore);
            var params = {
                itemResponse: {
                    'RESPONSE1': { base: { identifier: 'a' } },
                    'RESPONSE2': { list: { identifier: ['c'] } },
                },
            };

            offlineJumpTableHelper
                .setTestMap(testMapJson)
                .jumpToNextItem(params).then(function () {
                    QUnit.start();

                    assert.deepEqual(offlineJumpTableHelper.getJumpTable(), [
                        {
                            item: 'I01',
                            part: 'P01',
                            section: 'S01',
                            position: 0,
                        },
                    ]);
                    assert.deepEqual(offlineJumpTableHelper.getLastJump(), {
                        item: 'I01',
                        part: 'P01',
                        section: 'S01',
                        position: 0,
                    });
                });
        });
    });

    QUnit.asyncTest('jumpToNextItem() - when some items are loaded from the current section', function(assert) {
        QUnit.expect(2);

        itemStoreMock.then(function(itemStore) {
            var offlineJumpTableHelper = new OfflineJumpTableHelper(itemStore);
            var params = {
                itemResponse: {
                    'RESPONSE1': {base: {identifier: 'a'}},
                    'RESPONSE2': {list: {identifier: ['c']}},
                },
            };

            offlineJumpTableHelper.setTestMap(testMapJson);

            Promise.all([
                offlineJumpTableHelper.addJump('P01', 'S01', 'I01'),
                offlineJumpTableHelper.jumpToNextItem(params),
            ]).then(function() {
                QUnit.start();

                assert.deepEqual(offlineJumpTableHelper.getJumpTable(), [
                    {
                        item: 'I01',
                        part: 'P01',
                        section: 'S01',
                        position: 0,
                    },
                    {
                        item: 'I02',
                        part: 'P01',
                        section: 'S01',
                        position: 1,
                    },
                ]);
                assert.deepEqual(offlineJumpTableHelper.getLastJump(), {
                    item: 'I02',
                    part: 'P01',
                    section: 'S01',
                    position: 1,
                });
            });
        });
    });

    QUnit.asyncTest('jumpToNextItem() - when all items are loaded from the current section', function(assert) {
        QUnit.expect(2);

        itemStoreMock.then(function(itemStore) {
            var offlineJumpTableHelper = new OfflineJumpTableHelper(itemStore);
            var params = {
                itemResponse: {
                    'RESPONSE1': {base: {identifier: 'a'}},
                    'RESPONSE2': {list: {identifier: ['c']}},
                },
            };

            offlineJumpTableHelper.setTestMap(testMapJson);

            Promise.all([
                offlineJumpTableHelper.addJump('P01', 'S01', 'I01'),
                offlineJumpTableHelper.addJump('P01', 'S01', 'I02'),
                offlineJumpTableHelper.jumpToNextItem(params),
            ]).then(function() {
                QUnit.start();
                assert.deepEqual(offlineJumpTableHelper.getJumpTable(), [
                    {
                        item: 'I01',
                        part: 'P01',
                        section: 'S01',
                        position: 0,
                    },
                    {
                        item: 'I02',
                        part: 'P01',
                        section: 'S01',
                        position: 1,
                    },
                    {
                        item: 'I03',
                        part: 'P01',
                        section: 'S02',
                        position: 2,
                    },
                ]);
                assert.deepEqual(offlineJumpTableHelper.getLastJump(), {
                    item: 'I03',
                    part: 'P01',
                    section: 'S02',
                    position: 2,
                });
            });
        });
    });

    QUnit.asyncTest('jumpToNextItem() - when there is no next item', function(assert) {
        QUnit.expect(2);

        itemStoreMock.then(function(itemStore) {
            var offlineJumpTableHelper = new OfflineJumpTableHelper(itemStore);
            var params = {
                itemResponse: {
                    'RESPONSE1': {base: {identifier: 'a'}},
                    'RESPONSE2': {list: {identifier: ['c']}},
                },
            };

            offlineJumpTableHelper.setTestMap(testMapJson);

            Promise.all([
                offlineJumpTableHelper.addJump('P03', 'S06', 'I12'),
                offlineJumpTableHelper.jumpToNextItem(params),
            ]).then(function() {
                QUnit.start();
                assert.deepEqual(offlineJumpTableHelper.getJumpTable(), [
                    {
                        item: 'I12',
                        part: 'P03',
                        section: 'S06',
                        position: 0,
                    },
                ]);
                assert.deepEqual(offlineJumpTableHelper.getLastJump(), {
                    item: 'I12',
                    part: 'P03',
                    section: 'S06',
                    position: 0,
                });
            });
        });
    });

    QUnit.asyncTest('jumpToNextItem() - when there is branching rule but not taking into account', function(assert) {
        QUnit.expect(2);

        itemStoreMock.then(function(itemStore) {
            var offlineJumpTableHelper = new OfflineJumpTableHelper(itemStore);
            var params = {
                itemDefinition: 'I01',
                itemResponse: {
                    'RESPONSE1': {base: {identifier: 'a'}},
                    'RESPONSE2': {list: {identifier: ['c']}},
                },
            };

            testMapJson.parts['P01'].sections['S01'].items['I01'].branchRule = {
                '@attributes': { target: 'I03' },
                or: {
                    not: [
                        {
                            match: {
                                correct: { '@attributes': { identifier: 'I01.RESPONSE1' } },
                                variable: { '@attributes': { identifier: 'I01.RESPONSE1' } },
                            },
                        },
                        {
                            match: {
                                correct: { '@attributes': { identifier: 'I01.RESPONSE2' } },
                                variable: { '@attributes': { identifier: 'I01.RESPONSE2' } },
                            },
                        }
                    ]
                }
            };

            offlineJumpTableHelper.setTestMap(testMapJson);
            offlineJumpTableHelper.init();

            Promise.all([
                offlineJumpTableHelper.addJump('P01', 'S01', 'I01'),
                offlineJumpTableHelper.jumpToNextItem(params),
            ]).then(function() {
                QUnit.start();
                assert.deepEqual(offlineJumpTableHelper.getJumpTable(), [
                    {
                        item: 'I01',
                        part: 'P01',
                        section: 'S01',
                        position: 0,
                    },
                    {
                        item: 'I03',
                        part: 'P01',
                        section: 'S02',
                        position: 1,
                    },
                ]);
                assert.deepEqual(offlineJumpTableHelper.getLastJump(), {
                    item: 'I03',
                    part: 'P01',
                    section: 'S02',
                    position: 1,
                });
            });
        });
    });

    QUnit.asyncTest('jumpToNextItem() - when there is branching rule and taking into account', function(assert) {
        QUnit.expect(2);

        itemStoreMock.then(function(itemStore) {
            var offlineJumpTableHelper = new OfflineJumpTableHelper(itemStore);
            var params = {
                itemDefinition: 'I01',
                itemResponse: {
                    'RESPONSE1': {base: {identifier: 'test'}},
                    'RESPONSE2': {list: {identifier: ['c']}},
                },
            };

            testMapJson.parts['P01'].sections['S01'].items['I01'].branchRule = {
                '@attributes': { target: 'I03' },
                or: {
                    not: [
                        {
                            match: {
                                correct: { '@attributes': { identifier: 'I01.RESPONSE1' } },
                                variable: { '@attributes': { identifier: 'I01.RESPONSE1' } },
                            },
                        },
                        {
                            match: {
                                correct: { '@attributes': { identifier: 'I01.RESPONSE2' } },
                                variable: { '@attributes': { identifier: 'I01.RESPONSE2' } },
                            },
                        }
                    ]
                }
            };

            offlineJumpTableHelper.setTestMap(testMapJson);
            offlineJumpTableHelper.init();

            Promise.all([
                offlineJumpTableHelper.addJump('P01', 'S01', 'I01'),
                offlineJumpTableHelper.jumpToNextItem(params),
            ]).then(function() {
                QUnit.start();
                assert.deepEqual(offlineJumpTableHelper.getJumpTable(), [
                    {
                        item: 'I01',
                        part: 'P01',
                        section: 'S01',
                        position: 0,
                    },
                    {
                        item: 'I03',
                        part: 'P01',
                        section: 'S02',
                        position: 1,
                    },
                ]);
                assert.deepEqual(offlineJumpTableHelper.getLastJump(), {
                    item: 'I03',
                    part: 'P01',
                    section: 'S02',
                    position: 1,
                });
            });
        });
    });












    QUnit.module('jumpToNextSection');
    QUnit.test('jumpToNextSection() - when there are no previous jumps', function(assert) {
        QUnit.expect(2);

        var offlineJumpTableHelper = new OfflineJumpTableHelper(testMapJson).jumpToNextSection();

        assert.deepEqual(offlineJumpTableHelper.getJumpTable(), [
            {
                item: 'I01',
                part: 'P01',
                section: 'S01',
                position: 0,
            },
        ]);
        assert.deepEqual(offlineJumpTableHelper.getLastJump(), {
            item: 'I01',
            part: 'P01',
            section: 'S01',
            position: 0,
        });
    });

    QUnit.test('jumpToNextSection() - when some items are loaded from the current section', function(assert) {
        QUnit.expect(2);

        var offlineJumpTableHelper = new OfflineJumpTableHelper(testMapJson)
            .addJump('P01', 'S01', 'I01')
            .jumpToNextSection();

        assert.deepEqual(offlineJumpTableHelper.getJumpTable(), [
            {
                item: 'I01',
                part: 'P01',
                section: 'S01',
                position: 0,
            },
            {
                item: 'I03',
                part: 'P01',
                section: 'S02',
                position: 1,
            },
        ]);
        assert.deepEqual(offlineJumpTableHelper.getLastJump(), {
            item: 'I03',
            part: 'P01',
            section: 'S02',
            position: 1,
        });
    });

    QUnit.test('jumpToNextSection() - when all items are loaded from the current section', function(assert) {
        QUnit.expect(2);

        var offlineJumpTableHelper = new OfflineJumpTableHelper(testMapJson)
            .addJump('P01', 'S01', 'I01')
            .addJump('P01', 'S01', 'I02')
            .jumpToNextSection();

        assert.deepEqual(offlineJumpTableHelper.getJumpTable(), [
            {
                item: 'I01',
                part: 'P01',
                section: 'S01',
                position: 0,
            },
            {
                item: 'I02',
                part: 'P01',
                section: 'S01',
                position: 1,
            },
            {
                item: 'I03',
                part: 'P01',
                section: 'S02',
                position: 2,
            },
        ]);
        assert.deepEqual(offlineJumpTableHelper.getLastJump(), {
            item: 'I03',
            part: 'P01',
            section: 'S02',
            position: 2,
        });
    });

    QUnit.test('jumpToNextSection() - when there is no next section', function(assert) {
        QUnit.expect(2);

        var offlineJumpTableHelper = new OfflineJumpTableHelper(testMapJson)
            .addJump('P03', 'S06', 'I12')
            .jumpToNextSection();

        assert.deepEqual(offlineJumpTableHelper.getJumpTable(), [
            {
                item: 'I12',
                part: 'P03',
                section: 'S06',
                position: 0,
            },
        ]);
        assert.deepEqual(offlineJumpTableHelper.getLastJump(), {
            item: 'I12',
            part: 'P03',
            section: 'S06',
            position: 0,
        });
    });

    QUnit.module('jumpToNextPart');
    QUnit.test('jumpToNextPart() - when there are no previous jumps', function(assert) {
        QUnit.expect(2);

        var offlineJumpTableHelper = new OfflineJumpTableHelper(testMapJson).jumpToNextPart();

        assert.deepEqual(offlineJumpTableHelper.getJumpTable(), [
            {
                item: 'I01',
                part: 'P01',
                section: 'S01',
                position: 0,
            },
        ]);
        assert.deepEqual(offlineJumpTableHelper.getLastJump(), {
            item: 'I01',
            part: 'P01',
            section: 'S01',
            position: 0,
        });
    });

    QUnit.test('jumpToNextPart() - when some items are loaded from the current section', function(assert) {
        QUnit.expect(2);

        var offlineJumpTableHelper = new OfflineJumpTableHelper(testMapJson)
            .addJump('P01', 'S01', 'I01')
            .jumpToNextPart();

        assert.deepEqual(offlineJumpTableHelper.getJumpTable(), [
            {
                item: 'I01',
                part: 'P01',
                section: 'S01',
                position: 0,
            },
            {
                item: 'I05',
                part: 'P02',
                section: 'S03',
                position: 1,
            },
        ]);
        assert.deepEqual(offlineJumpTableHelper.getLastJump(), {
            item: 'I05',
            part: 'P02',
            section: 'S03',
            position: 1,
        });
    });

    QUnit.test('jumpToNextPart() - when all items are loaded from the current section', function(assert) {
        QUnit.expect(2);

        var offlineJumpTableHelper = new OfflineJumpTableHelper(testMapJson)
            .addJump('P01', 'S01', 'I01')
            .addJump('P01', 'S01', 'I02')
            .jumpToNextPart();

        assert.deepEqual(offlineJumpTableHelper.getJumpTable(), [
            {
                item: 'I01',
                part: 'P01',
                section: 'S01',
                position: 0,
            },
            {
                item: 'I02',
                part: 'P01',
                section: 'S01',
                position: 1,
            },
            {
                item: 'I05',
                part: 'P02',
                section: 'S03',
                position: 2,
            },
        ]);
        assert.deepEqual(offlineJumpTableHelper.getLastJump(), {
            item: 'I05',
            part: 'P02',
            section: 'S03',
            position: 2,
        });
    });

    QUnit.test('jumpToNextPart() - when there is no next part', function(assert) {
        QUnit.expect(2);

        var offlineJumpTableHelper = new OfflineJumpTableHelper(testMapJson)
            .addJump('P03', 'S06', 'I12')
            .jumpToNextPart();

        assert.deepEqual(offlineJumpTableHelper.getJumpTable(), [
            {
                item: 'I12',
                part: 'P03',
                section: 'S06',
                position: 0,
            },
        ]);
        assert.deepEqual(offlineJumpTableHelper.getLastJump(), {
            item: 'I12',
            part: 'P03',
            section: 'S06',
            position: 0,
        });
    });

    QUnit.module('jumpToPreviousItem');
    QUnit.test('jumpToPreviousItem() - when there are no previous jumps', function(assert) {
        QUnit.expect(2);

        var offlineJumpTableHelper = new OfflineJumpTableHelper(testMapJson).jumpToPreviousItem();

        assert.deepEqual(offlineJumpTableHelper.getJumpTable(), []);
        assert.deepEqual(offlineJumpTableHelper.getLastJump(), {});
    });

    QUnit.test('jumpToPreviousItem() - when there are previous jumps', function(assert) {
        QUnit.expect(2);

        var offlineJumpTableHelper = new OfflineJumpTableHelper(testMapJson);

        offlineJumpTableHelper
            .addJump('P01', 'S01', 'I01')
            .addJump('P01', 'S01', 'I02')
            .jumpToPreviousItem();

        assert.deepEqual(offlineJumpTableHelper.getJumpTable(), [{
            item: 'I01',
            part: 'P01',
            section: 'S01',
            position: 0,
        }]);
        assert.deepEqual(offlineJumpTableHelper.getLastJump(), {
            item: 'I01',
            part: 'P01',
            section: 'S01',
            position: 0,
        });
    });

    QUnit.module('jumpToPreviousSection');
    QUnit.test('jumpToPreviousSection() - when there are no previous jumps', function(assert) {
        QUnit.expect(2);

        var offlineJumpTableHelper = new OfflineJumpTableHelper(testMapJson).jumpToPreviousSection();

        assert.deepEqual(offlineJumpTableHelper.getJumpTable(), [
            {
                item: 'I01',
                part: 'P01',
                position: 0,
                section: 'S01',
            },
        ]);
        assert.deepEqual(offlineJumpTableHelper.getLastJump(), {
            item: 'I01',
            part: 'P01',
            position: 0,
            section: 'S01',
        });
    });

    QUnit.test('jumpToPreviousSection() - when there are previous jumps', function(assert) {
        QUnit.expect(2);

        var offlineJumpTableHelper = new OfflineJumpTableHelper(testMapJson)
            .addJump('P01', 'S01', 'I01')
            .addJump('P01', 'S02', 'I01')
            .addJump('P01', 'S03', 'I01')
            .jumpToPreviousSection();

        assert.deepEqual(offlineJumpTableHelper.getJumpTable(), [
            {
                item: 'I01',
                part: 'P01',
                position: 0,
                section: 'S01',
            },
            {
                item: 'I03',
                part: 'P01',
                position: 1,
                section: 'S02',
            }
        ]);
        assert.deepEqual(offlineJumpTableHelper.getLastJump(), {
            item: 'I03',
            part: 'P01',
            position: 1,
            section: 'S02',
        });
    });

    QUnit.module('jumpToPreviousPart');
    QUnit.test('jumpToPreviousPart() - when there are no previous jumps', function(assert) {
        QUnit.expect(2);

        var offlineJumpTableHelper = new OfflineJumpTableHelper(testMapJson).jumpToPreviousPart();

        assert.deepEqual(offlineJumpTableHelper.getJumpTable(), [
            {
                item: 'I01',
                part: 'P01',
                position: 0,
                section: 'S01',
            },
        ]);
        assert.deepEqual(offlineJumpTableHelper.getLastJump(), {
            item: 'I01',
            part: 'P01',
            position: 0,
            section: 'S01',
        });
    });

    QUnit.test('jumpToPreviousPart() - when there are previous jumps', function(assert) {
        QUnit.expect(2);

        var offlineJumpTableHelper = new OfflineJumpTableHelper(testMapJson)
            .addJump('P01', 'S01', 'I01')
            .addJump('P02', 'S02', 'I02')
            .addJump('P03', 'S03', 'I03')
            .jumpToPreviousPart();

        assert.deepEqual(offlineJumpTableHelper.getJumpTable(), [
            {
                item: 'I01',
                part: 'P01',
                position: 0,
                section: 'S01',
            },
            {
                item: 'I05',
                part: 'P02',
                position: 1,
                section: 'S03',
            },
        ]);
        assert.deepEqual(offlineJumpTableHelper.getLastJump(), {
            item: 'I05',
            part: 'P02',
            position: 1,
            section: 'S03',
        });
    });

    QUnit.module('getJumpTable');
    QUnit.test('getJumpTable() - when there are no jumps', function(assert) {
        QUnit.expect(1);

        var offlineJumpTableHelper = new OfflineJumpTableHelper(testMapJson);

        assert.deepEqual(offlineJumpTableHelper.getJumpTable(), []);
    });

    QUnit.test('getJumpTable() - when there are already some jumps', function(assert) {
        QUnit.expect(1);

        var offlineJumpTableHelper = new OfflineJumpTableHelper(testMapJson);
        offlineJumpTableHelper
            .addJump('P01', 'S01', 'I01');

        assert.deepEqual(offlineJumpTableHelper.getJumpTable(), [
            {
                item: 'I01',
                part: 'P01',
                section: 'S01',
                position: 0,
            },
        ]);
    });

    QUnit.module('getLastJump');
    QUnit.test('getLastJump() - when the jumpTable is empty', function(assert) {
        QUnit.expect(1);

        var offlineJumpTableHelper = new OfflineJumpTableHelper(testMapJson);

        assert.deepEqual(offlineJumpTableHelper.getLastJump(), {});
    });

    QUnit.test('getLastJump() - when the jumpTable is not empty', function(assert) {
        QUnit.expect(1);

        var offlineJumpTableHelper = new OfflineJumpTableHelper(testMapJson);

        offlineJumpTableHelper
            .addJump('P01', 'S01', 'I01')
            .addJump('P01', 'S01', 'I02');

        assert.deepEqual(offlineJumpTableHelper.getLastJump(), {
            item: 'I02',
            part: 'P01',
            section: 'S01',
            position: 1,
        });
    });
});
