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
 * Helper for iterating on nested collections within a test model.
 * It's recommended to use a validator on the model before calling these functions.
 *
 * @example
const testModel = {
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
                    identifier: 'item-1',
                    categories: ['math', 'history']
                }]
            }]
        }]
    }]
};
eachItemInTest(testModel, itemRef => {
    console.log(itemRef.categories);
});
 */
define([
    'lodash',
    'core/errorHandler'
], function (_, errorHandler) {
    'use strict';

    const _ns = '.testModel';

    /**
     * Calls a function for each itemRef in the test model. Handles nested subsections.
     * @param {Object} testModel
     * @param {Function} cb - takes itemRef as only param
     */
    function eachItemInTest(testModel, cb) {
        _.forEach(testModel.testParts, testPartModel => {
            eachItemInTestPart(testPartModel, cb);
        });
    }

    /**
     * Calls a function for each itemRef in the testPart model. Handles nested subsections.
     * @param {Object} testPartModel
     * @param {Function} cb - takes itemRef as only param
     */
    function eachItemInTestPart(testPartModel, cb) {
        _.forEach(testPartModel.assessmentSections, sectionModel => {
            eachItemInSection(sectionModel, cb);
        });
    }

    /**
     * Calls a function for each itemRef in the section model. Handles nested subsections.
     * @param {Object} sectionModel
     * @param {Function} cb - takes itemRef as only param
     */
    function eachItemInSection(sectionModel, cb) {
        _.forEach(sectionModel.sectionParts, sectionPartModel => {
            // could be item, could be subsection
            if (sectionPartModel['qti-type'] === 'assessmentSection') {
                // recursion to handle any amount of subsection levels
                eachItemInSection(sectionPartModel, cb);
            } else if (sectionPartModel['qti-type'] === 'assessmentItemRef') {
                const itemRef = sectionPartModel;
                if (typeof cb === 'function') {
                    cb(itemRef);
                } else {
                    errorHandler.throw(_ns, 'cb must be a function');
                }
            }
        });
    }

    return {
        eachItemInTest,
        eachItemInTestPart,
        eachItemInSection
    };
});
