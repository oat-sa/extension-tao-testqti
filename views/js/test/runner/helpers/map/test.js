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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'lodash',
    'helpers',
    'taoQtiTest/runner/helpers/map',
    'json!taoQtiTest/test/runner/helpers/map/map.json',
    'json!taoQtiTest/test/runner/helpers/map/light-map.json',
    'json!taoQtiTest/test/runner/helpers/map/mapWithActives.json'
], function(_, helpers, mapHelper, mapSample, lightMapSample, activeMapSample) {
    'use strict';

    QUnit.module('helpers/map');


    QUnit.test('module', function(assert) {
        QUnit.expect(1);
        assert.equal(typeof mapHelper, 'object', "The map helper module exposes an object");
    });


    QUnit.cases([
        { title : 'getJumps' },
        { title : 'getParts' },
        { title : 'getJump' },
        { title : 'getPart' },
        { title : 'getSection' },
        { title : 'getSections' },
        { title : 'getNextSections' },
        { title : 'getItem' },
        { title : 'getTestStats' },
        { title : 'getPartStats' },
        { title : 'getSectionStats' },
        { title : 'getScopeStats' },
        { title : 'getScopeMap' },
        { title : 'getItemPart' },
        { title : 'getItemSection' },
        { title : 'getItemAt' },
        { title : 'getItemIdentifier' },
        { title : 'each' },
        { title : 'updateItemStats' },
        { title : 'computeItemStats' },
        { title : 'computeStats' },
        { title : 'patch' },
        { title : 'reindex' },
        { title : 'createJumpTable' },

    ]).test('helpers/map API ', function(data, assert) {
        QUnit.expect(1);
        assert.equal(typeof mapHelper[data.title], 'function', 'The map helper expose a "' + data.title + '" function');
    });


    QUnit.test('helpers/map.getJumps', function(assert) {
        var map = {
            jumps : []
        };

        QUnit.expect(3);

        assert.equal(mapHelper.getJumps(map), map.jumps, 'The map helper getJumps provides the map jumps');
        assert.equal(mapHelper.getJumps({}), undefined, 'The map helper getJumps does not provide the map jumps when the map is wrong');
        assert.equal(mapHelper.getJumps(), undefined, 'The map helper getJumps does not provide the map jumps when the map does not exist');
    });


    QUnit.test('helpers/map.getParts', function(assert) {
        var map = {
            parts : {}
        };

        QUnit.expect(3);

        assert.equal(mapHelper.getParts(map), map.parts, 'The map helper getParts provides the map parts');
        assert.equal(mapHelper.getParts({}), undefined, 'The map helper getParts does not provide the map parts when the map is wrong');
        assert.equal(mapHelper.getParts(), undefined, 'The map helper getParts does not provide the map parts when the map does not exist');
    });


    QUnit.test('helpers/map.getJump', function(assert) {
        var map = {
            jumps : [
                {identifier: "item-1"},
                {identifier: "item-2"}
            ]
        };

        QUnit.expect(4);

        assert.equal(mapHelper.getJump(map, 1), map.jumps[1], 'The map helper getJump provides the right jump');
        assert.equal(mapHelper.getJump(map, 10), undefined, 'The map helper getJump does not provide any jump when the position does not exist');
        assert.equal(mapHelper.getJump({}), undefined, 'The map helper getJump does not provide any jump when the map is wrong');
        assert.equal(mapHelper.getJump(), undefined, 'The map helper getJump does not provide any jump when the map does not exist');
    });


    QUnit.test('helpers/map.getPart', function(assert) {
        QUnit.expect(4);

        assert.equal(mapHelper.getPart(mapSample, 'testPart-2'), mapSample.parts['testPart-2'], 'The map helper getPart provides the right part');
        assert.equal(mapHelper.getPart(mapSample, 'testPart-0'), undefined, 'The map helper getPart does not provide any part when the part does not exist');
        assert.equal(mapHelper.getPart({}), undefined, 'The map helper getPart does not provide any part when the map is wrong');
        assert.equal(mapHelper.getPart(), undefined, 'The map helper getPart does not provide any part when the map does not exist');
    });


    QUnit.test('helpers/map.getSection', function(assert) {
        QUnit.expect(4);

        assert.equal(mapHelper.getSection(mapSample, 'assessmentSection-3'), mapSample.parts['testPart-2'].sections['assessmentSection-3'], 'The map helper getSection provides the right section');
        assert.equal(mapHelper.getSection(mapSample, 'assessmentSection-0'), undefined, 'The map helper getSection does not provide any section when the section does not exist');
        assert.equal(mapHelper.getSection({}), undefined, 'The map helper getSection does not provide any section when the map is wrong');
        assert.equal(mapHelper.getSection(), undefined, 'The map helper getSection does not provide any section when the map does not exist');
    });


    QUnit.test('helpers/map.getSections', function(assert) {
        QUnit.expect(3);
        assert.deepEqual(mapHelper.getSections(mapSample), _.extend({}, mapSample.parts['testPart-1'].sections, mapSample.parts['testPart-2'].sections), 'The map helper getSection provides the right sections');
        assert.deepEqual(mapHelper.getSections({}), {}, 'The map helper getSection does not provide any section when the map is wrong');
        assert.deepEqual(mapHelper.getSections(), {}, 'The map helper getSection does not provide any section when the map does not exist');
    });


    QUnit.test('helpers/map.getActiveItem', function(assert) {
        QUnit.expect(3);
        assert.deepEqual(mapHelper.getActiveItem(activeMapSample), _.extend({}, activeMapSample.parts['testPart-1'].sections['assessmentSection-2'].items['item-4']), 'The map helper getSection provide the active item from map');
        assert.deepEqual(mapHelper.getActiveItem(mapSample), {}, 'The map helper getActiveItem does not provide any item when there is no active items');
        assert.deepEqual(mapHelper.getActiveItem(), {}, 'The map helper getActiveItem does not provide any item when the map does not exist');
    });


    QUnit.test('helpers/map.getNextSections', function(assert) {
        QUnit.expect(4);
        assert.deepEqual(mapHelper.getNextSections(mapSample, 'assessmentSection-3'), _.omit(mapSample.parts['testPart-2'].sections, 'assessmentSection-3'), 'The map helper getSection provides the right sections');
        assert.deepEqual(mapHelper.getNextSections(mapSample, 'foo'), {}, 'The map helper getSection does not provide any section when the section does not exist');
        assert.deepEqual(mapHelper.getNextSections({}, 'foo'), {}, 'The map helper getSection does not provide any section when the map is wrong');
        assert.deepEqual(mapHelper.getNextSections(), {}, 'The map helper getSection does not provide any section when the map does not exist');
    });


    QUnit.test('helpers/map.getItem', function(assert) {
        QUnit.expect(4);

        assert.equal(mapHelper.getItem(mapSample, 'item-5'), mapSample.parts['testPart-1'].sections['assessmentSection-2'].items['item-5'], 'The map helper getItem provides the right item');
        assert.equal(mapHelper.getItem(mapSample, 'item-0'), undefined, 'The map helper getItem does not provide any item when the item does not exist');
        assert.equal(mapHelper.getItem({}), undefined, 'The map helper getItem does not provide any item when the map is wrong');
        assert.equal(mapHelper.getItem(), undefined, 'The map helper getItem does not provide any item when the map does not exist');
    });


    QUnit.test('helpers/map.getTestStats', function(assert) {
        var map = {
            stats: {}
        };

        QUnit.expect(3);

        assert.equal(mapHelper.getTestStats(map), map.stats, 'The map helper getTestStats provides the right stats');
        assert.equal(mapHelper.getTestStats({}), undefined, 'The map helper getTestStats does not provide any stats when the map is wrong');
        assert.equal(mapHelper.getTestStats(), undefined, 'The map helper getTestStats does not provide any stats when the map does not exist');
    });


    QUnit.test('helpers/map.getPartStats', function(assert) {
        QUnit.expect(4);

        assert.equal(mapHelper.getPartStats(mapSample, 'testPart-2'), mapSample.parts['testPart-2'].stats, 'The map helper getPartStats provides the right stats');
        assert.equal(mapHelper.getPartStats(mapSample, 'testPart-0'), undefined, 'The map helper getPartStats does not provide any stats when the part does not exist');
        assert.equal(mapHelper.getPartStats({}), undefined, 'The map helper getPartStats does not provide any stats when the map is wrong');
        assert.equal(mapHelper.getPartStats(), undefined, 'The map helper getPartStats does not provide any stats when the map does not exist');
    });


    QUnit.test('helpers/map.getSectionStats', function(assert) {
        QUnit.expect(4);

        assert.equal(mapHelper.getSectionStats(mapSample, 'assessmentSection-3'), mapSample.parts['testPart-2'].sections['assessmentSection-3'].stats, 'The map helper getSectionStats provides the right stats');
        assert.equal(mapHelper.getSectionStats(mapSample, 'assessmentSection-0'), undefined, 'The map helper getSectionStats does not provide any stats when the section does not exist');
        assert.equal(mapHelper.getSectionStats({}), undefined, 'The map helper getSectionStats does not provide any stats when the map is wrong');
        assert.equal(mapHelper.getSectionStats(), undefined, 'The map helper getSectionStats does not provide any stats when the map does not exist');
    });


    QUnit.test('helpers/map.getScopeStats', function(assert) {
        QUnit.expect(9);

        assert.equal(mapHelper.getScopeStats(mapSample, 6), mapHelper.getScopeStats(mapSample, 6, 'test'), 'The map helper getScopeStats use the "test" scope by default');
        assert.equal(mapHelper.getScopeStats(mapSample, 6, 'test'), mapSample.stats, 'The map helper getScopeStats provides the right stats when the scope is "test"');
        assert.equal(mapHelper.getScopeStats(mapSample, 6, 'part'), mapSample.parts['testPart-2'].stats, 'The map helper getScopeStats provides the right stats when the scope is "part"');
        assert.equal(mapHelper.getScopeStats(mapSample, 6, 'section'), mapSample.parts['testPart-2'].sections['assessmentSection-3'].stats, 'The map helper getScopeStats provides the right stats when the scope is "section');
        assert.equal(mapHelper.getScopeStats(mapSample, 100, 'test'), mapSample.stats, 'The map helper getScopeStats still provide any stats when the position does not exist but the scope is "test"');
        assert.equal(mapHelper.getScopeStats(mapSample, 100, 'part'), undefined, 'The map helper getScopeStats does not provide any stats when the position does not exist and the scope is "part"');
        assert.equal(mapHelper.getScopeStats(mapSample, 100, 'section'), undefined, 'The map helper getScopeStats does not provide any stats when the section does not exist and the scope is "section"');
        assert.equal(mapHelper.getScopeStats({}, 1), undefined, 'The map helper getScopeStats does not provide any stats when the map is wrong');
        assert.equal(mapHelper.getScopeStats(), undefined, 'The map helper getScopeStats does not provide any stats when the map does not exist');
    });


    QUnit.test('helpers/map.getScopeMap', function(assert) {
        var expectedTestMap = mapSample;
        var expectedPartMap = {
            jumps: mapSample.jumps,
            parts: {
                'testPart-2': mapSample.parts['testPart-2']
            },
            stats: mapSample.parts['testPart-2'].stats
        };
        var expectedSectionMap = {
            jumps: mapSample.jumps,
            parts: {
                'testPart-2': {
                    "id": "testPart-2",
                    "label": "testPart-2",
                    "position": 6,
                    "isLinear": false,
                    sections: {
                        'assessmentSection-3': mapSample.parts['testPart-2'].sections['assessmentSection-3']
                    },
                    stats: mapSample.parts['testPart-2'].sections['assessmentSection-3'].stats
                }
            },
            stats: mapSample.parts['testPart-2'].sections['assessmentSection-3'].stats
        };
        var expectedNotFound = {
            jumps: mapSample.jumps,
            parts: {},
            stats: {
                questions: 0,
                questionsViewed: 0,
                answered: 0,
                flagged: 0,
                viewed: 0,
                total: 0
            }
        };
        var expectedEmpty = {
            stats: {
                questions: 0,
                questionsViewed: 0,
                answered: 0,
                flagged: 0,
                viewed: 0,
                total: 0
            }
        };

        QUnit.expect(9);

        assert.deepEqual(mapHelper.getScopeMap(mapSample, 6), mapHelper.getScopeMap(mapSample, 6, 'test'), 'The map helper getScopeMap use the "test" scope by default');
        assert.deepEqual(mapHelper.getScopeMap(mapSample, 6, 'test'), expectedTestMap, 'The map helper getScopeMap provides the right content when the scope is "test"');
        assert.deepEqual(mapHelper.getScopeMap(mapSample, 6, 'part'), expectedPartMap, 'The map helper getScopeMap provides the right content when the scope is "part"');
        assert.deepEqual(mapHelper.getScopeMap(mapSample, 6, 'section'), expectedSectionMap, 'The map helper getScopeMap provides the right content when the scope is "section');
        assert.deepEqual(mapHelper.getScopeMap(mapSample, 100, 'test'), expectedTestMap, 'The map helper getScopeMap still provide any map when the position does not exist but the scope is "test"');
        assert.deepEqual(mapHelper.getScopeMap(mapSample, 100, 'part'), expectedNotFound, 'The map helper getScopeMap does not provide any map when the position does not exist and the scope is "part"');
        assert.deepEqual(mapHelper.getScopeMap(mapSample, 100, 'section'), expectedNotFound, 'The map helper getScopeMap does not provide any map when the section does not exist and the scope is "section"');
        assert.deepEqual(mapHelper.getScopeMap({}, 1), expectedEmpty, 'The map helper getScopeMap does not provide any map when the map is wrong');
        assert.deepEqual(mapHelper.getScopeMap(), expectedEmpty, 'The map helper getScopeMap does not provide any map when the map does not exist');
    });


    QUnit.test('helpers/map.getItemPart', function(assert) {
        QUnit.expect(4);

        assert.equal(mapHelper.getItemPart(mapSample, 8), mapSample.parts['testPart-2'], 'The map helper getItemPart provides the right part');
        assert.equal(mapHelper.getItemPart(mapSample, 100), undefined, 'The map helper getItemPart does not provide any part when the position does not exist');
        assert.equal(mapHelper.getItemPart({}), undefined, 'The map helper getItemPart does not provide any part when the map is wrong');
        assert.equal(mapHelper.getItemPart(), undefined, 'The map helper getItemPart does not provide any part when the map does not exist');
    });


    QUnit.test('helpers/map.getItemSection', function(assert) {
        QUnit.expect(4);

        assert.equal(mapHelper.getItemSection(mapSample, 8), mapSample.parts['testPart-2'].sections['assessmentSection-4'], 'The map helper getItemSection provides the right section');
        assert.equal(mapHelper.getItemSection(mapSample, 100), undefined, 'The map helper getItemSection does not provide any section when the position does not exist');
        assert.equal(mapHelper.getItemSection({}), undefined, 'The map helper getItemSection does not provide any section when the map is wrong');
        assert.equal(mapHelper.getItemSection(), undefined, 'The map helper getItemSection does not provide any section when the map does not exist');
    });


    QUnit.test('helpers/map.getItemAt', function(assert) {
        QUnit.expect(4);

        assert.equal(mapHelper.getItemAt(mapSample, 8), mapSample.parts['testPart-2'].sections['assessmentSection-4'].items['item-9'], 'The map helper getItemAt provides the right item');
        assert.equal(mapHelper.getItemAt(mapSample, 100), undefined, 'The map helper getItemAt does not provide any item when the position does not exist');
        assert.equal(mapHelper.getItemAt({}), undefined, 'The map helper getItemAt does not provide any item when the map is wrong');
        assert.equal(mapHelper.getItemAt(), undefined, 'The map helper getItemAt does not provide any item when the map does not exist');
    });


    QUnit.test('helpers/map.getItemIdentifier', function(assert) {
        QUnit.expect(6);

        assert.equal(mapHelper.getItemIdentifier(mapSample, 8), 'item-9', 'The map helper getItemIdentifier provides the right identifier');
        assert.equal(mapHelper.getItemIdentifier(mapSample, 'item-8'), 'item-8', 'The map helper getItemIdentifier provides the right identifier if directly provided');
        assert.equal(mapHelper.getItemIdentifier(mapSample, 'item-100'), undefined, 'The map helper getItemIdentifier does not provide the identifier if the item does not exist');
        assert.equal(mapHelper.getItemIdentifier(mapSample, 100), undefined, 'The map helper getItemIdentifier does not provide any identifier when the position does not exist');
        assert.equal(mapHelper.getItemIdentifier({}), undefined, 'The map helper getItemIdentifier does not provide any identifier when the map is wrong');
        assert.equal(mapHelper.getItemIdentifier(), undefined, 'The map helper getItemIdentifier does not provide any identifier when the map does not exist');
    });


    QUnit.test('helpers/map.each', function(assert) {
        var result;

        QUnit.expect(42);

        result = mapHelper.each(mapSample, function(item, section, part, map) {
            assert.equal(item, mapHelper.getItemAt(mapSample, item.position), 'The right item is provided to each callback');
            assert.equal(section, mapHelper.getItemSection(mapSample, item.position), 'The right section is provided to each callback');
            assert.equal(part, mapHelper.getItemPart(mapSample, item.position), 'The right part is provided to each callback');
            assert.equal(map, mapSample, 'The map is provided to each callback');
        });

        assert.equal(result, mapSample, 'The map helper each returns the provided map');
        assert.equal(mapHelper.each(mapSample), mapSample, 'The map helper each returns the provided map even if no callback has been provided');
    });


    QUnit.test('helpers/map.updateItemStats', function(assert) {
        var map = _.cloneDeep(mapSample);
        var item = mapHelper.getItemAt(map, 8);
        var section = mapHelper.getItemSection(map, 8);
        var part = mapHelper.getItemPart(map, 8);
        var stats = mapHelper.getTestStats(map);

        QUnit.expect(59);

        assert.equal(item.informational, false, 'The item is not informational');
        assert.equal(item.answered, false, 'The item is not answered at this time');
        assert.equal(item.flagged, false, 'The item is not flagged at this time');
        assert.equal(item.viewed, false, 'The item is not viewed at this time');

        assert.equal(stats.questions, 9, 'There is 9 questions at this time in the test');
        assert.equal(stats.answered, 0, 'There is no answered item at this time in the test');
        assert.equal(stats.flagged, 0, 'There is no flagged item at this time in the test');
        assert.equal(stats.viewed, 1, 'There is one viewed item at this time in the test');
        assert.equal(stats.total, 10, 'There is 10 items at this time in the test');

        assert.equal(part.stats.questions, 4, 'There is 4 questions at this time in the part');
        assert.equal(part.stats.answered, 0, 'There is no answered item at this time in the part');
        assert.equal(part.stats.flagged, 0, 'There is no flagged item at this time in the part');
        assert.equal(part.stats.viewed, 0, 'There is no viewed item at this time in the part');
        assert.equal(part.stats.total, 4, 'There is 4 items at this time in the part');

        assert.equal(section.stats.questions, 2, 'There is 2 questions at this time in the section');
        assert.equal(section.stats.answered, 0, 'There is no answered item at this time in the section');
        assert.equal(section.stats.flagged, 0, 'There is no flagged item at this time in the section');
        assert.equal(section.stats.viewed, 0, 'There is no viewed item at this time in the section');
        assert.equal(section.stats.total, 2, 'There is 2 items at this time in the section');

        item.answered = true;
        item.flagged = true;
        item.viewed = true;

        assert.equal(mapHelper.updateItemStats(map, 8), map, 'The map helper updateItemStats returns the map');

        assert.equal(item.informational, false, 'The item is still not informational');
        assert.equal(item.answered, true, 'The item is now answered');
        assert.equal(item.flagged, true, 'The item is now flagged');
        assert.equal(item.viewed, true, 'The item is now viewed');

        stats = mapHelper.getTestStats(map);
        assert.equal(stats.questions, 9, 'There is still 9 questions at this time in the test');
        assert.equal(stats.answered, 1, 'There is one answered item at this time in the test');
        assert.equal(stats.flagged, 1, 'There is one flagged item at this time in the test');
        assert.equal(stats.viewed, 2, 'There is two viewed items at this time in the test');
        assert.equal(stats.total, 10, 'There is 10 items at this time in the test');

        assert.equal(part.stats.questions, 4, 'There is 4 questions at this time in the part');
        assert.equal(part.stats.answered, 1, 'There is one answered item at this time in the part');
        assert.equal(part.stats.flagged, 1, 'There is one flagged item at this time in the part');
        assert.equal(part.stats.viewed, 1, 'There is one viewed item at this time in the part');
        assert.equal(part.stats.total, 4, 'There is 4 items at this time in the part');

        assert.equal(section.stats.questions, 2, 'There is 2 questions at this time in the section');
        assert.equal(section.stats.answered, 1, 'There is one answered item at this time in the section');
        assert.equal(section.stats.flagged, 1, 'There is one flagged item at this time in the section');
        assert.equal(section.stats.viewed, 1, 'There is one viewed item at this time in the section');
        assert.equal(section.stats.total, 2, 'There is 2 items at this time in the section');

        item.informational = true;

        assert.equal(mapHelper.updateItemStats(map, 8), map, 'The map helper updateItemStats returns the map');

        assert.equal(item.informational, true, 'The item is now informational');
        assert.equal(item.answered, true, 'The item is still answered, but it should be ignored since it is informational');
        assert.equal(item.flagged, true, 'The item is still flagged');
        assert.equal(item.viewed, true, 'The item is still viewed');

        stats = mapHelper.getTestStats(map);
        assert.equal(stats.questions, 8, 'There is 8 questions at this time in the test');
        assert.equal(stats.answered, 0, 'There is no answered item at this time in the test');
        assert.equal(stats.flagged, 1, 'There is one flagged item at this time in the test');
        assert.equal(stats.viewed, 2, 'There is two viewed items at this time in the test');
        assert.equal(stats.total, 10, 'There is 10 items at this time in the test');

        assert.equal(part.stats.questions, 3, 'There is 3 questions at this time in the part');
        assert.equal(part.stats.answered, 0, 'There is no answered item at this time in the part');
        assert.equal(part.stats.flagged, 1, 'There is one flagged item at this time in the part');
        assert.equal(part.stats.viewed, 1, 'There is one viewed item at this time in the part');
        assert.equal(part.stats.total, 4, 'There is 4 items at this time in the part');

        assert.equal(section.stats.questions, 1, 'There is 1 questions at this time in the section');
        assert.equal(section.stats.answered, 0, 'There is no answered item at this time in the section');
        assert.equal(section.stats.flagged, 1, 'There is one flagged item at this time in the section');
        assert.equal(section.stats.viewed, 1, 'There is one viewed item at this time in the section');
        assert.equal(section.stats.total, 2, 'There is 2 items at this time in the section');
    });


    QUnit.test('helpers/map.computeItemStats', function(assert) {
        var item = mapHelper.getItemAt(mapSample, 6);
        var section = mapHelper.getItemSection(mapSample, 6);
        var stats;

        QUnit.expect(29);

        assert.equal(item.informational, false, 'The item is not informational');
        assert.equal(item.answered, false, 'The item is not answered at this time');
        assert.equal(item.flagged, false, 'The item is not flagged at this time');
        assert.equal(item.viewed, false, 'The item is not viewed at this time');

        assert.equal(section.stats.questions, 2, 'There is 2 questions at this time in the section');
        assert.equal(section.stats.answered, 0, 'There is no answered item at this time in the section');
        assert.equal(section.stats.flagged, 0, 'There is no flagged item at this time in the section');
        assert.equal(section.stats.viewed, 0, 'There is no viewed item at this time in the section');
        assert.equal(section.stats.total, 2, 'There is 2 items at this time in the section');

        item.answered = true;
        item.flagged = true;
        item.viewed = true;

        stats = mapHelper.computeItemStats(section.items);

        assert.equal(typeof stats, 'object', 'The map helper computeItemStats returns an object');

        assert.equal(item.informational, false, 'The item is still not informational');
        assert.equal(item.answered, true, 'The item is now answered');
        assert.equal(item.flagged, true, 'The item is now flagged');
        assert.equal(item.viewed, true, 'The item is now viewed');

        assert.equal(stats.questions, 2, 'There is still 2 question at this time in the computed stats');
        assert.equal(stats.answered, 1, 'There is one answered item at this time in the computed stats');
        assert.equal(stats.flagged, 1, 'There is one flagged item at this time in the computed stats');
        assert.equal(stats.viewed, 1, 'There is one viewed item at this time in the computed stats');
        assert.equal(stats.total, 2, 'There is 2 items at this time in the computed stats');

        item.informational = true;

        stats = mapHelper.computeItemStats(section.items);

        assert.equal(typeof stats, 'object', 'The map helper computeItemStats returns an object');

        assert.equal(item.informational, true, 'The item is now informational');
        assert.equal(item.answered, true, 'The item is still answered, but it should be ignored since it is informational');
        assert.equal(item.flagged, true, 'The item is now flagged');
        assert.equal(item.viewed, true, 'The item is now viewed');

        assert.equal(stats.questions, 1, 'There is now one question at this time in the computed stats');
        assert.equal(stats.answered, 0, 'There is no answered item at this time in the computed stats');
        assert.equal(stats.flagged, 1, 'There is one flagged item at this time in the computed stats');
        assert.equal(stats.viewed, 1, 'There is one viewed item at this time in the computed stats');
        assert.equal(stats.total, 2, 'There is 2 items at this time in the computed stats');
    });


    QUnit.test('helpers/map.computeStats', function(assert) {
        var map = _.cloneDeep(mapSample);
        var section = mapHelper.getItemSection(map, 8);
        var part = mapHelper.getItemPart(map, 8);
        var stats = mapHelper.getTestStats(map);

        QUnit.expect(32);

        assert.equal(stats.questions, 9, 'There is 9 questions at this time in the test');
        assert.equal(stats.answered, 0, 'There is no answered item at this time in the test');
        assert.equal(stats.flagged, 0, 'There is no flagged item at this time in the test');
        assert.equal(stats.viewed, 1, 'There is one viewed item at this time in the test');
        assert.equal(stats.total, 10, 'There is 10 items at this time in the test');

        assert.equal(part.stats.questions, 4, 'There 4 questions at this time in the part');
        assert.equal(part.stats.answered, 0, 'There is no answered item at this time in the part');
        assert.equal(part.stats.flagged, 0, 'There is no flagged item at this time in the part');
        assert.equal(part.stats.viewed, 0, 'There is no viewed item at this time in the part');
        assert.equal(part.stats.total, 4, 'There is 4 items at this time in the part');

        assert.equal(section.stats.questions, 2, 'There is 2 questions at this time in the section');
        assert.equal(section.stats.answered, 0, 'There is no answered item at this time in the section');
        assert.equal(section.stats.flagged, 0, 'There is no flagged item at this time in the section');
        assert.equal(section.stats.viewed, 0, 'There is no viewed items at this time in the section');
        assert.equal(section.stats.total, 2, 'There is 2 items at this time in the section');

        section.stats.questions = 1;
        section.stats.answered = 2;
        section.stats.flagged = 2;
        section.stats.viewed = 2;
        section.stats.total = 2;

        part.stats = mapHelper.computeStats(part.sections);
        assert.equal(typeof part.stats, 'object', 'The map helper computeStats returns an object');

        stats = mapHelper.computeStats(mapHelper.getParts(map));
        assert.equal(typeof map.stats, 'object', 'The map helper computeStats returns an object');

        assert.equal(stats.questions, 8, 'There is 8 questions at this time in the test');
        assert.equal(stats.answered, 2, 'There is two answered items at this time in the test');
        assert.equal(stats.flagged, 2, 'There is two flagged items at this time in the test');
        assert.equal(stats.viewed, 3, 'There is three viewed items at this time in the test');
        assert.equal(stats.total, 10, 'There is 10 items at this time in the test');

        assert.equal(part.stats.questions, 3, 'There is one question at this time in the part');
        assert.equal(part.stats.answered, 2, 'There is two answered items at this time in the part');
        assert.equal(part.stats.flagged, 2, 'There is two flagged items at this time in the part');
        assert.equal(part.stats.viewed, 2, 'There is two viewed items at this time in the part');
        assert.equal(part.stats.total, 4, 'There is 2 items at this time in the part');

        assert.equal(section.stats.questions, 1, 'There is one question at this time in the section');
        assert.equal(section.stats.answered, 2, 'There is two answered items at this time in the section');
        assert.equal(section.stats.flagged, 2, 'There is two flagged items at this time in the section');
        assert.equal(section.stats.viewed, 2, 'There is two viewed items at this time in the section');
        assert.equal(section.stats.total, 2, 'There is two items at this time in the section');
    });

    QUnit.test('reindex', function(assert){
        var map = _.cloneDeep(lightMapSample);
        var item1;
        var item8;

        QUnit.expect(20);

        assert.equal(typeof map.jumps, 'undefined', 'There is no jump table');

        item1 = map.parts['testPart-1'].sections['assessmentSection-1'].items['item-1'];
        assert.equal(item1.position, 0, 'The 1st item position is correct');
        assert.equal(typeof item1.positionInPart, 'undefined', 'The positionInPart property is missing');
        assert.equal(typeof item1.positionInSection, 'undefined', 'The positionInSection property is missing');
        assert.equal(typeof item1.index, 'undefined', 'The index property is missing');

        item8 = map.parts['testPart-2'].sections['assessmentSection-3'].items['item-8'];
        assert.equal(item8.position, 7, 'The 8th item position is correct');
        assert.equal(typeof item8.positionInPart, 'undefined', 'The positionInPart property is missing');
        assert.equal(typeof item8.positionInSection, 'undefined', 'The positionInSection property is missing');
        assert.equal(typeof item8.index, 'undefined', 'The index property is missing');

        map = mapHelper.reindex(map);

        assert.equal(map.jumps.length, 10, 'There is a jump table with the correct size');
        assert.deepEqual(map.jumps[0], {
            identifier: 'item-1',
            section: 'assessmentSection-1',
            part: 'testPart-1',
            position: 0
        },  'There 1st jump is correct');
        assert.deepEqual(map.jumps[7], {
            identifier: 'item-8',
            section: 'assessmentSection-3',
            part: 'testPart-2',
            position: 7
        },  'There 8th jump is correct');

        item1 = map.parts['testPart-1'].sections['assessmentSection-1'].items['item-1'];
        assert.equal(item1.position, 0, 'The 1st item position is correct');
        assert.equal(item1.positionInPart, 0, 'The positionInPart property is correct');
        assert.equal(item1.positionInSection, 0, 'The positionInSection property is correct');
        assert.equal(item1.index, 1, 'The index property is correct');

        item8 = map.parts['testPart-2'].sections['assessmentSection-3'].items['item-8'];
        assert.equal(item8.position, 7, 'The 8th item position is correct');
        assert.equal(item8.positionInPart, 1, 'The positionInPart property is correct');
        assert.equal(item8.positionInSection, 1, 'The positionInSection property is correct');
        assert.equal(item8.index, 2, 'The index property is correct');
    });

    QUnit.test('createJumpTable', function(assert){
        var map = _.cloneDeep(lightMapSample);

        QUnit.expect(4);

        assert.equal(typeof map.jumps, 'undefined', 'There is no jump table');

        map = mapHelper.createJumpTable(map);

        assert.equal(map.jumps.length, 10, 'There is a jump table with the correct size');
        assert.deepEqual(map.jumps[0], {
            identifier: 'item-1',
            section: 'assessmentSection-1',
            part: 'testPart-1',
            position: 0
        },  'There 1st jump is correct');
        assert.deepEqual(map.jumps[7], {
            identifier: 'item-8',
            section: 'assessmentSection-3',
            part: 'testPart-2',
            position: 7
        },  'There 8th jump is correct');
    });

    QUnit.test('patch section', function(assert){
        var section3;
        var section4;

        var map = _.cloneDeep(lightMapSample);
        var patchStats = {
            questions: 3,
            answered: 0,
            flagged: 0,
            viewed: 0,
            total: 3
        };

        var patch = {
            scope : 'section',
            parts: {
                'testPart-2': {
                    position: 6,
                    sections: {
                        'assessmentSection-3': {
                            id: 'assessmentSection-3',
                            label: 'Section 1',
                            position: 6,
                            items: {
                                'item-17': {
                                    id: 'item-17',
                                    label: 'Item 17',
                                    position: 6,
                                    occurrence: 0,
                                    remainingAttempts: -1,
                                    informational: false,
                                    answered: false,
                                    flagged: false,
                                    viewed: false
                                },
                                'item-18': {
                                    id: 'item-18',
                                    label: 'Item 18',
                                    position: 7,
                                    occurrence: 0,
                                    remainingAttempts: -1,
                                    informational: false,
                                    answered: false,
                                    flagged: false,
                                    viewed: false
                                },
                                'item-19': {
                                    id: 'item-19',
                                    label: 'Item 18',
                                    position: 8,
                                    occurrence: 0,
                                    remainingAttempts: -1,
                                    informational: false,
                                    answered: false,
                                    flagged: false,
                                    viewed: false
                                }
                            },
                            stats: patchStats
                        }
                    },
                    stats: patchStats
                }
            },
            stats: patchStats
        };
        QUnit.expect(21);

        assert.equal(typeof map.jumps, 'undefined', 'There is no jump table');

        section3 = map.parts['testPart-2'].sections['assessmentSection-3'];
        assert.equal(typeof section3.items['item-8'], 'object', 'The 3rd section has the item 8');
        assert.equal(typeof section3.items['item-18'], 'undefined', 'The 3rd section has not the item 18');
        assert.equal(section3.items['item-8'].position, 7);

        section4 = map.parts['testPart-2'].sections['assessmentSection-4'];
        assert.equal(section4.items['item-9'].position, 8);

        assert.equal(section3.stats.total, 2);
        assert.equal(map.parts['testPart-2'].stats.total, 4);
        assert.equal(map.stats.total, 10);

        map = mapHelper.patch(map, patch);

        assert.equal(map.jumps.length, 11, 'There is a jump table with the correct size');
        assert.deepEqual(map.jumps[0], {
            identifier: 'item-1',
            section: 'assessmentSection-1',
            part: 'testPart-1',
            position: 0
        },  'There 1st jump is correct');
        assert.deepEqual(map.jumps[8], {
            identifier: 'item-19',
            section: 'assessmentSection-3',
            part: 'testPart-2',
            position: 8
        },  'There 9th jump is correct');
        assert.deepEqual(map.jumps[10], {
            identifier: 'item-10',
            section: 'assessmentSection-4',
            part: 'testPart-2',
            position: 10
        },  'There 10th jump is correct');

        section3 = map.parts['testPart-2'].sections['assessmentSection-3'];
        assert.equal(typeof section3.items['item-8'], 'undefined', 'The 3rd section has not the item 8');
        assert.equal(typeof section3.items['item-18'], 'object', 'The 3rd section has now the item 18');
        assert.equal(section3.items['item-17'].position, 6, 'The update fix the positions');
        assert.equal(section3.items['item-18'].position, 7, 'The update fix the positions');
        assert.equal(section3.items['item-19'].position, 8, 'The update fix the positions');

        section4 = map.parts['testPart-2'].sections['assessmentSection-4'];
        assert.equal(section4.items['item-9'].position, 9, 'Positions have been updated');

        assert.equal(section3.stats.total, 3, 'The stats have been updated');
        assert.equal(map.parts['testPart-2'].stats.total, 5, 'The stats have been updated');
        assert.equal(map.stats.total, 11, 'The stats have been updated');

    });
});
