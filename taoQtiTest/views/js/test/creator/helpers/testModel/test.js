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
define([
    'lodash',
    'taoQtiTest/controller/creator/helpers/testModel',
    'json!taoQtiTest/test/creator/samples/categories.json'
], function(_, testModelHelper, testModelSample) {
    'use strict';

    const testModelHelperApi = [
        {title: 'eachItemInTest'},
        {title: 'eachItemInTestPart'},
        {title: 'eachItemInSection'}
    ];

    QUnit.module('helpers/testModel');

    QUnit.test('module', function(assert) {
        assert.expect(1);
        assert.equal(typeof testModelHelper, 'object', 'The category helper module exposes an object');
    });

    QUnit
        .cases.init(testModelHelperApi)
        .test('helpers/testModel API ', function(data, assert) {
            assert.expect(1);
            assert.equal(typeof testModelHelper[data.title], 'function', 'The category helper exposes a "' + data.title + '" function');
        });

    const testModelSampleNested = {
        'qti-type': 'test',
        testParts: [{
            'qti-type': 'testPart',
            identifier: 'testPart-1',
            assessmentSections: [{
                'qti-type': 'assessmentSection',
                identifier: 'assessmentSection-1',
                sectionParts: [{
                    'qti-type': 'assessmentSection',
                    identifier: 'subsection-1',
                    sectionParts: [{
                        'qti-type': 'assessmentItemRef',
                        identifier: 'item-1'
                    }, {
                        'qti-type': 'assessmentItemRef',
                        identifier: 'item-2'
                    }, {
                        'qti-type': 'assessmentItemRef',
                        identifier: 'item-3'
                    }]
                }]
            }, {
                'qti-type': 'assessmentSection',
                identifier: 'assessmentSection-2',
                sectionParts: [{
                    'qti-type': 'assessmentItemRef',
                    identifier: 'item-4'
                }, {
                    'qti-type': 'assessmentItemRef',
                    identifier: 'item-5'
                }]
            }]
        }, {
            'qti-type': 'testPart',
            identifier: 'testPart-2',
            assessmentSections: [{
                'qti-type': 'assessmentSection',
                identifier: 'assessmentSection-3',
                sectionParts: [{
                    'qti-type': 'assessmentItemRef',
                    identifier: 'item-6'
                }]
            }]
        }]
    };

    QUnit.test('helpers/testModel.eachItemInTest() - flat test', function(assert) {
        const path = ['item-1', 'item-3', 'item-2', 'item-4', 'item-5', 'item-6', 'item-7', 'item-8', 'item-9'];
        let pointer = 0;

        testModelHelper.eachItemInTest(testModelSample, function(itemRef) {
            assert.equal(itemRef.identifier, path[pointer], 'The helper loops over the items in the correct order');
            pointer++;
        });

        assert.expect(path.length + 1);

        assert.equal(pointer, path.length, 'The helper visited every item');
    });

    QUnit.test('helpers/testModel.eachItemInTest() - nested subsections', function(assert) {
        const path = ['item-1', 'item-2', 'item-3', 'item-4', 'item-5', 'item-6'];
        let pointer = 0;

        testModelHelper.eachItemInTest(testModelSampleNested, function(itemRef) {
            assert.equal(itemRef.identifier, path[pointer], 'The helper loops over the items in the correct order');
            pointer++;
        });

        assert.expect(path.length + 1);

        assert.equal(pointer, path.length, 'The helper visited every item');
    });

    QUnit.test('helpers/testModel.eachItemInTestPart() - nested subsections', function(assert) {
        const path = ['item-1', 'item-2', 'item-3', 'item-4', 'item-5'];
        let pointer = 0;

        testModelHelper.eachItemInTestPart(testModelSampleNested.testParts[0], function(itemRef) {
            assert.equal(itemRef.identifier, path[pointer], 'The helper loops over the items in the correct order');
            pointer++;
        });

        assert.expect(path.length + 1);

        assert.equal(pointer, path.length, 'The helper visited every item');
    });

    QUnit.test('helpers/testModel.eachItemInSection() - nested subsections', function(assert) {
        const path = ['item-1', 'item-2', 'item-3'];
        let pointer = 0;

        testModelHelper.eachItemInSection(testModelSampleNested.testParts[0].assessmentSections[0], function(itemRef) {
            assert.equal(itemRef.identifier, path[pointer], 'The helper loops over the items in the correct order');
            pointer++;
        });

        assert.expect(path.length + 1);

        assert.equal(pointer, path.length, 'The helper visited every item');
    });
});
