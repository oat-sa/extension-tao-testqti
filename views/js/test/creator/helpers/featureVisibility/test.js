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
 * Copyright (c) 2018-2022 (original work) Open Assessment Technologies SA ;
 */
define([
    'lodash',
    'services/features',
    'taoQtiTest/controller/creator/helpers/featureVisibility',
    'json!taoQtiTest/test/creator/helpers/featureVisibility/presetGroupsSample.json'
], function (_, features, featureVisibility, presetGroupsSample) {
    'use strict';

    /**
     * Mocks the isVisible function of services/features to return defined value
     * @param {boolean} value
     * @param {string} [featureKey]
     */
    function mockIsVisible(value, featureKey) {
        features.isVisible = function (key) {
            if (featureKey) {
                if (key === featureKey) {
                    return value;
                } else {
                    return true;
                }
            } else {
                return value;
            }
        };
    }

    QUnit.module('API');

    QUnit.test('module', function (assert) {
        assert.expect(1);
        assert.equal(typeof featureVisibility, 'object', 'The module exposes an object');
    });

    QUnit.cases
        .init([
            [
                'addTestVisibilityProps',
                'addTestPartVisibilityProps',
                'addSectionVisibilityProps',
                'addItemRefVisibilityProps',
                'filterVisiblePresets'
            ]
        ])
        .test('method ', function (data, assert) {
            assert.expect(data.length);
            data.forEach(methodName => {
                assert.equal(
                    typeof featureVisibility[methodName],
                    'function',
                    'The helper exposes a "' + methodName + '" method'
                );
            });
        });

    QUnit.module('visibility props');

    QUnit.test('adds visibility props to test model', function (assert) {
        assert.expect(2);

        const testModelSample = {
            'qti-type': 'assessmentTest',
            identifier: 'Test-4',
            title: 'QTI Interactions',
            toolName: 'tao',
            toolVersion: '3.3.0-RC02',
            outcomeDeclarations: [],
            timeLimits: {},
            testParts: [],
            outcomeProcessing: {},
            testFeedbacks: [],
            observers: {},
            scoring: {}
        };

        mockIsVisible(false);
        featureVisibility.addTestVisibilityProps(testModelSample);
        assert.notEqual(testModelSample.showTimeLimits, true, 'showTimeLimits is not true if feature is not visible');

        mockIsVisible(true);
        featureVisibility.addTestVisibilityProps(testModelSample);
        assert.equal(testModelSample.showTimeLimits, true, 'showTimeLimits is true if feature is visible');
    });

    QUnit.test('adds visibility props to testPart model', function (assert) {
        assert.expect(8);

        const testPartModelSample = {
            'qti-type': 'testPart',
            identifier: 'testPart-1',
            navigationMode: 1,
            submissionMode: 0,
            preConditions: [],
            branchRules: [],
            itemSessionControl: {},
            timeLimits: {},
            assessmentSections: [],
            testFeedbacks: [],
            observers: {},
            index: 0
        };

        mockIsVisible(false);
        featureVisibility.addTestPartVisibilityProps(testPartModelSample);
        assert.notEqual(
            testPartModelSample.showTimeLimits,
            true,
            'showTimeLimits is not true if feature is not visible'
        );
        assert.notEqual(
            testPartModelSample.itemSessionShowFeedback,
            true,
            'itemSessionShowFeedback is not true if feature is not visible'
        );
        assert.notEqual(
            testPartModelSample.itemSessionAllowComment,
            true,
            'itemSessionAllowComment is not true if feature is not visible'
        );
        assert.notEqual(
            testPartModelSample.itemSessionAllowSkipping,
            true,
            'itemSessionAllowSkipping is not true if feature is not visible'
        );

        mockIsVisible(true);
        featureVisibility.addTestPartVisibilityProps(testPartModelSample);
        assert.equal(testPartModelSample.showTimeLimits, true, 'showTimeLimits is true if feature is visible');
        assert.equal(
            testPartModelSample.itemSessionShowFeedback,
            true,
            'itemSessionShowFeedback is true if feature is visible'
        );
        assert.equal(
            testPartModelSample.itemSessionAllowComment,
            true,
            'itemSessionAllowComment is true if feature is visible'
        );
        assert.equal(
            testPartModelSample.itemSessionAllowSkipping,
            true,
            'itemSessionAllowSkipping is true if feature is visible'
        );
    });

    QUnit.test('adds visibility props to section model', function (assert) {
        assert.expect(8);

        const sectionModelSample = {
            'qti-type': 'assessmentSection',
            title: 'Overview',
            visible: true,
            keepTogether: true,
            rubricBlocks: [],
            sectionParts: [],
            identifier: 'assessmentSection-1',
            required: true,
            fixed: false,
            preConditions: [],
            branchRules: [],
            itemSessionControl: {},
            timeLimits: {},
            observers: {},
            index: 0,
            categories: ['x-tao-option-highlighter']
        };

        mockIsVisible(false);
        featureVisibility.addTestPartVisibilityProps(sectionModelSample);
        assert.notEqual(
            sectionModelSample.showTimeLimits,
            true,
            'showTimeLimits is not true if feature is not visible'
        );
        assert.notEqual(
            sectionModelSample.itemSessionShowFeedback,
            true,
            'itemSessionShowFeedback is not true if feature is not visible'
        );
        assert.notEqual(
            sectionModelSample.itemSessionAllowComment,
            true,
            'itemSessionAllowComment is not true if feature is not visible'
        );
        assert.notEqual(
            sectionModelSample.itemSessionAllowSkipping,
            true,
            'itemSessionAllowSkipping is not true if feature is not visible'
        );

        mockIsVisible(true);
        featureVisibility.addTestPartVisibilityProps(sectionModelSample);
        assert.equal(sectionModelSample.showTimeLimits, true, 'showTimeLimits is true if feature is visible');
        assert.equal(
            sectionModelSample.itemSessionShowFeedback,
            true,
            'itemSessionShowFeedback is true if feature is visible'
        );
        assert.equal(
            sectionModelSample.itemSessionAllowComment,
            true,
            'itemSessionAllowComment is true if feature is visible'
        );
        assert.equal(
            sectionModelSample.itemSessionAllowSkipping,
            true,
            'itemSessionAllowSkipping is true if feature is visible'
        );
    });

    QUnit.test('adds visibility props to itemRef model', function (assert) {
        assert.expect(6);

        const itemRefModelSample = {
            'qti-type': 'assessmentItemRef',
            href: 'https://taocommunity.com/ontologies/tao.rdf#i62582f9f9a45311cf13402804765c99',
            categories: [],
            variableMappings: [],
            weights: [],
            templateDefaults: [],
            identifier: 'item-1',
            required: false,
            fixed: false,
            preConditions: [],
            branchRules: [],
            itemSessionControl: {},
            timeLimits: {},
            observers: {},
            index: 0,
            isLinear: false
        };

        mockIsVisible(false);
        featureVisibility.addTestPartVisibilityProps(itemRefModelSample);
        assert.notEqual(
            itemRefModelSample.itemSessionShowFeedback,
            true,
            'itemSessionShowFeedback is not true if feature is not visible'
        );
        assert.notEqual(
            itemRefModelSample.itemSessionAllowComment,
            true,
            'itemSessionAllowComment is not true if feature is not visible'
        );
        assert.notEqual(
            itemRefModelSample.itemSessionAllowSkipping,
            true,
            'itemSessionAllowSkipping is not true if feature is not visible'
        );

        mockIsVisible(true);
        featureVisibility.addTestPartVisibilityProps(itemRefModelSample);
        assert.equal(
            itemRefModelSample.itemSessionShowFeedback,
            true,
            'itemSessionShowFeedback is true if feature is visible'
        );
        assert.equal(
            itemRefModelSample.itemSessionAllowComment,
            true,
            'itemSessionAllowComment is true if feature is visible'
        );
        assert.equal(
            itemRefModelSample.itemSessionAllowSkipping,
            true,
            'itemSessionAllowSkipping is true if feature is visible'
        );
    });

    QUnit.module('categories & presets');

    QUnit.test('removes preset group from presetGroups', function (assert) {
        assert.expect(2);

        const presetGroups = _.cloneDeep(presetGroupsSample);

        mockIsVisible(false, 'taoQtiTest/creator/category/presetGroup/navigation');

        const filteredPresetGroups = featureVisibility.filterVisiblePresets(presetGroups);

        assert.notEqual(
            filteredPresetGroups.some(presetGroup => presetGroup.groupId === 'navigation'),
            true,
            'navigation presetGroup is filtered out if them are not visible'
        );

        mockIsVisible(true, 'taoQtiTest/creator/category/presetGroup/navigation');

        const notFilteredPresetGroups = featureVisibility.filterVisiblePresets(presetGroups);

        assert.equal(
            notFilteredPresetGroups.some(presetGroup => presetGroup.groupId === 'navigation'),
            true,
            'navigation presetGroup is not filtered out if them are visible'
        );
    });

    QUnit.test('removes single preset from presetGroups', function (assert) {
        assert.expect(2);

        const presetGroups = _.cloneDeep(presetGroupsSample);

        mockIsVisible(false, 'taoQtiTest/creator/category/preset/reviewScreen');

        const filteredPresetGroups = featureVisibility.filterVisiblePresets(presetGroups);

        assert.equal(filteredPresetGroups.length, 3, 'presetGroups are not filtered');

        const navigationPresetGroupPresets = filteredPresetGroups[0].presets;

        assert.equal(
            navigationPresetGroupPresets.some(preset => preset.id === 'reviewScreen'),
            false,
            'reviewScreen preset is filtered out if marked not visible'
        );
    });
});
