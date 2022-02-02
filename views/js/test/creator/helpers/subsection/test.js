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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Hanna Dzmitryieva <hanna@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'taoQtiTest/controller/creator/helpers/subsection',
], function($, _, subsectionsHelper) {

    'use strict';

    QUnit.test('isFistLevelSubsection', function(assert) {
        assert.ok(subsectionsHelper.isFistLevelSubsection($('#subsection-1')), 'subsection-1 is on first level');
        assert.ok(subsectionsHelper.isFistLevelSubsection($('#subsection-5')), 'subsection-5 is on first level');
        assert.notOk(subsectionsHelper.isFistLevelSubsection($('#subsection-2')), 'subsection-2 is not on first level');
    });

    QUnit.test('isNestedSubsection', function(assert) {
        assert.ok(subsectionsHelper.isNestedSubsection($('#subsection-2')), 'subsection-2 is nested subsection');
        assert.ok(subsectionsHelper.isNestedSubsection($('#subsection-3')), 'subsection-3 is nested subsection');
        assert.notOk(subsectionsHelper.isNestedSubsection($('#subsection-1')), 'subsection-1 is not nested subsection');
    });

    QUnit.test('getSubsections', function(assert) {
        const $subsectionsWithoutNested = subsectionsHelper.getSubsections($('#assessmentSection-1'));
        assert.equal($subsectionsWithoutNested.length, 2, 'assessmentSection-1 has 2 subsection on first level');
        assert.equal($subsectionsWithoutNested[0].id, 'subsection-1', 'assessmentSection-1 has 1st subsection "subsection-1" on first level');
        assert.equal($subsectionsWithoutNested[1].id, 'subsection-4', 'assessmentSection-1 has 2nd subsection "subsection-4" on first level');
    });

    QUnit.test('getSiblingSubsections', function(assert) {
        const $siblings = subsectionsHelper.getSiblingSubsections($('#subsection-1'));
        assert.equal($siblings.length, 2, 'on level subsection-1 has 2 subsections');
        assert.equal($siblings[0].id, 'subsection-1', 'fist is "subsection-1"');
        assert.equal($siblings[1].id, 'subsection-4', 'fist is "subsection-4"');
    });

    QUnit.test('getParentSubsection', function(assert) {
        const $parentSubsection = subsectionsHelper.getParentSubsection($('#subsection-2'));
        assert.equal($parentSubsection.length, 1, 'return 1 element');
        assert.equal($parentSubsection[0].id, 'subsection-1', 'parent is "subsection-1"');
    });

    QUnit.test('getParentSection', function(assert) {
        const $parentSection = subsectionsHelper.getParentSection($('#subsection-2'));
        assert.equal($parentSection.length, 1, 'return 1 element');
        assert.equal($parentSection[0].id, 'assessmentSection-1', 'parent is "assessmentSection-1"');
    });

    QUnit.test('getParent', function(assert) {
        const $parentSubsection = subsectionsHelper.getParent($('#subsection-2'));
        assert.equal($parentSubsection.length, 1, 'return 1 element');
        assert.equal($parentSubsection[0].id, 'subsection-1', 'parent is "subsection-1"');
        const $parentSection = subsectionsHelper.getParent($parentSubsection);
        assert.equal($parentSection.length, 1, 'return 1 element');
        assert.equal($parentSection[0].id, 'assessmentSection-1', 'parent is "assessmentSection-1"');
    });

    QUnit.test('getSubsectionContainer', function(assert) {
        const $container = subsectionsHelper.getSubsectionContainer($('#subsection-2'));
        assert.equal($container.length, 1, 'return 1 element');
        assert.equal($container[0].id, 'subsections-for-2', 'correct element');
    });

    QUnit.test('getSubsectionTitleIndex', function(assert) {
        let index = subsectionsHelper.getSubsectionTitleIndex($('#subsection-2'));
        assert.equal(index, '1.1.1.', 'for "subsection-2" return index 1.1.1.');
        index = subsectionsHelper.getSubsectionTitleIndex($('#subsection-1'));
        assert.equal(index, '1.1.', 'for "subsection-2" return index 1.1.');
        index = subsectionsHelper.getSubsectionTitleIndex($('#subsection-5'));
        assert.equal(index, '2.1.', 'for "subsection-2" return index 2.1.');
        index = subsectionsHelper.getSubsectionTitleIndex($('#subsection-6'));
        assert.equal(index, '2.1.1.', 'for "subsection-2" return index 2.1.1.');
    });
});
